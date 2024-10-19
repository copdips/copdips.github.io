---
authors:
- copdips
categories:
- python
- multithreading
comments: true
date:
  created: 2024-10-19
---

# Python thread safe operations

Quick example from the official [Python documentation about thread safety in Python](https://docs.python.org/3/faq/library.html#what-kinds-of-global-value-mutation-are-thread-safe):

```python title="Thread safe operations" linenums="1"
L.append(x)
L1.extend(L2)
x = L[i]
x = L.pop()
L1[i:j] = L2
L.sort()
x = y
x.field = y
D[x] = y
D1.update(D2)
D.keys()
```

```python title="Not thread safe operations" linenums="1"
i = i+1
L.append(L[-1])
L[i] = L[j]
D[x] = D[x] + 1
```

It's important to understand that Python, due to its Global Interpreter Lock (GIL), can only switch between threads **between bytecode instructions**. The frequency of these switches can be adjusted using [sys.setswitchinterval()](https://docs.python.org/3/library/sys.html#sys.setswitchinterval). This ensures that within a single bytecode instruction, Python will not switch threads, making the operation atomic (thread-safe). For a deeper dive into this topic, you can read this discussion on [atomic and thread-safe operations in Python](https://discuss.python.org/t/atomic-and-thread-safe-in-python-world/51575/3).

<!-- more -->

For example, consider the `L1.extend(L2)` operation, which is listed as thread-safe. One might assume that the `extend()` method is not atomic, as ChatGPT o1-mini model suggested:

> "No, Python's list.extend operation is not thread-safe. While certain list operations like append are atomic in CPython due to the Global Interpreter Lock (GIL), extend involves multiple steps (iterating and adding elements) and is not atomic. This can lead to race conditions when used in a multithreaded environment."

However, in reality, it is atomic. By examining the bytecode, we can see that the `extend()` method is a single bytecode (`CALL` opcode), ensuring the operation is atomic and thread-safe.

Let's verify this using the [dis](https://docs.python.org/3/library/dis.html) module.

## list.extend bytecode

```python title="l.extend([1]) bytecode is CALL" hl_lines="18"
In [16]: from dis import dis

In [17]: def list_extend():
    ...:     l = []
    ...:     l.extend([1])
    ...:

In [18]: dis(list_extend)
  1           0 RESUME                   0

  2           2 BUILD_LIST               0
              4 STORE_FAST               0 (l)

  3           6 LOAD_FAST                0 (l)
              8 LOAD_ATTR                1 (NULL|self + extend)
             28 LOAD_CONST               1 (1)
             30 BUILD_LIST               1
             32 CALL                     1
             40 POP_TOP
             42 RETURN_CONST             0 (None)
```

## list.inplace_addition bytecode

[BIANRY_OP](https://docs.python.org/3/library/dis.html#opcode-BINARY_OP) is introduced in Python 3.11 and [INPLACE_ADD](https://docs.python.org/3.10/library/dis.html#opcode-INPLACE_ADD) before Python 3.11.

```python title="l += [1] bytecode is BINARY_OP (INPLACE_ADD for Python 3.11-)" hl_lines="15"
In [19]: def list_inplace_addition():
    ...:     l = []
    ...:     l += [1]
    ...:

In [20]: dis(list_inplace_addition)
  1           0 RESUME                   0

  2           2 BUILD_LIST               0
              4 STORE_FAST               0 (l)

  3           6 LOAD_FAST                0 (l)
              8 LOAD_CONST               1 (1)
             10 BUILD_LIST               1
             12 BINARY_OP               13 (+=)
             16 STORE_FAST               0 (l)
             18 RETURN_CONST             0 (None)
```

## Source code for `extend` in `listobject.c`

[Source code link](https://github.com/python/cpython/blob/2e950e341930ea79549137d4d3771d5edb940e65/Objects/listobject.c#L1372-L1389)

```c title="Source code: for extend"
/*[clinic input]
list.extend as list_extend

     iterable: object
     /

Extend list by appending elements from the iterable.
[clinic start generated code]*/

static PyObject *
list_extend(PyListObject *self, PyObject *iterable)
/*[clinic end generated code: output=630fb3bca0c8e789 input=979da7597a515791]*/
{
    if (_list_extend(self, iterable) < 0) {
        return NULL;
    }
    Py_RETURN_NONE;
}
```

## Source code for BINARY_OP (INPLACE_ADD in Python 3.11-) in `listobject.c`

[Source code link](https://github.com/python/cpython/blob/2e950e341930ea79549137d4d3771d5edb940e65/Objects/listobject.c#L1420-L1428)

```c title="Source code for BINARY_OP"
static PyObject *
list_inplace_concat(PyObject *_self, PyObject *other)
{
    PyListObject *self = (PyListObject *)_self;
    if (_list_extend(self, other) < 0) {
        return NULL;
    }
    return Py_NewRef(self);
}
```

## Releasing GIL in c code

To ensure that the `list.extend` operation remains atomic, it is essential that the GIL is not released during its execution. According to the [Python C API documentation](https://docs.python.org/3/c-api/init.html#releasing-the-gil), the GIL can be released using `Py_BEGIN_ALLOW_THREADS` and reacquired with `Py_END_ALLOW_THREADS`. However, a review of the `listobject.c` file shows that these macros are not used in the implementation of `list.extend`. This is appropriate because `extend` is not an I/O blocking operation and should not require GIL release.

!!! note "releasing the GIL != pausing the thread"
    It is important to understand that releasing the GIL does not mean the thread is paused and waits to reacquire the GIL. Instead, it allows other threads to run while the current thread continues to execute without the GIL's protection. This means that the thread can **run in parallel** with other threads, but without the safety provided by the GIL. Check the [RealPython example on Write a C Extension Module With the GIL Released](https://realpython.com/python-parallel-processing/#write-a-c-extension-module-with-the-gil-released) for more details.
