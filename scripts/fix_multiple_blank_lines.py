import os


def remove_extra_blank_lines(markdown_file):
    with open(markdown_file, "r", encoding="utf-8") as file:
        lines = file.readlines()

    adjusted_lines = []
    in_code_block = False
    last_line_blank = False

    for line in lines:
        # Check for start or end of a code block
        if line.strip().startswith("```"):
            in_code_block = not in_code_block

        # Remove extra blank lines outside of code blocks
        if not in_code_block:
            if line.strip() == "":
                if last_line_blank:
                    continue  # Skip this line
                last_line_blank = True
            else:
                last_line_blank = False
        adjusted_lines.append(line)

    # Write the adjusted content back to the file
    with open(markdown_file, "w", encoding="utf-8") as file:
        file.writelines(adjusted_lines)


def main():
    for root, dirs, files in os.walk("./docs/posts/"):
        for filename in files:
            if filename.endswith(".md"):
                markdown_file = os.path.join(root, filename)
                remove_extra_blank_lines(markdown_file)


if __name__ == "__main__":
    main()
