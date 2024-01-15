---
authors:
- copdips
categories:
- python
- package
comments: true
date:
  created: 2024-01-05
description: Simple demo to using Flit for managing Python package
---

# Python packaging with Flit

This post provides a simple starter demonstration on how to use [Flit](https://flit.pypa.io/en/stable/index.html) for building and publishing Python package.
However, for more complex builds, such as compiling C code, you still need the de facto standard [setuptools](https://setuptools.readthedocs.io/en/latest/).

<!-- more -->

## Demo

file `pyproject.toml`:

The flit-core github repo has already a good [demo](https://github.com/pypa/flit/blob/main/pyproject.toml) of pyproject.toml, and I just need to change a few lines:

```toml title="pyproject.toml"
[build-system]
requires = ["flit-core >= 3.9,<4"]
build-backend = "flit_core.buildapi"

[project]
# https://flit.pypa.io/en/stable/pyproject_toml.html#module-section
name = "package_name_shown_in_pypi"  # will be converted to kebab-case automatically
dynamic = ["version", "description"]
authors = [
    { name = "my name", email = "my email" },
]
requires-python = ">=3.11"
readme = "README.md"
classifiers = [
    "Programming Language :: Python :: 3",
    "Topic :: Software Development :: Libraries :: Python Modules",
]
urls.repository = "repo url"
urls.documentation = "repo url"

dependencies = ["aiohttp"]

[project.optional-dependencies]
dev = ["pre-commit"]
doc = ["mkdocs"]

[tool.flit.module]
# https://flit.pypa.io/en/stable/pyproject_toml.html#module-section
name = "python_module_folder_name"  # name used by import in Python

[tool.flit.sdist]
# https://flit.pypa.io/en/stable/pyproject_toml.html#sdist-section
# non-Python data file are not included by flit by default, so add VERSION file here.
include = ["VERSION"]
```

Flit reads the [variable `__version__`](https://flit.pypa.io/en/stable/#usage) from the module file `python_module_folder_name/__init__.py` to get the version number. The above example uses a file `VERSION` to store the version number, and the `__init__.py` file reads the version number from the `VERSION` file. As `VERSION` is more convenient to edit, I prefer this way.

So the `python_module_folder_name/__init__.py` file could look like:

```python title="python_module_folder_name/__init__.py"
"""An amazing sample package!"""
from pathlib import Path

DEFAULT_VERSION = "0.0.0"

try:
    version_file_path = Path(__file__).resolve().parent.parent / "VERSION"
    __version__ = version_file_path.read_text().strip()
except FileNotFoundError:
    __version__ = DEFAULT_VERSION

...
```

After that, you can use [build](https://build.pypa.io/en/latest/) to build the package, and [twine](https://twine.readthedocs.io/en/stable/) to upload the package to pypi:

```bash
pip install build
python -m build
twine upload -r [feed_name_configured_in_pypirc] dist/*.whl
```

I don't use `flit build` because I find `python -m build` to be more standard from my personal perspective, and I prefer using `twine` over `flit publish` for the same reason.
For example, Azure Pipeline configures `~/.pypirc` for twine with the built-in task [TwineAuthenticate](https://learn.microsoft.com/en-us/azure/devops/pipelines/tasks/reference/twine-authenticate-v1?view=azure-pipelines), but not for flit.
