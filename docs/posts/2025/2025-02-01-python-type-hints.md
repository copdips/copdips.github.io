---
authors:
- copdips
categories:
- python
- linter
comments: true
date:
  created: 2025-02-01
  updated: 2025-08-20
---

# Python Type Hints

Python is a dynamically typed language, meaning variable types don't require explicit declaration. However, as projects grow in complexity, type annotations become increasingly valuable for code maintainability and clarity.

Type hints ([PEP 484](https://peps.python.org/pep-0484/)) have been a major focus of recent Python releases, and I was particularly intrigued when I heard about [Guido van Rossum's work on MyPy at Dropbox](https://blog.dropbox.com/topics/company/thank-you--guido), where the team needed robust tooling to migrate their codebase from Python 2 to Python 3.

Today, type hints are essential for modern Python development. They significantly enhance IDE capabilities and AI-powered development tools by providing better code completion, static analysis, and error detection. This mirrors the evolution we've seen with TypeScript's adoption over traditional JavaScript—explicit typing leads to more reliable and maintainable code.

The majority of this post is based on [MyPy documentation](https://mypy.readthedocs.io/).

!!! note "Typed Python vs data science projects"
    We know that type hints are [not very popular among data science projects](https://engineering.fb.com/2024/12/09/developer-tools/typed-python-2024-survey-meta/) for [some reasons](https://typing.python.org/en/latest/guides/typing_anti_pitch.html), but we won't discuss them here.

<!-- more -->

## typing module vs collections module

Since Python 3.9, most of types in `typing` module i [deprecated](https://docs.python.org/3/library/typing.html#deprecated-aliases), and `collections` module is recommended.

Some types like: `typing.Any`, `typing.Generic`, `typing.TypeVar`, etc. are still not deprecated.

!!! note "Thanks to subscription support in many collections since Python3.9"
    The `collections` module is now the preferred way to import many types (not all yet), as [they support subscription at runtime](https://mypy.readthedocs.io/en/stable/runtime_troubles.html#using-generic-builtins). [Subscription](https://docs.python.org/3/reference/expressions.html#subscriptions) refers to using square brackets `[]` to indicate the type of elements in a collection. **Subscription at runtime** means we can use `list[int]`, `dict[str, int]`, etc. directly without importing from `typing.List`, `typing.Dict`, etc.
    ```python title="subscription calls **class_getitem**()"
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

- `collections.abc.Collection` is a type of unordered collection. Collections supports only `__len__`, `__iter__`, `__contains__` operators, and does not support indexing or slicing.
- `collections.abc.Sequence` is **subclass** of `Collection`, is a type of ordered, indexable collection. Sequence supports `__getitem__()`, `__reversed__` in addition to the methods of `Collection`. Sequences can be sliced and indexed.

See [Collections Abstract Base Classes](https://docs.python.org/3/library/collections.abc.html#collections-abstract-base-classes) to check all the methods available for each type.

| Type                                              | Sequence | Collection |
| ------------------------------------------------- | -------- | ---------- |
| str                                               | ✅       | ✅         |
| tuple                                             | ✅       | ✅         |
| list                                              | ✅       | ✅         |
| range                                             | ✅       | ✅         |
| set                                               | ❌       | ✅         |
| dict                                              | ❌       | ✅         |
| order                                             | ✅       | ❌         |
| indexing (having `__getitem__()`)(e.g., `seq[0]`) | ✅       | ❌         |
| Membership Checks (`x in data`)                   | ✅       | ✅         |

## Type aliases

[From Mypy](https://mypy.readthedocs.io/en/stable/kinds_of_types.html#type-aliases): Python 3.12 introduced the `type` statement for defining explicit type aliases. Explicit type aliases are unambiguous and can also improve readability by making the intent clear.
The definition may contain forward references without having to use string literal escaping, **since it is evaluated lazily**, which improves also the loading performance.

```python
type AliasType = list[dict[tuple[int, str], set[int]]] | tuple[str, list[str]]

# Now we can use AliasType in place of the full name:

def f() -> AliasType:
    ...
```

!!! warning "type alias can not be used with isinstance()"

## Type variable

[From MyPy](https://mypy.readthedocs.io/en/stable/kinds_of_types.html#the-type-of-class-objects): Python 3.12 introduced new syntax to use the `type[C]` and a type variable with an upper bound (see [Type variables with upper bounds](https://mypy.readthedocs.io/en/stable/generics.html#type-variable-upper-bound)).

In the below example, we define a type variable `U` that is bound to the `User` parent class.
This allows us to create a function that can return an instance of any subclass of `User`, while still providing type safety. See the [fastapi-demo for concrete example.](https://github.com/copdips/fastapi-demo/blob/d9922c99404f5d6406e2f10b02822d19a6bc3b91/app/services/base.py#L13-L33)

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

## abstract abc.ABC vs typing.Protocol

`abc.ABC` enforce the inheritance of abstract methods, requiring subclasses to implement them.
`typing.Protocol` is only for typing, allowing for structural subtyping without enforcing inheritance.

```python title="typing.Protocol"
from typing import Protocol

class Shape(Protocol):
    def area(self) -> float: ...

# no class Circle(Shape) here
class Circle:
    def __init__(self, r: float) -> None:
        self.r = r

    def area(self) -> float:
        return 3.14159 * self.r * self.r

def print_area(s: Shape) -> None:
    print(s.area())

c = Circle(10)
# as c has area() method, it matches Shape protocol, MyPy is happy with that.
print_area(c)  # ✅ Circle matches Shape structurally
```

## Callable and Protocol

[From MyPy](https://mypy.readthedocs.io/en/stable/protocols.html#callback-protocols): We can use [Protocols](https://typing.python.org/en/latest/spec/protocol.html) to define [callable](https://docs.python.org/3/library/collections.abc.html#collections.abc.Callable) types with a special [**call**](https://docs.python.org/3/reference/datamodel.html#object.__call__) member:

Callback `protocols` and `Callable` types can be used mostly interchangeably, but protocols are more flexible and can be used to define more complex callable types.

```python title="Callable Protocol"
from collections.abc import Iterable
from typing import Optional, Protocol

class Combiner(Protocol):
    def __call__(self, *vals: bytes, maxlen: int | None = None) -> list[bytes]: ...

def batch_proc(data: Iterable[bytes], cb_results: Combiner) -> bytes:
    for item in data:
        ...

def good_cb(*vals: bytes, maxlen: int | None = None) -> list[bytes]:
    ...
def bad_cb(*vals: bytes, maxitems: int | None) -> list[bytes]:
    ...

batch_proc([], good_cb)  # OK
batch_proc([], bad_cb)   # Error! Argument 2 has incompatible type because of
                         # different name and kind in the callback
```

!!! warning "Protocol doesn't like isinstance()"
    Although the `@runtime_checkable` decorator allows using `isinstance()` to check if an object conforms to a Protocol, this approach [has limitations and performance issues](https://mypy.readthedocs.io/en/stable/protocols.html#using-isinstance-with-protocols). Therefore, it's recommended to use `Protocol` exclusively for static type checking and avoid runtime `isinstance()` checks, at least until Python 3.13.

    ```python
    from typing import Protocol, runtime_checkable

    @runtime_checkable
    class Drawable(Protocol):
        def draw(self) -> None: ...

    class Circle:
        def draw(self) -> None:
            print("Drawing a circle")

    # This works but is not recommended
    circle = Circle()
    if isinstance(circle, Drawable):  # Avoid this pattern
        circle.draw()

    # Preferred approach: rely on duck typing
    def render(obj: Drawable) -> None:
        obj.draw()  # Type checker ensures obj has draw() method

    render(circle)  # Type-safe without runtime checks
    ```

## Type narrowing for parameters in multi-type

We know how to define parameters with union types `a: int | str`, but how can we help static type checkers understand which specific type a parameter has within if-else control flow?

Previously, we can simply use `isinstance()` function, Python 3.13 introduced `typing.TypeIs` ([PEP 742](https://peps.python.org/pep-0742/))for this purpose (use [typing_extensions.TypeIs](https://typing-extensions.readthedocs.io/en/latest/index.html#typing_extensions.TypeIs) for Python versions prior to 3.13).

```python title="use isinstance() for type narrowing"
# https://mypy.readthedocs.io/en/stable/type_narrowing.html#type-narrowing-expressions
from typing import reveal_type


def function(arg: object):
    if isinstance(arg, int):
        # Type is narrowed within the ``if`` branch only
        reveal_type(arg)  # Revealed type: "builtins.int"
    elif isinstance(arg, str) or isinstance(arg, bool):
        # Type is narrowed differently within this ``elif`` branch:
        reveal_type(arg)  # Revealed type: "builtins.str | builtins.bool"

        # Subsequent narrowing operations will narrow the type further
        if isinstance(arg, bool):
            reveal_type(arg)  # Revealed type: "builtins.bool"

    # Back outside of the ``if`` statement, the type isn't narrowed:
    reveal_type(arg)  # Revealed type: "builtins.object"
```

```python title="use TypeIs with Python 3.13 new syntax"
# https://mypy.readthedocs.io/en/stable/type_narrowing.html#type-narrowing-expressions
from typing import TypeIs, reveal_type

def is_str(x: object) -> TypeIs[str]:
    return isinstance(x, str)

def process(x: int | str) -> None:
    if is_str(x):
        reveal_type(x)  # Revealed type is 'str'
        print(x.upper())  # Valid: x is str
    else:
        reveal_type(x)  # Revealed type is 'int'
        print(x + 1)  # Valid: x is int

In [6]: process(2)
Runtime type is 'int'
3

In [7]: process("2")
Runtime type is 'str'
```

!!! warning "Don't use TypeGuard, it works only in if branch, not else branch. TypeIs works for both if and else branch."

### When to use TypeIs over isinstance()

[PEP 724 says](https://peps.python.org/pep-0742/#when-to-use-typeis): Python code often uses functions like `isinstance()` to distinguish between different possible types of a value. Type checkers understand `isinstance()` and various other checks and use them to narrow the type of a variable. However, sometimes you want to reuse a more complicated check in multiple places, or you use a check that the type checker doesn't understand. In these cases, you can define a `TypeIs` function to perform the check and allow type checkers to use it to narrow the type of a variable.

A TypeIs function takes a single argument and is annotated as returning `TypeIs[T]`, where `T` is the type that you want to narrow to. The function must return `True` if the argument is of type `T`, and `False` otherwise. The function can then be used in if checks, just like you would use `isinstance()`. For example:

```python
# https://peps.python.org/pep-0742/#when-to-use-typeis
rom typing import TypeIs, Literal

type Direction = Literal["N", "E", "S", "W"]

def is_direction(x: str) -> TypeIs[Direction]:
    return x in {"N", "E", "S", "W"}

def maybe_direction(x: str) -> None:
    if is_direction(x):
        print(f"{x} is a cardinal direction")
    else:
        print(f"{x} is not a cardinal direction")
```

## Stub files

Python [standard library](https://docs.python.org/3/library/index.html) ships its type hints in the [typeshed repo](https://github.com/python/typeshed) with `.pyi` extension.

For third party libraries, you can save stub files along with your code in the same directory, or you can put them in a for e.g. `myproject/stubs` directory, and point it by the env var export `MYPYPATH=~/work/myproject/stubs`.

If a directory contains both a `.py` and a `.pyi` file for the same module, the `.pyi` file takes precedence. This way you can easily add annotations for a module even if you don’t want to modify the source code. This can help you to manually add type hints to third-party libraries that don't have them.

### Generating stub files

Mypy also ships with two tools for making it easier to create and maintain stubs: [Automatic stub generation (stubgen)](https://mypy.readthedocs.io/en/stable/stubgen.html#stubgen) and [Automatic stub testing (stubtest)](https://mypy.readthedocs.io/en/stable/stubtest.html#stubtest).

```bash title="use stubgen to generate stub files for package my_pkg_dir"
# default output dir is: out, use -o to change it
stubgen my_pkg_dir -o stubs
```

```bash title="use pyright to generate stub files for package my_pkg_dir"
# default output dir is: typings
pyright --createstub my_pkg_dir
```

A common problem with stub files is that they tend to diverge from the actual implementation. Mypy includes the [stubtest](https://mypy.readthedocs.io/en/stable/stubtest.html#stubtest) tool that can automatically check for discrepancies between the stubs and the implementation at runtime.

```bash
MYPYPATH=stubs stubtest my_pkg_dir --concise
```

## Generics

`list`, `set`, `dict`, etc, all the built-in collection classes are all Generics type, as they accept one or more type arguments within [...], which can be arbitrary types.
For example, the type `dict[int, str]` has the type arguments `int` and `str`, and `list[int]` has the type argument `int`.

### Type variables with value restriction

[MyPy docs](https://mypy.readthedocs.io/en/stable/generics.html#type-variables-with-value-restriction):

```python title="Python 3.12 syntax"
def concat[S: (str, bytes)](x: S, y: S) -> S:
    return x + y

concat('a', 'b')    # Okay
concat(b'a', b'b')  # Okay
concat(1, 2)        # Error!
```

```python title="Python 3.11 and earlier syntax"
from typing import TypeVar

S = TypeVar('S', str, bytes)

def concat(x: S, y: S) -> S:
    return x + y

concat('a', 'b')    # Okay
concat(b'a', b'b')  # Okay
concat(1, 2)        # Error!
```

### Annotating decorators

<https://mypy.readthedocs.io/en/stable/generics.html#declaring-decorators>

## Overloading

Use [@overload](https://mypy.readthedocs.io/en/stable/more_types.html#function-overloading) to let type checkers know that a function can accept different types of arguments and return different types based on those arguments.

!!! note "If there are multiple equally good matching variants (overloaded functions), mypy will select the variant that was defined first."
    Put always the finest overloaded function at first: https://mypy.readthedocs.io/en/stable/more_types.html#type-checking-the-variants

### Overloading example

```python title="Overloading __getitem__() method with Python 3.12 syntax"
# https://mypy.readthedocs.io/en/stable/more_types.html#function-overloading
from collections.abc import Sequence
from typing import overload

class MyList[T](Sequence[T]):
    @overload
    # replace default value (True) of flag in overload definitions
    # with ... as a placeholder
    def __getitem__(self, index: int, flag: bool = ...) -> T:
      """
      The variant bodies must all be empty with ellipsis (`...`),
      `pass` keyword is OK too by not recommended.
      only the implementation is allowed to contain code.
      This is because at runtime, the variants are completely ignored:
      they're overridden by the final implementation function.
      """
      ...


    @overload
    # replace default value (True) of flag in overload definitions
    # with ... as a placeholder
    def __getitem__(self, index: slice, flag: bool = ...) -> Sequence[T]: ...

    def __getitem__(self, index: int | slice, flag: bool = True) -> T | Sequence[T]:
        if isinstance(index, int):
            # Return a T here
        elif isinstance(index, slice):
            # Return a sequence of Ts here
        else:
            raise TypeError(...)
```

## Literal and Final

`Literal` types may contain one or more literal `bool`, `int`, `str`, `bytes`, and `enum` values. Which means `Literal[3.14]` is not a valid literal type.

If you find repeating the value of the variable in the type hint to be tedious, you can instead change the variable to be `Final` (see Final names, methods and classes):

```python hl_lines="5 7"
from typing import Final, Literal

def expects_literal(x: Literal[19]) -> None: pass

c: Final = 19

reveal_type(c)          # Revealed type is "Literal[19]?"
expects_literal(c)      # ...and this type checks!
```

Literals containing two or more values are equivalent to the union of those values. So, `Literal[-3, b"foo", MyEnum.A]` is equivalent to `Union[Literal[-3], Literal[b"foo"], Literal[MyEnum.A]]`. So we can has below code:

```python linenums="1" hl_lines="11"
# https://mypy.readthedocs.io/en/stable/literal_types.html#parameterizing-literals
from typing import Literal

PrimaryColors = Literal["red", "blue", "yellow"]
SecondaryColors = Literal["purple", "green", "orange"]
AllowedColors = Literal[PrimaryColors, SecondaryColors]

def paint(color: AllowedColors) -> None: ...

paint("red")        # Type checks!
paint("turquoise")  # Does not type check
```

```shell
$ mypy docs/posts/2025/scripts/mypy_literal.py
docs/posts/2025/scripts/mypy_literal.py:11: error: Argument 1 to "paint" has incompatible type "Literal['turquoise']"; expected "Literal['red', 'blue', 'yellow', 'purple', 'green', 'orange']"  [arg-type]
Found 1 error in 1 file (checked 1 source file)
```

## Discriminated union types

We can use [Literals](#literal-and-final) to create [discriminated union types](https://mypy.readthedocs.io/en/stable/literal_types.html#tagged-unions) for [type narrowing](https://mypy.readthedocs.io/en/stable/type_narrowing.html).

```py title="Example with TypedDict"
# https://mypy.readthedocs.io/en/stable/literal_types.html#tagged-unions
from typing import Literal, TypedDict, Union

class NewJobEvent(TypedDict):
    tag: Literal["new-job"]
    job_name: str
    config_file_path: str

class CancelJobEvent(TypedDict):
    tag: Literal["cancel-job"]
    job_id: int

Event = Union[NewJobEvent, CancelJobEvent]

def process_event(event: Event) -> None:
    # Since we made sure both TypedDicts have a key named 'tag', it's
    # safe to do 'event["tag"]'. This expression normally has the type
    # Literal["new-job", "cancel-job"], but the check below will narrow
    # the type to either Literal["new-job"] or Literal["cancel-job"].
    #
    # This in turns narrows the type of 'event' to either NewJobEvent
    # or CancelJobEvent.
    if event["tag"] == "new-job":
        print(event["job_name"])
    else:
        print(event["job_id"])
```

```py title="Example with generics"
# https://mypy.readthedocs.io/en/stable/literal_types.html#tagged-unions
class Wrapper[T]:
    def __init__(self, inner: T) -> None:
        self.inner = inner

def process(w: Wrapper[int] | Wrapper[str]) -> None:
    # Doing `if isinstance(w, Wrapper[int])` does not work: isinstance requires
    # that the second argument always be an *erased* type, with no generics.
    # This is because generics are a typing-only concept and do not exist at
    # runtime in a way `isinstance` can always check.
    #
    # However, we can side-step this by checking the type of `w.inner` to
    # narrow `w` itself:
    if isinstance(w.inner, int):
        reveal_type(w)  # Revealed type is "Wrapper[int]"
    else:
        reveal_type(w)  # Revealed type is "Wrapper[str]"
```

And check [this Pydantic doc](https://docs.pydantic.dev/latest/concepts/unions/#discriminated-unions-with-str-discriminators) to see how Pydantic use `Field(discriminator='...')` to handle discriminators.

## Typing tools

### MyPy

Ref. MyPy in [this post](../2021/2021-01-04-python-lint-and-format.md#mypy).

While MyPy may not be the most performant type checker, particularly when integrated into pre-commit hooks, it remains an invaluable learning resource.
The [MyPy documentation](https://mypy.readthedocs.io/en/stable/index.html) provides comprehensive guidance on writing effective type hints. Understanding its development history and current maintainership adds valuable context to its role in the Python ecosystem.
And this posts is mainly based on MyPy documentation.

### Pyright && Pylance

Ref. Pyright in [this post](../2021/2021-01-04-python-lint-and-format.md#pyright).

[Pylance](https://github.com/microsoft/pylance-release#readme) is the Microsoft backed Pyright extension for VSCode.

### RightTyper

During an internal tech demo at my working, I heard about [RightTyper](https://github.com/RightTyper/RightTyper), a Python tool that generates type annotations for function arguments and return values.
It's important to note that **RightTyper** doesn't statically parse your Python files to add types; instead, it needs to run your code to detect types on the fly. So, one of the best ways to use **RightTyper** is with python `-m pytest`, assuming you have good test coverage.

### ty

[ty](https://github.com/astral-sh/ty) represents the next generation of Python type checking tools. Developed by the team behind the popular [ruff](https://docs.astral.sh/ruff/) linter, **ty** is implemented in Rust for exceptional performance.
It functions both as a type checker and language server, offering seamless integration through its dedicated [VSCode extension ty-vscode](https://github.com/astral-sh/ty-vscode).

While **Ruff** excels at various aspects of Python linting, type checking remains outside its scope.
ty aims to fill this gap, though it's currently in preview and still evolving toward production readiness.
The combination of **Ruff** and **ty** promises to provide a comprehensive Python code quality toolkit.

### pyrefly

[pyrefly](https://pyrefly.org/) emerges as another promising entrant in the Python type checking landscape.
Developed by Meta and also written in Rust, **pyrefly** offers both type checking capabilities and language server functionality.
While still in preview, it demonstrates the growing trend of high-performance Python tooling implemented in Rust.

The tool integrates smoothly with modern development environments through its [VSCode extension refly-vscode](https://marketplace.visualstudio.com/items?itemName=meta.pyrefly), making it accessible to a wide range of developers.
Its backing by Meta suggests potential for robust development and long-term support.

### ty vs pyrefly

**pyrefly** has very similar output format to **ty**, but after a quick test, it seems that it generates more alerts than **ty** for the same codebase. It doesn't mean **pyrefly** is more powerful or more strict. Sometimes it just generates more false positives as it's still in preview.

And test on a single [Generics](https://mypy.readthedocs.io/en/stable/generics.html#generics) type, both **ty** and **pyrefly** generate the same type errors, but **ty** can point to the exact position of the error, while **pyrefly** only points to a limited position.

Test code:

```python title="mypy_demo.py" linenums="1"
--8<-- "posts/2025/scripts/mypy_demo.py"
```

Test results:

=== "ty output"

    ```bash linenums="1"
    $ ty --version
    ty 0.0.1-alpha.14

    $ ty check scripts/2025/mypy_demo.py
    WARN ty is pre-release software and not ready for production use. Expect to encounter bugs, missing features, and fatal errors.
    error[unsupported-operator]: Operator `+` is unsupported between objects of type `S` and `S`
    --> scripts/2025/mypy_demo.py:3:12
      |
    1 | # https://mypy.readthedocs.io/en/stable/generics.html#type-variables-with-value-restriction
    2 | def concat[S: (str, bytes)](x: S, y: S) -> S:
    3 |     return x + y
      |            ^^^^^
    4 |
    5 | concat('a', 'b')    # Okay
      |
    info: rule `unsupported-operator` is enabled by default

    error[invalid-argument-type]: Argument to function `concat` is incorrect
    --> scripts/2025/mypy_demo.py:7:8
      |
    5 | concat('a', 'b')    # Okay
    6 | concat(b'a', b'b')  # Okay
    7 | concat(1, 2)        # Error!
      |        ^ Argument type `Literal[1]` does not satisfy constraints of type variable `S`
      |
    info: Type variable defined here
    --> scripts/2025/mypy_demo.py:2:12
      |
    1 | # https://mypy.readthedocs.io/en/stable/generics.html#type-variables-with-value-restriction
    2 | def concat[S: (str, bytes)](x: S, y: S) -> S:
      |            ^^^^^^^^^^^^^^^
    3 |     return x + y
      |
    info: rule `invalid-argument-type` is enabled by default

    error[invalid-argument-type]: Argument to function `concat` is incorrect
    --> scripts/2025/mypy_demo.py:7:11
      |
    5 | concat('a', 'b')    # Okay
    6 | concat(b'a', b'b')  # Okay
    7 | concat(1, 2)        # Error!
      |           ^ Argument type `Literal[2]` does not satisfy constraints of type variable `S`
      |
    info: Type variable defined here
    --> scripts/2025/mypy_demo.py:2:12
      |
    1 | # https://mypy.readthedocs.io/en/stable/generics.html#type-variables-with-value-restriction
    2 | def concat[S: (str, bytes)](x: S, y: S) -> S:
      |            ^^^^^^^^^^^^^^^
    3 |     return x + y
      |
    info: rule `invalid-argument-type` is enabled by default

    Found 3 diagnostics
    ```

=== "pyrefly output"

    ```bash linenums="1"
    $ pyrefly --version
    pyrefly 0.23.1

    $ pyrefly check scripts/2025/mypy_demo.py
    ERROR `+` is not supported between `S` and `S` [bad-argument-type]
    --> /home/xiang/git/copdips.github.io/scripts/2025/mypy_demo.py:3:12
      |
    3 |     return x + y
      |            ^^^^^
      |
    Argument `S` is not assignable to parameter `self` with type `Self@bytes` in function `bytes.__add__`
    ERROR `+` is not supported between `S` and `S` [bad-argument-type]
    --> /home/xiang/git/copdips.github.io/scripts/2025/mypy_demo.py:3:12
      |
    3 |     return x + y
      |            ^^^^^
      |
    Argument `S` is not assignable to parameter `value` with type `Buffer` in function `bytes.__add__`
    ERROR `+` is not supported between `S` and `S` [no-matching-overload]
    --> /home/xiang/git/copdips.github.io/scripts/2025/mypy_demo.py:3:12
      |
    3 |     return x + y
      |            ^^^^^
      |
    No matching overload found for function `str.__add__`
    Possible overloads:
    (value: LiteralString, /) -> LiteralString [closest match]
    (value: str, /) -> str
    ERROR Returned type `bytes | Unknown` is not assignable to declared return type `S` [bad-return]
    --> /home/xiang/git/copdips.github.io/scripts/2025/mypy_demo.py:3:12
      |
    3 |     return x + y
      |            ^^^^^
      |
    INFO errors shown: 4, errors ignored: 0, modules: 1, transitive dependencies: 62, lines: 17,891, time: 0.12s, peak memory: physical 72.1 MiB
    ```
