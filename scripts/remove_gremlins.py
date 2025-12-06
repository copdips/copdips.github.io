#!/usr/bin/env python3
import argparse
import re
import shutil
import sys
import unicodedata
from pathlib import Path
from tempfile import NamedTemporaryFile

# ----- Patterns & Tables -----

# Zero-width and bidi control junk to remove
ZERO_WIDTH_BIDI_RE = re.compile(
    "["                     # open char class
    "\u200B-\u200D"         # zero-width space/joiner/non-joiner
    "\u2060"                # word joiner
    "\u200E\u200F"          # LTR/RTL marks
    "\u202A-\u202E"         # bidi embedding/override
    "\u061C"                # Arabic Letter Mark
    "\uFEFF"                # BOM
    "]"
)

# NBSP-like spaces to turn into a normal ASCII space
NBSP_RE = re.compile("[\u00A0\u202F\u180E]")  # NBSP, narrow NBSP, deprecated Mongolian vowel sep

# Common typographic → ASCII replacements (leave French « » intact)
TYPO_MAP = {
    "\u2010": "-",  # hyphen
    "\u2011": "-",  # non-breaking hyphen
    "\u2012": "-",  # figure dash
    "\u2013": "-",  # en dash
    "\u2014": "-",  # em dash
    "\u2212": "-",  # minus sign

    "\u2018": "'",  # left single quotation mark
    "\u2019": "'",  # right single quotation mark / apostrophe
    "\u201B": "'",  # single high-reversed-9 quotation mark
    "\u2032": "'",  # prime (often used as apostrophe)

    "\u201C": '"',  # left double quotation mark
    "\u201D": '"',  # right double quotation mark
    "\u201F": '"',  # double high-reversed-9 quotation mark
    "\u2033": '"',  # double prime

    "\u2026": "...",  # ellipsis
}

# Build fast translate table for single-char replacements
TRANSLATE_TABLE = str.maketrans(TYPO_MAP)

# Heuristic markers that commonly show up in UTF-8→Latin-1 mojibake
MOJIBAKE_MARKERS = ("Ã", "Â", "â", "€", "œ", "�")


# ----- Helpers -----

def is_binary(path: Path, probe_size: int = 4096) -> bool:
    """
    Very conservative binary detection:
    - Only treat as binary if there is a NUL byte in the first probe_size bytes.
    - Do NOT try to decode as UTF-8 here (to avoid false positives on non-UTF-8 text).
    """
    try:
        with open(path, "rb") as f:
            chunk = f.read(probe_size)
        return b"\x00" in chunk
    except Exception:
        # On any I/O error, be safe and treat as binary/skip
        return True


def looks_like_mojibake(text: str) -> bool:
    return any(m in text for m in MOJIBAKE_MARKERS)


def mojibake_score(text: str) -> int:
    return sum(text.count(m) for m in MOJIBAKE_MARKERS)


def try_fix_mojibake(text: str) -> str:
    """
    Attempt to repair common UTF-8 mojibake where UTF-8 bytes were decoded as Latin-1
    BEFORE being written to the file (so the file now contains the mojibake).
    We only apply this if it clearly improves the text (reduces mojibake markers).
    """
    if not looks_like_mojibake(text):
        return text

    try:
        encoded = text.encode("latin-1", errors="strict")
        repaired = encoded.decode("utf-8", errors="strict")
        if mojibake_score(repaired) < mojibake_score(text):
            return repaired
        return text
    except Exception:
        return text


def normalize_text_block(s: str) -> str:
    # Fix mojibake first (works better before other rules)
    s = try_fix_mojibake(s)

    # Normalize to composed form (keep accents, avoid compatibility folding)
    s = unicodedata.normalize("NFC", s)

    # Remove zero-width/bidi controls
    s = ZERO_WIDTH_BIDI_RE.sub("", s)

    # Convert NBSP-like to a normal ASCII space
    s = NBSP_RE.sub(" ", s)

    # Replace typographic gremlins with ASCII equivalents (quotes, dashes, ellipsis)
    s = s.translate(TRANSLATE_TABLE)

    # Keep French guillemets « » as-is; do NOT touch accents
    return s


# ----- Processing -----

def process_file(path: Path, *, force_text: bool = False) -> None:
    """
    Process a single file.
    - If force_text=True, skip the binary (NUL) check and always try to read as UTF-8.
    """
    print(f"[FOUND] {path}")

    if not force_text and is_binary(path):
        print("  -> Skipped (binary file)")
        return

    try:
        # Read full text to allow safe mojibake detection and normalization
        with open(path, "r", encoding="utf-8", errors="strict") as fin:
            text = fin.read()
    except UnicodeDecodeError:
        print("  -> Skipped (encoding not UTF-8)")
        return
    except Exception:
        print("  -> Skipped (read error)")
        return

    normalized = normalize_text_block(text)
    if normalized != text:
        try:
            # Atomic replace using a temp file in the same directory
            with NamedTemporaryFile(
                "w", delete=False, encoding="utf-8", dir=str(path.parent)
            ) as fout:
                fout.write(normalized)
                temp_name = fout.name
            shutil.move(temp_name, path)
            print("  -> ✅ FIXED")
        except Exception:
            print("  -> Skipped (write error)")
    else:
        print("  -> OK (clean)")


def main():
    parser = argparse.ArgumentParser(
        description=(
            "Recursive Unicode normalizer for text files.\n"
            "- Fixes dashes/quotes/ellipsis to ASCII punctuation\n"
            "- Repairs French accents (NFC) and common UTF-8 mojibake\n"
            "- Removes zero-width/BOM/bidi controls\n"
            "- Converts NBSP/narrow NBSP to normal space\n"
            "- Keeps « » and French letters intact\n\n"
            "Usage:\n"
            "  script.py /path/to/file.md\n"
            "  script.py /path/to/folder .md"
        )
    )
    parser.add_argument(
        "target",
        help="File OR folder to scan. If file, only that file is processed. If folder, scan recursively.",
    )
    parser.add_argument(
        "extension",
        nargs="?",
        help="File extension to match when target is a folder (e.g. .txt, .md, .csv)",
    )
    args = parser.parse_args()

    target = Path(args.target)

    # --- Single-file mode ---
    if target.is_file():
        # User explicitly pointed at this file: trust them, don't NUL-check
        process_file(target, force_text=True)
        return

    # --- Folder mode ---
    if not target.exists():
        print(f"Target not found: {target}", file=sys.stderr)
        sys.exit(1)

    if not target.is_dir():
        print(
            f"Target is neither a regular file nor a directory: {target}",
            file=sys.stderr,
        )
        sys.exit(1)

    if not args.extension:
        print(
            "When target is a folder, you must specify an extension (e.g. .md, .txt).",
            file=sys.stderr,
        )
        sys.exit(1)

    ext = args.extension.lower()
    if not ext.startswith("."):
        ext = "." + ext

    for p in target.rglob("*"):
        if p.is_file() and p.suffix.lower() == ext and not p.is_symlink():
            # In folder mode, still protect against true binary files via NUL check
            process_file(p, force_text=False)


if __name__ == "__main__":
    main()
