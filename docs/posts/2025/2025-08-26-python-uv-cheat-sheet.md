---
authors:
- copdips
categories:
- python
- package
- cicd
- cache
- github
comments: true
date:
  created: 2025-08-26
  updated: 2025-09-07
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
    If upper folders has already a `pyproject.toml` file, uv will also add the new project (created by `uv init`) as `[tool.uv.workspace]` members. This cheat sheet doesn't cover that yet. As that converts the repo to a [uv workspace](https://docs.astral.sh/uv/concepts/projects/workspaces/#using-workspaces) which is a little bit more complex. You might need to use `uv sync --active` to install dependencies in the active venv.

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

### tool.uv.environments vs tool.uv.required-environments

[`tool.uv.environments`](https://docs.astral.sh/uv/concepts/resolution/#limited-resolution-environments) forces uv to ==only resolve the dependencies and cache== the defined environments, whereas [`tool.uv.required-environments`](https://docs.astral.sh/uv/concepts/resolution/#required-environments) will only ensure the required environments are always available, but ==other environments (the wheel files) could still be resolved and cached==.

```toml title="pyproject.toml with tool.uv.environments" hl_lines="2"
[tool.uv]
environments = [
    "sys_platform == 'darwin'",
    "sys_platform == 'linux'",
]
```

```toml title="pyproject.toml with tool.uv.required-environments" hl_lines="2"
[tool.uv]
required-environments = [
    "sys_platform == 'darwin' and platform_machine == 'x86_64'"
]
```

`tool.uv.required-environments` is useful when some packages (like PyTorch) have only wheels (no [sdist](https://docs.astral.sh/uv/concepts/resolution/#source-distribution)), and its wheels are not available for all platforms.

Example:

Say a package `foo` publishes only linux platform wheels, and no `sdist`:

- `foo-1.0.0-cp311-cp311-manylinux_x86_64.whl`

If you're on Linux, and run `uv add foo`:

- With no `required-environments` → ✅ works (Linux wheel available, resolution succeeds). uv only guarantees installability for your own environment.
- With `required-environments = ["sys_platform == 'darwin'"]` → ❌ fails (no macOS wheel, and no sdist to build one). With this settings, your colleagues on macOS won't see surprisingly `foo` in the `pyproject.toml`

!!! note "If we have the sdist, that's all right"
    For packages providing also `sdist` (source distribution), even if no wheel (built distributions) is available for a specific platform, uv can still try to build from `sdist` on the specific platform, so it should work. But as said above, some packages like `pytorch` don't provide `sdist`, only wheels.

!!! note
    [`--only-binary`](https://docs.astral.sh/uv/pip/compatibility/#-only-binary-enforcement) will restrict to use wheels only, and [`--no-binary`](https://docs.astral.sh/uv/pip/compatibility/#-no-binary-enforcement) will restrict to use `sdist` only.

### Dependency overrides

If you want to install a version of a package that is resolved as conflict with existing dependencies, but you're sure it's compatible or you want to test it intentionally, you can use [dependency overrides](https://docs.astral.sh/uv/concepts/resolution/#dependency-overrides) to force uv to install a specific version of a package.

```toml title="pyproject.toml"
[tool.uv]
override-dependencies = [

    # Always install Werkzeug 2.3.0, regardless of whether
    # transitive dependencies request a different version.
    "werkzeug==2.3.0",

    # Install pydantic>=2.0 even though
    # a transitive dependency declares the requirement pydantic>=1.0,<2.0
    "pydantic>=1.0,<3",
]
```

While [constraints](https://docs.astral.sh/uv/concepts/resolution/#dependency-constraints) can only reduce the set of acceptable versions for a package, overrides can expand the set of acceptable versions, providing an escape hatch for erroneous upper version bounds. As with constraints, ==overrides do not add a dependency on the package== and only take effect if the package is requested in a direct or transitive dependency.

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
                                                            |

### --resolution lowest-direct and --resolution lowest

With `--resolution lowest`, uv will install the lowest possible version for all dependencies, both direct and indirect (transitive). `--resolution lowest`

Alternatively, `--resolution lowest-direct` will use the lowest compatible versions for all direct dependencies, while using the latest compatible versions for all other dependencies. uv will always use the latest versions for build dependencies.

!!! important "testing compatibility"
    When publishing libraries, it is recommended to separately run tests with `--resolution lowest` or `--resolution lowest-direct` in CI/CD to [ensure compatibility with the declared lower bounds](https://docs.astral.sh/uv/concepts/resolution/#lower-bounds).

!!! warning "set back to default `--resolution highest` after testing"
    After testing with `--resolution lowest` or `--resolution lowest-direct`, remember to set back to the default `--resolution highest` to avoid potential dependency conflicts in future installations.

`--resolution lowest-direct` is easier than `--resolution lowest` as it only affects direct dependencies, so it is less likely to cause dependency conflicts:

```bash hl_lines="1"
$ uv sync --resolution lowest
Ignoring existing lockfile due to change in resolution mode: `highest` vs. `lowest`
  × Failed to build `idna==0.2`
  ├─▶ The build backend returned an error
  ╰─▶ Call to `setuptools.build_meta:__legacy__.build_wheel` failed (exit status: 1)

      [stderr]
      Sorry, Python 3 not yet supported

      hint: This usually indicates a problem with the package or the build environment.
  help: `idna` (v0.2) was included because `temp` (v0.1.0) depends on `httpx` (v0.28.1) which depends on
        `idna`
```

Whereas `--resolution lowest-direct` works fine for the same project:

```bash hl_lines="1"
$ uv sync --resolution lowest-direct
Ignoring existing lockfile due to change in resolution mode: `highest` vs. `lowest-direct`
Resolved 26 packages in 330ms
Uninstalled 3 packages in 10ms
Installed 3 packages in 9ms
 - fastapi==0.116.1
 + fastapi==0.115.1
 - ruff==0.12.10
 + ruff==0.12.4
 - starlette==0.47.3
 + starlette==0.38.6
```

### Reproducible builds

- If you're using uv.lock with Dockerfile to build your application, you could use `uv sync --locked --no-install-project --no-dev` to ensure reproducible builds, or even the image itself is reproducible. See [Using uv in Docker](https://docs.astral.sh/uv/guides/integration/docker/) for more information.
- If you're not using uv.lock, and you previously (on `2025-09-07`) used `uv pip install -r requirements.txt` to install dependencies, and not all the dependencies and transitive dependencies are pinned in `requirements.txt`. One day there's bug in the production, you want to reproduce the same environment as before. One of the ways is to use `uv pip install -r requirements.txt --exclude-newer 2025-09-07` to exclude any package released after `2025-09-07`. See [Reproducible resolutions](https://docs.astral.sh/uv/concepts/resolution/#reproducible-resolutions) for more information. We can also add `exclude-older` in [tool.uv] in `pyproject.toml` to make it permanent.

!!! note
    An [RFC 3339](https://www.rfc-editor.org/rfc/rfc3339.html) timestamp (e.g., `2006-12-02T02:07:43Z`) and a local date in the same format (e.g., `2006-12-02`) in your system's configured time zone are both supported in `--exclude-newer`

### link-mode: clone, copy, hardlink, symlink

| OS      | Default link-mode     | Fallback          |
| ------- | --------------------- | ----------------- |
| Linux   | hardlink              | fallbacks to copy |
| Windows | hardlink              | fallbacks to copy |
| MacOS   | clone (copy-on-write) |   unknown         |

Possible values:

- `clone`: Clone (i.e., [copy-on-write](https://en.wikipedia.org/wiki/Copy-on-write)) packages from the wheel into the site-packages directory. With copy-on-write (COW), initially no extra disk space is used as long as the dependencies are cached, we're using shared cache files. But if you modify the code of a package, extra disk space will be used to store the modified files. To ensure your modification to the dependencies won't impact other projects which are using the same dependencies from the shared cache. This mode minimizes disk space usage, but it requires a filesystem that supports copy-on-write, such as Btrfs or APFS. If the filesystem doesn't support copy-on-write, uv will fallback to `copy` mode.
- `copy`: Copy packages from the wheel into the site-packages directory. ==This is also the default mode for traditional pip install, useful if you want to modify dependencies' code for debugging purpose==.
- `hardlink`: Hard link packages from the wheel into the site-packages directory. fallbacks to `copy` mode if the cache and the venv are on different filesystems.
- `symlink`: Symbolically link packages from the wheel into the site-packages directory, use with caution as `uv cache clean` will break all installed packages.

```toml title="pyproject.toml"
[tool.uv]
link-mode = "copy"
```

or `export UV_LINK_MODE=copy` or `--link-mode=copy` in the command line.

### Bytecode compilation

Unlike `pip`, uv does not compile `.py` files to `.pyc` files during installation by default (i.e., uv does not create or populate `__pycache__` directories). To enable bytecode compilation during installs, pass the -`-compile-bytecode` flag to `uv pip install` or `uv pip sync`, or set the environment variable `UV_COMPILE_BYTECODE=1`.

Skipping bytecode compilation can be undesirable in workflows; for example, we recommend enabling bytecode compilation in [Docker builds](https://docs.astral.sh/uv/guides/integration/docker/) to improve startup times (at the cost of increased build times).

### Concurrent install

[As per uv's documentation](https://docs.astral.sh/uv/concepts/cache/#cache-safety), concurrent installations are supported even against the same virtual environment. uv applies a file-based lock to the target virtual environment when installing, to avoid concurrent modifications across processes.

## Dependencies tree

| Command            | Description                                                                                                                                                          |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `uv pip tree`      | Display the **installed packages** in a tree format                                                                                                                  |
| `uv tree`          | Update `uv.lock` based on `pyproject.toml` and display tree based on `uv.lock`, **no package installation will occur**. `uv tree` displays better than `uv pip tree` |
| `uv tree --frozen` | Don't update `uv.lock`, just display tree based on the current `uv.lock`                                                                                             |
| `uv tree --locked` | If `uv.lock` is not updated, display a warning message. This command is not very useful|

## List outdated packages

- `uv tree --outdated` or `uv tree --outdated | grep latest`: display a list of outdated packages with their latest **public** versions, no matter what`pyproject.toml` declares.
- [`uv lock --check`](https://docs.astral.sh/uv/concepts/projects/sync/#checking-if-the-lockfile-is-up-to-date): check if `uv.lock` is up-to-date with `pyproject.toml`.

## Upgrade packages and uv.lock

The only way to change the package version constraints is to edit manually the `pyproject.toml` file directly. After making changes to `pyproject.toml`, you should run `uv sync` to update the venv dependencies and the `uv.lock` file accordingly. Or `uv lock` to update only the `uv.lock` file without changing the venv dependencies.

[`uv.lock` file](https://docs.astral.sh/uv/concepts/projects/layout/#the-lockfile) can be updated by `uv lock`, `uv sync`, `uv run`, `uv add`, `uv remove`.

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

For a list of packages that are known to fail under PEP 517 build isolation, see [#2252](hhttps://github.com/astral-sh/uv/issues/2252).

## Caching

- `uv cache dir`: show the cache directory.
- `uv cache clean`: clear the cache entirely.
- `uv cache clean ruff`: clear only the ruff package cache.
- `uv cache prune`: safely removes all unused cache entries.
- `uv sync --refresh` or `uv pip install --refresh`: force revalidate cached data for all dependencies, use `--refresh-package ruff` to revalidate only `ruff`.

### Caching in CI

As per [uv's documentation on Caching in continuous integration](https://docs.astral.sh/uv/concepts/cache/#caching-in-continuous-integration), it's recommended to use `uv cache prune --ci` at the end of the CI, to remove all pre-built wheels and unzipped source distributions from the cache, but retain any wheels that were built from source.

There's [an example of using this in Github Actions](https://docs.astral.sh/uv/guides/integration/github/#caching). It also provides `enable-cache: true` to achieve the same effect.

!!! note
    If using `uv pip`, use `requirements.txt` along with the OS and the Python version instead of `uv.lock` in the cache key. And you may need to set the env var `UV_SYSTEM_PYTHON=1` or add the command line flag `--system` to use the system Python in CI.

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
