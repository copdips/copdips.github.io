---
title: "Setting Up Powershell Gallery And Nuget Gallery"
excerpt: "As like [pypi](https://pypi.org/) for Python, [npm](https://www.npmjs.com/) for Node.js, we also have [Powershell Gallery](https://www.powershellgallery.com/) for Powershell to add some extra Powershell modules, and [Nuget Gallery](https://www.nuget.org/) for Powershell to add some extra executables."
tags:
  - nuget
  - powershell
  - powershell-gallery
  - package-management
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

> As like [pypi](https://pypi.org/) for Python, [npm](https://www.npmjs.com/) for Node.js, we also have [Powershell Gallery](https://www.powershellgallery.com/) for Powershell to add some extra Powershell modules, and [Nuget Gallery](https://www.nuget.org/) for Powershell to add some extra executables.

# Configure proxy in Powershell

Both Powershell Gallery et Nuget Gallery can be installed locally that we don't need external Internet access to retrieve the packages from them, but setting up an internal Powershell Gallery or an internal Nuget Gallery is [out of scope of this post](#set-up-internal-powershell-gallery-or-nuget-gallery).



To use the [public Powershell Gallery](https://www.powershellgallery.com/) or the [public Nuget Gallery](https://www.nuget.org/), you must have Internet access. If you're at the office, your computer is probably behind a company proxy to access Internet. If your Internet Explorer's proxy setting has already been configured, you can use the below command to tell Powershell to reuse the same proxy setting :

```powershell
(New-Object -TypeName System.Net.WebClient).Proxy.Credentials = [System.Net.CredentialCache]::DefaultNetworkCredentials

# Or batch version by using netsh (not tested) :
netsh winhttp show proxy
netsh winhttp import proxy source=ie
```

I suggest to add the above command in your powershell profile, otherwise you should type it each time you open a new Powershell session.

Your Windows Powershell profile can be found at four locations:

```powershell
$PROFILE | gm | ? membertype -eq noteproperty
```

The output of the above command :

```powershell
# For Windows Powershell :

   TypeName:System.String

Name                   MemberType   Definition
----                   ----------   ----------
AllUsersAllHosts       NoteProperty string AllUsersAllHosts=C:\Windows\System32\WindowsPowerShell\v1.0\profile.ps1
AllUsersCurrentHost    NoteProperty string AllUsersCurrentHost=C:\Windows\System32\WindowsPowerShell\v1.0\Microsoft.PowerShell_profile.ps1
CurrentUserAllHosts    NoteProperty string CurrentUserAllHosts=d:\xiang\Documents\WindowsPowerShell\profile.ps1
CurrentUserCurrentHost NoteProperty string CurrentUserCurrentHost=d:\xiang\Documents\WindowsPowerShell\Microsoft.PowerShell_profile.ps1
```

The two CurrentUser profile locations might differ on different computers, all depends on your `MyDocuments` location ( `[Environment]::GetFolderPath("MyDocuments")` ), and if you're using Powershell Core, all the four locations are different than the ones in Windows Powershell.
I use usually `CurrentUserAllHost` because the change will only affect my profile, and even if I'm not the admin of the computer, I can still get it work. The profile location can be found at :

```powershell
$PROFILE | % CurrentUserAllHosts
```

Add proxy setting in the end of your `CurrentUserAllHost` powershell profile :

```powershell
Add-Content ($PROFILE | % CurrentUserAllHost) "`n(New-Object -TypeName System.Net.WebClient).Proxy.Credentials = [System.Net.CredentialCache]::DefaultNetworkCredentials`n"
```

As a best practice, it would be better to add the above line at the top of your profile.

# Set up Powershell Gallery for Powershell

This is pretty easy for Powershell v5+ :

```powershell
# I add the switch Trusted because I trust all the modules and scripts from Powershell Gallery
Register-PSRepository -Default -InstallationPolicy Trusted
```

Test :
```powershell
> Get-PSRepository

Name                      InstallationPolicy   SourceLocation
----                      ------------------   --------------
PSGallery                 Trusted              https://www.powershellgallery.com/api/v2/
```

# Use Powershell Gallery

```powershell
# Search a module which name is like poshrs*
> find-module poshrs*

Name                           Version          Source           Summary
----                           -------          ------           -------
PoshRSJob                      1.7.4.4          PSGallery        Provides an alternative to PSjobs with greater performance and less overhead to run commands in ...

# Install the module without admin privileges
> find-module poshrs* | install-module -Scope CurrentUser
```

# Set up Nuget for Powershell

Nuget is well-known among the Windows developers.

```powershell
# I also add the Trusted switch
Register-PackageSource -Name Nuget -Location "http://www.nuget.org/api/v2" –ProviderName Nuget -Trusted
```

Test :

```powershell
> Get-PackageSource

Name                             ProviderName     IsTrusted  Location
----                             ------------     ---------  --------
Nuget                            NuGet            True       http://www.nuget.org/api/v2
PSGallery                        PowerShellGet    True       https://www.powershellgallery.com/api/v2/
```

# Use Nuget

```powershell
# install the latest version of GitForWindows without admin privileges
find-package gitforwindows | install-package -Scope CurrentUser

# install the latest version of Python without admin privileges
find-package python | install-package -Scope CurrentUser

# find the path of Python installation
get-package python | % source

# You need to add manually the package executable path to your USER PATH.
# To get the current USER Path
[System.Environment]::GetEnvironmentVariable('Path', 'User')

# To set the current USER Path
[System.Environment]::SetEnvironmentVariable('Path', $newPathInSingleStringSeparatedByColumn, 'User')
```

> In fact, you can find out from the output of `Get-PackageSource` that `Find-Package` can search the packages and modules in both Nuget Gallery and Powershell Gallery.

# Set up internal Powershell Gallery or Nuget Gallery

Some resources on setting up internal Powershell Gallery and Nuget Gallery:

1. [Setting up an Internal PowerShellGet Repository](https://blogs.msdn.microsoft.com/powershell/2014/05/20/setting-up-an-internal-powershellget-repository/)
1. [Powershell: Your first internal PSScript repository](https://kevinmarquette.github.io/2017-05-30-Powershell-your-first-PSScript-repository/)
1. [PowerShell/PSPrivateGallery](https://github.com/PowerShell/PSPrivateGallery)
1. [Overview of Hosting Your Own NuGet Feeds](https://docs.microsoft.com/en-us/nuget/hosting-packages/overview)
1. [NuGet/NuGetGallery](https://github.com/NuGet/NuGetGallery/wiki/Hosting-the-NuGet-Gallery-Locally-in-IIS)

