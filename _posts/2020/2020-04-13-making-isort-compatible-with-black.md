---
last_modified_at: 2020-12-06 01:00:25
title: "Making isort compatible with black"
excerpt: "Making isort compatible with black"
tags:
  - python
  - format
  - vscode
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

Update 2020-12-06, thanks to [Christian Jauvin's comment](https://www.copdips.com/2020/04/making-isort-compatible-with-black.html#comment-5178374085), since isort v5, it has introduced `--profile=black` option, so the life is much easier now:)
{: .notice--info}

> Both [isort](https://github.com/timothycrosley/isort) and [black](https://github.com/psf/black) are a must have in my python life, but with their default settings, I will get different imports formats.

## multi_line_output, include_trailing_comma and line_length

The main difference between isort and black are on there points:

1. the multi line mode
2. the trailing comma of the last import
3. the max line length

Personally, I prefer making isort compatible with black, so the settings to be used with isort is: `isort -m 3 -tc`

As per isort settings [wiki](https://github.com/timothycrosley/isort/wiki/isort-Settings):


- [`-m 3`](https://github.com/timothycrosley/isort#multi-line-output-modes) standards for multi line mode 3, which is `Vertical Hanging Indent`

  ```python
  from third_party import (
      lib1,
      lib2,
      lib3,
      lib4,
  )
  ```

- `-tc` standards for adding trailing comma for each import including the last one

There's also a param `-w 88` to set the max line length to 88, but with multi line mode 3, we rarely need it.

There's also a param `-rc` to recursively sort on all files in the project.

We can also use isort custom profile to overwrite the default settings as shown [here](https://github.com/timothycrosley/isort#configuring-isort). And to use the custom profile in VSCode:
```json
# https://github.com/microsoft/vscode/issues/83586#issuecomment-557334564
"python.sortImports.args": [
    "--settings-path=${workspaceFolder}/setup.cfg"
]
```
{: .notice--info}

## isort with VSCode

isort v5-:

[https://pycqa.github.io/isort/docs/configuration/profiles/](https://pycqa.github.io/isort/docs/configuration/profiles/)

```json
{
  "editor.formatOnSave":true,
  "python.sortImports.path": "isort",
  "python.sortImports.args":[
    "-m 3",
    "-tc",
  ],
  "[python]":{
    "editor.codeActionsOnSave":{
         # it was `"source.organizeImports": true` in my first version of this post,
         # see below comment for explanation.
        "source.organizeImports.python": true
    }
  }
}
```

isort v5+:

```json
{
  "editor.formatOnSave":true,
  "python.sortImports.path": "isort",
  "python.sortImports.args":[
    "--profile=black",
  ],
  "[python]":{
    "editor.codeActionsOnSave":{
         # it was `"source.organizeImports": true` in my first version of this post,
         # see below comment for explanation.
        "source.organizeImports.python": true
    }
  }
}
```

After some days of using above settings, I found a very frustrating behavior that when I pressed Ctrl+S multiple times to save manually a python file, the imports part changed upon each save, and sometimes it even [deleted some imports](https://github.com/microsoft/vscode/issues/83586#issuecomment-607497052)...
Digged in github, people have already reported the issue. See [issues/83586](https://github.com/microsoft/vscode/issues/83586), and [issues/9889](https://github.com/microsoft/vscode-python/issues/9889)
The solution (workaround) is [here](https://github.com/microsoft/vscode/issues/90221#issuecomment-583664840). Replace `"source.organizeImports":true` by `source.organizeImports.python` to allow codeActionsOnSave to specify which extension to use for a given on save action, the way `editor.defaultFormatter` or `python.formatting.provider` work.
{: .notice--warning}

## isort with git hook

Just in case you're interested in git hook, the settings is [here](https://github.com/timothycrosley/isort#git-hook).
