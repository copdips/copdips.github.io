---
last_modified_at: 2021-03-20 08:31:41
title: "Python Requests With Retry"
excerpt: "Make python requests retry easily to use"
tags:
  - python
  - requests
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



There're several solutions to retry a HTTP request with [Requests](https://requests.readthedocs.io/en/master/) module, some of them are:

1. Native Requests' retry based on urllib3's [HTTPAdapter](https://2.python-requests.org/en/master/api/#requests.adapters.HTTPAdapter).
2. Third party module: [backoff](https://github.com/litl/backoff).
3. Third party module: [tenacity](https://github.com/jd/tenacity).

The native **HTTPAdapter** is not easy to use. The **tenacity** module is very powerful, but is also more or less overkill because it's a general Python retry utility, and doesn't throw the same exception `requests.exceptions.HTTPError` raised by `raise_for_status()` of Requests. Using tenacity to an ongoing project might involve some code refactoring. So this post will just show some snippets to make retry with the **backoff** module.

Usually, we should only retry on [idempotent verbs](https://developer.mozilla.org/en-US/docs/Glossary/Idempotent#technical_knowledge), we can get the same thing twice but we don't want to create the same thing twice. On the other hand, sometimes the specific environment that we're working on might have a POST as idempotent too, so make sure of that before using the retry.
{: .notice--warning}

## Using backoff to retry

```python
import logging
from logging import Logger

import backoff
import requests
from requests.exceptions import HTTPError
import urllib3

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)


# in an internal enterprise environment, we often need to disable the proxy and ignore the ssl check. Of course, if you don't trust the target, then verify the ssl.
NO_PROXY = {"http": None, "https": None}
COMMON_REQUESTS_PARAMS = {"verify": False, "proxies": NO_PROXY}


# This snippet only retries on the response return code >= 500
def fatal_code(e):
    return 400 <= e.response.status_code < 500


BACKOFF_RETRY_ON_EXCEPTION_PARAMS = {
    # expo: [1, 2, 4, 8, etc.] https://github.com/litl/backoff/blob/master/backoff/_wait_gen.py#L6
    "wait_gen": backoff.expo,
    # HTTPError raised by raise_for_status()
    # HTTPError code list: https://github.com/psf/requests/blob/master/requests/models.py#L943
    "exception": (HTTPError,),
    "max_tries": 4,
    "max_time": 50,  # nginx closes a session at 60' second by default
    "giveup": fatal_code,
}


@backoff.on_exception(**BACKOFF_RETRY_ON_EXCEPTION_PARAMS)
def request_with_retry(
    should_log: bool = False,
    logger: Logger = logging.getLogger(),
    logger_level: str = "info",
    **request_params
):
    full_params = COMMON_REQUESTS_PARAMS | request_params
    requests_params_keys_to_log = ["data", "json", "params"]
    if should_log:
        params_message = ""
        for key in requests_params_keys_to_log:
            if key in request_params:
                params_message += " with {} {}".format(key, request_params[key])
        log_message = "[{}] {} with params{}.".format(
            full_params["method"], full_params["url"], params_message
        )
        getattr(logger, logger_level.lower())(log_message)
    response = requests.request(**full_params)
    response.raise_for_status()
    return response

# how to use:
request_params = {"method": "get", "url": "http://localhost"}
response = request_with_retry(**request_params)
```
