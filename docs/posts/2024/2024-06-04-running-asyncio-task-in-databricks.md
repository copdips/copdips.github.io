---
authors:
- copdips
categories:
- python
- async
- databricks
comments: true
date:
  created: 2024-06-04
---

# Running asyncio task in Databricks

Standard method to run asyncio task is as simple as `asyncio.run(main())`.
But in Databricks, it is not that simple.
With the same command, you will get the following error:

```python
import asyncio
async def main():
    await asyncio.sleep(1)
asyncio.run(main())

RuntimeError: asyncio.run() cannot be called from a running event loop
```

Indeed, in Databricks, we've already in a running loop:

```python
import asyncio
asyncio.get_running_loop()

<_UnixSelectorEventLoop running=True closed=False debug=False>
```

<!-- more -->

## nest_asyncio.apply

OK but achieved.

This uses a third party module `nest_asyncio` to allow nested asyncio event loops. You can find the solution in [this thread](https://community.databricks.com/t5/data-engineering/asynchronous-api-calls-from-databricks/m-p/4692/highlight/true#M1349). It works, and `nest_asyncio` is already embedded in Databricks runtimes (including the latest [runtime version 14.3 LTS](https://docs.databricks.com/en/release-notes/runtime/14.3lts.html#system-environment)).

But the module `nest_asyncio` has been [achieved by the author](https://github.com/erdewit/nest_asyncio) since March 6 2024 very recently.

```python
import asyncio

import nest_asyncio

async def main():
    await asyncio.sleep(1)

if __name__ == "__main__":
    nest_asyncio.apply()
    asyncio.run(main())
```

## await directly

Failed.

```python
import asyncio

async def main():
    await asyncio.sleep(1)

if __name__ == "__main__":
  await main()


File /tmp/tmp07dkybgu.py:43
  await main()
  ^
SyntaxError: 'await' outside function
```

## loop.run_until_complete

Failed.

```python
import asyncio

async def main():
    await asyncio.sleep(1)

if __name__ == "__main__":
  loop = asyncio.get_event_loop()
  loop.run_until_complete(main())


File /tmp/tmpievxdev0.py:43
     41 if __name__ == "__main__":
     42     loop = asyncio.get_event_loop()
---> 43     loop.run_until_complete(main())

File /usr/lib/python3.10/asyncio/base_events.py:625, in BaseEventLoop.run_until_complete(self, future)
    614 """Run until the Future is done.
    615
    616 If the argument is a coroutine, it is wrapped in a Task.
   (...)
    622 Return the Future's result, or raise its exception.
    623 """
    624 self._check_closed()
--> 625 self._check_running()
    627 new_task = not futures.isfuture(future)
    628 future = tasks.ensure_future(future, loop=self)

File /usr/lib/python3.10/asyncio/base_events.py:584, in BaseEventLoop._check_running(self)
    582 def _check_running(self):
    583     if self.is_running():
--> 584         raise RuntimeError('This event loop is already running')
    585     if events._get_running_loop() is not None:
    586         raise RuntimeError(
    587             'Cannot run the event loop while another loop is running')

RuntimeError: This event loop is already running
```

## asyncio.run_coroutine_threadsafe

Failed.

```python
import asyncio

async def main():
    await asyncio.sleep(1)

if __name__ == "__main__":
  loop = asyncio.get_event_loop()
  future = asyncio.run_coroutine_threadsafe(main(), loop)
  future.result()

# run into timeout
```

## loop.run_in_executor

Failed.

Works in Databricks interactive mode, but not in Databricks jobs.
In job cluster, we got error:

```python
import asyncio

async def main():
    await asyncio.sleep(1)

def sync_main():
    asyncio.run(main())

if __name__ == "__main__":
  loop = asyncio.get_event_loop()
  await loop.run_in_executor(None, sync_main)


File /tmp/tmpba3flrqf.py:46
  await loop.run_in_executor(None, main)
  ^
SyntaxError: 'await' outside function
```

## loop.create_task

Failed.

Works in Databricks interactive mode, but not in Databricks jobs.
In job cluster, we got error:

```python
import asyncio

async def main():
    await asyncio.sleep(1)

if __name__ == "__main__":
  loop = asyncio.get_event_loop()
  task = loop.create_task(main())
  results = await asyncio.gather(task)


File /tmp/tmp_kskwl7g.py:44
  await asyncio.gather(task)
  ^
SyntaxError: 'await' outside function
```

## Conclusion

Only [nest_asyncio](#nest_asyncioapply) works in Databricks job cluster with Python scripts. But be aware that the module has been archived by the author.
Some other methods work in Databricks with Notebooks, but Notebooks are not recommended for production use as it depends on Git.
