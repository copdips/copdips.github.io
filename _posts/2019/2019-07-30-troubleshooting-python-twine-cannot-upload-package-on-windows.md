---
title: "Troubleshooting Python Twine Cannot Upload Package On Windows"
excerpt: "Python twine uses ~/.pypirc as its default config file, but for some reasons it doesn't work on Windows."
tags:
  - python
  - package-management
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

Python has several tools to upload packages to PyPi or some private Artifactory locations. The mostly used one should be [twine](https://twine.readthedocs.io/en/latest/). Although twine is not a Python originate tool, but it's officially [recommended by Python.org](https://packaging.python.org/tutorials/packaging-projects/#uploading-the-distribution-archives).

## Building the package

Just a quick callback on how to build the pacakge. We need to create a file named [setup.py](https://docs.python.org/3.7/distutils/setupscript.html) at the root of the app. Use another file named [MANIFEST.IN](https://docs.python.org/3/distutils/sourcedist.html#specifying-the-files-to-distribute) to include the non-code files to the package. Don't forget to set [`include_package_data=True`](https://python-packaging.readthedocs.io/en/latest/non-code-files.html) in `setup.py`

> **Wheel**
>
> A [Built Distribution](https://packaging.python.org/glossary/#term-built-distribution) format introduced by [PEP 427](https://www.python.org/dev/peps/pep-0427), which is intended to replace the [Egg](https://packaging.python.org/glossary/#term-egg) format. Wheel is currently supported by [pip](https://packaging.python.org/key_projects/#pip).

Before the build, ensure that [`version`](https://packaging.python.org/guides/distributing-packages-using-setuptools/#choosing-a-versioning-scheme) key in `setup.py` is well defined.

```powershell
# to build a python wheel package
# sdist will generate a .tar.gz file in dist/
# bdist_wheel will generate a .whl file in dist/
python setup.py sdist bdist_wheel
```

## Upload built package to PyPi or private Artifactory.

We use twine to upload the Python packages. Before using it, we need to create a file name [`.pypirc` in `~/`](https://github.com/pypa/twine/blob/master/twine/utils.py#L57).

There's [an example from jfrog for .pypirc](https://www.jfrog.com/confluence/display/RTF/PyPI+Repositories#PyPIRepositories-PublishingtoArtifactory).

Then, we can upload the package by:

```powershell
# -r dev, dev is a repo defined in the ~/.pypirc file.
6.2.0> twine upload dist/* -r dev --cert [path_of_artifactory_site_cert_bundle_full_chain_in_pem_format_it_seems_that_no_param_to_ignore_ssl_error_with_twine]
```

### .pypirc path error

Unfortunately, on Windows OS, you might get following error message:

```powershell
6.2.0> twine upload dist/* --cert [artifactory_site_cert_full_chain_in_pem_format] -r dev

InvalidConfiguration: Missing 'dev' section from the configuration file or not a complete URL in --repository-url.
Maybe you have a out-dated '~/.pypirc' format?
more info: https://docs.python.org/distutils/packageindex.html#pypirc
```

This error is too generic, one of the reasons is because twine cannot find the file `~/.pypirc`, but if you check by `get-content ~/.pypirc`, it exits.

The reason for this error is that if you're on Windows, and `$env:HOME` exists and doesn't point to the same location as `$env:USERPROFILE`.

twine uses `$env:HOME` as `~/` as per [os.path.expanduser()](https://github.com/pypa/twine/blob/579f3fe60f2333972ba0260f44033ee1889ca3ca/twine/utils.py#L70), but Windows powershell uses `$env:USERPROFILE` as `~/`. `$env:HOME` is not set by Windows by default. And Windows administrators often use `$env:HOME` to redirect the user roaming profile.

### .pypirc path error reason

1. Firstly, I set $env:HOME to a temp file, so it is differnet than $env:USERPROFILE

    ```powershell
    # Initially $env:HOME doesn't exist
    6.2.0> Get-ChildItem env: | Out-String -st | Select-String 'userpro|home'

    ANDROID_SDK_HOME               C:\Android
    HOMEDRIVE                      C:
    HOMEPATH                       \Users\xiang
    USERPROFILE                    C:\Users\xiang

    6.2.0> $env:HOME = 'c:/temp'

    # now, we have $env:HOME which is different than $env:USERPROFILE
    6.2.0> Get-ChildItem env: | Out-String -st | Select-String 'userpro|home'

    ANDROID_SDK_HOME               C:\Android
    HOME                           c:/temp
    HOMEDRIVE                      C:
    HOMEPATH                       \Users\xiang
    USERPROFILE                    C:\Users\xiang
    ```

1. Check ~/ in Python
    ```python
    In [1]: import os

    In [2]: os.path.expanduser('~/')
    Out[2]: 'c:/temp/'
    ```

2. Check ~/ in Powershell
    ```powershell
    6.2.0> Resolve-Path ~/

    Path
    ----
    C:\Users\xiang
    ```

So if we created the .pypirc file in `~/` in Powershell, twine won't find it.

### Why os.path.expanduser() doesn't resolve the same ~/ as Powershell

As shown previsouly, Windows Powershell resolves `~/` as `$env:USERPROFILE`. How about os.path.expanduser()? Let's check its source code by the `inspect` module.

```python
In [1]: import os ; print(inspect.getsource(os.path.expanduser))
def expanduser(path):
    """Expand ~ and ~user constructs.

    If user or $HOME is unknown, do nothing."""
    path = os.fspath(path)
    if isinstance(path, bytes):
        tilde = b'~'
    else:
        tilde = '~'
    if not path.startswith(tilde):
        return path
    i, n = 1, len(path)
    while i < n and path[i] not in _get_bothseps(path):
        i += 1

    if 'HOME' in os.environ:
        userhome = os.environ['HOME']
    elif 'USERPROFILE' in os.environ:
        userhome = os.environ['USERPROFILE']
    elif not 'HOMEPATH' in os.environ:
        return path
    else:
        try:
            drive = os.environ['HOMEDRIVE']
        except KeyError:
            drive = ''
        userhome = join(drive, os.environ['HOMEPATH'])

    if isinstance(path, bytes):
        userhome = os.fsencode(userhome)

    if i != 1: #~user
        userhome = join(dirname(userhome), path[1:i])

    return userhome + path[i:]

In [2]:
```

From the source code, obviously, if `$env:HOME` exists, expanduser() will return its value. If `$env:HOME` doesn't exists, it falls back to `$env:USERPROFILE`, if not again, it falls back to `$env:HOMEDRIVE/$env:HOMEPATH`.

### Solutions

We have 3 solutions.

1. use [`twine --config-file`](https://twine.readthedocs.io/en/latest/#twine-upload) to manually specify the .pypirc config file.

1. if $env:HOME exists, copy the .pypirc file to $env:HOME, otherwise $env:USERPROFILE.

1. declare all the upload params as [environment variables](https://twine.readthedocs.io/en/latest/#environment-variables).