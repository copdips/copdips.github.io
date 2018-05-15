---
title: "Powershell stop-parsing (`--%`)"
excerpt: "Use Powershell stop-parsing (`--%`) to treat the remaining characters in the line as a literal."
tags:
  - powershell
  - parsing
  - ssh
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

> A friend of mine told me about the Powershell stop-parsing (\-\-%) last year, he said the stop-parsing tells powershell to treat the remaining characters in the line as a literal, but I'd never known where to use it. Recently working on git ssh made it happened.

The use case is I needed to git push by using a ssh key instead of the https wincred. So at first I needed to generate a ssh key pair. I used the `ssh-keygen.exe` provided by [GitForWindows](https://copdips.com/2018/05/setting-up-powershell-gallery-and-nuget-gallery-for-powershell.html#use-nuget).

To generate a ssh key pair from Powershell :

```powershell
> ssh-keygen.exe -t rsa -b 4096 -C "your_email@example.com"

Eenerating public/private rsa key pair.
Enter file in which to save the key (/c/Users/xiang/.ssh/id_rsa):
nter passphrase (empty for no passphrase):
Enter same passphrase again:
Your identification has been saved in /c/Users/xiang/.ssh/id_rsa.
Your public key has been saved in /c/Users/xiang/.ssh/id_rsa.pub.
The key fingerprint is:
SHA256:msbOTbVaHD2W3BNBmhxHkpJ7FWhdLhzFWj8Q0IDAiU0 xiang.zhu@outlook.com
The key's randomart image is:
+---[RSA 4096]----+
|      =Eo .+*BO=o|
|     . + .o.+Xo+o|
|           ++.=oo|
|          .o.o.+.|
|        S o.* o .|
|     . o o + . . |
|      = . +      |
|     + o o       |
|      o o        |
+----[SHA256]-----+
```

Press twice enter will create the key pair (id_rsa and id_rsa.public) without passphrase in the default Windows SSH keys' location `Join-Path $env:HOMEDRIVE $env:HOMEPATH | Join-Path -ChildPath .ssh` which is at `C:\Users\xiang\.ssh` on my computer.

> It is highly recommended to secure your SSH key by a passphrase : `ssh-keygen -N 'yourPassphraseHere'`.

Everything works well till now, and the command ssh-keygen is easy to use. But the real use case is to generate the ssh key pair on a remote Windows server. I thought it should be easy too. Just install GitForWindows on the remote Windows server, add the Git paths to the user's env PATH (I'm not admin on the remote server), and run the same ssh-keygen command ? Imagination remains imagination, let's see the real world :

```powershell
[RemoteServer]: PS> ssh-keygen.exe -t rsa -b 4096 -C "your_email@example.com"
Generating public/private rsa key pair.
Enter file in which to save the key (/c/Users/Administrator/.ssh/id_rsa):
[RemoteServer]: PS>
[RemoteServer]: PS>Test-Path C:\Users\Administrator\.ssh
False
[RemoteServer]: PS>
```

Hmm... it seems that remote PsSession doesn't support ssh-keygen's interactive prompt dialog. It closed the prompt without giving me the chance to talk with ssh-keygen. Never mind, `ssh-keygen --help` shows me what is the one-line command without prompt :

```powershell
# param --help doesnt exist
> ssh-keygen --help
ssh-keygen: unknown option -- -
usage: ssh-keygen [-q] [-b bits] [-t dsa | ecdsa | ed25519 | rsa]
                  [-N new_passphrase] [-C comment] [-f output_keyfile]
       ssh-keygen -p [-P old_passphrase] [-N new_passphrase] [-f keyfile]
       ...
```

The first one from the above help file seems good, let's try it out :

```powershell
[RemoteServer]: PS> ssh-keygen -q -t rsa -b 4096 -N '' -C 'xiang.zhu@outlook.com' -f C:\Users\xiang\.ssh\id_rsa

Too many arguments.
usage: ssh-keygen [-q] [-b bits] [-t dsa | ecdsa | ed25519 | rsa]
                  [-N new_passphrase] [-C comment] [-f output_keyfile]
       ...
```

Still failed, but this time it threw `Too many arguments` error, very strange, all the arguments are valid as per ssh-keygen's help.

 Searched on Google, finally found that someone raised already [an issue](https://github.com/PowerShell/Win32-OpenSSH/issues/1017) on PowerShell/Win32-OpenSSH github repo. It is because Powershell thinks `-f` is a powershell native parameter for [`parsing`](https://docs.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_parsing?view=powershell-6).

For example, to parse a DateTime to a sortable string :

```powershell
> '{0:s}' -f (Get-Date)
2018-05-15T20:41:55
```

So I added the stop-parsing symbol `--%` just after ssh-keygen.exe, and my ssh keys are managed to be created :
```powershell
[RemoteServer]: PS> ssh-keygen.exe --% -q -t rsa -b 4096 -N '' -C 'xiang.zhu@outlook.com' -f C:\Users\administrator\.ssh\id_rsa
ssh-keygen.exe : Saving key "C:\\Users\\administrator\\.ssh\\id_rsa" failed: No such file or directory
    + CategoryInfo          : NotSpecified: (Saving key "C:\...le or directory:String) [], RemoteException
    + FullyQualifiedErrorId : NativeCommandError

# I need to create the folder .ssh in advance
[RemoteServer]: PS> md C:\Users\administrator\.ssh

    Directory: C:\Users\administrator

Mode                LastWriteTime         Length Name
----                -------------         ------ ----
d-----        5/15/2018   8:35 PM                .ssh

[RemoteServer]: PS> ssh-keygen.exe --% -q -t rsa -b 4096 -N '' -C 'xiang.zhu@outlook.com' -f C:\Users\administrator\.ssh\id_rsa
[RemoteServer]: PS> gci C:\Users\Administrator\.ssh

    Directory: C:\Users\Administrator\.ssh

Mode                LastWriteTime         Length Name
----                -------------         ------ ----
-a----        5/15/2018   8:36 PM           3243 id_rsa
-a----        5/15/2018   8:36 PM            747 id_rsa.pub

[RemoteServer]: PS>
```

Some references on stop-parsing (not many resources on Internet):

- https://docs.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_parsing?view=powershell-6
- https://ss64.com/ps/stop-parsing.html
- https://rkeithhill.wordpress.com/2012/01/02/powershell-v3-ctp2-provides-better-argument-passing-to-exes/
