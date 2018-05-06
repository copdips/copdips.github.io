{% include toc title="Table of content" %}

# Why should use Powershell Gallery and Nuget Gallery

As like [pypi](https://pypi.org/) for Python, [npm](https://www.npmjs.com/) for Node.js, we also have [Powershell Gallery](https://www.powershellgallery.com/) for Powershell to add some extra Powershell modules, and [Nuget Gallery](https://www.nuget.org/) for Powershell to add some extra executables.

## Configure proxy in Powershell

If you're at office, your computer is probably behind a company proxy to access Internet. If your Internet Explorer's proxy has already been configured, you can use below command to tell Powershell to use the same proxy setting as Internet Explorer:

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
> The two CurrentUser profile locations might differ on different computers, all depends on your `Documents` location, and if you're using Powershell Core, all the four locations are different than the ones in Windows Powershell.

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
I often use `CurrentUserAllHost` which is at :

```powershell
$PROFILE | % CurrentUserAllHosts
```

Add proxy setting in the end of your `CurrentUserAllHost` powershell profile :

```powershell
Add-Content ($PROFILE | % CurrentUserAllHost) "`n(New-Object -TypeName System.Net.WebClient).Proxy.Credentials = [System.Net.CredentialCache]::DefaultNetworkCredentials"
```

> As a best practice, it would be better to add the above line on the top of your profile.

## Set up Powershell Gallery for Powershell

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

## Use Powershell Gallery

```powershell
# Search a module which name like poshrs*
> find-module poshrs*

Name                           Version          Source           Summary
----                           -------          ------           -------
PoshRSJob                      1.7.4.4          PSGallery        Provides an alternative to PSjobs with greater performance and less overhead to run commands in ...

# Install the module without admin privileges
> find-module poshrs* | install-module -Scope CurrentUser
```

## Set up Nuget for Powershell

> Nuget is well-known among the Windows developers.

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

## Use Nuget

```powershell
# install the latest version of GitForWindows without admin privileges
find-package gitforwindows | install-package -Scope CurrentUser

# install the latest version of Python without admin privileges
find-package python | install-package -Scope CurrentUser

# find the path of the installation for Python
get-package python | % source
```

> In fact, you can find out from the output of `Get-PackageSource` that `Find-Package` can search the packages and modules in both Nuget Gallery and Powershell Gallery
