---
last_modified_at:
title: "Azure pipeline Windows agent UnicodeEncodeError"
excerpt: ""
tags:
  - azure
  - cicd
  - codec
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

For people who encounter `UnicodeEncodeError` when using Windows Azure Pipeline agent, the issue might be [here](https://github.com/PrefectHQ/prefect/issues/5754#issuecomment-1312774275).

As per above link, or this [email](https://mail.python.org/pipermail/python-list/2022-November/908164.html), the solutions could be:

* You can override just sys.std* to UTF-8 by setting
the environment variable `PYTHONIOENCODING=UTF-8`.
* You can override all I/O to use UTF-8 by setting `PYTHONUTF8=1`, or by passing the
command-line option `-X utf8`.
