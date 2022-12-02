---
last_modified_at: 2022-12-02 21:32:49
title: "Python difference on subprocess run(), call(), check_call(), check_output()"
excerpt: ""
tags:
  - python
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

## Difference on subprocess run(), call(), check_call(), check_output()

Since Python 3.5, the [official doc](https://docs.python.org/3.5/library/subprocess.html#older-high-level-api) explains that:

> Prior to Python 3.5, these three functions (`subprocess.call()`, `subprocess.check_call()`, `subprocess.check_output()`) comprised the high level API to subprocess. You can now use `subprocess.run()` in many cases, but lots of existing code calls these functions.

## subprocess.run common parameters

* subprocess.run default behavior accepts arguments in list

  ```python
  subprocess.run(["ls", "-l"])
  ```

* `shell=True` (default `False`) to send arguments in string

  ```python
  subprocess.run("ls -l", shell=True)
  ```

* `capture_output=True` (default `False`) to save output in a var

  ```python
  res = subprocess.run("ls -l", shell=True, capture_output=True)
  res.stdout
  ```

* `encoding="utf-8"` (default `None`) to save var in string instead of bytes.

* `check=True` (default `False`) to raise [`subprocess.CalledProcessError`](https://docs.python.org/3/library/subprocess.html#subprocess.CalledProcessError): if command returned non-zero exit code. But if the command executable doesn't exist for exampel missspellm you will get the error `FileNotFoundError`

* [Popen()](https://docs.python.org/3/library/subprocess.html#using-the-subprocess-module) is for advanced usage. For example, [replacing the shell pipeline](https://docs.python.org/3/library/subprocess.html#replacing-shell-pipeline).

  shell command:

  ```shell
  output=$(dmesg | grep hda)
  ```

  with Popen, becomes:

  ```python
  p1 = Popen(["dmesg"], stdout=PIPE)
  p2 = Popen(["grep", "hda"], stdin=p1.stdout, stdout=PIPE)
  p1.stdout.close()  # Allow p1 to receive a SIGPIPE if p2 exits.
  output = p2.communicate()[0]
  ```

* default params

  ```python
  import subprocess

  default_run_params = dict(
      capture_output=True,
      encoding="utf-8",
      check=True
  )
  # command = ["unknown_command", "-l"]
  # command = ["python", "-askjd"]
  command = ["ls", "-l"]

  try:
      # output type is subprocess.CompletedProcess
      output = subprocess.run(command, **default_run_params)

      # print in pure string in one line
      print(output)

      # print with new line just as launching from shell
      print(output.stdout)

      # as we catch error with `check=True`,
      # output.stderr is always an empty string.
      # and output.returncode is always 0 in this case.
  except FileNotFoundError as exc:
    print(f"{type(exc).__name__}: {exc}")
      raise
  except subprocess.CalledProcessError as exc:
      print(exc)  # no error details will given by print(exc)
      print(exc.__dict__)  # print all
      print(exc.returncode)
      print(exc.stderr)  # print error message only
      # exc.stdout should be empty
      raise
  ```
