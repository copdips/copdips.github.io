import os


def adjust_headers(markdown_file):
    with open(markdown_file, "r", encoding="utf-8") as file:
        lines = file.readlines()

    adjusted_lines = []
    top_header_found = False
    next_header_found = False
    excerpt_processing = False
    in_code_block = False  # Flag to track if inside a code block

    for i, line in enumerate(lines):
        # Toggle in_code_block flag when encountering code block delimiters (```)
        if line.strip().startswith("```"):
            in_code_block = not in_code_block

        if not in_code_block and line.startswith("# "):
            if not top_header_found:
                # First top-level header, keep it as is
                top_header_found = True
            elif not next_header_found:
                # Next header found, stop processing excerpt
                next_header_found = True
                if excerpt_processing:
                    # Insert <!-- more --> with one blank line before and after
                    adjusted_lines.append("<!-- more -->\n\n")
                    excerpt_processing = False

            if next_header_found and not line.strip() == "":
                # Increment header level for all headers after the first top-level header
                line = "#" + line

        if top_header_found and not next_header_found and not in_code_block:
            if line.startswith("> "):
                # Process excerpt lines
                excerpt_processing = True
                adjusted_lines.append(line[2:])  # Remove '> ' from the line
                continue
            elif excerpt_processing and not line.strip() == "":
                # End of excerpt, add <!-- more --> with one blank line before it
                adjusted_lines.append("\n<!-- more -->\n\n")
                excerpt_processing = False

        # Add a blank line after a header if the next line is not blank
        if (
            line.startswith("#")
            and not in_code_block
            and (i + 1 < len(lines) and not lines[i + 1].strip() == "")
        ):
            adjusted_lines.append("\n")

        adjusted_lines.append(line)

    if excerpt_processing:
        # Case where file ends without another header
        adjusted_lines.append("\n<!-- more -->\n")

    # Write the adjusted content back to the file
    with open(markdown_file, "w", encoding="utf-8") as file:
        file.writelines(adjusted_lines)


def main():
    for root, dirs, files in os.walk("./new_posts"):
        for filename in files:
            if filename.endswith(".md"):
                markdown_file = os.path.join(root, filename)
                adjust_headers(markdown_file)


if __name__ == "__main__":
    main()
