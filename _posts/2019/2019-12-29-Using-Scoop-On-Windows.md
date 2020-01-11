---
last_modified_at: 2020-01-11 21:45:02
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

Scoop uses following methods to support different TLS/SSL versions:

Previously:

```powershell
# https://github.com/lukesampson/scoop/issues/2040#issuecomment-368298352

function set_https_protocols($protocols) {
    try {
        [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType] $protocols
    } catch {
        [System.Net.ServicePointManager]::SecurityProtocol = "Tls,Tls11,Tls12"
    }
}

function use_any_https_protocol() {
    $original = "$([System.Net.ServicePointManager]::SecurityProtocol)"
    $available = [string]::join(', ', [Enum]::GetNames([System.Net.SecurityProtocolType]))

    # use whatever protocols are available that the server supports
    set_https_protocols $available

    return $original
}

function do_dl($url, $to, $cookies) {
    $original_protocols = use_any_https_protocol
    $progress = [console]::isoutputredirected -eq $false

    try {
        $url = handle_special_urls $url
        dl $url $to $cookies $progress
    } catch {
        $e = $_.exception
        if($e.innerexception) { $e = $e.innerexception }
        throw $e
    } finally {
        set_https_protocols $original_protocols
    }
}
```

Now:

```powershell
# https://github.com/lukesampson/scoop/blob/48bb96a3d80ed722317a88afbae126c40ee205e8/lib/core.ps1#L1

function Optimize-SecurityProtocol {
    # .NET Framework 4.7+ has a default security protocol called 'SystemDefault',
    # which allows the operating system to choose the best protocol to use.
    # If SecurityProtocolType contains 'SystemDefault' (means .NET4.7+ detected)
    # and the value of SecurityProtocol is 'SystemDefault', just do nothing on SecurityProtocol,
    # 'SystemDefault' will use TLS 1.2 if the webrequest requires.
    $isNewerNetFramework = ([System.Enum]::GetNames([System.Net.SecurityProtocolType]) -contains 'SystemDefault')
    $isSystemDefault = ([System.Net.ServicePointManager]::SecurityProtocol.Equals([System.Net.SecurityProtocolType]::SystemDefault))

    # If not, change it to support TLS 1.2
    if (!($isNewerNetFramework -and $isSystemDefault)) {
        # Set to TLS 1.2 (3072), then TLS 1.1 (768), and TLS 1.0 (192). Ssl3 has been superseded,
        # https://docs.microsoft.com/en-us/dotnet/api/system.net.securityprotocoltype?view=netframework-4.5
        [System.Net.ServicePointManager]::SecurityProtocol = 3072 -bor 768 -bor 192
    }
}
```

We can reuse it elsewhere.

## Scoop aria2 skip certificate check

To use aria2 within Scoop to download packages in multithreading:

```powershell
scoop config aria2-enabled true
```

But aria2 by default checks the certificate, to skip the check, use [aria2-options](https://github.com/lukesampson/scoop/pull/3780):

```powershell
scoop config aria2-options @('--check-certificate=false')
```
