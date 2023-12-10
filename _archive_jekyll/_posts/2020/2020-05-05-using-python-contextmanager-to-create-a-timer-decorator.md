---
last_modified_at:
title: "Using Python Contextmanager To Create A Timer Decorator"
excerpt: "Using Python contextmanager to create a timer decorator"
tags:
  - python
  - contextlib
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



This [stackoverflow post](https://stackoverflow.com/a/30024601/5095636) has already given an example on how to use contextmanager to create a timer decorator:

```python
from contextlib import contextmanager
from timeit import default_timer

@contextmanager
def elapsed_timer():
    start = default_timer()
    elapser = lambda: default_timer() - start
    yield lambda: elapser()
    end = default_timer()
    elapser = lambda: end-start
```

It works well, but flake8 linter warns me that: `[E731]: do not assign a lambda expression, use a def.`

So hereunder the lambda free version:

```python
from contextlib import contextmanager
from timeit import default_timer

@contextmanager
def elapsed_timer():
    start_time = default_timer()

    class _Timer():
      start = start_time
      end = default_timer()
      duration = end - start

    yield _Timer

    end_time = default_timer()
    _Timer.end = end_time
    _Timer.duration = end_time - start_time
```

Test:

```python
In [67]: from time import sleep
    ...:
    ...: def sleep_1s():
    ...:     sleep(1)
    ...:
    ...: with elapsed_timer() as t:
    ...:     sleep_1s()
    ...:

In [68]: t.start
Out[68]: 4583.4985535

In [69]: t.end
Out[69]: 4584.4983676

In [70]: t.duration
Out[70]: 0.9998141000005489

# the duration is less than 1s, it's default_timer of timeit.
```
