---
last_modified_at:
title: "Python Asyncio Unittest"
excerpt: "Unittest based on Pytest framework not on embedded unittest."
tags:
  - python
  - async
  - pytest
  - unittest
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

> Unittest based on Pytest framework not embedded unittest.

## Mocking async http client aiohttp.ClientSession

### Source code

```python
# file path: root/module_name/foo.py
# pip install aiohttp
import aiohttp


class ClassFoo:
    def __init__(self, access_token: str):
        self.access_token = access_token
        self.auth_header = {"Authorization": f"Bearer {self.access_token}"}
        self.base_url = "https://foo.bar.com/api/v1"

    async def get_foo(self, foo_id: str) -> dict:
        url = f"{self.base_url}/{foo_id}"
        async with aiohttp.ClientSession(headers=self.auth_header) as session:
            async with session.get(url) as resp:
                resp.raise_for_status()
                return await resp.json()
```

### Unittest with pytest-asyncio

```python
# file path: root/tests/module_name/test_foo.py
# pip install pytest pytest-asyncio

from typing import Any
import pytest
from unittest.mock import MagicMock, patch, AsyncMock
from module_name import foo as test_module

TEST_MODULE_PATH = test_module.__name__


@pytest.fixture
def mock_session():
    with patch(f"{TEST_MODULE_PATH}.aiohttp.ClientSession") as mock_client_session:
        session = MagicMock()
        mock_client_session.return_value.__aenter__.return_value = session
        yield session


@pytest.fixture
def mock_service():
    access_token = "bar"
    yield test_module.ApplicationsService(access_token=access_token)


@pytest.mark.asyncio  # could be removed if asyncio_mode = "auto"
async def test_get_foo(mock_session, mock_service):
    foo_id = "foo"
    mock_json_response = {"key": "value"}

    mock_response = AsyncMock()
    mock_response.json.return_value = mock_json_response
    mock_response.raise_for_status.return_value = None

    mock_session.get.return_value.__aenter__.return_value = mock_response

    response = await mock_service.get_foo(foo_id=foo_id)

    mock_session.get.assert_called_once_with(f"{mock_service.base_url}/{foo_id}")
    assert response == mock_json_response
```

If you set [`asyncio_mode = "auto"`](https://pytest-asyncio.readthedocs.io/en/latest/reference/configuration.html) (defaults to `strict`) to your config (pyproject.toml, setup.cfg or pytest.ini) there is no need for the `@pytest.mark.asyncio` marker.
{: .notice--info}

Above unittest will success but also raise a warning:

```bash
============================= warnings summary ==============================
tests/module_name/test_foo.py::test_get_foo
  root/module_name/test_foo.py:15: RuntimeWarning: coroutine 'AsyncMockMixin._execute_mock_call' was never awaited
    resp.raise_for_status()
  Enable tracemalloc to get traceback where the object was allocated.
  See https://docs.pytest.org/en/stable/how-to/capture-warnings.html#resource-warnings for more info.
```

This is because `resp` is an `AsyncMock` object, `resp.raise_for_status()` will be an `AsyncMockMixin` object. But in fact, `raise_for_status()` is a traditional sync function, it will not be awaited. So we need to mock it with a `MagicMock` object:

```py
In [1]: from unittest.mock import AsyncMock, MagicMock

In [2]: a = AsyncMock()

In [3]: a
Out[3]: <AsyncMock id='140698543883888'>

In [4]: a.raise_for_status()
Out[4]: <coroutine object AsyncMockMixin._execute_mock_call at 0x7ff6ef43d2a0>

In [5]: a.raise_for_status = MagicMock()

In [6]: a.raise_for_status()
Out[6]: <MagicMock name='mock.raise_for_status()' id='140698512592176'>
```

To fix the warning, we need to change the line:

```python
# replace line:
mock_response.raise_for_status.return_value = None

# by:
mock_response.raise_for_status = MagicMock()
```

## Pytest fixture with session scope

Say I need a session scope fixture to perform a cleanup before all tests and after all tests:

```python
@pytest.fixture(scope="session", autouse=True)
async def _clean_up():
    await pre_tests_function()
    yield
    await post_tests_function()
```

This session scope fixture will be called automatically before all tests and after all tests. But when you run the tests, you will get an error:

> ScopeMismatch: You tried to access the 'function' scoped fixture 'event_loop' with a 'session' scoped request object, involved factories

This is because pytest-asyncio create by default a new [function scope event loop](https://pytest-asyncio.readthedocs.io/en/latest/concepts.html#asyncio-event-loops), but the async fixture `_clean_up` is session scoped and is using the event loop fixture, where the ScopeMismatch in the error message. To fix this, we need to create a new session scope event loop for the fixture `_clean_up`:

```python
@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.get_event_loop()
    yield loop
    loop.close()

@pytest.fixture(scope="session", autouse=True)
async def _clean_up():
    await pre_tests_function()
    yield
    await post_tests_function()
```
