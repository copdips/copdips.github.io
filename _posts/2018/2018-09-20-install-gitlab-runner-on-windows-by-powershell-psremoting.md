---
title: "Install Gitlab Runner on Windows by Powershell PsRemoting"
excerpt: "Install Gitlab runner on Windows over winrm PsRemoting with full command line."
tags:
  - gitlab
  - cicd
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

> Gitlab runner can be installed on Windows OS. For people like me who is more familiar with Windows, we would like to use Windows as a Gitlab runner. This post will give you a simplified procedure (winrm PsRemoting full command line) about its installation with some tips and tricks that I haven't seen anywhere on the Internet.

# Some docs on the Internet

The [official doc](https://docs.gitlab.com/runner/) is complete and clear enough.

# Download Gitlab runner executable

```powershell
# This command is runned from my Windows 10 desktop.
$paramIwr = @{
  Uri = "https://gitlab-runner-downloads.s3.amazonaws.com/latest/binaries/gitlab-runner-windows-amd64.exe";
  OutFile = "D:\xiang\Downloads\gitlab-runner-windows-amd64.exe"
}
Invoke-WebRequest @paramIwr
```

# Install Gitlab runner on Windows

Some official docs:
1. [Install gitlab runner on windows](https://docs.gitlab.com/runner/install/windows.html).
2. [Gitlab-runner installation related commands](https://docs.gitlab.com/runner/commands/#gitlab-runner-install)

My Gitlab runner is a fresh Windows server 2019 VM named **19S01**.

```powershell
# Use WinRM over HTTPS is the simplest way to connect to an out of the box workgroup Windows server in lab.
$s19s01 = New-PSSession 19S01 -UseSSL -SessionOption (New-PSSessionOption -SkipCACheck) -Credential administrator

# ntrights is in the Windows Server 2003 Resource Kit Tools
# https://www.microsoft.com/en-us/Download/confirmation.aspx?id=17657
Copy-Item D:\xiang\Dropbox\tools\windows\rktools\ntrights.exe c:/temp -ToSession $s19s01
Copy-Item D:\xiang\Downloads\gitlab-runner-windows-amd64.exe c:/temp -ToSession $s19s01

Enter-PSSession $s19S01

# If you need to use a domain account to run the gitlab-runner server, this way is not recommended.
# c:/temp/ntrights.exe ntrights +r SeServiceLogonRight -u Domain\DomainAccount

New-Item d:/app/gitlab-runner -Type Directory -Force
Copy-Item C:\temp\gitlab-runner-windows-amd64.exe D:\app\gitlab-runner
Rename-Item D:\app\gitlab-runner\gitlab-runner-windows-amd64.exe gitlab-runner.exe

# Install without any other params will install a windows service named gitlab-runner running under the built-in system account.
Set-Location D:\app\gitlab-runner
./gitlab-runner.exe install

# If you need to bind a domain account to the gitlab runner service:
# I encountered some issue when installing gitlab runner service with the full exe path : D:\app\gitlab-runner\gitlab-runner.exe install, so I firstly go to the gitlab-runner.exe folder, than run the exe directly from there.
Set-Location D:\app\gitlab-runner
./gitlab-runner install --user ENTER-YOUR-USERNAME --password ENTER-YOUR-PASSWORD

D:\app\gitlab-runner\gitlab-runner.exe status
```

# Register Gitlab runner on Windows

Some official docs:

1. [Register gitlab-runner on windows](https://docs.gitlab.com/runner/register/index.html#windows)
2. [One-line registration commands](https://docs.gitlab.com/runner/register/index.html#one-line-registration-command)
3. [Gitlab-runner registration related commands](https://docs.gitlab.com/runner/commands/#registration-related-commands)

```powershell
Add-Content -Value "192.168.111.184`tgitlab.copdips.local" -Path C:\Windows\system32\drivers\etc\hosts

# Add the gitlab self-signed certificate to runner's cert store.
$gitlabUrl = "https://gitlab.copdips.local"
$localCertPath = "$env:temp\$($gitlabUrl.Split('/')[2]).crt"
$webRequest = [Net.WebRequest]::Create($gitlabUrl)
try { $webRequest.GetResponse() } catch {} # try catch is useful if ssl cert is not valid. ServicePoint is always kept even for invalid ssl cert.
$cert = $webRequest.ServicePoint.Certificate
$bytes = $cert.Export("Cert")
Set-content -value $bytes -encoding byte -path $localCertPath

# https://docs.microsoft.com/en-us/windows/desktop/seccertenroll/about-certificate-directory
Import-Certificate -FilePath $localCertPath -CertStoreLocation Cert:\LocalMachine\Root

# Ensure the runner is stopped before the registration.
D:\app\gitlab-runner\gitlab-runner.exe stop
D:\app\gitlab-runner\gitlab-runner.exe status

# Go to https://gitlab.copdips.local/win/flaskapi/settings/ci_cd and get the runner registration-token from this web site
# Dont add quotes around the registration-token.
# Pay attention to the usage of the stop-parsing symbol --% .
# http://copdips.com/2018/05/powershell-stop-parsing.html
D:\app\gitlab-runner\gitlab-runner.exe --% register -n --name 19s01 --url https://gitlab.copdips.local/ --registration-token Qdz3TyfnESrjSsmff6A9  --executor shell --shell powershell --tag-list 'windows,windows2016,flaskapi' --run-untagged true
D:\app\gitlab-runner\gitlab-runner.exe start
D:\app\gitlab-runner\gitlab-runner.exe status
```

Using Powershell Core `pwsh.exe` as a Windows Gitlab runner shell will be supported from the [version 11.8](https://gitlab.com/gitlab-org/gitlab-runner/issues/3291#note_111326306)
{: .notice--note}


# Check the Gitlab runner config from the runner server

```powershell
# Dont be afraid of the error messages returned by gitlab-runner.exe list.
# The Powershell PsRemoting session is not as powerfull as local Powershell console, and some external executables like gitlab-runner.exe or git.exe send their outputs to stderr by default.
[19S01]: PS C:\temp> D:\app\gitlab-runner\gitlab-runner.exe list
D:\app\gitlab-runner\gitlab-runner.exe : Listing configured runners
ConfigFile=C:\Users\Administrator\Documents\config.toml
    + CategoryInfo          : NotSpecified: (Listing configu...nts\config.toml:String) [], RemoteException
    + FullyQualifiedErrorId : NativeCommandError

19s01                                               Executor=shell
Token=4a76cba042b1748e7546dad9f03458 URL=https://gitlab.copdips.local/

[19S01]: PS C:\temp> Get-Content (gcim cim_service | ? name -eq gitlab-runner | % path*).split(" ")[5]
concurrent = 1
check_interval = 0

[[runners]]
  name = "19s01"
  url = "https://gitlab.copdips.local/"
  token = "4a76cba042b1748e7546dad9f03458"
  executor = "shell"
  shell = "powershell"
  [runners.cache]
```

# Check the Gitlab runner config from the Gitlab website

Go to the Gitlab web site hosted in my Ubuntu docker container. Then go to the repo where I got the runner registration token previously. Than go to `Settings-> CI / CD Settings -> Runner Settings`, check your runner setting here, especially the tag list which is not listed from the [runner server local config](#check-the-gitlab-runner-config-from-the-runner-server).

![](https://github.com/copdips/copdips.github.io/raw/master/_image/blog/2018-09-20-install-gitlab-runner-on-windows-by-powershell-psremoting/gitlab-runner-settings-from-web.PNG)