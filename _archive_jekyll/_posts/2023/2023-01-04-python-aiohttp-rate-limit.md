---
last_modified_at: 2023-01-06 21:26:17
title: "Python aiohttp rate limit"
excerpt: ""
tags:
  - python
  - async
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
HTTP rate limit is often the max requests in a limited time period, and sometimes could also be the max concurrent requests.

## Max requests in a limited time period

```python
from aiolimiter import AsyncLimiter

RATE_LIMIT_IN_SECOND = 20
# 1.0 for time period during 1 second
rate_limit = AsyncLimiter(RATE_LIMIT_IN_SECOND, 1.0)

async with rate_limit:
    await my_aiohttp_request()
```

## Max concurrent requests

Official doc: [Limiting connection pool size](https://docs.aiohttp.org/en/stable/client_advanced.html#limiting-connection-pool-size)

```python
import aiohttp

MAX_CONCURRENT = 10

async def main():
  # The default limit is 100
  connector = aiohttp.TCPConnector(limit=MAX_CONCURRENT)

  async with aiohttp.ClientSession(connector=connector) as session:
      await my_aiohttp_request()

if __name__ == "__main__":
    asyncio.run(main())
```

The object `connector` from `connector = aiohttp.TCPConnector(limit=MAX_CONCURRENT)` must be created within an async function.
{: .notice--warning}

## Example

We can borrow the official example on [asyncio queues](https://docs.python.org/fr/3/library/asyncio-queue.html#examples).

The below example shows how to send GET method to [https://httpbin.org/get](https://httpbin.org/get) with a rate limit of 20 requests per second and max 10 concurrent requests.

```python
import asyncio
import random
import time

import aiohttp
from aiolimiter import AsyncLimiter

MAX_CONCURRENT = 10
RATE_LIMIT_IN_SECOND = 20
rate_limit = AsyncLimiter(RATE_LIMIT_IN_SECOND, 1.0)


async def my_aiohttp_request(session, name):
    response = await session.get("https://httpbin.org/get")
    response.raise_for_status()
    json_response = await response.json()
    print(f"{name} finished aiohttp request with response: {json_response}")
    # do something on reponse here


async def worker(name, queue, session):
    while True:
        # Get a "work item" out of the queue.
        sleep_for = await queue.get()

        # Sleep for the "sleep_for" seconds.
        await asyncio.sleep(sleep_for)

        async with rate_limit:
            await my_aiohttp_request(session, name)

        # Notify the queue that the "work item" has been processed.
        queue.task_done()

        print(f"{name} has slept for {sleep_for:.2f} seconds")


async def main():
    connector = aiohttp.TCPConnector(limit=MAX_CONCURRENT)
    async with aiohttp.ClientSession(connector=connector) as session:
        # Create a queue that we will use to store our "workload".
        queue = asyncio.Queue()

        # Generate random timings and put them into the queue.
        total_sleep_time = 0
        for _ in range(20):
            sleep_for = random.uniform(0.05, 1.0)
            total_sleep_time += sleep_for
            queue.put_nowait(sleep_for)

        # Create three worker tasks to process the queue concurrently.
        tasks = [
            asyncio.create_task(worker(f"worker-{idx}", queue, session))
            for idx in range(MAX_CONCURRENT)
        ]
        # Wait until the queue is fully processed.
        started_at = time.monotonic()
        await queue.join()
        total_slept_for = time.monotonic() - started_at

        # Cancel our worker tasks.
        for task in tasks:
            task.cancel()
        # Wait until all worker tasks are cancelled.
        await asyncio.gather(*tasks, return_exceptions=True)

        print("====")
        print(f"3 workers slept in parallel for {total_slept_for:.2f} seconds")
        print(f"total expected sleep time: {total_sleep_time:.2f} seconds")


asyncio.run(main())
```
