---
authors:
- copdips
categories:
- linux
comments: true
date:
  created: 2020-02-01
description: Setting up WSL (Windows Subsystem for Linux)
---

# Setting up WSL

## Cleaning up manually the WSL instance

For any reason you failed to install WSL from Microsoft store, you might need to clean up manually the downloaded WSL instance, the default location is at: `$env:LOCALAPPDATA\Packages`

For example, Ubuntu v1804 is at: `C:\Users\xiang\AppData\Local\Packages\CanonicalGroupLimited.UbuntuonWindows_79rhkp1fndgsc\`

Just delete the folder then reinstall it from Microsoft store.

## Changing the default ls output directory color

[https://github.com/microsoft/vscode/issues/7556](https://github.com/microsoft/vscode/issues/7556)

[https://askubuntu.com/a/466203](https://askubuntu.com/a/466203)

```bash
# add to ~/.bashrc
export LS_COLORS="ow=0;36;40"
```
ow = (OTHER_WRITABLE)   Directory that is other-writable (o+w) and not sticky

<!-- more -->

## Installing Python3.7 on Ubuntu 1804

Installing Python3.7 will automatically prompt you to update libssl.

```bash
sudo apt update
sudo apt install python3.7 python3.7-venv python3-venv
```
