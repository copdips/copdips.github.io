---
authors:
- copdips
categories:
- web
- mkdocs
comments: true
date:
  created: 2023-12-17
description: ''
---

# Rendering CSV as Markdown table in Mkdocs Material

Markdown table is not easy to write in IDE. So I want to write CSV and render it as Markdown table. Previously I used a pre-build script during CICD time to convert CSV to Markdown table, and referenced it as `--8<-- "markdown_table_file_path.md"`. But it's not convenient to preview the result locally. So I want to find a way to render CSV as Markdown table in Mkdocs Material directly.

<!-- more -->

Thanks to [pymdown-extensions](https://github.com/facelessuser/pymdown-extensions) maintainer [@facelessuser](https://github.com/facelessuser), he gave me some [tips](https://github.com/facelessuser/pymdown-extensions/discussions/2273#discussioncomment-7871897).

1. In Markdown file, use code block with language `csv` to render CSV as Markdown table.

    ````markdown
    ```csv-path
    my_csv_file_path.csv
    ```
    ````

2. In `mkdocs.yml`, add [custom fence](https://squidfunk.github.io/mkdocs-material/setup/extensions/python-markdown-extensions/#superfences) for `csv-path` language:

    ```yaml
    - pymdownx.superfences:
      custom_fences:
        - name: csv-path
          class: csv-path
          format: !!python/name:tools.pymdownx_md_render.md_csv_path_render
    ```

3. Install additional pip dependencies:

    ```bash
    # if you use other methode to convert csv to markdown table,
    # you may need to install other modules
    pip install pandas, tabulate
    ```

4. In `tools/pymdownx_md_render.py`, add a new function `md_csv_path_render()` to handle csv code block. Check [here](https://github.com/facelessuser/pymdown-extensions/issues/2240) to see a `pymdownx_md_render.py` example.

    `tablefmt="github"` is to set the alignment.

    ```python title="file tools/pymdownx_md_render.py"
    ... other imports
    import pandas as pd

    ... other functions

    def md_csv_path_render(
            src="",
            language="",
            class_name=None,
            options=None, md="",
            **kwargs):
        """Formatter wrapper."""
        try:
            df = pd.read_csv(src)
            return markdown.markdown(
                df.to_markdown(tablefmt="github", index=False),
                extensions=["tables"])
        except Exception:
            import traceback

            print(traceback.format_exc())
            raise
    ```

    !!! note "We can use other modules (for e.g. [csv2md](https://github.com/lzakharov/csv2md)) than [pandas](https://pandas.pydata.org/docs/index.html) as pandas is a little heavy"

        ```python
        # no need to pip install pandas, tabulate
        # instead, pip install csv2md
        ...
        from csv2md.table import Table
        ...
        with open(src, encoding="utf-8") as f:
            table = Table.parse_csv(f)
        md_table = table.markdown() # (1)
        return markdown.markdown(md_table, extensions=["tables"])
        ```

        1. You can set the alignment parameters [here](https://github.com/lzakharov/csv2md/blob/938fbbbe8dce0be393ff3c0915e3fe90c129e552/csv2md/table.py#L11).

5. To build the mkdocs, must use `python -m mkdocs build` instead of `mkdocs build`. Otherwise, the local `tools` module will not be loaded.

6. Demo:

    I saved a test csv file at: https://github.com/copdips/copdips.github.io/blob/main/docs/assets/blog_data/test.csv

    I referenced the csv file in Markdown file as below:

    ````markdown
    ```csv-path
    ./docs/assets/blog_data/test.csv
    ```
    ````

    Then it was rendered like follows:

    ```csv-path
    ./docs/assets/blog_data/test.csv
    ```
