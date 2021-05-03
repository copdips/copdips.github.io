---
last_modified_at: 2021-03-17 00:12:13
title: "Install Python3 on Ubuntu"
excerpt: "Install Python3 on Ubuntu by using official source."
tags:
  - python
  - ubuntu
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



Most of tutorials on the Internet about installing Python3.6 on Ubuntu are by [using 3rd party PPA repositories](http://ubuntuhandbook.org/index.php/2017/07/install-python-3-6-1-in-ubuntu-16-04-lts/). If for any reason, you cannot use them, hereunder a quick tutorial for installing it from the Python official source, you should in advance download the source to the Ubuntu.

## Installing Python3.6 on Ubuntu 16.04

### Disabling IPv6

IPv6 is enabled by default on Ubuntu 16.04, in some cases, your Ubuntu network connection might be very low due to IPv6. Use `ip a | grep inet6` to check if IPv6 is enabled.

Ref: [How to disable ipv6 address on ubuntu 18 04 bionic beaver linux](https://linuxconfig.org/how-to-disable-ipv6-address-on-ubuntu-18-04-bionic-beaver-linux)

To disable IPv6 in a persist way, add following 2 lines in the file `/etc/sysctl.conf` and [reload the sysctl by `sudo sysctl --system`](https://www.cyberciti.biz/faq/reload-sysctl-conf-on-linux-using-sysctl/) or reboot the server:

```
net.ipv6.conf.all.disable_ipv6=1
net.ipv6.conf.default.disable_ipv6=1
```

### Installing build packages

```bash
sudo apt install -y build-essential zlib1g-dev libssl-dev
```

without `libssl-dev` package, pip install will throw TLS/SSL error.
{: .notice--info}

From this point of view, installing Python on Windows by Scoop is much more pleasant :)
{: .notice--info}

### Installing Python3.6 from official source

The latest Python3.6 version at the time of this writing is 3.6.9.

```bash
# You may download the Python source to a local shared location (S3 or Artifactory, etc.) if you need to deploy Python to many servers.
wget https://www.python.org/ftp/python/3.6.9/Python-3.6.9.tgz
tar xzvf Python-3.6.9.tgz
cd Python-3.6.9
sudo ./configure --prefix=/opt/python3.6
make -j $(nproc)
sudo make install
sudo ln -s /opt/python3.6/bin/python3.6 /usr/bin/python3.6
```

Python3.5 is preinstalled by default on Ubuntu 16.04, `python3 -V` gives `Python 3.5.2`, many system tools rely on it, please **DO NOT** bind python3 to any versions other than Python3.5, otherwise your system might have unexpected problems.
{: .notice--warning}

For a general Python installation not only for this Python3.6, if you have `gcc v8+`, you can add the flag `--enable-optimizations` to `./configure` to gain an extra runtime speed, otherwise you might encounter `Could not import runpy module` error
{: .notice--info}

### Using Python3.6 pip

```bash
python3.6 -m pip install [a python module]
```

### Prevent pip install without an active venv

```bash
echo 'export PIP_REQUIRE_VIRTUALENV=true' >> ~/.bashrc
```

## Installing Python3.7 on Ubuntu 16.04

Just tested installing Python3.7.5 with the same procedure, all works.

## Installing Python3.9.2 with sqlite3 on Ubuntu 20.04 in WSL

```bash
# install build packages
sudo apt update
sudo apt install -y build-essential zlib1g-dev libssl-dev libffi-dev

# install sqlite3 from source, if you need a specific sqlite3 version in Python, you must install it before compiling Python, because the compilation needs the lib libsqlite3.so
mkdir ~/src
cd ~/src/
wget https://www.sqlite.org/2021/sqlite-autoconf-3350100.tar.gz
tar xvf sqlite-autoconf-3350100.tar.gz
cd sqlite-autoconf-3350100/
./configure --prefix=/usr/local
make -j $(nproc)
sudo make install
make clean
ll /usr/local/bin/sqlite*
ll /usr/local/lib/*sqlite*

# let below Python compilation to use the newly installed sqlite3 lib
export LD_LIBRARY_PATH=/usr/local/lib:$LD_LIBRARY_PATH

# install python3.9.2 from source
cd ~/src/
wget https://www.python.org/ftp/python/3.9.2/Python-3.9.2.tgz
tar xvf Python-3.9.2.tgz
cd Python-3.9.2/

# ubuntu 20.04 has gcc v9, so you can add the flag --enable-optimizations to ./configure
./configure --prefix=$HOME/opt/python3.9
make -j $(nproc)
sudo make install
make clean
sudo ln -s ~/opt/python3.9/bin/python3.9 /usr/bin/python3.9
ll $(which python3.9)
echo -e '\nexport PIP_REQUIRE_VIRTUALENV=true' >> ~/.bashrc
python3.9 -c 'import sqlite3 ; print(sqlite3.sqlite_version)'
```
