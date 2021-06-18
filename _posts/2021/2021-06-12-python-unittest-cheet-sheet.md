---
last_modified_at:
title: "Python Unittest Cheet Sheet"
excerpt: ""
tags:
  - python
  - unittest
  - pytest
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

> Some small & quick examples on how to use Python unittest framwork, especially with Pytest framework. This post is not finished yet.

## pytest --pdb

https://docs.pytest.org/en/stable/usage.html#dropping-to-pdb-python-debugger-on-failures

This will invoke the Python debugger on every failure (or KeyboardInterrupt).

## pytest --pdb --pdbcls=IPython.terminal.debugger:TerminalPdb

https://docs.pytest.org/en/stable/usage.html#using-the-builtin-breakpoint-function

```bash
$ pytest --help | grep -i ipython
                        --pdbcls=IPython.terminal.debugger:TerminalPdb
```

`--pdbcls=IPython.terminal.debugger:Pdb` also opens a ipython session, [but without tab completion (readline)](https://ipython.readthedocs.io/en/latest/api/generated/IPython.core.debugger.html#IPython.core.debugger.Pdb).

This will use ipdb instead of pdb. Can also be set by default in `pytest.ini`:

```bash
[pytest]
addopts = --pdbcls=IPython.terminal.debugger:Pdb
```

PS: an alternatif: `pdbpp` (successor of `pytest-ipdb`) at: https://github.com/pdbpp/pdbpp

## export PYTHONBREAKPOINT=ipdb.set_trace

Another way to using ipdb in debugger is to set `export PYTHONBREAKPOINT=ipdb.set_trace`, and set a break point with `breakpoint()` (introduce in [Python 3.7](https://docs.python.org/3/library/functions.html#breakpoint)), then run test with `pytest -s`.

`import pdb; pdb.set_trace()` won't drop in to ipdb session with this way.
{: .notice--info}

## jupyter notebook #%% Debug Cell (VSCode only)

Aadd the `#%%` marker on a line, you will see a `Debug Cell` code lens. Should install the module jupyter at first.

Although we get the `Debug Cell`, it seems that it doesn't work in test, should do more research later.
{: .notice--warning}

## sys.last_value, sys.last_type and sys.last_traceback

https://docs.pytest.org/en/stable/usage.html#dropping-to-pdb-python-debugger-on-failures

> Note that on any failure the exception information is stored on sys.last_value, sys.last_type and sys.last_traceback. In interactive use, this allows one to drop into postmortem debugging with any debug tool. One can also manually access the exception information, for example:

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

## pytest --trace

https://docs.pytest.org/en/stable/usage.html#dropping-to-pdb-python-debugger-at-the-start-of-a-test

> allows one to drop into the PDB prompt immediately at the start of each test via a command line option.

## pytest --disable-socket

This is using a third party plugin [pytest-socket](https://github.com/miketheman/pytest-socket) to disable all network calls flowing through Python's socket interface. Unit test should not have any network calls, even any local file operations.

To work with async: `pytest --disable-socket --allow-unix-socket`

To allow specific hosts: `pytest --disable-socket --allow-hosts=127.0.0.1,8.8.8.8`
Not easy with IPs other than 127.0.0.1, as you might need to open sockets to more IPs for intermediate connections. So normally just --allow-hosts=127.0.0.1 if you have a local service (database for e.g.) for the unit tests.
{: .notice--warning}
## @pytest.mark

https://docs.pytest.org/en/stable/example/markers.html

We can use `@pytest.mark.foo` decorator to add a marker (label) on any test, and use `pytest -m foo` to run the tests only with mark name is `foo`.
This method is often used by the pytest extensions to for example enable or disable the extension on some specific tests. Like [@pytest.mark.enable_socket for the pytest-socket extension](https://github.com/miketheman/pytest-socket#usage)

Some people also use markers to categorize the tests, like `@pytest.mark.unit` for unit tests, and `@pytest.mark.integration` for integration tests, etc.
Personally, I dont like this because it forces to add the markers on every tests, it will be a very heavy work, and once you forget to add the markers, your tests wont be runned, and you will never discover it. The common usage (maybe I'm wrong) that I saw on github is just to put different categories' tests in different folders.

We can also [marking the whole classs or modules](https://docs.pytest.org/en/stable/example/markers.html#marking-whole-classes-or-modules).

## pytest -k expr

https://docs.pytest.org/en/stable/example/markers.html#using-k-expr-to-select-tests-based-on-their-name

> You can use the -k command line option to specify an expression which implements a substring match on the test names `or class names or file names` instead of the exact match on markers that -m provides. This makes it easy to select tests based on their names.

You can use `and`, `or`, and `not`.

```bash
$ pytest -k "send_http" -v
$ pytest -k "not send_http" -v
$ pytest -k "send_http or quick" -v
```

## @pytest.mark.xfail(strict=True, reason="")

https://docs.pytest.org/en/reorganize-docs/new-docs/user/xfail.html#strict-parameter

> Having the xfail marker will still run the test but won’t report a traceback once it fails. Instead terminal reporting will list it in the “expected to fail” (`XFAIL`) section. If the test doesn’t fail it will be reported as “unexpectedly passing” (`XPASS`). set strict=True to ensure `XPASS` (unexpectedly passing) causes the tests to be recorded as a failure.

```python

@pytest.mark.xfail(strict=True, reason="")
def test_function():
    ...
```

## @pytest.mark.parametrize

https://docs.pytest.org/en/stable/example/parametrize.html

I put `@pytest.mark.parametrize` out of `@pytest.mark` because they're really different. In fact, I discovered pytest from this functionnality.

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

https://docs.pytest.org/en/stable/example/parametrize.html#apply-indirect-on-particular-arguments

> Very often parametrization uses more than one argument name. There is opportunity to apply indirect parameter on particular arguments. It can be done by passing list or tuple of arguments’ names to indirect. In the example below there is a function test_indirect which uses two fixtures: x and y. Here we give to indirect the list, which contains the name of the fixture x. The indirect parameter will be applied to this argument only, and the value a will be passed to respective fixture function.

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

https://docs.python.org/3/library/unittest.mock-examples.html#side-effect-functions-and-iterables

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
