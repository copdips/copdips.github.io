---
last_modified_at:
title: "Python Asyncio"
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

This is not a Python asyncio tuto. Just some personal quick tips here, and could be updated from time to time.
{: .notice--info}

## greenlet vs gevent

- greenlet needs manual event switch.
- gevent is based on greenlet. gevent has `gevent.monkey.patch_all()`.

## @asyncio.coroutine

From Python 3.8, `async def` deprecates `@asyncio.coroutine`

## yield from

From Python 3.5, `await` deprecates `yield from`

## scope of await

`await` can only be used in `async def` except in `ipython`

## asyncio with queue

https://copdips.com/2023/01/python-aiohttp-rate-limit.html#example

## aiohttp with rate limit

https://copdips.com/2023/01/python-aiohttp-rate-limit.html#example

## get_running_loop vs get_event_loop

- `get_running_loop` raises error if there's no running loop.
- `get_event_loop` return running loop if exists, otherwise create one and return it.

## Awaitable vs Future vs Task vs Coroutine

- [`Awaitable`](https://docs.python.org/3/library/asyncio-task.html#awaitables) is an object can be used in an `await` expression. There are three main types of awaitable objects: `coroutines`, `Tasks`, and `Futures`.
- [`Coroutine`](https://docs.python.org/3/library/asyncio-task.html#coroutine) is declared with the `async/await` syntax is the preferred way of writing asyncio applications. Coroutines can await on `Future` objects until they either have a result or an exception set, or until they are cancelled. Python coroutines are awaitables and therefore can be awaited from other coroutines
- [`Future`](https://docs.python.org/3/library/asyncio-future.html#asyncio.Future) is an awaitable object. A Future represents an eventual result of an asynchronous operation. Not thread-safe.
- [`Task`](https://docs.python.org/3/library/asyncio-task.html#asyncio.Task) is subclass of `Future` that runs a Python coroutine. Not thread-safe. Tasks are used to schedule coroutines concurrently. When a coroutine is wrapped into a Task with functions like `asyncio.create_task()` the coroutine is automatically scheduled to run soon

## ensure_future vs create_task

- `create_task` is high-level introduced in Python 3.7 and accepts only `coroutines`, returns a Task object which is subclass of Future. `create_task` must be called inside a running event loop.
- `ensure_future` is low-level and accepts both `coroutines` and `Futures`. `Task` is subclass of `Future`. If `ensure_future` gets a `Task`, it will return the input `Task` itself, as Future is ensured. If `ensure_future` gets a `coroutine`, it will call `create_task` to wrap the input `coroutine` to a `Task`, then return it.

create_task [source code](https://github.com/python/cpython/blob/124af17b6e49f0f22fbe646fb57800393235d704/Lib/asyncio/tasks.py#L369-L382), ensure_future [source code](https://github.com/python/cpython/blob/124af17b6e49f0f22fbe646fb57800393235d704/Lib/asyncio/tasks.py#L647-L652).

[Warning on ensure_future](https://docs.python.org/3/library/asyncio-future.html#asyncio.ensure_future):
Deprecated since version 3.10: Deprecation warning is emitted if obj is not a Future-like object and loop is not specified and **there is no running event loop**. Coroutine is not a Future-like object.
{: .notice--warning}

## simple aiohttp download demo

```python
import asyncio
import aiohttp


async def download_img(session, url):
    file_name = url.rsplit("/")[-1]
    print(f"Downloading：{file_name}")
    response = await session.get(url, ssl=False)
    content = await response.content.read()
    with open(file_name, mode="wb") as file:
        file.write(content)
    print(f"Done：{file_name}")


async def main():
    urls = [
        "https://tenfei05.cfp.cn/creative/vcg/800/new/VCG41560336195.jpg",
        "https://tenfei03.cfp.cn/creative/vcg/800/new/VCG41688057449.jpg",
    ]
    async with aiohttp.ClientSession() as session:
        # download_img(session, url) returns a coroutine
        tasks = [asyncio.create_task(download_img(session, url)) for url in urls]
        await asyncio.wait(tasks)


# loop = asyncio.get_event_loop()
# loop.run_until_complete(main())

# above commented 2 lines are low level API and could be replaced by
# below asyncio.run() introduced by python 3.7.
# asyncio.get_event_loop() creates new event loop if doesn't exist.
# asyncio.run() raises exception if already in a event loop.
# This function always creates a new event loop and closes it at the end.
# It should be used as a main entry point for asyncio programs, and should
# ideally only be called once.
asyncio.run(main())

```

## aiohttp rate limit example

[https://copdips.com/2023/01/python-aiohttp-rate-limit.html](https://copdips.com/2023/01/python-aiohttp-rate-limit.html)

## run coroutines concurrently as asyncio Tasks

await coroutines directly will run the coroutines sequentially, so 2 sleeps of 2s takes 4s:

```python
import asyncio
import time

print(f"started at {time.strftime('%X')}")
await asyncio.sleep(2)
await asyncio.sleep(2)
print(f"started at {time.strftime('%X')}")

# output, duration 4s
started at 23:48:19
started at 23:48:23
```

Wrap the coroutines into tasks to run concurrently, 2 sleeps of 2s takes 2s:

```python
import asyncio
import time

print(f"started at {time.strftime('%X')}")

# create_task() must be inside a running event loop,
# often created by asyncio.run()
task1 = asyncio.create_task(asyncio.sleep(2))
task2 = asyncio.create_task(asyncio.sleep(2))

await task1
await task2
# or: await asyncio.wait([task1, task2])

print(f"started at {time.strftime('%X')}")

# output, duration 2s
started at 23:49:08
started at 23:49:10
```

## schedule task without asyncio.create_task()

The popular asyncio tasks usage is :

```python
import asyncio
import time

async def main()
    start = time.time()
    tasks = [
        asyncio.create_task(asyncio.sleep(2)),
        asyncio.create_task(asyncio.sleep(2)),
    ]
    await asyncio.wait(tasks)
    print(time.time() - start)

asyncio.run(main())

# output
2.0010249614715576
```

`asyncio.create_task()` must be run inside a event loop, which is created by `asyncio.run()`. We can also not use `asyncio.create_task()` to create tasks too:

```python
import asyncio
import time

coroutines = [
    asyncio.sleep(2),
    asyncio.sleep(2)
]

start = time.time()

# asyncio.run() creates an event loop,
# then asyncio.wait() wraps the coroutines into tasks.
asyncio.run(asyncio.wait(coroutines))

print(time.time() - start)

# output
2.0026962757110596
```

## wait vs gather

- [`wait`](https://docs.python.org/3/library/asyncio-task.html#asyncio.wait) is a low-level api, [`gather`](https://docs.python.org/3/library/asyncio-task.html#asyncio.gather) is a high-level api.
- `wait` has more options than `gather`:
  - `async def wait(fs, *, loop=None, timeout=None, return_when=ALL_COMPLETED):`
  - `def gather(*coros_or_futures, loop=None, return_exceptions=False):`
- `wait` accepts lists of coroutines/Futures (`asyncio.wait(tasks)`), `gather` accepts each element a coroutine/Futures (`asyncio.gather(*tasks)`).
- `wait` returns two `futures` in a tuple: `(done, pending)`, it's a coroutine `async def`. To get the `wait` results: `[d.result() for d in done]`, `gather` returns the results directly, it's a standard `def`.
- `gather` can group tasks, and can also cancel groups of tasks:

  ```python
  async def main():
    group1 = asyncio.gather(f1(), f1())
    group2 = asyncio.gather(f2(), f2())
    group1.cancel()
    # if return_exceptions=False, `asyncio.exceptions.CancelledError` will be raised,
    # if return_exceptions=True, the exception will be returned in the results.
    # return_exceptions default value is False
    all_groups = await asyncio.gather(group1, group2, return_exceptions=True)
    print(all_groups)
  ```

- If the `wait` task is cancelled, it simply throws an CancelledError and the waited tasks remain intact. Need to call `task.cancel()` to cancel the remaining tasks. If `gather` is cancelled, all submitted awaitables (that have not completed yet) are also cancelled. https://stackoverflow.com/a/64370162
