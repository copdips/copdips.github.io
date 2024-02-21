---
authors:
- copdips
categories:
- debug
- python
comments: true
date:
  created: 2024-02-22
---

# Debugging in Python

<!-- more -->

## Setting breakpoint

`import pdb; pdb.set_trace()` and `import ipdb; ipdb.set_trace()` are the old ways to set a breakpoint. The new way is to use `breakpoint()` directly since Python 3.7+.

## Setting default debugger

Default **pdb** doesn't support autocomplete, and it's not as powerful as **ipdb**. To set **ipdb** by default:

```bash
export PYTHONBREAKPOINT='IPython.terminal.debugger.set_trace'
```

Do not use: `export PYTHONBREAKPOINT='IPython.core.debugger.set_trace'`, it opens a **ipdb** shell, but does not have autocomplete.

## Setting debugger in Pytest

Already mentioned in another post dedicated to [Python unittest](../2021/2021-06-12-python-unittest-cheet-sheet.md#pytest-pdb-pdbclsipythonterminaldebuggerterminalpdb).
