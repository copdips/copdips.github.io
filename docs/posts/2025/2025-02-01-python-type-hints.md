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

Type hints ([PEP 484](https://peps.python.org/pep-0484/)) have been a major focus of recent Python releases, and I was particularly intrigued when I heard about [Guido van Rossum's work on MyPy at Dropbox](https://blog.dropbox.com/topics/company/thank-you--guido), where the team needed robust tooling to migrate their codebase from Python 2 to Python 3.

Today, type hints are essential for modern Python development. They significantly enhance IDE capabilities and AI-powered development tools by providing better code completion, static analysis, and error detection. This mirrors the evolution we've seen with TypeScript's adoption over traditional JavaScript—explicit typing leads to more reliable and maintainable code.

!!! note "Typed Python vs data science projects"
    We know that type hints are [not very popular among data science projects](https://engineering.fb.com/2024/12/09/developer-tools/typed-python-2024-survey-meta/) for [some reasons](https://typing.python.org/en/latest/guides/typing_anti_pitch.html), but we won't discuss them here.

<!-- more -->

## typing module vs collections module

Since Python 3.9, most of types in `typing` module is [deprecated](https://docs.python.org/3/library/typing.html#deprecated-aliases), and `collections` module is recommended.

Some types like: `typing.Any`, `typing.Generic`, `typing.TypeVar`, etc. are still not deprecated.

!!! note "Thanks to subscription support in many collections since Python3.9"
    The `collections` module is now the preferred way to import many types (not all yet), as [they support subscription at runtime](https://mypy.readthedocs.io/en/stable/runtime_troubles.html#using-generic-builtins). [Subscription](https://docs.python.org/3/reference/expressions.html#subscriptions) refers to using square brackets `[]` to indicate the type of elements in a collection. **Subscription at runtime** means we can use `list[int]`, `dict[str, int]`, etc. directly without importing from `typing.List`, `typing.Dict`, etc.
    ```python title="subscription calls \_\_class_getitem\_\_()"
    In [1]: list[int]
    Out[1]: list[int]

    In [2]: type(list[int])
    Out[2]: types.GenericAlias

    """
    https://docs.python.org/3/reference/datamodel.html#classgetitem-versus-getitem
    # Usually, the subscription of an object using square brackets will call the __getitem__() instance method
    defined on the object's class. However, if the object being subscribed is itself a class,
    the class method __class_getitem__() may be called instead. __class_getitem__()
    should return a GenericAlias object if it is properly defined.
    """
    In [3]: list.__class_getitem__(int)
    Out[3]: list[int]

    In [4]: type(list.__class_getitem__(int))
    Out[4]: types.GenericAlias

    In [5]: list.__getitem__(int)
    ---------------------------------------------------------------------------

    TypeError                                 Traceback (most recent call last)
    Cell In[5], line 1
    ----> 1 list.__getitem__(int)

    TypeError: descriptor '__getitem__' for 'list' objects doesn't apply to a 'type' object
    ```

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

## Type aliases

[From Mypy](https://mypy.readthedocs.io/en/stable/kinds_of_types.html#type-aliases): Python 3.12 introduced the `type` statement for defining explicit type aliases. Explicit type aliases are unambiguous and can also improve readability by making the intent clear.
The definition may contain forward references without having to use string literal escaping, **since it is evaluated lazily**, which improves also the loading performance.

    ```python
    type AliasType = list[dict[tuple[int, str], set[int]]] | tuple[str, list[str]]

    # Now we can use AliasType in place of the full name:

    def f() -> AliasType:
        ...
    ```

## Type variable

[From MyPy](https://mypy.readthedocs.io/en/stable/kinds_of_types.html#the-type-of-class-objects): Python 3.12 introduced new syntax to use the `type[C]` and a type variable with an upper bound (see [Type variables with upper bounds](https://mypy.readthedocs.io/en/stable/generics.html#type-variable-upper-bound)).

    ```python title="Python 3.12 syntax"
    def new_user[U: User](user_class: type[U]) -> U:
        # Same implementation as before
    ```

Here is the example using the legacy syntax (**Python 3.11 and earlier**):

    ```python title="Python 3.11 and earlier syntax"
    U = TypeVar('U', bound=User)

    def new_user(user_class: type[U]) -> U:
        # Same implementation as before
    ```

Now mypy will infer the correct type of the result when we call new_user() with a specific subclass of User:

    ```python
    beginner = new_user(BasicUser)  # Inferred type is BasicUser
    beginner.upgrade()  # OK

    ```

## Annotating \_\_init\_\_ methods

[From MyPy](https://mypy.readthedocs.io/en/stable/class_basics.html#annotating-init-methods): It is allowed to omit the return type declaration on \_\_init\_\_ methods if at least one argument is annotated.

    ```python
    class C1:
        # __init__ has no argument is annotated,
        # so we should add return type declaration
        def __init__(self) -> None:
            self.var = 42

    class C2:
        # __init__ has at least one argument is annotated,
        # so it's allowed to omit the return type declaration
        # so in most cases, we don't need to add return type.
        def __init__(self, arg: int):
            self.var = arg

```

## Postponed Evaluation of Annotations

[PEP 563 (Postponed Evaluation of Annotations)](https://peps.python.org/pep-0563/) (also known as Future annotations import) allows you to use `from __future__ import annotations` to defer evaluation of type annotations until they're actually needed. Generally speaking, it turns every annotation into a string. This helps with:

- [Forward references](https://docs.pydantic.dev/latest/concepts/forward_annotations/)
- [Circular imports](#import-cycles)
- Performance improvements

`from __future__ import annotations` **must be the first executable line** in the file. You can only have shebang and comment lines before it.

    ```python hl_lines="1 7"
    from __future__ import annotations
    from pydantic import BaseModel

    class User(BaseModel):
        name: str
        age: int
        friends: list[User] = []  # Forward reference works

    # This works in Pydantic v2
    user = User(name="Alice", age=30, friends=[])
    ```

!!! warning "from \_\_future\_\_ import annotation is not fully compatible with Pydantic"
    See this [warning](https://mypy.readthedocs.io/en/stable/runtime_troubles.html#future-annotations-import-pep-563), and see this [github issue](https://github.com/jlowin/fastmcp/issues/905), and [this issue](https://github.com/pydantic/pydantic/issues/2678) for the compatibility issues with Pydantic and postponed evaluation of annotations.
    Future annotations import [doesn't support Python3.10 new syntax for union type](https://mypy.readthedocs.io/en/stable/runtime_troubles.html#using-x-y-syntax-for-unions) (e.g., `int | str`), and it also doesn't support the new syntax for type variables with upper bounds (e.g., `type[C]`), neither for some dynamic evaluation of annotations.
    So it's preferable **NOT TO USE** `from __future__ import annotation` as much as possible, just use `string literal annotations` for forward references and circular imports.

## Import cycles

[From MyPy](https://mypy.readthedocs.io/en/stable/runtime_troubles.html#import-cycles): If the cycle import is only needed for type annotations:

    ```python title="File foo.py" hl_lines="3-6"
    from typing import TYPE_CHECKING

    if TYPE_CHECKING:
        import bar

    def listify(arg: 'bar.BarClass') -> 'list[bar.BarClass]':
        return [arg]
    ```

    ```python title="File bar.py" hl_lines="1"
    from foo import listify

    class BarClass:
        def listifyme(self) -> 'list[BarClass]':
            return listify(self)
    ```

SqlAlchemy also uses [string literal](https://mypy.readthedocs.io/en/stable/runtime_troubles.html#string-literal-types-and-type-comments) for lazy evaluation and [typing.TYPE_CHECKING](https://mypy.readthedocs.io/en/stable/runtime_troubles.html#typing-type-checking) for typing:

    ```python title="File models/parent.py" linenums="1" hl_lines="1 8 19-21"
    from __future__ import annotations  # (1)!
    from typing import TYPE_CHECKING, List
    from sqlalchemy import String, Integer
    from sqlalchemy.orm import Mapped, mapped_column, relationship
    from database import Base

    if TYPE_CHECKING:
        from models.child import Child # (2)!

    class Parent(Base):
        __tablename__ = "parent"

        # SQLAlchemy v2 syntax
        id: Mapped[int] = mapped_column(Integer, primary_key=True)
        name: Mapped[str] = mapped_column(String(50), nullable=False)
        email: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)

        # One-to-Many (Parent -> Children)
        # children: Mapped[List[Child]] = relationship(
                                                        # (3)!
        children: Mapped[List["Child"]] = relationship(  # (4)!
            "Child",  # (5)!
            back_populates="parent",
            cascade="all, delete-orphan",
            lazy="selectin"  # one of sqlalchemy 2 lazy loading strategies
        )

        def __repr__(self) -> str:
            return f"<Parent(id={self.id}, name='{self.name}')>"
    ```

1. `from __future__ import annotations` (PEP 563) turns every annotation into a string. Should be used with careful.

2. The `TYPE_CHECKING` import enables static type checking tools (MyPy, IDEs) to analyze types without affecting runtime behavior. For more details, see the [SQLModel documentation](https://sqlmodel.tiangolo.com/tutorial/code-structure/#import-only-while-editing-with-type_checking).

3. While `from __future__ import annotations` (PEP 563) allows direct usage of `children: Mapped[List[Child]]`, the preferred approach is `children: Mapped[List["Child"]]`. The latter avoids potential compatibility issues with libraries like Pydantic while maintaining clear type hints.

4. By using `if TYPE_CHECKING:`, we ensure the type checker recognizes `children` as a list of `Child` objects (even it's in string format `"Child"`) while preventing circular imports at runtime.

5. SQLAlchemy uses string literals (e.g., `"Child"`) to reference models, allowing for lazy loading and avoiding circular dependencies.

    ```python title="File models/child.py" linenums="1" hl_lines="1 8 24-25"
    from __future__ import annotations
    from typing import TYPE_CHECKING, Optional
    from sqlalchemy import String, Integer, ForeignKey
    from sqlalchemy.orm import Mapped, mapped_column, relationship
    from database import Base

    if TYPE_CHECKING:
        from models.parent import Parent

    class Child(Base):
        __tablename__ = "child"

        id: Mapped[int] = mapped_column(Integer, primary_key=True)
        name: Mapped[str] = mapped_column(String(50), nullable=False)
        age: Mapped[int] = mapped_column(Integer, nullable=False)

        parent_id: Mapped[int] = mapped_column(
            Integer,
            ForeignKey("parents.id", ondelete="CASCADE"),
            nullable=False
        )

        # Many-to-One (Child -> Parent)
        parent: Mapped[Parent] = relationship(
            "Parent",
            back_populates="children",
            lazy="selectin"
        )

        def __repr__(self) -> str:
            return f"<Child(id={self.id}, name='{self.name}', parent_id={self.parent_id})>"
    ```

## Type hints

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
