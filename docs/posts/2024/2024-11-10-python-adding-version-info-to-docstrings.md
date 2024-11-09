---
authors:
- copdips
categories:
- python
comments: true
date:
  created: 2024-11-10
---

# Python adding version info to docstrings

When checking PySpark's source code, find a nice way it uses to add version information to docstrings by a [@since()](https://github.com/apache/spark/blob/5d757993f4cfcd859eb11640d210a560d6136465/python/pyspark/__init__.py#L81-L97) decorator. Here is an example:

<!-- more -->

```python title="decorator since defined in pypsark.since"
# https://github.com/apache/spark/blob/5d757993f4cfcd859eb11640d210a560d6136465/python/pyspark/__init__.py#L81-L97

_F = TypeVar("_F", bound=Callable)

def since(version: Union[str, float]) -> Callable[[_F], _F]:
    """
    A decorator that annotates a function to append the version of Spark the function was added.
    """
    import re

    indent_p = re.compile(r"\n( +)")

    def deco(f: _F) -> _F:
        assert f.__doc__ is not None

        indents = indent_p.findall(f.__doc__)
        indent = " " * (min(len(m) for m in indents) if indents else 0)
        f.__doc__ = f.__doc__.rstrip() + "\n\n%s.. versionadded:: %s" % (indent, version)
        return f

    return deco
```

```python title="usage of since decorator in delta.tables"
# https://github.com/apache/spark/blob/5d757993f4cfcd859eb11640d210a560d6136465/python/pyspark/ml/tuning.py#L191-L205

@since("1.4.0")
def build(self) -> List["ParamMap"]:
    """
    Builds and returns all combinations of parameters specified
    by the param grid.
    """
```

This will generate the following docstring for the `build` method when using `help(build)` in the Python REPL:

```python
"""
Builds and returns all combinations of parameters specified
by the param grid.

.. versionadded:: 1.4.0
"""
```

!!! note "@since() is not a standard decorator"
    If we review the source code of the `@since()` decorator, we can see that it is not a standard decorator. It doesn't run the decorated function inside the wrapper function. Instead, it just modifies the decorated function and returns it. A more common way to create decorator could be like this with `functools.wraps`, and execute some code before and after:

    ```python
    import functools

    def my_decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            print("Something is happening before the function is called.")
            result = func(*args, **kwargs)
            print("Something is happening after the function is called.")
            return result
        return wrapper

    @my_decorator
    def say_hello():
        """This function says hello."""
        print("Hello!")

    say_hello()

    """output:
    Something is happening before the function is called.
    Hello!
    Something is happening after the function is called.
    """
    ```
