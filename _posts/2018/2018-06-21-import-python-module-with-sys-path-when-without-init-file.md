---
title: "Import Python module with sys.path variable when without `__init__` file"
excerpt: "When file A needs to import a function from the file B in another folder, and B is not in a module, we can use the sys.path variable."
tags:
  - python
  - module
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

> We're familiar to put a python file inside a folder, and create a `__init__.py` file under the same folder, then we can easily import the file by import the folder, as the folder is transformed to a python module. But if we don't have the \_\_init\_\_.py, how can we import it?

Suppose that we have a Flask project, during the development of Flask, we need to use the function **flask_ctx_get_request_id()** in the file **request_id.py** from the repo [https://github.com/Workable/flask-log-request-id](https://github.com/Workable/flask-log-request-id).

Here is the current folder tree, there's only one file flask.py:

```
D:\xiang\git\test\flask_project
│  flask.py
```

I add the repo as a submodule:

```powershell
> git submodule add https://github.com/Workable/flask-log-request-id.git
```

Then my folder tree is like this:

```
D:\xiang\git\test\flask_project
│  .gitmodules
│  flask.py
│
└─flask-log-request-id
    │
    ├─flask_log_request_id
    │  │  ctx_fetcher.py
    │  │  filters.py
    │  │  parser.py
    │  │  request_id.py
    │  │  __init__.py
    │  │
    │  └─extras
    │          celery.py
    │          __init__.py
    │
    └─(more files and folders and ignored ...)
```

In flask.py, I try to import the function by importing the folder flask-log-request-id:
```python
# flask.py
from flask-log-request-id.flask_log_request_id.request_id import flask_ctx_get_request_id
```

Test the import:
```python
> python .\flask.py
  File ".\flask.py", line 1
    from flask-log-request-id.flask_log_request_id.request_id import flask_ctx_get_request_id
              ^
SyntaxError: invalid syntax
```

The `flask-log-request-id` folder is not importable because it doesn't contain the __init_.py file. I don't want to manually create it, it has no sense here. The workaround is to use the [sys.path](https://docs.python.org/3/tutorial/modules.html#the-module-search-path) variable.

> 6.1.2. The Module Search Path
>
>When a module named spam is imported, the interpreter first searches for a built-in module with that name. If not found, it then searches for a file named spam.py in a list of directories given by the variable [sys.path](https://docs.python.org/3/library/sys.html#sys.path). [sys.path](https://docs.python.org/3/library/sys.html#sys.path) is initialized from these locations:
>
> - The directory containing the input script (or the current directory when no file is specified).
> - [PYTHONPATH](https://docs.python.org/3/using/cmdline.html#envvar-PYTHONPATH) (a list of directory names, with the same syntax as the shell variable PATH).
> - The installation-dependent default.
>
> On file systems which support symlinks, the directory containing the input script is calculated after the symlink is followed. In other words the directory containing the symlink is not added to the module search path.
> {: .notice--info}
>
> After initialization, Python programs can modify [sys.path](https://docs.python.org/3/library/sys.html#sys.path). The directory containing the script being run is placed at the beginning of the search path, ahead of the standard library path. This means that scripts in that directory will be loaded instead of modules of the same name in the library directory. This is an error unless the replacement is intended. See section Standard Modules for more information.

As per the official doc, I could add the path of the `flask-log-request-id` folder to the sys.path variable, than the module `flask_log_request_id` will be directly searchable by python process.

```python
# flask.py
import sys
sys.path.append(r"d:/xiang/git/test/flask_project/flask-log-request-id")

from flask_log_request_id.request_id import flask_ctx_get_request_id
```

The import will still fail due to the file `d:/xiang/git/test/flask_project/flask-log-request-id\flask_log_request_id\__init__.py`, resolving this issue is out of scope of this blog, the adding path to the `sys.path` to find the `flask_log_request_id` module works well.
{: .notice--info}
