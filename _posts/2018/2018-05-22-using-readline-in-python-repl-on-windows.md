---
title: "Using Readline In Python REPL On Windows With PyReadline and PtPython"
excerpt: "Use PyReadline and PtPython to have the powerful Readline in Python REPL on Windows OS."
tags:
  - python
  - repl
  - readline
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

> As an ex-sysadmin, I'm in love with the [Readline](https://en.wikipedia.org/wiki/GNU_Readline). In Powershell, we have its variation [PSReadline](https://github.com/lzybkr/PSReadLine). In Python REPL on Windows OS, I'll show you the [PyReadline](https://pythonhosted.org/pyreadline/) and the [PtPython](https://github.com/jonathanslenders/ptpython).

# PyReadline

When you search on Internet, you will find many tutorials telling you to install a Python module called [readline](https://pypi.org/project/readline/), but unfortunately, it's not compatible on Windows OS :

```python
> pip install readline

Collecting readline
  Using cached https://files.pythonhosted.org/packages/f4/01/2cf081af8d880b44939a5f1b446551a7f8d59eae414277fd0c303757ff1b/readline-6.2.4.1.tar.gz
    Complete output from command python setup.py egg_info:
    error: this module is not meant to work on Windows
```

On Windows, the counterpart is PyReadline, install it by :
```powershell
pip install pyreadline
```

Here are the features of PyReadline :
- keyboard text selection and copy/paste
- Shift-arrowkeys for text selection
- Control-c can be used for copy activate with allow_ctrl_c(True) in config file
- Double tapping ctrl-c will raise a KeyboardInterrupt, use ctrl_c_tap_time_interval(x) where x is your preferred tap time window, default - 0.3 s.
- paste pastes first line of content on clipboard.
- ipython_paste, pastes tab-separated data as list of lists or numpy array if all data is numeric
- paste_mulitline_code pastes multi line code, removing any empty lines.

PyReadline was used by IPython, but since it hasn't been maintained since 2015, IPython [removed it](https://github.com/ipython/ipython/blob/60f802938467731f555f694514e6592288455a1c/docs/source/whatsnew/version5.rst#new-terminal-interface), and replaced it by [prompt_toolkit](http://python-prompt-toolkit.readthedocs.io/en/stable/).
{: .notice--warning}

As PyReadline must be used inside Python REPL, you need to type `import PyReadline` from the very beginning of the Python REPL. To be a lazy devops, just add the import into a file and let Python to source it before the first prompt is displayed by using [$env:PYTHONSTARTUP](https://docs.python.org/3/using/cmdline.html#envvar-PYTHONSTARTUP) :

```powershell
# In powershell console
Add-Content $env:USERPROFILE/.pythonrc "`nimport PyReadline"
$env:PYTHONSTARTUP = "$env:USERPROFILE/.pythonrc"
```

# PtPython

Previous chapter mentioned that PyReadline is no more maintained, so here comes the [PtPython](https://github.com/jonathanslenders/ptpython).

PyPython is an interactive Python Shell, build on top of [prompt_toolkit](https://github.com/jonathanslenders/python-prompt-toolkit) written by the same author [Jonathan Slenders](https://github.com/jonathanslenders).

Install PtPython by :
```powershell
pip install ptpython
```

Start it by typing simply : `ptpython` from the terminal, it will start a Python REPL with prompt_toolkit integrated, nothing to set on $env:USERPROFILE
