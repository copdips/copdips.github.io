---
authors:
- copdips
categories:
- python
- package
comments: true
date:
  created: 2025-08-26
---

# Python uv cheat sheet

Python [UV](https://docs.astral.sh/uv/) common usage cheat sheet, but doesn't cover all the features.

<!-- more -->

## Init project

```bash
# init new project with new folder
uv init my-project -p python3.13

# init an existing project
uv init -p python3.13
```

!!! warning "uv init under a folder with already a pyproject.toml"
    If upper folders has already a `pyproject.toml` file, uv will also add the new project (created by `uv init`) as `[tool.uv.workspace]` members. This cheat sheet doesn't cover that. As that makes uv workspace management more complex. You might need to use `uv sync --active` to install dependencies in the separate venv of the sub module if needed.

## Add dependencies

### optional-dependencies vs dependency-groups

Ref:

- [UV's Dependency fields](https://docs.astral.sh/uv/concepts/projects/dependencies/#dependency-fields)
- https://github.com/astral-sh/uv/issues/8981#issuecomment-2466787211

  > `optional-dependencies` are part of the published metadata for your package, while `dependency-groups` are only visible when working with your package locally

### Add to dependencies

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

### Add to optional dependencies as extra packages

```bash
uv add ruff --optional aio
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

### Add to dependency groups

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

- Install dependencies only: `uv sync --no-dev` (without any extra nor any group)
- Install dependencies and `dev` group: `uv sync`
- Install dependencies and all groups (dependency-groups): `uv sync --all-groups`
- Install dependencies and all extras (project.optional-dependencies) and `dev` group: `uv sync --all-extras` (`dev` group is by default)
- Install dependencies and all extras and all groups: `uv sync --all-extras --all-groups`
- Install dependencies and extra `aio` and `dev` group: `uv sync --extra aio`
- Install dependencies and extra `aio` but without `dev` group: `uv sync --extra aio --no-dev`
- Install dependencies and `dev` groups and already installed extraneous packages not declared in pyproject.toml: `uv sync --extra aio --inexact`

- Ensure install by respecting `uv.lock` (ensure uv.lock won't be changed after uv sync) and raise error if lock file doesn't conform with pyproject.toml: `uv sync --locked --no-dev`, in Dockerfile ([official uv Dockerfile example](https://github.com/astral-sh/uv-docker-example/blob/main/Dockerfile)), we often use `uv sync --locked --no-install-project --no-dev`, see [Using uv in Docker](https://docs.astral.sh/uv/guides/integration/docker/) to understand the usage of each parameters.

    ```bash
    $ uv sync --locked --no-dev
    Resolved 21 packages in 33ms
    The lockfile at `uv.lock` needs to be updated, but `--locked` was provided. To update the lockfile, run `uv lock`.
    ```

## Dependencies tree

- `uv pip tree`: display the **installed packages** in a tree format.
- `uv tree`: update `uv.lock` based on `pyproject.toml` and display tree based on `uv.lock`, **no package installation will occur**. `uv tree` displays better than `uv tree pip tree`
- `uv tree --frozen`: don't update `uv.lock`, just display tree based on the current `uv.lock`
- `uv tree --locked`: if `uv.lock` is not updated, display a warning message. This command is not very useful.

## List outdated packages

- `uv tree --outdated`: display a list of outdated packages with their latest versions.

## Upgrade packages and uv.lock

- `uv lock`: update the `uv.lock` file to match the current state of `pyproject.toml`.
- `uv lock -U`: update the `uv.lock` file and upgrade all packages to their latest compatible versions.
- `uv sync`: same as `uv lock` but also installs the dependencies.
- `uv sync -U`: same as `uv lock -U` but also installs the dependencies.

!!! note "`uv lock` vs `uv lock -U` and `uv sync` vs `uv sync -U`"
    If latest version of fastapi is 0.116.1, and pyproject.toml declares fastapi>=0.115.1, and current uv.lock has fastapi==0.115.1. then:

      - `uv lock`: no effect, as `0.115.1` is still within the range of `>=0.115.1`.
      - `uv lock -U`: upgrade `fastapi` to `0.116.1`.

    Same logic applies to `uv sync` and `uv sync -U`, except for `sync` installing the dependencies too.

## Integrations

Check [this doc](https://docs.astral.sh/uv/guides/integration/) for more information on integrations with other tools and platforms (Docker, Jupyter, Github Actions, Pre Commit, PyTorch FastAPI, etc.).
