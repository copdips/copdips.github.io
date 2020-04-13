---
# last_modified_at: 2020-01-11 21:45:02
title: "Fixing an ipython Windows ConEmu only bug on 'MouseEventType.MOUSE_DOWN'"
excerpt: "This post is for manually fixing an ipython Windows ConEmu only bug (from prompt_toolkit): Exception 'MouseEventType.MOUSE_DOWN' is not a valid MouseEventType"
tags:
  - python
  - ipython
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

{% include toc title="Table of content" %}

## Problem

Previously I updated the python version, the ipython version and maybe ConEmu on my Windows 10 (I don't remember which one exactly), I got an error when I wanted to copy some text from ipython repl in ConEmu console by the right mouse click:

```python
ps.7.0.0 | py.3.8.2❯ ipython
Python 3.8.2 (tags/v3.8.2:7b3ab59, Feb 25 2020, 23:03:10) [MSC v.1916 64 bit (AMD64)]
Type 'copyright', 'credits' or 'license' for more information
IPython 7.13.0 -- An enhanced Interactive Python. Type '?' for help.


Unhandled exception in event loop:
  File "d:\xiang\tools\scoop\apps\python\3.8.2\lib\asyncio\events.py", line 81, in _run
    self._context.run(self._callback, *self._args)
  File "d:\xiang\tools\scoop\apps\python\3.8.2\lib\site-packages\prompt_toolkit\input\win32.py", line 512, in ready
    callback()
  File "d:\xiang\tools\scoop\apps\python\3.8.2\lib\site-packages\prompt_toolkit\application\application.py", line 653, in read_from_input
    self.key_processor.process_keys()
  File "d:\xiang\tools\scoop\apps\python\3.8.2\lib\site-packages\prompt_toolkit\key_binding\key_processor.py", line 274, in process_keys
    self._process_coroutine.send(key_press)
  File "d:\xiang\tools\scoop\apps\python\3.8.2\lib\site-packages\prompt_toolkit\key_binding\key_processor.py", line 186, in _process
    self._call_handler(matches[-1], key_sequence=buffer[:])
  File "d:\xiang\tools\scoop\apps\python\3.8.2\lib\site-packages\prompt_toolkit\key_binding\key_processor.py", line 329, in _call_handler
    handler.call(event)
  File "d:\xiang\tools\scoop\apps\python\3.8.2\lib\site-packages\prompt_toolkit\key_binding\key_bindings.py", line 101, in call
    self.handler(event)
  File "d:\xiang\tools\scoop\apps\python\3.8.2\lib\site-packages\prompt_toolkit\key_binding\bindings\mouse.py", line 128, in _mouse
    event_type = MouseEventType(pieces[0])
  File "d:\xiang\tools\scoop\apps\python\3.8.2\lib\enum.py", line 304, in __call__
    return cls.__new__(cls, value)
  File "d:\xiang\tools\scoop\apps\python\3.8.2\lib\enum.py", line 595, in __new__
    raise exc
  File "d:\xiang\tools\scoop\apps\python\3.8.2\lib\enum.py", line 579, in __new__
    result = cls._missing_(value)
  File "d:\xiang\tools\scoop\apps\python\3.8.2\lib\enum.py", line 608, in _missing_
    raise ValueError("%r is not a valid %s" % (value, cls.__name__))

Exception 'MouseEventType.MOUSE_DOWN' is not a valid MouseEventType
Press ENTER to continue...
```

## Root cause

From the error stack, we can identify that it should be this line from the prompt_toolkit which throws the error:

```python
  File "d:\xiang\tools\scoop\apps\python\3.8.2\lib\site-packages\prompt_toolkit\key_binding\bindings\mouse.py", line 128, in _mouse
    event_type = MouseEventType(pieces[0])
```

And hereunder is the ipython and prompt_toolkit version installed on my Windows 10.

```powershell
ps.7.0.0 | py.3.8.2❯ pip list | sls ipython, prompt

ipython          7.13.0
ipython-genutils 0.2.0
prompt-toolkit   3.0.4
```

Let's check the [source code](https://github.com/prompt-toolkit/python-prompt-toolkit/blob/dcc7adf0d5bcd0fd9db32ade713caaa56edbf757/prompt_toolkit/key_binding/bindings/mouse.py#L126) of the prompt_toolkit:

```python
@key_bindings.add(Keys.WindowsMouseEvent)
def _mouse(event: E) -> None:
    """
    Handling of mouse events for Windows.
    """
    assert is_windows()  # This key binding should only exist for Windows.

    # Parse data.
    pieces = event.data.split(";")

    event_type = MouseEventType(pieces[0])
```

And let's add some simple debug code by using print():

```python
@key_bindings.add(Keys.WindowsMouseEvent)
def _mouse(event: E) -> None:
    """
    Handling of mouse events for Windows.
    """
    assert is_windows()  # This key binding should only exist for Windows.

    # Parse data.
    pieces = event.data.split(";")

    # start debug
    for met in MouseEventType:
          print("met:", met)
    print("pieces[0]:", pieces[0])
    # end debug

    event_type = MouseEventType(pieces[0])
```

Reproduce the error in ipython, I got the print info:

```python
met: MouseEventType.MOUSE_UP
met: MouseEventType.MOUSE_DOWN
met: MouseEventType.SCROLL_UP
met: MouseEventType.SCROLL_DOWN
pieces[0]: MouseEventType.MOUSE_DOWN
```

Visually it seems that `pieces[0]` is in the MouseEventType, but as MouseEventType is an [Enum type](https://docs.python.org/3.8/library/enum.html), the correct syntax is that `pieces[0]` should not be prefixed by the enum class name `MouseEventType`, instead we can use the string format of the type, so called [programmatic access](https://docs.python.org/3.8/library/enum.html#programmatic-access-to-enumeration-members-and-their-attributes): `MouseEventType["MOUSE_DOWN"]`

## Solution

Adding a split on `pieces[0]` object can workaround the issue, but to fix it definitively, in fact, the author already fixed it a couple of weeks ago:

[https://github.com/prompt-toolkit/python-prompt-toolkit/issues/1099](https://github.com/prompt-toolkit/python-prompt-toolkit/issues/1099)

[https:/
/pull/1105/commits/d2e7da3be5e46a5c8b432f67f78b662541b957de](https://github.com/prompt-toolkit/python-prompt-toolkit/pull/1105/commits/d2e7da3be5e46a5c8b432f67f78b662541b957de)

```diff
# On a key press, generate both the mouse down and up event.
for event_type in [MouseEventType.MOUSE_DOWN, MouseEventType.MOUSE_UP]:
    data = ";".join(
-       [str(event_type), str(ev.MousePosition.X), str(ev.MousePosition.Y)]
+       [event_type.value, str(ev.MousePosition.X), str(ev.MousePosition.Y)]
    )
    result.append(KeyPress(Keys.WindowsMouseEvent, data))
```
