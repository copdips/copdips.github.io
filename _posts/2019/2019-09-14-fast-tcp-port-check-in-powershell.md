---
last_modified_at: 2019-12-31 22:49:18
title: "A fast way to check TCP port in Powershell"
excerpt: "Test-NetConnection is too slow if the remote port is not opened due to its timeout setting. Use System.Net.Sockets.TcpClient instead."
tags:
  - powershell
  - network
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

The [Test-NetConnection](https://docs.microsoft.com/en-us/powershell/module/nettcpip/test-netconnection) cmdlet is great and verbose but too slow if the remote port to check is not opened. This is due to its timeout setting and cannot be modified. In this port, I will show you a custom function that leverages the power of  [System.Net.Sockets.TcpClient](https://docs.microsoft.com/dotnet/api/system.net.sockets.tcpclient) to accelerate the port test.

**Update 2019-12-31**: I didn't mention `Test-Connection` previously because although it has the parameter `-TimeoutSeconds`, its output only has `True` or `False`. What a pity. But things are going to be changed, as per this [github issue](https://github.com/PowerShell/PowerShell/issues/11440), [@jackdcasey](https://github.com/jackdcasey) is preparing a pull request to make Test-Connection's output verbose enough.
{: .notice--info}

## Test-NetConnection is slow if the port is not opened

If the port is opened, it's OK.

```powershell
# if the port is opened
6.2.2> Measure-Command {Test-NetConnection www.google.fr -Port 80} | % TotalSeconds
0,2015152
```

But if the port is not opened, it would be better to take a coffee to wait for the result.

```powershell
# if the port is not opened
6.2.2> Measure-Command {Test-NetConnection www.google.fr -Port 123} | % TotalSeconds
WARNING: TCP connect to (2a00:1450:4007:805::2003 : 123) failed
WARNING: TCP connect to (172.217.18.195 : 123) failed
42,5026257
```

For most of the cases, we only need to test a TCP port in a fast network (often LAN), waiting for 42 seconds is ridiculous, but unfortunately, Test-NetConnection doesn't provide a parameter to decrease the timeout.

## System.Net.Sockets.TcpClient is fast

> *"Talk is cheap. Show me the code."*

### Test-Port demos

```powershell
# if the port is opened
6.2.2> Measure-Command {Test-Port www.google.fr 80} | % TotalSeconds
0,0648323

# if the port is not opened
6.2.2> Measure-Command {Test-Port www.google.fr 123} | % TotalSeconds
1,0072371

# it works with pipeline too
6.2.2> Measure-Command {"www.google.fr:80", "www.orange.fr:123", "www.free.fr" | Test-Port} | % TotalSeconds
2,0201628

# the output of the Test-Port, the default port to check is TCP 5985
6.2.2> "www.google.fr:80", "www.orange.fr:123", "www.free.fr" | Test-Port | ft -a

RemoteHostname RemotePort PortOpened TimeoutInMillisecond SourceHostname OriginalComputerName
-------------- ---------- ---------- -------------------- -------------- --------------------
www.google.fr  80               True                 1000 DELL-ZX        www.google.fr:80
www.orange.fr  123             False                 1000 DELL-ZX        www.orange.fr:123
www.free.fr    5985            False                 1000 DELL-ZX        www.free.fr
```

### Test-Port source code

The code is still in POC, there're still many parts to improve. For example, validating the given $ComputerName by resolving its IP, and error handling, etc.

```powershell
function Test-Port {
    [CmdletBinding()]
    param (
        [Parameter(ValueFromPipeline = $true, HelpMessage = 'Could be suffixed by :Port')]
        [String[]]$ComputerName,

        [Parameter(HelpMessage = 'Will be ignored if the port is given in the param ComputerName')]
        [Int]$Port = 5985,

        [Parameter(HelpMessage = 'Timeout in millisecond. Increase the value if you want to test Internet resources.')]
        [Int]$Timeout = 1000
    )

    begin {
        $result = [System.Collections.ArrayList]::new()
    }

    process {
        foreach ($originalComputerName in $ComputerName) {
            $remoteInfo = $originalComputerName.Split(":")
            if ($remoteInfo.count -eq 1) {
                # In case $ComputerName in the form of 'host'
                $remoteHostname = $originalComputerName
                $remotePort = $Port
            } elseif ($remoteInfo.count -eq 2) {
                # In case $ComputerName in the form of 'host:port',
                # we often get host and port to check in this form.
                $remoteHostname = $remoteInfo[0]
                $remotePort = $remoteInfo[1]
            } else {
                $msg = "Got unknown format for the parameter ComputerName: " `
                    + "[$originalComputerName]. " `
                    + "The allowed formats is [hostname] or [hostname:port]."
                Write-Error $msg
                return
            }

            $tcpClient = New-Object System.Net.Sockets.TcpClient
            $portOpened = $tcpClient.ConnectAsync($remoteHostname, $remotePort).Wait($Timeout)

            $null = $result.Add([PSCustomObject]@{
                RemoteHostname       = $remoteHostname
                RemotePort           = $remotePort
                PortOpened           = $portOpened
                TimeoutInMillisecond = $Timeout
                SourceHostname       = $env:COMPUTERNAME
                OriginalComputerName = $originalComputerName
                })
        }
    }

    end {
        return $result
    }
}
```

### Test-Port in parallel

Although the timeout in Test-Port is 1000 milliseconds, if we have 100 hosts to check and if all the ports are not opened, Test-Port will be slow too, because it runs the check in serial.

I don't prefer to implement the parallel inside Test-Port, as we have already some pure powershell parallel solutions by using the [RunspacePool](https://docs.microsoft.com/en-us/dotnet/api/system.management.automation.runspaces.runspacepool) ([PoshRSJob](https://github.com/proxb/PoshRSJob), [Invoke-Parallel](https://github.com/RamblingCookieMonster/PowerShell/blob/master/Invoke-Parallel.ps1), etc.). And Microsoft is releasing its home-born parallel mechanism `ForEach-Object -Parallel` for Powershell 7.
