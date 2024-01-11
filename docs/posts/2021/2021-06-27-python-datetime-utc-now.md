---
authors:
- copdips
categories:
- python
- datetime
comments: true
date:
  created: 2021-06-27
description: ''
---

# Python datetime utcnow

<!-- more -->

Previously, when I needed a real UTC now with [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format, I used to use the [strftime](https://docs.python.org/3.9/library/datetime.html#datetime.date.strftime) function or the [pytz](https://pypi.org/project/pytz/) module. But recently I just found that Python at least since [v3.5](https://docs.python.org/3.5/library/datetime.html#datetime.datetime.utcnow) has already provide it with built-in module: `datetime.now(timezone.utc)`, and this is also the preferred method over [`datatime.utcnow()`](https://docs.python.org/3/library/datetime.html#datetime.datetime.utcnow)

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
