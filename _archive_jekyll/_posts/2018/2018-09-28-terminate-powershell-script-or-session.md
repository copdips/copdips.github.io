---
title: Terminate Powershell script or session
excerpt: "Some ways to terminate the Powershell script or session."
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

> I always asked myself how to terminate a Powershell script or session, each time I needed to do some tests by myself and also searched on Google. But I could never remember it. So I would like to take this post to note it down, the next time I need to terminate, just need to come back to here.

# Terminate the current Powershell script

## Way 1 - Exit

### Exit without exit code

```powershell
5.1> Get-Content .\test.ps1
function foo {
    Write-Output beginFunction
    1..3 | % {
        Write-Output $_
        exit
    }
    Write-Output endFunction
}

Write-Output beginScript
foo
Write-Output endScript

5.1> .\test.ps1
beginScript
beginFunction
1

5.1> Write-Host "Last execution status: $?" ; Write-Host "Last exit code: $LASTEXITCODE"
Last execution status: True
Last exit code: 0

5.1>
```

### Exit with code 0

```powershell
5.1> Get-Content .\test.ps1
function foo {
    Write-Output beginFunction
    1..3 | % {
        Write-Output $_
        exit 0
    }
    Write-Output endFunction
}

Write-Output beginScript
foo
Write-Output endScript

5.1> .\test.ps1
beginScript
beginFunction
1

5.1> Write-Host "Last execution status: $?" ; Write-Host "Last exit code: $LASTEXITCODE"
Last execution status: True
Last exit code: 0

5.1>
```

### Exit with code 1

```powershell
5.1> Get-Content .\test.ps1
function foo {
    Write-Output beginFunction
    1..3 | % {
        Write-Output $_
        exit 1
    }
    Write-Output endFunction
}

Write-Output beginScript
foo
Write-Output endScript

5.1> .\test.ps1
beginScript
beginFunction
1

5.1> Write-Host "Last execution status: $?" ; Write-Host "Last exit code: $LASTEXITCODE"
Last execution status: False
Last exit code: 0

5.1>
```

## Way 2 - Break

### Break with an UnknownLabel terminates the script directly

```powershell
5.1> Get-Content .\test.ps1
function foo {
    Write-Output beginFunction
    1..3 | % {
        Write-Output $_
        break foobar
    }
    Write-Output endFunction
}

Write-Output beginScript
foo
Write-Output endScript

5.1> .\test.ps1
beginScript
beginFunction
1

5.1> Write-Host "Last execution status: $?" ; Write-Host "Last exit code: $LASTEXITCODE"
Last execution status: True
Last exit code: 0

5.1>
```

### But it terminates also the caller script

```powershell
5.1> Get-Content .\test.ps1
function foo {
    Write-Output beginFunction
    1..3 | % {
        Write-Output $_
        break foobar
    }
    Write-Output endFunction
}

Write-Output beginScript
foo
Write-Output endScript

5.1> Get-Content .\call-test.ps1
Write-Output 'Call test.ps1'
./test.ps1
Write-Output 'End call test.ps'
Write-Output "call-test.ps1: Last execution status: $?"
Write-Output "call-test.ps1: Last exit code: $LASTEXITCODE"

5.1> .\call-test.ps1
Call test.ps1
beginScript
beginFunction
1

5.1>
```

Never use `break UnknownLabel` to terminate the script. Break does't raise error, the caller script cannot catch its output.
{: .notice--warning}


# Terminate the current Powershell session

## Way 1 - System.Environment.Exit

<https://docs.microsoft.com/en-us/dotnet/api/system.environment.exit>

### Environment.Exit with code 0 and started by powershell.exe

```powershell
5.1> Get-Content .\test.ps1
function foo {
    Write-Output beginFunction
    1..3 | % {
        Write-Output $_
        [Environment]::Exit(0)
    }
    Write-Output endFunction
}

Write-Output beginScript
foo
Write-Output endScript

5.1> powershell -noprofile .\test.ps1
beginScript
beginFunction
1

5.1> Write-Host "Last execution status: $?" ; Write-Host "Last exit code: $LASTEXITCODE"
Last execution status: True
Last exit code: 0

5.1>
```

### Environment.Exit with code 1 and started by powershell.exe

```powershell
5.1> Get-Content .\test.ps1
function foo {
    Write-Output beginFunction
    1..3 | % {
        Write-Output $_
        [Environment]::Exit(1)
    }
    Write-Output endFunction
}

Write-Output beginScript
foo
Write-Output endScript

5.1> powershell -noprofile .\test.ps1
beginScript
beginFunction
1

5.1> Write-Host "Last execution status: $?" ; Write-Host "Last exit code: $LASTEXITCODE"
Last execution status: False
Last exit code: 0

5.1>
```

### Environment.Exit with code 0 and started by Start-Process

```powershell
5.1> Get-Content .\test.ps1
function foo {
    Write-Output beginFunction
    1..3 | % {
        Write-Output $_
        [Environment]::Exit(0)
    }
    Write-Output endFunction
}

Write-Output beginScript
foo
Write-Output endScript

5.1> Start-Process .\test.ps1


5.1> Write-Host "Last execution status: $?" ; Write-Host "Last exit code: $LASTEXITCODE"
Last execution status: True
Last exit code: 0

5.1>
```

### Environment.Exit with code 1 and started by Start-Process

```powershell
5.1> Get-Content .\test.ps1
function foo {
    Write-Output beginFunction
    1..3 | % {
        Write-Output $_
        [Environment]::Exit(1)
    }
    Write-Output endFunction
}

Write-Output beginScript
foo
Write-Output endScript

5.1> Start-Process .\test.ps1


5.1> Write-Host "Last execution status: $?" ; Write-Host "Last exit code: $LASTEXITCODE"
Last execution status: True
Last exit code: 0

5.1>
```

## Way 2 - Stop-Process

Powershell has an [automatic variable called $PID](https://docs.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_automatic_variables?view=powershell-6#pid) which refers to the process ID that is hosting the current PowerShell session.

### Stop-Process started by powershell.exe

```powershell
5.1> Get-Content .\test.ps1
function foo {
    Write-Output beginFunction
    1..3 | % {
        Write-Output $_
        Write-Output "Kill process $PID"
        Stop-Process $PID
    }
    Write-Output endFunction
}

Write-Output beginScript
foo
Write-Output endScript

5.1> powershell -NoProfile .\test.ps1
beginScript
beginFunction
1
Kill process 12348

5.1> Write-Host "Last execution status: $?" ; Write-Host "Last exit code: $LASTEXITCODE"
Last execution status: False
Last exit code: 0

5.1>
```

### Stop-Process started by Start-Process

```powershell
5.1> Get-Content .\test.ps1
function foo {
    Write-Output beginFunction
    1..3 | % {
        Write-Output $_
        Write-Output "Kill process $PID"
        Stop-Process $PID
    }
    Write-Output endFunction
}

Write-Output beginScript
foo
Write-Output endScript

5.1> Start-Process .\test.ps1


5.1> Write-Host "Last execution status: $?" ; Write-Host "Last exit code: $LASTEXITCODE"
Last execution status: True
Last exit code: 0

5.1>
```

# Conclusion

| Goal              | Terminate Method                                 | Last execution status: $? | Last exit code: $LASTEXITCODE | Comment          |
|-------------------|--------------------------------------------------|---------------------------|-------------------------------|------------------|
| Terminate Script  | exit                                             | True                      | 0                             |                  |
| Terminate Script  | exit 0                                           | True                      | 0                             |                  |
| Terminate Script  | exit 1                                           | False                     | 0                             |                  |
| Terminate Script  | break UnknownLabel                               | True                      | 0                             | **Never use it** |
| Terminate Process | [Environment]::Exit(0) started by powershell.exe | True                      | 0                             |                  |
| Terminate Process | [Environment]::Exit(1) started by powershell.exe | False                     | 0                             |                  |
| Terminate Process | [Environment]::Exit(0) started by Start-Process  | True                      | 0                             |                  |
| Terminate Process | [Environment]::Exit(1) started by Start-Process  | True                      | 0                             |                  |
| Terminate Process | Stop-Process started by powershell.exe           | False                     | 0                             |                  |
| Terminate Process | Stop-Process started by Start-Process            | True                      | 0                             |                  |
