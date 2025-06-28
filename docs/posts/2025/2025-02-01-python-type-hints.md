---
authors:
- copdips
categories:
- python
- linter
comments: true
date:
  created: 2025-02-01
  updated: 2025-06-28
---

# Python Type Hints

Python is a dynamically typed language, meaning variable types don't require explicit declaration. However, as projects grow in complexity, type annotations become increasingly valuable for code maintainability and clarity.

Type hints have been a major focus of recent Python releases, and I was particularly intrigued when I heard about [Guido van Rossum's work on MyPy at Dropbox](https://blog.dropbox.com/topics/company/thank-you--guido), where the team needed robust tooling to migrate their codebase from Python 2 to Python 3.

Today, type hints are essential for modern Python development. They significantly enhance IDE capabilities and AI-powered development tools by providing better code completion, static analysis, and error detection. This mirrors the evolution we've seen with TypeScript's adoption over traditional JavaScript—explicit typing leads to more reliable and maintainable code.

<!-- more -->

## typing module vs collections module

Since Python 3.9, most of types in `typing` module is [deprecated](https://docs.python.org/3/library/typing.html#deprecated-aliases), and `collections` module is recommended.

Some types like: `typing.Any`, `typing.Generic`, `typing.TypeVar`, etc. are still not deprecated.

### Aliases to Built-in Types

| Deprecated Alias   | Replacement |
| ------------------ | ----------- |
| `typing.Dict`      | `dict`      |
| `typing.List`      | `list`      |
| `typing.Set`       | `set`       |
| `typing.FrozenSet` | `frozenset` |
| `typing.Tuple`     | `tuple`     |
| `typing.Type`      | `type`      |

### Aliases to Types in collections

| Deprecated Alias     | Replacement               |
| -------------------- | ------------------------- |
| `typing.DefaultDict` | `collections.defaultdict` |
| `typing.OrderedDict` | `collections.OrderedDict` |
| `typing.ChainMap`    | `collections.ChainMap`    |
| `typing.Counter`     | `collections.Counter`     |
| `typing.Deque`       | `collections.deque`       |

### Aliases to Other Concrete Types

| Deprecated Alias    | Replacement                                                             |
| ------------------- | ----------------------------------------------------------------------- |
| `typing.Pattern`    | `re.Pattern`                                                            |
| `typing.Match`      | `re.Match`                                                              |
| `typing.Text`       | `str`                                                                   |
| `typing.ByteString` | `collections.abc.Buffer` or union like `bytes | bytearray | memoryview` |

### Aliases to Container ABCs in collections.abc

| Deprecated Alias         | Replacement                       |
| ------------------------ | --------------------------------- |
| `typing.AbstractSet`     | `collections.abc.Set`             |
| `typing.Collection`      | `collections.abc.Collection`      |
| `typing.Container`       | `collections.abc.Container`       |
| `typing.ItemsView`       | `collections.abc.ItemsView`       |
| `typing.KeysView`        | `collections.abc.KeysView`        |
| `typing.Mapping`         | `collections.abc.Mapping`         |
| `typing.MappingView`     | `collections.abc.MappingView`     |
| `typing.MutableMapping`  | `collections.abc.MutableMapping`  |
| `typing.MutableSequence` | `collections.abc.MutableSequence` |
| `typing.MutableSet`      | `collections.abc.MutableSet`      |
| `typing.Sequence`        | `collections.abc.Sequence`        |
| `typing.ValuesView`      | `collections.abc.ValuesView`      |

### Aliases to Asynchronous ABCs in collections.abc

| Deprecated Alias        | Replacement                      |
| ----------------------- | -------------------------------- |
| `typing.Coroutine`      | `collections.abc.Coroutine`      |
| `typing.AsyncGenerator` | `collections.abc.AsyncGenerator` |
| `typing.AsyncIterable`  | `collections.abc.AsyncIterable`  |
| `typing.AsyncIterator`  | `collections.abc.AsyncIterator`  |
| `typing.Awaitable`      | `collections.abc.Awaitable`      |

### Aliases to Other ABCs in collections.abc

| Deprecated Alias    | Replacement                  |
| ------------------- | ---------------------------- |
| `typing.Iterable`   | `collections.abc.Iterable`   |
| `typing.Iterator`   | `collections.abc.Iterator`   |
| `typing.Callable`   | `collections.abc.Callable`   |
| `typing.Generator`  | `collections.abc.Generator`  |
| `typing.Hashable`   | `collections.abc.Hashable`   |
| `typing.Reversible` | `collections.abc.Reversible` |
| `typing.Sized`      | `collections.abc.Sized`      |

### Aliases to contextlib ABCs

| Deprecated Alias             | Replacement                              |
| ---------------------------- | ---------------------------------------- |
| `typing.ContextManager`      | `contextlib.AbstractContextManager`      |
| `typing.AsyncContextManager` | `contextlib.AbstractAsyncContextManager` |

### Notes

- Deprecated aliases are guaranteed to remain until at least Python 3.14.
- Type checkers may flag deprecated aliases for projects targeting Python 3.9+.

## Sequence & Collection

- `collections.abc.Sequence` is a type of ordered collection. Sequence does not include `append` and `extend` methods.
- `collections.abc.Collection` is a type of unordered collection.

| Type                            | Sequence | Collection |
| ------------------------------- | -------- | ---------- |
| str                             | Yes      | No         |
| tuple                           | Yes      | Yes        |
| list                            | Yes      | Yes        |
| set                             | No       | Yes        |
| dict                            | No       | Yes        |
| order                           | Yes      | No         |
| indexing (e.g., `seq[0]`)       | Yes      | No         |
| Membership Checks (`x in data`) | Yes      | Yes        |

!!! note "(Python 3.9+) Both `typing.Sequence` and `typing.Collection` are [deprecated aliases](#typing-module-vs-collections-module)."

## Typing tools

### MyPy

Ref. MyPy in [this post](../2021/2021-01-04-python-lint-and-format.md#mypy).

### Pyright && Pylance

Ref. Pyright in [this post](../2021/2021-01-04-python-lint-and-format.md#pyright).

[Pylance](https://github.com/microsoft/pylance-release#readme) is the Microsoft backed Pyright extension for VSCode.

### RightTyper

During an internal tech demo at my working, I heard about [RightTyper](https://github.com/RightTyper/RightTyper), a Python tool that generates type annotations for function arguments and return values.
It’s important to note that RightTyper doesn’t statically parse your Python files to add types; instead, it needs to run your code to detect types on the fly. So, one of the best ways to use RightTyper is with python `-m pytest`, assuming you have good test coverage.

### ty

[ty](https://github.com/astral-sh/ty) represents the next generation of Python type checking tools. Developed by the team behind the popular [ruff](https://docs.astral.sh/ruff/) linter, ty is implemented in Rust for exceptional performance.
It functions both as a type checker and language server, offering seamless integration through its dedicated [VSCode extension ty-vscode](https://github.com/astral-sh/ty-vscode).

While Ruff excels at various aspects of Python linting, type checking remains outside its scope.
ty aims to fill this gap, though it's currently in preview and still evolving toward production readiness.
The combination of Ruff and ty promises to provide a comprehensive Python code quality toolkit.

### pyrefly

[pyrefly](https://pyrefly.org/) emerges as another promising entrant in the Python type checking landscape.
Developed by Meta and also written in Rust, pyrefly offers both type checking capabilities and language server functionality.
While still in preview, it demonstrates the growing trend of high-performance Python tooling implemented in Rust.

The tool integrates smoothly with modern development environments through its [VSCode extension refly-vscode](https://marketplace.visualstudio.com/items?itemName=meta.pyrefly), making it accessible to a wide range of developers.
Its backing by Meta suggests potential for robust development and long-term support.

Just a quick test, pyrefly seems to generate more typing errors than ty.
