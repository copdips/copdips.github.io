---
title: "Using Powershell To Retrieve Latest Package Url From Github Releases"
excerpt: "Github can host package releases, I will show you how to use Powershell to retrieve the latest release download url."
tags:
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

> Github can host package releases, I will show you how to use Powershell to retrieve the latest release download url.

## Download latest Powershell release for Windows x64 zip version

The goal of this demo is to convert the static url:

- [https://github.com/PowerShell/PowerShell/releases/latest](https://github.com/PowerShell/PowerShell/releases/latest)

to the real download url (latest version on 2019/12/29):

- [https://github.com/PowerShell/PowerShell/releases/download/v6.2.3/PowerShell-6.2.3-win-x64.zip](https://github.com/PowerShell/PowerShell/releases/download/v6.2.3/PowerShell-6.2.3-win-x64.zip)

```powershell
> $url = 'https://github.com/PowerShell/PowerShell/releases/latest'
> $request = [System.Net.WebRequest]::Create($url)
> $response = $request.GetResponse()
> $realTagUrl = $response.ResponseUri.OriginalString
> $version = $realTagUrl.split('/')[-1].Trim('v')
> $version
6.2.3
> $fileName = "PowerShell-$version-win-x64.zip"
> $realDownloadUrl = $realTagUrl.Replace('tag', 'download') + '/' + $fileName
> $realDownloadUrl
https://github.com/PowerShell/PowerShell/releases/download/v6.2.3/PowerShell-6.2.3-win-x64.zip
> Invoke-WebRequest -Uri $realDownloadUrl -OutFile $env:TEMP/$fileName
```

The same method can be applied to retrieve other urls on other sites.
{: .notice--info}

The powershell pre-release doesn't have a static url, so I cannot retrieve the latest [v7.0.0-rc.1](https://github.com/PowerShell/PowerShell/releases/tag/v7.0.0-rc.1) download url.
{: .notice--info}
