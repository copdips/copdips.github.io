---
last_modified_at:
title: "Python Asyncio Study notes"
excerpt: ""
tags:
  - python
  - async
published: false
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

## concurrent.futures

The [`concurrent.futures`](https://docs.python.org/3.9/library/concurrent.futures.html) is a high-level abstraction for the `threading` and `multiprocessing` modules.

```mermaid
flowchart LR
  concurrent.futures ---> |abstraction for| threading
  concurrent.futures ---> |abstraction for| multiprocessing
  threading ---> |abstraction for| _thread
  click concurrent.futures "https://docs.python.org/3.9/library/concurrent.futures.html" _blank
```
