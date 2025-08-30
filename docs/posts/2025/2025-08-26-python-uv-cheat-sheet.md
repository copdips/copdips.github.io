---
authors:
- copdips
categories:
- python
- package
comments: true
date:
  created: 2025-08-26
  updated: 2025-08-30
---

# Python uv cheat sheet

Python [uv](https://docs.astral.sh/uv/) common usage cheat sheet, but doesn't cover all the features.

<!-- more -->

## Init project

uv init can have 3 templates: [`--app`](https://docs.astral.sh/uv/concepts/projects/init/#packaged-applications) (by default), [`--lib`](https://docs.astral.sh/uv/concepts/projects/init/#applications) and [`--package`](https://docs.astral.sh/uv/concepts/projects/init/#packaged-applications).

| Command                            | Description                                                                                                                                                                                      |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `uv init my-project -p python3.13` | Init new project with new folder                                                                                                                                                                 |
| `uv init -p python3.13`            | Init an existing project with python3.13                                                                                                                                                         |
| `uv init --lib`                    | Libraries template creates a src folder whereas application template only creates a main.py file                                                                                                 |
| `uv init --package`                | Init a project with package template, same as libraries but pyproject.toml has a `[project.scripts]` key, so this is for command-line interface you can later run the command by: `uv run pkg-1` |

```toml title="pyproject.toml created by uv init --package pkg-1"
[project.scripts]
pkg-1 = "pkg_1:main"
```

!!! warning "uv init inside an existing package with already a pyproject.toml"
    If upper folders has already a `pyproject.toml` file, uv will also add the new project (created by `uv init`) as `[tool.uv.workspace]` members. This cheat sheet doesn't cover that yet. As that converts the repo to a [uv workspace](https://docs.astral.sh/uv/concepts/projects/workspaces/#using-workspaces) which is a little bit more complex. You might need to use `uv sync --active` to install dependencies in the separate venv of the sub module if needed.

## Add dependencies

### optional-dependencies vs dependency-groups

Ref:

- [UV's Dependency fields](https://docs.astral.sh/uv/concepts/projects/dependencies/#dependency-fields)
- https://github.com/astral-sh/uv/issues/8981#issuecomment-2466787211

  > `optional-dependencies` are part of the published metadata for your package, while `dependency-groups` are only visible when working with your package locally

### Add to project.dependencies as main dependencies

```bash
uv add fastapi
```

Could be installed by end users with `uv pip install temp`

```toml title="pyproject.toml"
[project]
name = "temp"
...
dependencies = [
    "fastapi>=0.116.1",
]
```

### Add to project.optional-dependencies as extra packages

```bash
uv add aiohttp --optional aio
```

Could be installed by end users with `uv pip install temp[aio]`

```toml title="pyproject.toml"
[project]
name = "temp"
...
[project.optional-dependencies]
aio = [
    "aiohttp>=3.12.15",
]
```

### Add to dependency-groups for local development

```bash
uv add ruff --dev
# or
uv add ruff --group dev

uv add ty --group typing
```

Dependencies declared in the `dependency-groups` part are not added to the package metadata, so end users cannot install them directly.

```toml title="pyproject.toml"
[project]
name = "temp"
...
[dependency-groups]
dev = [
    "ruff>=0.12.4",
]
typing = [
    "ty>=0.0.1a19",
]

```

### Add to dependency sources

[Dependency sources](https://docs.astral.sh/uv/concepts/projects/dependencies/#dependency-sources) are for local development only.

```bash
uv add git+https://github.com/encode/httpx
uv add --editable ../temp1/lib_1
```

```toml
[project]
name = "temp"
...
[tool.uv.sources]
httpx = { git = "https://github.com/encode/httpx" }
lib-1 = { path = "../temp1/lib_1", editable = true }
```

!!! note
    For multiple packages in the same repository, [workspaces](https://docs.astral.sh/uv/concepts/projects/workspaces/) may be a better fit.

### Declare conflicting dependencies

uv supports explicit [declaration of conflicting dependency groups](https://docs.astral.sh/uv/concepts/projects/config/#conflicting-dependencies). For example, to declare that the optional-dependency groups extra1 and extra2 are incompatible:

```toml title="pyproject.toml"
[tool.uv]
conflicts = [
    [
      { extra = "extra1" },
      { extra = "extra2" },
    ],
]
```

Or, to declare the development dependency groups group1 and group2 incompatible:

```toml title="pyproject.toml"
[tool.uv]
conflicts = [
    [
      { group = "group1" },
      { group = "group2" },
    ],
]
```

## Install dependencies

```toml title="pyproject.toml"
[project]
name = "temp"
version = "0.1.0"
description = "Add your description here"
readme = "README.md"
requires-python = ">=3.13"
dependencies = [
    "fastapi>=0.116.1",
]

# this is the optional extra part, useful for end user
[project.optional-dependencies]
aio = [
    "aiohttp>=3.12.15",
]

# this is the local development groups part, useful for developers
[dependency-groups]
dev = [
    "ruff>=0.12.4",
]
typing = [
    "ty>=0.0.1a19",
]
all = [
    {include-group = "dev"},
    {include-group = "typing"},
]
```

!!! note "The `--dev`, `--only-dev`, and `--no-dev` flags are equivalent to `--group dev`, `--only-group dev`, and `--no-group dev` respectively."

!!! note "without `--no-dev`, the `dev` group is already installed with `uv sync`"
    Use `uv sync --no-dev` or `uv sync --no-default-groups` to avoid installing the `dev` group.
    By default, [uv includes the `dev` dependency group](https://docs.astral.sh/uv/concepts/projects/dependencies/#default-groups) in the environment (e.g., during `uv run` or `uv sync`). The default groups to include can be changed using the `tool.uv.default-groups` setting.

!!! note "use `uv sync --dry-run` to see what will be the changes"

| Command                             | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `uv sync --no-dev`                  | Install [dependencies](https://docs.astral.sh/uv/concepts/projects/dependencies/#project-dependencies) only (without any extra nor any group)                                                                                                                                                                                                                                                                                                                                             |
| `uv sync`                           | Install dependencies and `dev` group, no extras, no other groups than `dev`                                                                                                                                                                                                                                                                                                                                                                                                               |
| `uv sync --all-groups`              | Install dependencies and all groups ([`dependency-groups`](https://docs.astral.sh/uv/concepts/projects/dependencies/#dependency-groups))                                                                                                                                                                                                                                                                                                                                                  |
| `uv sync --all-extras`              | Install dependencies and all extras ([`project.optional-dependencies`](https://docs.astral.sh/uv/concepts/projects/dependencies/#optional-dependencies)) and `dev` group (`dev` group is by default)                                                                                                                                                                                                                                                                                      |
| `uv sync --all-extras --all-groups` | Install dependencies and all extras and all groups                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `uv sync --extra aio`               | Install dependencies and extra `aio` and `dev` group                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `uv sync --extra aio --no-dev`      | Install dependencies and extra `aio` but without `dev` group                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `uv sync --extra aio --inexact`     | Install dependencies and `dev` groups and retain already installed [extraneous packages](https://docs.astral.sh/uv/concepts/projects/sync/#retaining-extraneous-packages) not declared in pyproject.toml                                                                                                                                                                                                                                                                                  |
| `uv sync --locked --no-dev`         | Ensure install by respecting `uv.lock` (ensure uv.lock won't be changed after uv sync) and raise an error if lock file doesn't confirm with pyproject.toml.<br/><br/>In 🐳 Dockerfile ([official uv Dockerfile example](https://github.com/astral-sh/uv-docker-example/blob/main/Dockerfile)), we often use `uv sync --locked --no-install-project --no-dev`, see [Using uv in Docker](https://docs.astral.sh/uv/guides/integration/docker/) to understand the usage of each parameters. |
|                                     |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |

```bash
$ uv sync --locked --no-dev
Resolved 21 packages in 33ms
The lockfile at `uv.lock` needs to be updated, but `--locked` was provided.
To update the lockfile, run `uv lock`.
```

### `--locked` vs `--frozen` vs `--no-sync`

official doc: https://docs.astral.sh/uv/concepts/projects/sync/#automatic-lock-and-sync

`uv.lock` file related:

- `--locked`: If the lockfile is not up-to-date, uv will raise an error instead of updating the lockfile. `--locked` could be considered as `--ensure-locked`.
- `--frozen`: Use the lockfile without checking if it is up-to-date, no error will be raised.

`venv` related:

- `--no-sync`: Do not update the venv.

## Dependencies tree

| Command            | Description                                                                                                                                                          |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `uv pip tree`      | Display the **installed packages** in a tree format                                                                                                                  |
| `uv tree`          | Update `uv.lock` based on `pyproject.toml` and display tree based on `uv.lock`, **no package installation will occur**. `uv tree` displays better than `uv pip tree` |
| `uv tree --frozen` | Don't update `uv.lock`, just display tree based on the current `uv.lock`                                                                                             |
| `uv tree --locked` | If `uv.lock` is not updated, display a warning message. This command is not very useful                                                                              |

## List outdated packages

- `uv tree --outdated`: display a list of outdated packages with their latest **public** versions, no matter what `pyproject.toml` declares.
- [`uv lock --check`](https://docs.astral.sh/uv/concepts/projects/sync/#checking-if-the-lockfile-is-up-to-date): check if `uv.lock` is up-to-date with `pyproject.toml`.

## Upgrade packages and uv.lock

[`uv.lock` file](https://docs.astral.sh/uv/concepts/projects/layout/#the-lockfile)can be updated by `uv lock`, `uv sync`, `uv run`, `uv add`, `uv remove`.

| Command      | Description                                                                                                                                                                   |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `uv lock`    | Update the `uv.lock` file to match the current state of `pyproject.toml`                                                                                                      |
| `uv lock -U` | Update the `uv.lock` file and [upgrade](https://docs.astral.sh/uv/concepts/projects/sync/#upgrading-locked-package-versions) all packages to their latest compatible versions |
| `uv sync`    | Same as `uv lock` but also installs the dependencies                                                                                                                          |
| `uv sync -U` | Same as `uv lock -U` but also installs the dependencies                                                                                                                       |

!!! note "`uv lock` vs `uv lock -U` and `uv sync` vs `uv sync -U`"
    If latest version of fastapi is 0.116.1, and pyproject.toml declares fastapi>=0.115.1, and current uv.lock has fastapi==0.115.1. then:

      - `uv lock`: no effect, as `0.115.1` is still within the range of `>=0.115.1`.
      - `uv lock -U`: upgrade `fastapi` to `0.116.1`.

    Same logic applies to `uv sync` and `uv sync -U`, except for `sync` installing the dependencies too.

    `-U` (`--upgrade` for all packages) or `-P` (`--upgrade-package` for a specific package) respect always the version constraints defined in `pyproject.toml`.

## Integrations

Check [this doc](https://docs.astral.sh/uv/guides/integration/) for more information on integrations with other tools and platforms (Docker, Jupyter, Github Actions, Pre Commit, PyTorch FastAPI, etc.).

## Build

### Build with rust, C, C++, CPython backend

uv can also [build with extension module by `--build-backend` flag](https://docs.astral.sh/uv/concepts/projects/init/#projects-with-extension-modules) to work with Rust and C, C++, CPython etc.

### Build isolation

uv build isolation is by default, but some packages need to [build against the same version of some packages installed in the project environment](https://docs.astral.sh/uv/concepts/projects/config/#build-isolation). For example, [flask-attn](https://pypi.org/project/flash-attn/), [deepspeed](https://pypi.org/project/deepspeed/), [cchardet](https://pypi.org/project/cchardet/), etc.

## Run

### Run single script file with isolated environment

https://docs.astral.sh/uv/concepts/projects/run/#running-scripts

```python title="example.py with inline dependencies"
# /// script
# dependencies = [
#   "httpx",
# ]
# ///

import httpx
print(httpx.__file__)
```

```bash title="in current venv, httpx is already installed" hl_lines="4"
$ uv pip show httpx
Name: httpx
Version: 0.28.1
Location: /home/xiang/git/copdips.github.io/.venv/lib/python3.13/site-packages
Requires: anyio, certifi, httpcore, idna
Required-by: fastapi-cloud-cli
```

```bash title="But httpx will still be installed in an isolated environment" hl_lines="3"
$ uv run example.py

/home/xiang/.cache/uv/environments-v2/example-b91cf8387ef5699e/lib/python3.13/site-packages/httpx/__init__.py
```

### Run inline script

`uv run --with httpx python -c "import httpx; print(httpx.__file__)"` to run an inline script. `httpx` will be installed in an isolated environment.

## Tools

### uvx and uv tool run and uv run and raw command

`uvx` and `uv tool run` are the same to run command in an isolated environment. They run `uv tool install` in the background

`uv run` is normally used to run a command in the current environment. But will auto upgrade the package based on `pyproject.toml` dependencies constraints. Whereas the raw command will not.

| Command                        | Target  | Effect                                                                                                                                                                                                                                  | Notes                                                                                                                                                                                                                                                                                                                                                                                |
| ------------------------------ | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `uvx`<br/>or<br/>`uv tool run` | command | Always in an isolated env in user cache, no auto update.<br/><br/>If the tool was previously installed, i.e., via `uv tool install`, the installed version will be used unless a version is requested or the `--isolated` flag is used. | Can run script by `uvx --with ruff python -c "import ruff ; from importlib.metadata import version; print(ruff.__file__); print(version('ruff'))"`                                                                                                                                                                                                                                   |
| `uvx`<br/>or<br/>`uv tool run` | script  | Not directly supported                                                                                                                                                                                                                  | Can workaround by `uvx --with ruff python example.py`.<br/><br/>[In-script dependencies declaration](https://docs.astral.sh/uv/concepts/projects/run/#running-scripts) is not supported, use `--with`, `--with-requirements`, `--with-executables-from` to [add additional dependencies](https://docs.astral.sh/uv/concepts/tools/#installing-executables-from-additional-packages). |
| `uv run`                       | command | Use current env, fallback to isolated env in user cache,<br/>could auto upgrade command version based on `pyproject.toml`                                                                                                               |                                                                                                                                                                                                                                                                                                                                                                                      |
| `uv run`                       | script  | - If no in-script dependencies declared, use current env and auto upgrade dependencies version<br/><br/>- If in-script dependencies declared, use isolated env in user cache                                                            |                                                                                                                                                                                                                                                                                                                                                                                      |
| `raw run`                      | command | use current env only                                                                                                                                                                                                                    |                                                                                                                                                                                                                                                                                                                                                                                      |
| `raw run`                      | script  | use current env only                                                                                                                                                                                                                    |                                                                                                                                                                                                                                                                                                                                                                                      |

```bash hl_lines="2 4 11-12 17-18 20-23"
$ grep ruff pyproject.toml
    "ruff>=0.12.4",

$ uv pip install ruff==0.12.0
Resolved 1 package in 7ms
Uninstalled 1 package in 0.50ms
Installed 1 package in 3ms
 - ruff==0.12.4
 + ruff==0.12.0

$ ruff --version
ruff 0.12.0

$ uv pip tree | grep ruff
ruff v0.12.0

$ uv run --no-project ruff --version  # (1)
ruff 0.12.0

$ uv run ruff --version  # (2)
Uninstalled 1 package in 0.62ms
Installed 1 package in 3ms
ruff 0.12.4

$ ruff --version
ruff 0.12.4

$ uv pip tree | grep ruff
ruff v0.12.4
```

1. `uv run --no-project ruff --version` will use the version of `ruff` installed in the current environment (0.12.0). The `--no-project` flag tells `uv` to [not consider the current project (pyproject.toml)](https://docs.astral.sh/uv/concepts/tools/#relationship-to-uv-run) and its dependencies.
2. `uv run ruff --version` upgrade automatically ruff version form 0.12.0 to 0.12.4 as constrainted in `pyproject.toml`

!!! note
    if `pipx` has been used to install a tool, `uv tool install` will fail. The [`--force` flag can be used to override this behavior](https://docs.astral.sh/uv/concepts/tools/#overwriting-executables).

### tools directory

`uv tool dir` to [show the directory where tools](https://docs.astral.sh/uv/concepts/tools/#tools-directory) are installed.

```bash
$ uv tool dir
/home/xiang/.local/share/uv/tools
```

### upgrade

- `uv tool upgrade ruff` to upgrade `ruff`.
- `uv tool upgrade ruff --reinstall` to upgrade `ruff` and all its dependencies.

### Cleanup

The tool will be installed in an isolated environment in the user's cache directory. Use `uv cache clean` to clean up the cache.

## Workspace

To be continued.
