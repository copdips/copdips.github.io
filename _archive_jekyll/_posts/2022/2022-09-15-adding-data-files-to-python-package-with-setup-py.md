---
last_modified_at:
title: "Adding data files to Python package with setup.py"
excerpt: ""
tags:
  - python
  - packaging
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

## setup.py vs pyproject.toml

`pyproject.toml` is the new Python project metadata specification standard since [PEP 621](https://peps.python.org/pep-0621/). As per [PEP 517](https://www.python.org/dev/peps/pep-0517/), and as per one of the comments of this [StackOverflow thread](https://stackoverflow.com/a/62983901/5095636), in some rare cases, we might have a chicken and egg problem when using `setup.py` if it needs to import something from the package it's building. The only thing that `pyproject.toml` cannot achieve for the moment is the installation in [editable mode](https://packaging.python.org/en/latest/guides/distributing-packages-using-setuptools/#working-in-development-mode), where we must use `setup.py`. Another advantage of `setup.py` is that we can compute some variables dynamically during the build time as it's a Python file.

Nevertheless, `setup.py` is still a widely used solid tool to build Python package. This post will discuss how to add data files (non Python files) to a Python wheel package built by `setup.py`, the source distribution files (sdist .tar.gz files, .zip for Windows) are not covered by this post.

## Adding data files

### With parameter package_data for files inside a package

Official doc: [https://docs.python.org/3/distutils/setupscript.html#installing-package-data](https://docs.python.org/3/distutils/setupscript.html#installing-package-data)

`package_data` accepts wildcard, but from the given example, the data files **must exist inside a Python module folder** (coexist with file `__init__.py`), you cannot use `package_data` to include files from non module folders, for e.g. the folder `conf` where there's no `__init__.py` file inside.

```bash
setup.py
conf/
    conf.json
src/
    mypkg/
        __init__.py
        module.py
        data/
            tables.dat
            spoons.dat
            forks.dat
```

```python
setup(...,
      packages=['mypkg'],
      package_dir={'mypkg': 'src/mypkg'},
      package_data={'mypkg': ['data/*.dat']},
      )
```

### With parameter data_files for any files

official doc: [https://docs.python.org/3/distutils/setupscript.html#installing-additional-files](https://docs.python.org/3/distutils/setupscript.html#installing-additional-files)

`distutils` is deprecated, and will be [remove in Python 3.12](https://docs.python.org/3/distutils/index.html#distributing-python-modules-legacy-version) as per [PEP 632](https://peps.python.org/pep-0632/), the migration path is to simply use [setuptools](https://setuptools.pypa.io/en/latest/deprecated/distutils-legacy.html).
{: .notice--warning}

```python
setup(...,
    data_files=[
        ('bitmaps', ['bm/b1.gif', 'bm/b2.gif']),
        ('config', ['cfg/data.cfg']),
        ({dest_folder_path_in_wheel}, [{source_file_path_relative_to_setup.py_script}]),
    ],
)
```

From the above example, we can see that:

1. `data_files` accepts any files from any folder, in contrast to `package_data` which accepts files inside a package folder.
2. `data_files` takes files one by one, we can not use the wildcard like * to specify a set of source files.
3. after build, there's a `.whl` wheel file generated, the `source_file_path_relative_to_setup` will be added to the path `{package_name}-{package_version}.data/data/{dest_folder_path_in_wheel}/{source_file_name}`, and the Python files are added to `{module_name}/{python_package_original_path}`. If you want to put the data files at the original path, you need to replace `{dest_folder_path_in_wheel}` with `../../{data_files_original_path}`, the first two `..` is just to escape two folder levels from `{package_name}-{package_version}.data/data/`.

### With file MANIFEST.in

From my understanding and tests, `MANIFEST.in` file is only for sdist, so out of the scope of this post which talks about bdist wheel package only.

### Parameter zip_safe

If you're using old-fashion egg file, to reference data files inside package, should put `zie_safe=False` during built. Otherwise, for modern Python packaging, this parameter is [obsolete](https://setuptools.pypa.io/en/latest/deprecated/zip_safe.html#understanding-the-zip-safe-flag).

## Loading data files

A very good sum-up can be found in this [StackOverflow thread](https://stackoverflow.com/a/58941536/5095636).

### Loading data files packaged by package_data

* With [importlib.resources](https://docs.python.org/3/library/importlib.html#module-importlib.resources), [importlib.metadata](https://docs.python.org/3/library/importlib.metadata.html) or their backports [importlib_resources](https://pypi.org/project/importlib_resources) [importlib_metadata](https://pypi.org/project/importlib_metadata).

  ```python
  # to read file from module_a/folder_b/file.json
  import importlib.resources
  import json

  # open_text is deprecated in Python3.11 as only support files in Python modules
  # see below example how to use `importlib.resources.files`
  json.load(importlib.resources.open_text("module_a.folder_b", "file.json"))
  ```

  Check this [doc](https://importlib-resources.readthedocs.io/en/latest/migration.html#migration-guide) for migration from `pkg_resources`.

* With deprecated [pkg_resources](https://setuptools.pypa.io/en/latest/pkg_resources.html#) from setuptools of pypa.io, and some examples from [here](https://godatadriven.com/blog/a-practical-guide-to-setuptools-and-pyproject-toml/) or [here](https://dbx.readthedocs.io/en/latest/guides/python/packaging_files/#using-the-referenced-files).

  [pkg_resources](https://setuptools.pypa.io/en/latest/pkg_resources.html) is deprecated due to some performance issue, and also need to install third-party setuptools for the run which should only be used during the build.
  {: .notice--warning}

  ```python
  # to read file from module_a/folder_b/file.json
  import json
  import pkg_resources

  json.load(pkg_resources.resource_stream("module_a", "folder_b/file.json"))
  ```

### Loading data files packaged by data_files

As data files packaged by `data_files` parameter could be in any folder, not necessarily inside a Python module with `__init__` file, in such case the new `importlib.resources.open_text`can not be used anymore, and indeed marked as [deprecated in Python 3.11](https://docs.python.org/3.11/library/importlib.resources.html?highlight=read_text#deprecated-functions).

* Use stdlib `importlib.resources.files` to read file from `module_a/folder_b/file.json`

  This method can also be used to [load data files packaged by package_data](#loading-data-files-packaged-by-data_files)
  {: .notice--info}

  ```python
  try:
      # new stdlib in Python3.9
      from importlib.resources import files
  except ImportError:
      # third-party package, backport for Python3.9-,
      # need to add importlib_resources to requirements
      from importlib_resources import files
  import json

  # with `data_files` in `setup.py`,
  # we can specify where to put the files in the wheel package,
  # so inside the module_a for example
  with open(files(module_a).joinpath("folder_b/file.json")) as f:
      print(json.load(f))
  ```

* Use deprecated third-party `pkg_resources` to read file from `module_a/folder_b/file.json`

  ```python
  import json
  import pkg_resources

  # use `data_files` in `setup.py`, we can specify where to put the files,
  # so inside the module_a for example
  json.load(pkg_resources.resource_stream("module_a", "folder_b/file.json"))
  ```

* Use stdlib `pkgtuil.get_data`

  You can find an example in this [StackOverflow thread](https://stackoverflow.com/a/58941536/5095636). All the answers and the comments are worth reading. Be aware that `pkgutil.get_date()` could be [deprecated](https://gitlab.com/python-devs/importlib_resources/-/issues/58#note_329352693) too one day.
