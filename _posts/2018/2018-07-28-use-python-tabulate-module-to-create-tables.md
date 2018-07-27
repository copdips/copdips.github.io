---
title: "Use python tabulate module to create tables"
excerpt: "Use the tabulate module to create some tables in pure text mode from a python list, than you can past it into markdown, wiki files or python cli."
tags:
  - python
  - markdown
  - format
published: true
# header:
#   teaserlogo:
#   teaser: ''
#   image: ''
#   caption:
gallery:
  - image_path: ''
    url: ''
    title: ''
---

{% include toc title="Table of content" %}

> If you want to create some tables from a python list, you can use the `tabulate` module, it can generate the table easily in text mode and in many formats, than you can past it into markdown, wiki files or add the print version to your python CLI in order to give a beautiful output to the CLI users.

# Install python tabulate module

```powershell
> pip install tabulate
```

# How to use tabulate

[The official doc](https://bitbucket.org/astanin/python-tabulate) has already included nearly everything

# How to print in markdown, rst, wiki, html formats

For rst, wiki, html formats, the official doc has already clealy given it, but for markdown, it's not mentioned. After the test, the `"pipe"` format from [PHP Markdown Extra](https://michelf.ca/projects/php-markdown/extra/#table) is comptiable to markdown.

| file         | tabulate format (tablefmt)   |
|:-------------|:-----------------------------|
| rst          | "rst"                        |
| **markdown** | **"pipe"**                   |
| mediawiki    | "mediawiki"                  |
| html         | "html"                       |

Html code can be injected into Markdown file.
{: .notice--info}

# Visualize all the formats

```python
from tabulate import tabulate

format_list = ['plain', 'simple', 'grid', 'fancy_grid', 'pipe', 'orgtbl', 'jira', 'presto', 'psql', 'rst', 'mediawiki', 'moinmoin', 'youtrack', 'html', 'latex', 'latex_raw', 'latex_booktabs']

# Each element in the table list is a row in the generated table
table = [["spam",42],["eggs",451],["bacon",0]]
headers = ["item", "qty"]

for f in format_list:
    print("\nformat: {}\n".format(f))
    print(tabulate(table, headers, tablefmt=f))
```