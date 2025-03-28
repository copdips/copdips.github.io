---
authors:
- copdips
categories:
- python
- unittest
comments: true
date:
  created: 2021-06-12
  updated: 2024-12-27
description: ''
---

# Python Unittest Cheat Sheet

Python unittest and Pytest is a big deal, this post just gives some small & quick examples on how to use Python unittest framework, especially with Pytest framework. This post is not finished yet.

<!-- more -->

## check if is in pytest mode

```python
# https://github.com/ETretyakov/hero-app/blob/7fd5955599e2d0149b1b2a09026337ee67f2c007/app/core/db.py#L1-L11
from sys import modules
...

db_connection_str = settings.db_async_connection_str
if "pytest" in modules:
    db_connection_str = settings.db_async_test_connection_str
```

## config in pyproject.toml

```toml title="file pyproject.toml"
[tool.pytest.ini_options]
testpaths = ["tests/unit"]
# https://pytest-asyncio.readthedocs.io/en/latest/concepts.html#auto-mode
asyncio_mode = "auto"
addopts = """
    -v -s
    --junitxml=junit/test-results.xml
    --cov app
    --cov-report=html
    --cov-report=xml
    --cov-report=term-missing:skip-covered
    --cov-fail-under=70
    """
# env is enabled by pytest-env
env = ["TESTING=yes"]
```

## asyncio support

- <https://github.com/ETretyakov/hero-app/blob/master/app/conftest.py>
- <https://github.com/ThomasAitken/demo-fastapi-async-sqlalchemy/blob/main/backend/app/conftest.py>
- <https://github.com/copdips/fastapi-demo/blob/main/tests/integration/conftest.py>
- <https://github.com/copdips/fastapi-demo/blob/b0142df65ffe2d2f72a1414ca27f0ca9aaeeff4d/pyproject.toml#L48>

## pytest in Makefile

```Makefile title="pytest conf are defined in pyproject.toml"
# Makefile
# https://github.com/databrickslabs/dbx/blob/main/Makefile

SHELL=/bin/bash
VENV_NAME := $(shell [ -d venv ] && echo venv || echo .venv)
VENV_DIR=${VENV_NAME}
PYTHON=$(shell if [ -d $(VENV_DIR) ]; then echo $(VENV_DIR)/bin/python; else echo python; fi)

test-integration:
    @echo "${BOLD}${YELLOW}Running integration tests:${NORMAL}"
    # ! --dist=loadfile to let Tests are grouped by their containing file.
    # Groups are distributed to available workers as whole units.
    # This guarantees that all tests in a file run in the same worker.
    # https://pytest-xdist.readthedocs.io/en/stable/distribution.html#running-tests-across-multiple-cpus
    $(PYTHON) -m pytest tests/integration -n auto --dist=loadfile

test: test-integration
    $(PYTHON) -m pytest tests/unit -n auto
```

## pytest --pdb

<https://docs.pytest.org/en/stable/how-to/failures.html#using-python-library-pdb-with-pytest>

This will invoke the Python debugger on every failure (or KeyboardInterrupt).

`pytest -x --pdb`: drop to PDB on first failure, then end test session

[breakpoint](https://docs.pytest.org/en/stable/how-to/failures.html#using-the-builtin-breakpoint-function):

>>> Python 3.7 introduces a builtin breakpoint() function. Pytest supports the use of breakpoint() with the following behaviors:
>>>
>>> - When `breakpoint()` is called and `PYTHONBREAKPOINT` is set to the default value, pytest will use the custom internal PDB trace UI instead of the system default Pdb.
>>> - When tests are complete, the system will default back to the system Pdb trace UI.
>>> - With `--pdb` passed to pytest, the custom internal Pdb trace UI is used with both `breakpoint()` and failed tests/unhandled exceptions.
>>> - `--pdbcls` can be used to specify a custom debugger class.

## pytest --pdb --pdbcls=IPython.terminal.debugger:TerminalPdb

<https://docs.pytest.org/en/stable/how-to/failures.html#using-python-library-pdb-with-pytest>

Use ipdb instead of pdb.

```bash
$ pytest --help | grep -i ipython
                        --pdbcls=IPython.terminal.debugger:TerminalPdb
```

`--pdbcls=IPython.terminal.debugger:Pdb` also opens a ipython session, [but without tab completion (readline)](https://ipython.readthedocs.io/en/latest/api/generated/IPython.core.debugger.html#IPython.core.debugger.Pdb).

Set in `pytest.ini`:

```bash
[pytest]
addopts = --pdbcls=IPython.terminal.debugger:TerminalPdb
```

Set in `pyproject.toml`:

```toml title="file pyproject.toml"
[tool.pytest.ini_options]
testpaths = ["tests/unit"]
addopts = """
    -v -s
    --junitxml=junit/test-results.xml
    --cov <app_folder_name>
    --cov-report=html
    --cov-report=xml
    --cov-report=term-missing:skip-covered
    --cov-fail-under=0
    --pdbcls=IPython.terminal.debugger:TerminalPdb
    """
```

PS: an alternatif: `pdbpp` (successor of `pytest-ipdb`) at: https://github.com/pdbpp/pdbpp

## export PYTHONBREAKPOINT=ipdb.set_trace

Another way to using ipdb in debugger is to set `export PYTHONBREAKPOINT=ipdb.set_trace`, and set a break point with `breakpoint()` (introduce in [Python 3.7](https://docs.python.org/3/library/functions.html#breakpoint)), then run test with `pytest -s`.

!!! note

    `import pdb; pdb.set_trace()` won't drop in to ipdb session with this way.

## jupyter notebook #%% Debug Cell (VSCode only)

Add the `#%%` marker on a line, you will see a `Debug Cell` code lens. Should install the module jupyter at first.

!!! warning

    Although we get the `Debug Cell`, it seems that it doesn't work in test, should do more research later.

## sys.last_value, sys.last_type and sys.last_traceback

[https://docs.pytest.org/en/stable/usage.html#dropping-to-pdb-python-debugger-on-failures](https://docs.pytest.org/en/stable/usage.html#dropping-to-pdb-python-debugger-on-failures)

Note that on any failure the exception information is stored on sys.last_value, sys.last_type and sys.last_traceback. In interactive use, this allows one to drop into postmortem debugging with any debug tool. One can also manually access the exception information, for example:

```python
# when pytest --pdb is stopping at a failure
>>> import sys

>>> sys.last_traceback.tb_lineno
1641

>>> sys.last_traceback.tb_frame
<frame at 0x7fcca5f89a00, file '/home/xiang/git/myPython/venv/lib/python3.8/site-packages/_pytest/python.py', line 1641, code runtest>

>>> sys.last_value
AssertionError('assert result == "ok"',)

>>> sys.last_type
<class 'AssertionError'>


```

## pytest \-\-trace

[https://docs.pytest.org/en/stable/usage.html#dropping-to-pdb-python-debugger-at-the-start-of-a-test](https://docs.pytest.org/en/stable/usage.html#dropping-to-pdb-python-debugger-at-the-start-of-a-test)

allows one to drop into the PDB prompt immediately at the start of each test via a command line option.

## pytest \-\-disable-socket

This is using a third party plugin [pytest-socket](https://github.com/miketheman/pytest-socket) to disable all network calls flowing through Python's socket interface. Unit test should not have any network calls, even any local file operations.

To work with async: `pytest --disable-socket --allow-unix-socket`

To allow specific hosts: `pytest --disable-socket --allow-hosts=127.0.0.1,8.8.8.8`
!!! warning

    Not easy with IPs other than 127.0.0.1, as you might need to open sockets to more IPs for intermediate connections. So normally just --allow-hosts=127.0.0.1 if you have a local service (database for e.g.) for the unit tests.

!!! warning

    Pay extra attention to this [caveat](https://github.com/miketheman/pytest-socket#frequently-asked-questions). If you create another fixture that creates a socket usage that has a "higher" instantiation order, such as at the module/class/session, then the higher order fixture will be resolved first, and won't be disabled during the tests.

## @pytest.mark

[https://docs.pytest.org/en/stable/example/markers.html](https://docs.pytest.org/en/stable/example/markers.html)

Firstly but **optionally**, we could [register the markers](https://docs.pytest.org/en/stable/how-to/mark.html#registering-marks)

Than, we can use `@pytest.mark.foo` decorator to add a `foo` marker (label) on any test, and use `pytest -m foo` to run the tests only with mark name is `foo`, and `pytest -m "not foo"` to run the tests without mark name is `foo`.

This method is often used by the pytest extensions to for example enable or disable the extension on some specific tests. Like [@pytest.mark.enable_socket for the pytest-socket extension](https://github.com/miketheman/pytest-socket#usage)

Some people also use markers to categorize the tests, like `@pytest.mark.unit` for unit tests, and `@pytest.mark.integration` for integration tests, etc.
Personally, I don't like this because it forces to add the markers on every tests, it will be a very heavy work, and once you forget to add the markers, your tests wont be run, and you will never discover it. The common usage (maybe I'm wrong) that I saw on github is just to put different categories' tests in different folders.

We can also [marking the whole class or modules](https://docs.pytest.org/en/stable/example/markers.html#marking-whole-classes-or-modules).

To run the tests with multiple markers, use `pytest -m "foo or bar"`.
To run the tests not with multiple markers, use `pytest -m "not foo and not bar"`.

## pytest -k expr

[https://docs.pytest.org/en/stable/example/markers.html#using-k-expr-to-select-tests-based-on-their-name](https://docs.pytest.org/en/stable/example/markers.html#using-k-expr-to-select-tests-based-on-their-name)

You can use the `-k` command line option to specify an expression which implements a substring match on the `test names` or `class names` or `file names` instead of the exact match on markers that -m provides. This makes it easy to select tests based on their names.

You can use `and`, `or`, and `not`.

```bash
pytest -k "send_http" -v
pytest -k "not send_http" -v
pytest -k "send_http or quick" -v
```

## Failfast

<https://docs.pytest.org/en/stable/how-to/failures.html#stopping-after-the-first-or-n-failures>

`--exitfirst` / `-x` can now be overridden by a following `--maxfail=N` and is just a synonym for `--maxfail=1`.

```bash
$ pytest --help | grep -E '\--tb|maxfail'
  --tb=style            Traceback print mode (auto/long/short/line/native/no)
  --maxfail=num         Exit after first num failures or errors

$ pytest --maxfail=1 --tb=short
```

[Modifying Python traceback printing](https://docs.pytest.org/en/stable/how-to/output.html#modifying-python-traceback-printing) with `--tb`:

```bash
pytest --showlocals     # show local variables in tracebacks
pytest -l               # show local variables (shortcut)
pytest --no-showlocals  # hide local variables (if addopts enables them)

pytest --capture=fd  # default, capture at the file descriptor level
pytest --capture=sys # capture at the sys level
pytest --capture=no  # don't capture
pytest -s            # don't capture (shortcut)
pytest --capture=tee-sys # capture to logs but also output to sys level streams

pytest --tb=auto    # (default) 'long' tracebacks for the first and last
                     # entry, but 'short' style for the other entries
pytest --tb=long    # exhaustive, informative traceback formatting
pytest --tb=short   # shorter traceback format
pytest --tb=line    # only one line per failure
pytest --tb=native  # Python standard library formatting
pytest --tb=no      # no traceback at all
```

## @pytest.mark.xfail(strict=True, reason="")

[https://docs.pytest.org/en/reorganize-docs/new-docs/user/xfail.html#strict-parameter](https://docs.pytest.org/en/reorganize-docs/new-docs/user/xfail.html#strict-parameter)

Having the `xfail` marker will still run the test but won't report a traceback once it fails. Instead terminal reporting will list it in the "expected to fail" (`XFAIL`) section. If the test doesn't fail it will be reported as "unexpectedly passing" (`XPASS`). set strict=True to ensure `XPASS` (unexpectedly passing) causes the tests to be recorded as a failure.

```python

@pytest.mark.xfail(strict=True, reason="")
def test_function():
    ...


```

## @pytest.mark.parametrize

[https://docs.pytest.org/en/stable/example/parametrize.html](https://docs.pytest.org/en/stable/example/parametrize.html)

I put `@pytest.mark.parametrize` out of `@pytest.mark` because they're really different. In fact, I discovered pytest from this functionality.

```python
@pytest.mark.parametrize(
    "a, b, expected",
    [
        (1, 2, 3),
        (3, 3, 6),
    ],
)
def test_sum(a, b, expected):
    total = a + b
    assert total == expected
```

### Apply indirect on particular arguments

[https://docs.pytest.org/en/stable/example/parametrize.html#apply-indirect-on-particular-arguments](https://docs.pytest.org/en/stable/example/parametrize.html#apply-indirect-on-particular-arguments)

Very often parametrization uses more than one argument name. There is opportunity to apply indirect parameter on particular arguments. It can be done by passing list or tuple of arguments' names to indirect. In the example below there is a function test_indirect which uses two fixtures: x and y. Here we give to indirect the list, which contains the name of the fixture x. The indirect parameter will be applied to this argument only, and the value a will be passed to respective fixture function.

if `indirect=True`, both `x` and `y` fixtures will be used, if only `indirect=["x"]`, then only the fixture `x` will be used, and `y` will be considered as a standard var name.

```python
# content of test_indirect_list.py

import pytest


@pytest.fixture(scope="function")
def x(request):
    return request.param * 3


@pytest.fixture(scope="function")
def y(request):
    return request.param * 2


@pytest.mark.parametrize("x, y", [("a", "b")], indirect=["x"])
def test_indirect(x, y):
    assert x == "aaa"
    assert y == "b"
```

## side_effect functions and iterables

[https://docs.python.org/3/library/unittest.mock-examples.html#side-effect-functions-and-iterables](https://docs.python.org/3/library/unittest.mock-examples.html#side-effect-functions-and-iterables)

We used to use side_effect to force a mock object to raise an exception. But we can also use side_effect to define different return values. This is useful when we have a same mock function used multiple times in a testing function, and this mock function should return different values.

**functions:**

```python
>>> vals = {(1, 2): 1, (2, 3): 2}
>>> def side_effect(*args):
...    return vals[args]
...
>>> mock = MagicMock(side_effect=side_effect)
>>> mock(1, 2)
1
>>> mock(2, 3)
2
```

**iterables:**

```python
>>> mock = MagicMock(side_effect=[4, 5, 6])
>>> mock()
4
>>> mock()
5
>>> mock()
6
```

## mock any class with Mock

```python
from dataclasses import dataclass
from unittest.mock import Mock


@dataclass
class A:
    name: str


@dataclass
class B:
    name: str


@dataclass
class InventoryItem:
    a: A
    b: B


def test_class_inventory_item():
    mock_inventory_item = InventoryItem(*[Mock() for _ in range(2)])

    # or using inspect to get dynamically the class parameters count
    from inspect import signature
    mock_inventory_item = InventoryItem(*[Mock() for _ in range(len(signature(InventoryItem).parameters))])
```

## monkeypatch

[monkeypatch](https://docs.pytest.org/en/stable/monkeypatch.html) is a pytest native fixture, all modifications will be undone after the requesting test function or fixture has finished.

### Monkeypatching functions or the property of a class

https://docs.pytest.org/en/stable/monkeypatch.html#simple-example-monkeypatching-functions

Very similar to Python standard lib `unittest.mock.patch` decorator since Python 3, but `monkeypatch` is a fixture. Some people find `monkeypatch` is less effort to write than `unittest.mock.patch`. Ref. https://github.com/pytest-dev/pytest/issues/4576

To use the native `unittest.mock.patch`, use the [`wraps` parameter](https://stackoverflow.com/a/59460964/5095636):

```python
# replace function bar of module x by another function fake_bar with unittest.mock.patch
# we can assert the mocked function with mock_bar
from unittest.mock import patch

def foo(arg1, arg2):
    r = bar(arg1)

def test_foo():
   with patch("x.bar", wraps=fake_bar) as mock_bar:
      actual = foo(arg1, arg2)
      assert actual == expected
      mock_bar.assert_called_once_with(arg1)
```

```python
# replace function bar of module x by another function fake_bar with monkeypatch
# we cannot assert the mocked function, but we don't need to give the x module in full string format.

def foo(arg1, arg2):
    r = bar(arg1)

def test_foo(monkeypatch):
    monkeypatch.setattr(x, "bar", fake_bar)
```

```python
# replace function bar of module x by another function fake_bar with pytest-mock
# we assert the mocked function

def foo(arg1, arg2):
    r = bar(arg1)

def test_foo(monkeypatch):
    mock_bar = mocker.patch("x.bar", wraps=fake_bar)
```

!!! note

    There's also a plugin `pytest-mock`, which provides `spy` and `stub` utilities.

!!! note

    The `wraps` parameter in the native `unittest.mock.patch` can also be used to [spy function](https://stackoverflow.com/a/43065411/5095636), if you don't want to use `pytest-mock.spy`.

```python
monkeypatch.setattr(obj, name, value, raising=True)
monkeypatch.delattr(obj, name, raising=True)
```

### Monkeypatching environment variables

[https://docs.pytest.org/en/stable/monkeypatch.html#monkeypatching-environment-variables](https://docs.pytest.org/en/stable/monkeypatch.html#monkeypatching-environment-variables)

!!! note

    Can be replaced by python native unittest.mock [@patch.dict('os.environ', {'newkey': 'newvalue'})](https://docs.python.org/3/library/unittest.mock.html#unittest.mock.patch.dict)

```python
# contents of our test file e.g. test_code.py
import pytest


@pytest.fixture
def mock_env_user(monkeypatch):
    monkeypatch.setenv("USER", "TestingUser")


@pytest.fixture
def mock_env_missing(monkeypatch):
    monkeypatch.delenv("USER", raising=False)


# notice the tests reference the fixtures for mocks
def test_upper_to_lower(mock_env_user):
    assert get_os_user_lower() == "testinguser"


def test_raise_exception(mock_env_missing):
    with pytest.raises(OSError):
        _ = get_os_user_lower()
```

### monkeypatch with parametrize

As said above monkeypatch is a fixture, so we can use [pytest-lazy-fixture](https://github.com/tvorog/pytest-lazy-fixture) to parametrize the fixtures. I cannot remember where is the link, in fact on one page from pytest official doc, it says that pytest cannot do it for the moment, that's why `pytest-lazy-fixture` is introduced here.

It is worth saying that following monkeypatch on env won't work:

```python
# file a.py
TEST_USER = os.getenv("TEST_USER")

def get_test_user():
    return(TEST_USER)


# file test_a.py
import pytest

from a import get_test_user

@pytest.fixture
def mock_env_user(monkeypatch):
    monkeypatch.setenv("TEST_USER", "TestingUser")

def test_get_test_user(mock_env_user):
    assert get_test_user() == "testinguser"
```

The test will fail, because the line `TEST_USER = os.getenv("TEST_USER")` in the file `a.py` is always imported before `mock_env_user` by `test_a.py`, `from a import get_test_user` is at the beginning of the test file. During the import, at this moment, the env var `TEST_USER` doesn't exist yet in os, it will always have the value `None`. To fix this problem, we need to put the `os.getenv` into `get_test_user` like:

```python
# file a.py

def get_test_user():
    TEST_USER = os.getenv("TEST_USER")
    return(TEST_USER)
```

### Monkeypatching dictionaries

!!! note

    Can be replaced by python native unittest.mock [@patch.dict()](https://docs.python.org/3/library/unittest.mock.html#unittest.mock.patch.dict)

```python
# patch one key at each patch
monkeypatch.setitem(app.DEFAULT_CONFIG, "user", "test_user")
monkeypatch.setitem(app.DEFAULT_CONFIG, "database", "test_db")
monkeypatch.delitem(app.DEFAULT_CONFIG, "name", raising=False)
```

### Modifying sys.path

```python
monkeypatch.syspath_prepend(path)
```

### Changing the context of the current working directory during a test

```python
monkeypatch.chdir(path)
```

## pytest-xdist to run tests in parallel

[https://github.com/pytest-dev/pytest-xdist](https://github.com/pytest-dev/pytest-xdist)

Especially useful when your tests are unit tests for example, which don't have dependencies from one  with each other, and don't share any changing data, which means your tests should be stateless.

```bash
# run on 4 CPUs
pytest -n 4

# run on a number of CPUs calculated automatically by the python built-in multiprocessing module
pytest -n auto

# run on a number of CPUs calculated automatically by the module psutil, you need such module if you have logical cpus as well as certain imposed limitations (like container runtimes with cpu limits)
# ref. https://stackoverflow.com/a/14840102/5095636
# ref. https://docs.python.org/3/library/multiprocessing.html#multiprocessing.cpu_count
pip install pytest-xdist[psutil]
pytest -n auto
```

!!! warning "pytest-xdist is not compatible with -s/--capture=no"
    Due to how `pytest-xdist` is implemented, the `-s/--capture=no` option does not work. a possible workaround is to [creating one log file for each worker](https://pytest-xdist.readthedocs.io/en/latest/how-to.html#creating-one-log-file-for-each-worker), and an example from this [StackOverflow answer](https://stackoverflow.com/a/76261063).

!!! note
    There's another module [pytest-parallel](https://github.com/browsertron/pytest-parallel), the author says his module can run the tests in concurrency, and very efficient in integration tests, which tests might be stateful or sequential. I haven't tested yet, so cannot say anything here.

## Ensure each pytest-xdist worker has its own database connection

Based on `worker_id` fixture, possible values are: `gw0`, `gw1`, etc., and `master` if no parallel fixture: https://breadcrumbscollector.tech/posts/running-tests-in-parallel-with-pytest/#worker_id-fixture

## Showing the tests durations

- Sowing the durations of all the tests: `pytest --durations=0`
- Showing the slowest 10 tests: `pytest --durations=10`

## speccing

[https://docs.python.org/3/library/unittest.mock.html#autospeccing](https://docs.python.org/3/library/unittest.mock.html#autospeccing)

mock.patch returns a mock object, a mock object can have whatever attributes and methods.

`mock.asssert_called_once_with(4, 5, 6)` doesn't fail as shown as follows:

```bash
>>> mock = Mock(name='Thing', return_value=None)
>>> mock(1, 2, 3)
>>> mock.asssert_called_once_with(4, 5, 6)
<Mock name='Thing.asssert_called_once_with()' id='140160334650144'>
```

### simple speccing

```bash
>>> from urllib import request
>>> mock = Mock()
>>> mock.asssert_called_with()
<Mock name='mock.asssert_called_with()' id='140160336271776'>

# using simple speccing, mock.asssert_called_with() is detected as an error
>>> mock = Mock(spec=request.Request)
>>> mock.asssert_called_with()
---------------------------------------------------------------------------
AttributeError                            Traceback (most recent call last)
...
AttributeError: Mock object has no attribute 'asssert_called_with'

# still using simple speccing, mock.data.asssert_called_with() is detected as an mocked method, no errors.
# so simple speccing doesnt' work for nested objects
>>> mock.data.asssert_called_with()
<Mock name='mock.data.asssert_called_with()' id='140160336027120'>
```

### auto-speccing

#### Using patch(autospec=True)

```bash
>>> from urllib import request
>>> patcher = patch('__main__.request', autospec=True)
>>> mock_request = patcher.start()

>>> request is mock_request
True

# mock_request.Request has the spec='Request' now
>>> mock_request.Request
<MagicMock name='request.Request' spec='Request' id='...'>

# the real request object doesn't have the static data attribute, so autospecced object doesn't have it neither.
>>> mock_request.data
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
  File "/usr/lib/python3.8/unittest/mock.py", line 637, in __getattr__
    raise AttributeError("Mock object has no attribute %r" % name)
AttributeError: Mock object has no attribute 'data'
```

#### Using create_autospec()

```bash
>>> from urllib import request
>>> mock_request = create_autospec(request)
>>> mock_request.Request('foo', 'bar')
<NonCallableMagicMock name='mock.Request()' spec='Request' id='...'>
```

!!! warning

    autospec works well on methods and static attributes, but a serious problem is that it is common for instance attributes to be created in the __init__() method and not to exist on the class at all. autospec can't know about any dynamically created attributes and restricts the api to visible attributes. This is why autospeccing is not the patch default behavior. Search the above phrase in the [python official doc](https://docs.python.org/3/library/unittest.mock.html#autospeccing) to get more details and solutions.

## unittest.mock.ANY

[https://docs.python.org/3/library/unittest.mock.html#any](https://docs.python.org/3/library/unittest.mock.html#any)

```bash
>>> from unittest.mock import Mock
>>> mock = Mock(return_value=None)
>>> mock('foo', bar=object())
>>> mock.assert_called_once_with('foo', bar=ANY)
```

```bash
>>> from unittest.mock import Mock, call
>>> m = Mock(return_value=None)
>>> m(1)
>>> m(1, 2)
>>> m(object())
>>> m.mock_calls == [call(1), call(1, 2), ANY]
```

## Appending coverage from multiple test runs

pytest with pytest-cov plugin installed provides the `--cov-append` option to append coverage data from multiple test runs.

```bash
$ pytest -h | grep append
  --cov-append          Do not delete coverage but append to current. Default:
                        False
```

Under the hood, pytest-cov uses the `coverage` module, and the `coverage` module provides the `combine` method to [combine multiple coverage data files](https://github.com/pytest-dev/pytest-cov/blob/4732d50f2322a6e0ea480a6c400fbc96f78283bb/src/pytest_cov/engine.py#L264-L280).

```bash
# https://coverage.readthedocs.io/en/latest/cmd.html#combining-data-files-coverage-combine

coverage combine
```

## Fixture teardown

### Teardown by yield (recommended)

[yield](https://docs.pytest.org/en/stable/how-to/fixtures.html#yield-fixtures-recommended)

!!! warning "Need to handle errors for yield fixture"
    If a yield fixture raises an exception before yielding, pytest won't try to run the teardown code after that yield fixture's yield statement.
    But, for every fixture that has already run successfully for that test, pytest will still attempt to tear them down as it normally would.

### Teardown by addfinalizer

[request.addfinalizer()](https://docs.pytest.org/en/stable/how-to/fixtures.html#adding-finalizers-directly)

```python
@pytest.fixture(scope="class")
def receiving_user(request):
    monkeypatch = pytest.MonkeyPatch()
    monkeypatch.setattr("module_foo.attribute_bar", True)
    request.addfinalizer(monkeypatch.undo)
```

!!! note "Use a Custom Monkeypatch Fixture for scopes other than function"
    By default, [monkeypatch](https://docs.pytest.org/en/stable/how-to/monkeypatch.html#how-to-monkeypatch-mock-modules-and-environments)
    in pytest is a fixture and scoped to functions,
    and pytest automatically handles teardown without manual intervention.
    However, when working with class scope or any other scope beyond functions, you must implement
    a custom `monkeypatch` fixture by [pytest.MonkeyPatch()](https://docs.pytest.org/en/stable/reference/reference.html#pytest.MonkeyPatch)
    and add the `request.addfinalizer(monkeypatch.undo)` as demonstrated in the example above.

### Fixture teardown order

For yield fixtures, the first teardown code to run is from the [right-most fixture](https://docs.pytest.org/en/stable/how-to/fixtures.html#note-on-finalizer-order), i.e. the last test parameter.

```python title="file: demo_pytest.py"
import pytest


@pytest.fixture
def fix_w_yield1():
    print("\nbefore_yield_1")
    yield
    print("after_yield_1")


@pytest.fixture
def fix_w_yield2():
    print("before_yield_2")
    yield
    print("after_yield_2")


def test_bar(fix_w_yield1, fix_w_yield2):
    print("\ntest_bar\n")
```

```bash title="pytest output"
$ pytest demo_pytest.py
============= test session starts ===========================
platform linux -- Python 3.10.15, pytest-7.4.4, pluggy-1.5.0
rootdir: /home/xiang/git/demo
plugins: xdist-3.6.1, cov-3.0.0
collected 1 item

demo_pytest.py
before_yield_1
before_yield_2

test_bar

.after_yield_2
after_yield_1

============== 1 passed in 0.01s ===========================
```

### Safe teardowns

[Each atomic operation should be in a separate fixture](https://docs.pytest.org/en/stable/how-to/fixtures.html#safe-fixture-structure) and separating it from other.
But not a big fixutre with many teardown operations after `yield`.
