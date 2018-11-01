---
title: "Setting Pwsh Invoke-WebRequest Proxy"
excerpt: "One-line command to set Powershell Core web cmdlets proxy."
tags:
  - powershell
  - proxy
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

> Different than Windows Powershell, Powershell Core doesn't [use the system proxy setting on Windows](https://copdips.com/2018/05/setting-up-powershell-gallery-and-nuget-gallery-for-powershell.html#configure-proxy-in-powershell). This post will show you an one-line command to set Powershell Core web cmdlets proxy.

My office working environment is behind an Internet proxy, and I use [Scoop](https://github.com/lukesampson/scoop) to install many dev tools on my Windows desktop.

Scoop is a [Chocolatey-like](https://github.com/lukesampson/scoop/wiki/Chocolatey-Comparison) Windows package management tool but its package sources are all on the Internet, there's no possibility to mirror the packages to a local repository. So I need to use the company Internet proxy to use the Scoop.

In fact, there's one possibility to install packages by [using the local source control repo](https://github.com/lukesampson/scoop/wiki/Buckets#creating-your-own-bucket), I've never tested, it should be technically worked, and seems not very difficult to set up, but it needs to be maintained.
{: .notice--info}

Scoop uses mainly the `Invoke-WebRequest` cmdlet to download the package sources from the Internet, and it has already generously given a [wiki on how to configure proxy](https://github.com/lukesampson/scoop/wiki/Using-Scoop-behind-a-proxy), but I've switched to Powershell Core (pwsh.exe) since a while, and none of the methods given by the wiki works.

After some googling, I finally find the [issue 3122](https://github.com/PowerShell/PowerShell/issues/3112) from the official Powershell Github repository, the collaborator [@markekraus](https://github.com/markekraus) gave a solution:

```powershell
$PSDefaultParameterValues["invoke-webrequest:proxy"] = 'http://username:password@proxyserver:port'
```

When giving the password as a plain text in a string, always use the single quotes to create the string, as some special characters ($, `, etc.) in the password might be evaluated by the string created by the double quotes. Otherwise pass the password as a variable into a double quoted string to convert it to a plain text. On Linux bash, we can see the same thing.
{: .notice--warning}
