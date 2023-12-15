import os
import re
import pdb


def convert_admonitions(markdown_file):
    with open(markdown_file, "r", encoding="utf-8") as file:
        content = file.read()

    # Pattern to match Jekyll admonitions with leading spaces
    pattern = re.compile(r"(\s*)(.+?)\n\1\{: \.notice--(info|warning)\}")

    # Function to replace the Jekyll format with MkDocs format
    def replace_admonition(match):
        leading_spaces = match.group(1)
        text = match.group(2).strip()
        admonition_type = "note" if match.group(3) == "info" else "warning"
        mkdocs_admonition = (
            f"{leading_spaces}!!! {admonition_type}\n\n{leading_spaces}    {text}\n\n"
        )
        return mkdocs_admonition

    # Perform the substitution
    new_content = pattern.sub(replace_admonition, content)

    # Write the new content back to the file
    with open(markdown_file, "w", encoding="utf-8") as file:
        file.write(new_content)


def main():
    try:
        for root, dirs, files in os.walk("./docs/posts"):
            for filename in files:
                if filename.endswith(".md"):
                    markdown_file = os.path.join(root, filename)
                    convert_admonitions(markdown_file)
    except Exception as e:
        print(f"An exception occurred: {e}")
        pdb.post_mortem()


if __name__ == "__main__":
    main()
