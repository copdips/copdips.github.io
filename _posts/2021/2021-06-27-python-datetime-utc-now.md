---
last_modified_at:
title: "Python datetime utcnow"
excerpt: ""
tags:
  - python
  - datetime
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

Previously, when I needed a real utc now with [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format, I used to use the [strftime](https://docs.python.org/3.9/library/datetime.html#datetime.date.strftime) function or the [pytz](https://pypi.org/project/pytz/) module. But recently I just found that Python at least since [v3.5](https://docs.python.org/3.5/library/datetime.html#datetime.datetime.utcnow) has already provide it with builtin module: `datetime.now(timezone.utc)`

PS: `datetime.fromisoformat()` is release with python v3.7

```bash
>>> from datetime import datetime, timezone

>>> datetime.utcnow()
datetime.datetime(2021, 6, 27, 17, 31, 14, 410011)
>>> datetime.utcnow().isoformat()
'2021-06-27T17:31:14.410200'
>>> datetime.fromisoformat(datetime.utcnow().isoformat())
datetime.datetime(2021, 6, 27, 17, 31, 14, 415153)

>>> datetime.now(timezone.utc)
datetime.datetime(2021, 6, 27, 17, 31, 14, 419667, tzinfo=datetime.timezone.utc)
>>> datetime.now(timezone.utc).isoformat()
'2021-06-27T17:31:14.425507+00:00'
>>> datetime.fromisoformat(datetime.now(timezone.utc).isoformat())
datetime.datetime(2021, 6, 27, 17, 31, 14, 431368, tzinfo=datetime.timezone.utc)
```
