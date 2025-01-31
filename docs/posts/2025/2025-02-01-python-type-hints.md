---
authors:
- copdips
categories:
- python
comments: true
date:
  created: 2025-02-01
---

# Python Type Hints

## typing module vs collections module

Since Python 3.9, most of types in `typing` module is [deprecated](https://docs.python.org/3/library/typing.html#deprecated-aliases), and `collections` module is recommended.

Some types like: `typing.Any`, `typing.Generic`, `typing.TypeVar`, etc. are still not deprecated.

<!-- more -->

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

## To be continued
