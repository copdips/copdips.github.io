---
authors:
- copdips
categories:
- python
- ubuntu
comments: true
date:
  created: 2019-10-27
  updated: 2024-07-23
description: Install Python3 on Ubuntu by using official source.
---

# Install Python3 on Ubuntu

A quick tutorial for installing Python from its official source on Ubuntu with sqlite3 support.

<!-- more -->

## Disabling IPv6

IPv6 is enabled by default on Ubuntu 16.04, in some cases, your Ubuntu network connection might be very low due to IPv6. Use `ip a | grep inet6` to check if IPv6 is enabled.

Ref: [How to disable ipv6 address on ubuntu 18 04 bionic beaver linux](https://linuxconfig.org/how-to-disable-ipv6-address-on-ubuntu-18-04-bionic-beaver-linux)

To disable IPv6 in a persist way, add following 2 lines in the file `/etc/sysctl.conf` and [reload the sysctl by `sudo sysctl --system`](https://www.cyberciti.biz/faq/reload-sysctl-conf-on-linux-using-sysctl/) or reboot the server:

```bash
net.ipv6.conf.all.disable_ipv6=1
net.ipv6.conf.default.disable_ipv6=1
```

## Installing Python3.11.9 with sqlite3 on Ubuntu 24.04 in WSL

!!! note "Similar procedure applied to other Python versions too."

```bash title="install build packages"
sudo apt update
# without `libssl-dev` package, pip install will throw TLS/SSL error.
sudo apt install -y \
  build-essential \
  zlib1g-dev \
  libssl-dev \
  libffi-dev \
  libbz2-dev \
  liblzma-dev \
  libncurses-dev \
  libreadline-dev \
  libsqlite3-dev \
  tk-dev \
  libgdbm-dev \
  libgdbm-compat-dev \
  libnsl-dev
```

```bash title="if install sqlite3 from source"
# install sqlite3 from source, if you need a specific sqlite3 version in Python, you must install it before compiling Python, because the compilation needs the lib libsqlite3.so
mkdir ~/src
cd ~/src/
wget https://www.sqlite.org/2024/sqlite-autoconf-3460000.tar.gz
tar xvf sqlite-autoconf-3460000.tar.gz
cd sqlite-autoconf-3460000/
./configure --prefix=/usr/local
make -j $(nproc)
sudo make install
make clean
ll /usr/local/bin/sqlite*
ll /usr/local/lib/*sqlite*

# let below Python compilation to use the newly installed sqlite3 lib
export LD_LIBRARY_PATH=/usr/local/lib:$LD_LIBRARY_PATH
```

```bash title="install Python from source"
cd ~/src/
wget https://www.python.org/ftp/python/3.11.9/Python-3.11.9.tgz
tar xvf Python-3.11.9.tgz
cd Python-3.11.9/

# ubuntu 20.04 has gcc v9 (v8+ are OK), so you can add the flag --enable-optimizations to ./configure
# to gain an extra runtime speed, otherwise you might encounter `Could not import runpy module` error
# --with-bz2 is for pandas, otherwise modulenotfounderror: no module named '_bz2' pandas
# ! --with-bz2 is not necessary for newer Python versions, at least for Python 3.11.9
version=$(basename "$(pwd)" | cut -d'-' -f2 | cut -d'.' -f1-2)
sudo ./configure --prefix=$HOME/opt/python$version  --enable-loadable-sqlite-extensions --enable-optimizations
make -j $(nproc)
sudo make install
make clean
sudo ln -sf ~/opt/python$version/bin/python$version /usr/bin/python$version
ll $(which python$version)
if ! grep -q 'export PIP_REQUIRE_VIRTUALENV=true' ~/.bashrc; then
    echo 'export PIP_REQUIRE_VIRTUALENV=true' >> ~/.bashrc
    echo "added export PIP_REQUIRE_VIRTUALENV=true"
fi
python$version -c 'import sqlite3 ; print(sqlite3.sqlite_version)'
```

## Prevent pip install without an active venv

```bash
if ! grep -q 'export PIP_REQUIRE_VIRTUALENV=true' ~/.bashrc; then
    echo 'export PIP_REQUIRE_VIRTUALENV=true' >> ~/.bashrc
fi
```
