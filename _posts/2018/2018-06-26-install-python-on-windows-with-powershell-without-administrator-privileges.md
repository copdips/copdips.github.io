---
last_modified_at: 2019-12-30 17:31:08
title: "Install Python on Windows with Powershell without administrator privileges"
excerpt: "To fast deploy Python on Windows OS and without administrator privileges, we can use Powershell Install-Package to archive it."
tags:
  - python
  - powershell
  - nuget
  - package
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

> As a Windows DevOps, I often use Powershell and Python, Powershell is installed by Windows out of box, but this is not for Python. And for my working environment, I don't have the administrator privileges on some servers. I will show you in this post how to rapidly deploy Python on Windows as a standard user by using Powershell with Nuget.

## Update 2019-12-30 Installing Python by Scoop

Installing Python on Windows by [Scoop](https://github.com/lukesampson/scoop) is the simplest way so far if you have Internet access.

To switch between different Python versions, please check this [doc](https://github.com/lukesampson/scoop/wiki/Switching-Ruby-and-Python-Versions).

## Finding Python packages

If you cannot use Find-Package to search pacakges in Nuget repository, please check my post on [Setting Up Nuget for Powershell](https://copdips.com/2018/05/setting-up-powershell-gallery-and-nuget-gallery-for-powershell.html#set-up-nuget-for-powershell).

We will install `python` with version 3.6.5 and `python2` with version 2.7.15.

```powershell
> Find-Package python*
Name                           Version          Source           Summary
----                           -------          ------           -------
python                         3.6.5            Nuget            Installs 64-bit Python for use in build scenarios.
python-embed                   3.6.1.1          Nuget            Installs 64-bit Python for use in build scenarios a...
python2x86                     2.7.15           Nuget            Installs 32-bit Python 2.7 for use in build scenarios.
python2                        2.7.15           Nuget            Installs 64-bit Python 2.7 for use in build scenarios.
Python35                       3.5.1.1          Nuget            Python 3.5 API
Python36                       3.6.0            Nuget            Python 3.6 API
pythonAndroid-2.7-x86_64-22... 1.0.0.7          Nuget            Python 2.7 android api version: 22.0.0 architecture... pythonAndroid-2.7-armeabi-v... 1.0.0.7          Nuget            Python 2.7 android api version: 22.0.0 architecture... pythonAndroid-2.7-x86_64-23... 1.0.0.7          Nuget            Python 2.7 android api version: 23.0.0 architecture...
Python27Dev                    2.7.13           Nuget            Python 2.7 unofficial dev environment package
pythonIOS-2.7-arm64-10.3       1.0.0.7          Nuget            Python 2.7 iOS api version: 10.3 architecture: arm64
PythonPlotter                  0.2.15           Nuget            Package to allow use of matplotlib from .NET....
Python.Runtime                 2.7.9            Nuget            Python 2.7.9 as a single, stand-alone executable wi...
PythonLibs4CSharp              1.0.0            Nuget            A collection of Iron Python compiled libraries with...
pythonx86                      3.6.5            Nuget            Installs 32-bit Python for use in build scenarios.
pythonnet_py35_dotnet          2.3.0            Nuget            Python 3.5 and .NET Framework
pythonnet_py27_dotnet          2.3.0            Nuget            Python 2.7 and .NET Framework
Python27                       2.7.6            Nuget            Python 2.7 API
PythonConsoleControl           1.0.1            Nuget            PythonConsole
Python3                        3.6.3.2          PSGallery        Python3 interpreter
PythonSelect                   1.0.0            PSGallery        Select a Python distribution to use within a PowerS...
PythonConverter.dll            1.0.0            Nuget            Package description
```

## Installing Python

```powershell
# To install Python 3
> Install-Package python -Scope CurrentUser

# To install Python 2
> Install-Package python2 -Scope CurrentUser
```

**Note 2018-08-29:**
Current `Find-Package python* -AllVersion` gives the lastest python version is `v3.7.0`, but this version doesn't work, the last worked Nuget python version is `v3.6.6`
{: .notice--warning}

## Adding Python to user path

I will show you the way to add Python3 into the user PATH, it will be the same way for Python2.
I use the user PATH because I'm not admin on the Windows server, I cannot modify the system PATH.

```powershell
# Get python3 package info path
> Get-Package python | % source
C:\Users\xiang\AppData\Local\

# For Nuget packages, the executable is always under the tools folder, and the tools folder is at the same level as .nupkg file.
> ls C:\Users\xiang\AppData\Local\PackageManagement\NuGet\Packages\python.3.6.5\tools\

    Directory: C:\Users\xiang\AppData\Local\PackageManagement\NuGet\Packages\python.3.6.5\tools

Mode                LastWriteTime         Length Name
----                -------------         ------ ----
d-----       2018-06-26     00:15                DLLs
d-----       2018-06-26     00:15                include
d-----       2018-06-26     00:16                Lib
d-----       2018-06-26     00:15                libs
d-----       2018-06-26     00:49                Scripts
d-----       2018-06-26     00:15                Tools
-a----       2018-03-28     17:10         100504 python.exe
-a----       2018-03-28     17:10          58520 python3.dll
-a----       2018-03-28     17:10        3610776 python36.dll
-a----       2018-03-28     17:10          98968 pythonw.exe
-a----       2018-03-28     17:10          88752 vcruntime140.dll

# python needs to add 2 paths to the user PATH, one is the root folder containing python.exe, another is the Sripts folder.
> $pythonRootFolder = Join-Path (Split-Path (Get-Package python | % source)) "tools"
> $pythonScriptsFolder = Join-Path $pythonRootFolder "Scripts"
> $path = [System.Environment]::GetEnvironmentVariable('path', 'user')
> $path += ";$pythonRootFolder"
> $path += ";$pythonScriptsFolder;"
> [System.Environment]::SetEnvironmentVariable('path', $path, 'user')
```

## Reinstalling pip

The default pip3.exe and pip2.exe have some strange behavior that just don't work :

```powershell
> pip3
Fatal error in launcher: Unable to create process using '"'

> pip2
Fatal error in launcher: Unable to create process using '"'
```

You can bypass the issue by using `python -m pip`, but I like to use pip directly without `python -m`, the trick is just reinstalling the pip:

```powershell
> python -m pip uninstall pip -y
> python -m ensurepip
```
Normally `python -m ensurepip` will install pip v9, if you want to install pip v10, just upgrade the v9:
```powershell
> pip3  --version
pip 9.0.3 from c:\users\xiang\appdata\local\packagemanagement\nuget\packages\python.3.6.5\tools\lib\site-packages (python 3.6)

> python -m pip install -U pip
Collecting pip
  Using cached https://files.pythonhosted.org/packages/0f/74/ecd13431bcc456ed390b44c8a6e917c1820365cbebcb6a8974d1cd045ab4/pip-10.0.1-py2.py3-none-any.whl
Installing collected packages: pip
  Found existing installation: pip 9.0.3
    Uninstalling pip-9.0.3:
      Successfully uninstalled pip-9.0.3
Successfully installed pip-10.0.1

> pip3 --version
pip 10.0.1 from c:\users\xiang\appdata\local\packagemanagement\nuget\packages\python.3.6.5\tools\lib\site-packages\pip (python 3.6)
```

And we can find that when installing pip v10, the pip.exe is installed too, while in pip v9, we only have pip3.exe.

```powershell
> ls C:\Users\xiang\AppData\Local\PackageManagement\NuGet\Packages\python.3.6.5\tools\Scripts\

    Directory: C:\Users\xiang\AppData\Local\PackageManagement\NuGet\Packages\python.3.6.5\tools\Scripts

Mode                LastWriteTime         Length Name
----                -------------         ------ ----
-a----       2018-03-28     17:10          98187 easy_install-3.6.exe
-a----       2018-06-26     00:49         102812 pip.exe
-a----       2018-06-26     00:49         102812 pip3.6.exe
-a----       2018-06-26     00:49         102812 pip3.exe
-a----       2018-06-26     00:29          98224 ptipython.exe
-a----       2018-06-26     00:29          98224 ptipython3.exe
-a----       2018-06-26     00:29          98223 ptpython.exe
-a----       2018-06-26     00:29          98223 ptpython3.exe
-a----       2018-06-26     00:29          98207 pygmentize.exe
```

**Update on 2018-07-27**:
The pip version has been jumped from v10 to [`v18`](https://pip.pypa.io/en/stable/news/#id1) directly, because PyPA switches the software versioning to [`CalVer`](https://calver.org/)
{: .notice--info}

## Configuring pip for PyPI

If you're in enterprise environment, you may probably dont have access to the public Python packages repository https://pypi.org/, and in this case, your enterprise should have a local Artifactory which mirrors the public https://pypi.org/. So you need to add your enterprise Artifactory PyPI URL to you Python pip conf.

You can find all the pip configuration details [here](https://pip.pypa.io/en/stable/user_guide/#configuration).

For **JFrog Artifactory**:
<https://www.jfrog.com/confluence/display/RTF/PyPI+Repositories>
{: .notice--info}
