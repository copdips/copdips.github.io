---
authors:
- copdips
categories:
- debug
- python
comments: true
date:
  created: 2024-02-22
  modified: 2024-04-27
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

**Conflict with pytest-cov**: If you use `pytest-cov`, you must use `pytest --no-cov` if you want to set breakpoints in your tests. Otherwise, pytest will just skip the breakpoints. This is because `pytest-cov` uses `sys.settrace()` to track code coverage, which is in conflict with breakpoints. There's no final solution for this issue, a workaround is to whether use coverage or whether use debug. In an IDE session (VSCode for e.g.), we can use `make test` to launch the test and generate coverage report with `pytest --cov`, and then use VScode's built-in debugger to set breakpoints and launch the tests in debug mode. To achieve this:

1. `pip install pytest-cov` (must be installed because next VSCode settings depend on it).
2. Add the following to your VSCode user settings:

    ```json title="VSCode settings.json" hl_lines="9"
      "python.testing.pytestArgs": [
        "tests",
        "--color=yes",
        // https://github.com/microsoft/vscode-python/issues/693#issuecomment-1356832568
        // must install pytest-cov as --no-cov is its param
        // and if --no-cov is not specify, breakpoint doesn't work in pytest debug
        // from VSCode UI to enable pytest debug from command line, need to add
        // --no-cov to the Pytest args manually.
        "--no-cov"
      ],
    ```

**Use IPython as debugger prompt**: [Python unittest](../2021/2021-06-12-python-unittest-cheet-sheet.md#pytest-pdb-pdbclsipythonterminaldebuggerterminalpdb).
