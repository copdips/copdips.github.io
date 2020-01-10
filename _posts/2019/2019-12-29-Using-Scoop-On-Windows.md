---
last_modified_at: 2020-01-11 11:47:42
title: "Using Scoop On Windows"
excerpt: "Some tips to use Scoop."
tags:
  - scoop
  - powershell
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

> I've been using [Scoop](https://github.com/lukesampson/scoop) for setting up my personal and professional Windows development desktops since nearly 2 years.
For me, it's much more useful than another famous Windows package management tool [Chocolatey](https://github.com/lukesampson/scoop/wiki/Chocolatey-Comparison), because with Scoop, everything is run & installed without any administrator privileges.
This is very important in an enterprise environment, that all the enterprise Windows administrators are trying their best to prevent you from installing anything on Windows. This post will share my ways to use it **especially in such a enterprise environment**. BTW, Scoop is completely a Powershell open source project and free for use.

## Using external 7Zip

7Zip is a prerequisite for Scoop which is used for decompress many tools (git, conemu, etc.).
By default, Scoop will download 7Zip from its official website [https://7-zip.org/a/7z1900-x64.msi](https://github.com/ScoopInstaller/Main/blob/master/bucket/7zip.json#L11).
Unfortunately, this website is probably excluded by some enterprises' security gateway/tool.

But, fortunately, 7Zip is often already installed by enterprises' deployment tool by default.

So, in order to let Scoop to use this external 7Zip pre-installed by enterprise admin rather than `$env:SCOOP\apps\7zip`, we need to set following config:

```powershell
scoop config '7ZIPEXTRACT_USE_EXTERNAL' $true
```

This tips is not documented yet in the [Scoop Wiki](https://github.com/lukesampson/scoop/wiki).

BTW: Maybe coping manually the 7Zip files to `$env:SCOOP\apps\7zip` will work too, but I haven't tested yet.

## Scoop TLS/SSL support

Scoop uses following methods to supports different TLS/SSL versions.
https://github.com/lukesampson/scoop/issues/2040#issuecomment-368298352

We can reuse elsewhere.

## Scoop aria2 skip certificate check

To use aria2 within Scoop to download packages in multithreading:

```powershell
scoop config aria2-enabled true
```

But aria2 by default checks the certificate, to skip the check, use [aria2-options](https://github.com/lukesampson/scoop/pull/3780):

```powershell
scoop config aria2-options @('--check-certificate=false')
```
