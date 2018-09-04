---
title: "Use Powershell to manage Windows Scheduled Task"
excerpt: "Create, get, migrate Windows scheduled task by a pure Powershell way."
tags:
  - scheduled-task
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

> A recent project made me to use the Windows scheduled task to execute periodically some python scripts. After the project, I find using Powershell to manage the Windows scheduled task is not so straightforward, that's why I opened this post to share my experience on some common usage, and hope this can save your time if you also need to use it.

# Scheduled task Powershell cmdlets

From the official Windows scheduled task powershell [doc](https://docs.microsoft.com/en-us/powershell/module/scheduledtasks/), we can find the ScheduledTasks module provides many cmdlets:

- Disable-ScheduledTask
- Enable-ScheduledTask
- Export-ScheduledTask
- Get-ScheduledTask
- Get-ScheduledTaskInfo
- New-ScheduledTask
- New-ScheduledTaskAction
- New-ScheduledTaskPrincipal
- New-ScheduledTaskSettingsSet
- New-ScheduledTaskTrigger
- Register-ScheduledTask
- Set-ScheduledTask
- Start-ScheduledTask
- Stop-ScheduledTask
- Unregister-ScheduledTask

Guess what is the cmdlet to create the task? New-ScheduledTask? Wrong, it's Register-ScheduledTask.

# Create scheduled task folder

By default, all the scheduled tasks are created under the root "\\" folder, if you have many tasks here, from the taskschd.msc GUI, it might take time to display all of them. So I suggest to [create your tasks to some custom task folders](https://blogs.technet.microsoft.com/heyscriptingguy/2015/01/15/use-powershell-to-create-scheduled-tasks-folders/). And withthat, you can easily filter on (Get-ScheduledTask -TaskPath) only your interested tasks especially if some other tasks have the similar name as the yours.

```powershell
# Create a task folder named 'project1' under the root path \
$taskFolderName = 'project1'
$taskPath = "\$taskFolderName"
$scheduleObject = New-Object -ComObject schedule.service
$scheduleObject.connect()
$taskRootFolder = $scheduleObject.GetFolder("\")
$taskRootFolder.CreateFolder($taskPath)
```

# Disable disabledomaincreds

In some corporate networks, the Windows or security admins might enable the security policy : `Network access: Do not allow storage of passwords and credentials for network authentication`. If this policy is enabled, we will not be able to use Register-ScheduledTask with the `-User` param. Its registry setting can be found from the [Microsoft official excel file for Group Policy Settings Reference for Windows and Windows Server](https://www.microsoft.com/en-us/download/confirmation.aspx?id=25250), There's also a online variant here: (http://gpsearch.azurewebsites.net/).

```powershell
# Set the key 'disabledomaincreds' to value 0 to disable it.
$regPath = 'HKLM:\SYSTEM\CurrentControlSet\Control\Lsa'
$regName = 'disabledomaincreds'
$regValue = 0
Set-ItemProperty -Path $regPath -Name $regName -Value $regValue
```

# Create scheduled task

Suppose we need to :
- Run the script 'd:/scripts/job1.ps1 arg1' every 30 minutes from 2018-09-05T18:00:00.
- The script should be stopped if it runs more then 15 minutes.
- The script should be executed under the account 'user1' with the password 'password1'.
- The task should be in the 'project1' task folder.
- The task name is 'task1'.

```powershell
$taskName = 'task1'
$taskFolderName = 'project1'
$taskPath = "\$taskFolderName"
$taskUser = 'user1'
$taskPassword = 'password1' # $taskPassword is given by un-secure clear string, it's only for demo. In addition, if you use clear string, please careful with the single-quoted because some passwords might contain the char $ which can be evaluated if you use the double-quoted string. https://docs.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_quoting_rules?view=powershell-6
$taskAction = New-ScheduledTaskAction -Execute powershell.exe -Argument 'd:/scripts/job1.ps1 arg1'

# some online docs give also the param -RepetitionDuration ([TimeSpan]::MaxValue),
# but this doesn't work for windows server 2016, it's a bug, this is also why I wrote this post.
# On windows server 2016, there's another bug is that we must use -Once -RepetitionInterval to run a repeated action,
# not -daily with 'Repeat task every 30 minutes' option in the advanced settings which is an option available only from taskschd.msc GUI,
# otherwise, the scheduled task will also be automatically triggered by the system reboot.
$taskTrigger = New-ScheduledTaskTrigger -Once -RepetitionInterval (New-TimeSpan -Minutes 30) -At (get-date '2018-09-05T18:00:00')

# the task is scheduled for every 30 minutes,
# but if it is running more than 15 minutes,
# I consider the task is hanging or failed, and I want to stop it.
$taskSetting= New-ScheduledTaskSettingsSet -ExecutionTimeLimit (New-TimeSpan -Minutes 15)


# finally create the task
$registerScheduledTaskParam = @{
  TaskName = $taskName
  TaskPath = $taskPath
  User = $taskUser
  Password = $taskPassword
  Action = $taskAction
  Trigger = $taskTrigger
  Settings = $taskSetting
}
Register-ScheduledTask @registerScheduledTaskParam

TaskPath                                       TaskName                          State
--------                                       --------                          -----
\project1\                                     task1                             Ready
```

# Get scheduled task info

```powershell
$taskFolderName = 'project1'
# when using Register-SchduledTask, one of its params $taskPath = "\$taskFolderName"
# doesn't contain the the ending "\", but for Get-ScheduledTask,
# we must add it. This is a bug on Windows Server 2016 at least.
$taskPath = "\$taskFolderName\"
Get-ScheduledTask $taskName | fl *

State                 : Ready
Actions               : {MSFT_TaskExecAction}
Author                :
Date                  :
Description           :
Documentation         :
Principal             : MSFT_TaskPrincipal2
SecurityDescriptor    :
Settings              : MSFT_TaskSettings3
Source                :
TaskName              : task1
TaskPath              : \project1\
Triggers              : {MSFT_TaskTimeTrigger}
URI                   : \project1\task1
Version               :
PSComputerName        :
CimClass              : Root/Microsoft/Windows/TaskScheduler:MSFT_ScheduledTask
CimInstanceProperties : {Actions, Author, Date, Description...}
CimSystemProperties   : Microsoft.Management.Infrastructure.CimSystemProperties

# The result shown above is not straightforward for admin,
# we need to deep into many sub properties to get some scheduled task basic information.
# Hereunder some ways to archive that.

# Way 1: oneliner by using the custom properties
$taskPath = "\project1\" ; Get-ScheduledTask -TaskPath $taskPath | Select-Object `
TaskName, State, `
@{n='TaskEnabled'; e={$_.Settings.Enabled}}, `
@{n='TriggerEnabled'; e={$_.Triggers.Enabled}}, `
@{n='User'; e={$_.Principal.UserID}}, `
@{n='TriggerStartBoundary'; e={$_.Triggers.StartBoundary}}, `
@{n='TriggerInterval'; e={$_.Triggers.Repetition.Interval}}, `
@{n='ExecutionTimeLimit'; e={$_.Settings.ExecutionTimeLimit}},`
@{n='LastRunTime'; e={$_ |  Get-ScheduledTaskInfo | % LastRunTime}}, `
@{n='LastTaskResult'; e={$_ |  Get-ScheduledTaskInfo | % LastTaskResult}}, `
@{n='NextRunTime'; e={$_ |  Get-ScheduledTaskInfo | % NextRunTime}}, `
@{n='Action'; e={$_.Actions.Execute + ' ' + $_.Actions.Arguments}}

# Way 2: Export the task config to XML and view the XML content directly
$taskPath = "\project1\" ; Get-ScheduledTask -TaskPath $taskPath | % {Write-Host "`nTask: $($_.TaskName)" -BackgroundColor Red ;  Export-ScheduledTask $_ ; $_ | Get-ScheduledTaskInfo}
```

# Get scheduled task log

It seems that there's no cmdlet to get the task log from the *-ScheduledTask cmdlets list. Yes, you're right, the task log is saved directly to the standard windows event log. You can use Get-WinEvent (Get-EventLog is an old way) to get it.

```powershell
# if you're not admin on the server,
# you might get some error when running below Get-WinEvent command,
# you can set $ErrorActionPreference = "SilentlyContinue" to hide it.
> Get-WinEvent -ListLog * | ? logname -match task

LogMode   MaximumSizeInBytes RecordCount LogName
-------   ------------------ ----------- -------
Circular             1052672          32 Microsoft-Windows-BackgroundTaskInfrastructure/Operational
Circular             1052672           0 Microsoft-Windows-Mobile-Broadband-Experience-Parser-Task/Operational
Circular             1052672           0 Microsoft-Windows-Shell-Core/LogonTasksChannel
Circular             1052672         636 Microsoft-Windows-TaskScheduler/Maintenance
Circular            10485760             Microsoft-Windows-TaskScheduler/Operational

# No RecordCount for Microsoft-Windows-TaskScheduler/Operational
# because the log history is disabled by default, enable it by wevtutil.
> wevtutil set-log Microsoft-Windows-TaskScheduler/Operational /enabled:true
> wevtutil get-log Microsoft-Windows-TaskScheduler/Operational
> Get-WinEvent -ListLog * | ? logname -match task

LogMode   MaximumSizeInBytes RecordCount LogName
-------   ------------------ ----------- -------
Circular             1052672          32 Microsoft-Windows-BackgroundTaskInfrastructure/Operational
Circular             1052672get-           0 Microsoft-Windows-Mobile-Broadband-Experience-Parser-Task/Operational
Circular             1052672           0 Microsoft-Windows-Shell-Core/LogonTasksChannel
Circular             1052672         636 Microsoft-Windows-TaskScheduler/Maintenance
Circular            10485760          12 Microsoft-Windows-TaskScheduler/Operational

# All the logs of all the tasks are saved in the same place,
# and the event object doesn't have a task name property,
# this is why when we view the task history from the taskschd.msc GUI,
# it's too slow to display, not cool /_\.
# So if we want to see the logs of a single task, there's still something to do.
> Get-WinEvent -FilterHashtable @{logname="Microsoft-Windows-TaskScheduler/Operational"; StartTime=$(get-date).AddDays(-2)} | so -fir 1 | fl *


Message              : Task Scheduler launched "{F14F3BF1-DAA7-4286-93BF-1BB1EE3B2C0C}" instance of task "\project1\task1"  for user "user1" .
Id                   : 110
Version              : 0
Qualifiers           :
Level                : 4
Task                 : 110
Opcode               : 0
Keywords             : -9223372036854775808
RecordId             : 6
ProviderName         : Microsoft-Windows-TaskScheduler
ProviderId           : de7b24ea-73c8-4a09-985d-5bdadcfa9017
LogName              : microsoft-windows-taskscheduler/operational
ProcessId            : 1612
ThreadId             : 10152
MachineName          : DELL-ZX
UserId               : S-1-5-18
TimeCreated          : 2018-09-05 00:48:37
ActivityId           : f14f3bf1-daa7-4286-93bf-1bb1ee3b2c0c
RelatedActivityId    :
ContainerLog         : microsoft-windows-taskscheduler/operational
MatchedQueryIds      : {}
Bookmark             : System.Diagnostics.Eventing.Reader.EventBookmark
LevelDisplayName     : Information
OpcodeDisplayName    : Info
TaskDisplayName      : Task triggered by user
KeywordsDisplayNames : {}
Properties           : {System.Diagnostics.Eventing.Reader.EventProperty, System.Diagnostics.Eventing.Reader.EventProperty, System.Diagnostics.Eventing.Reader.EventProperty}

> Get-WinEvent -FilterHashtable @{logname="Microsoft-Windows-TaskScheduler/Operational"; StartTime=$(get-date).AddDays(-2)} | ? message -match "\\project1\\task1"
```