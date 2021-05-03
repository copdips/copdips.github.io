---
title: "Installing Readthedocs (RTD) On Ubuntu 1804"
excerpt: "Not a step by step tutorial, just some tips and tricks."
tags:
  - python
  - readthedocs
  - ubuntu
published: false
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

> This is not a step by step tutorial to install Readthedocs, but just some tips and tricks.

## Official doc

The installation tutorial follows the [official doc](https://docs.readthedocs.io/en/stable/development/install.html).

On the date of writing this post, the official doc is at python v3.7.

## Installing python3 virtualenv

```bash
sudo apt-get install python3-pip
sudo pip3 install virtualenv

```

## Installing redis-server

The official doc asks to install redis-sever, but default Ubuntu 1804 installation wont find the package

```bash
sudo apt install redis-server

Reading package lists... Done
Building dependency tree
Reading state information... Done
E: Unable to locate package redis-server
```

We need to enable the universal package by:

```bash
sudo add-apt-repository universe
```
