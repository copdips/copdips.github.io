<#
.SYNOPSIS
  Bluetooth headset microphone (HFP) endpoints: diagnose -> confirm -> rebuild -> verify.

.DESCRIPTION
  Windows 10/11. No headset brand or UI language assumption: the A2DP and HFP
  device nodes are created by the Windows Bluetooth stack, not by the headset
  vendor.
  - Only connected headsets are inspected: the Bluetooth link must be up, and
    paired but disconnected devices are skipped.
  - Pairing: match the playback endpoint and the recording endpoint of the same
    headset by Bluetooth MAC address.
  - Verdict: either endpoint not ready means the headset is abnormal, which is
    the "connected but no sound / no microphone" case.
  - Locate: walk up the parent chain of the capture endpoint to find the HFP
    call device (standard UUID 0000111E).
  - Rebuild: restart the headset's HFP device first; if that is not enough,
    restart its parent audio device (Intel / Microsoft / any other stack).

.PARAMETER Device
  Only handle headsets whose name contains this keyword. Empty = every
  connected headset whose audio path is abnormal.

.PARAMETER Force
  Skip the interactive confirmation.

.PARAMETER DiagnoseOnly
  Diagnose only, change nothing.

.PARAMETER All
  Ignore the connected test and include every paired Bluetooth headset.

.EXAMPLE
  .\fix-bluetooth-headset-audio.ps1 -DiagnoseOnly
  .\fix-bluetooth-headset-audio.ps1
  .\fix-bluetooth-headset-audio.ps1 -Device FreeBuds
  .\fix-bluetooth-headset-audio.ps1 -All -DiagnoseOnly
#>
param(
    [string]$Device = '',
    [switch]$Force,
    [switch]$DiagnoseOnly,
    [switch]$All
)

$Root       = 'HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\MMDevices\Audio'
$P_NAME     = '{026e516e-b814-414b-83cd-856d6fef4822},2'
$P_DESC     = '{a45c254e-df1c-4efd-8020-67d146a850e0},2'
$P_PARENT   = '{b3f8fa53-0004-438e-9003-51a46e139bfc},39'
$P_PARENTID = '{b3f8fa53-0004-438e-9003-51a46e139bfc},2'
$P_AUDIO    = '{b3f8fa53-0004-438e-9003-51a46e139bfc},6'
$P_WAO      = '{b3f8fa53-0004-438e-9003-51a46e139bfc},26'
$HFP_UUID   = '0000111E-0000-1000-8000-00805F9B34FB'

function Get-StateText([int]$s) {
    switch ($s) {
        1       { 'ACTIVE     ready' }
        2       { 'DISABLED   disabled' }
        4       { 'NOTPRESENT not present' }
        8       { 'UNPLUGGED  not connected' }
        default { "UNKNOWN($s)" }
    }
}

function Resolve-EpName($pr) {
    $n = $null
    if ($pr.$P_NAME) { $n = [string]$pr.$P_NAME }
    elseif ($pr.$P_AUDIO -and ($pr.$P_AUDIO -notmatch 'Smart Sound|Bluetooth Audio|Audio Device|Audio Endpoint')) { $n = [string]$pr.$P_AUDIO }
    elseif ($pr.$P_WAO) { $n = [string]$pr.$P_WAO }
    elseif ($pr.$P_AUDIO) { $n = [string]$pr.$P_AUDIO }
    if ($n) { $n = ($n -replace '\s+Hands-?Free(\s+AG)?$', '').Trim() }
    return $n
}

function Get-EndpointList([string]$Kind) {
    $path = Join-Path $Root $Kind
    if (-not (Test-Path -LiteralPath $path)) { return @() }
    Get-ChildItem -LiteralPath $path -ErrorAction SilentlyContinue | ForEach-Object {
        $st = (Get-ItemProperty -LiteralPath $_.PSPath -ErrorAction SilentlyContinue).DeviceState
        $pr = Get-ItemProperty -LiteralPath "$($_.PSPath)\Properties" -ErrorAction SilentlyContinue
        $parents = @($pr.$P_PARENT)
        $parentId = "$($pr.$P_PARENTID)"
        $isBt = $false
        foreach ($x in $parents) { if ("$x" -match 'BTHENUM|BTHLEENUM') { $isBt = $true } }
        if ($parentId -match 'BTHENUM|BTHLEENUM') { $isBt = $true }
        $chainRaw = $null
        $hfpRaw = $parents | Where-Object { "$_" -match $HFP_UUID } | Select-Object -First 1
        if ($hfpRaw) { $chainRaw = "$hfpRaw" }
        elseif ($parents.Count -gt 0 -and "$($parents[0])" -match 'BTHENUM') { $chainRaw = "$($parents[0])" }
        elseif ($parentId -match 'BTHENUM') { $chainRaw = $parentId }
        $mac = $null
        foreach ($src in @($chainRaw, $parentId)) {
            $s = "$src"
            if (-not $s) { continue }
            # Bluetooth device instances look like ...&EC1234567890_C00000000
            if ($s -match '([0-9A-Fa-f]{12})_C[0-9A-Fa-f]{8}') { $mac = $matches[1].ToUpper(); break }
            if ($s -match 'DEV_([0-9A-Fa-f]{12})')            { $mac = $matches[1].ToUpper(); break }
        }
        [pscustomobject]@{
            Kind      = $Kind
            Id        = $_.PSChildName
            State     = [int]$st
            Name      = Resolve-EpName $pr
            Desc      = $pr.$P_DESC
            IsBt      = $isBt
            Mac       = $mac
            HfpId     = (("$chainRaw") -replace '^\{[^}]+\}\.', '').Trim()
            AudioDev  = $pr.$P_AUDIO
        }
    }
}

function Get-PairedList {
    $caps = @(Get-EndpointList 'Capture' | Where-Object { $_.IsBt })
    $rend = @(Get-EndpointList 'Render'  | Where-Object { $_.IsBt })
    foreach ($e in $caps) { if (-not $e.Mac) { $e.Mac = "N:$($e.Name)" } }
    foreach ($e in $rend) { if (-not $e.Mac) { $e.Mac = "N:$($e.Name)" } }
    $keys = @(@($caps | ForEach-Object { $_.Mac }) + @($rend | ForEach-Object { $_.Mac }) | Sort-Object -Unique)
    foreach ($k in $keys) {
        $c = $caps | Where-Object { $_.Mac -eq $k } | Sort-Object State | Select-Object -First 1
        $r = $rend | Where-Object { $_.Mac -eq $k } | Sort-Object State | Select-Object -First 1
        $nm = if ($c -and $c.Name) { $c.Name } elseif ($r) { $r.Name } else { $k }
        [pscustomobject]@{
            Key         = $k
            Name        = $nm
            # Same test as the Connected label in Settings - Bluetooth & devices:
            # any audio endpoint ACTIVE means connected. The DEV_ / A2DP / HFP
            # device nodes stay OK after pairing and cannot tell connected from
            # disconnected.
            Connected   = [bool](($All) -or ($r -and $r.State -eq 1) -or ($c -and $c.State -eq 1))
            RenderState = if ($r) { $r.State } else { 4 }
            CapState    = if ($c) { $c.State } else { $null }
            HfpId       = if ($c) { $c.HfpId } else { $null }
            AudioDev    = if ($c) { $c.AudioDev } else { $null }
        }
    }
}

function Show-Table([string]$Title) {
    Write-Host ''
    Write-Host "=== $Title ===" -ForegroundColor Cyan
    $list = @(Get-PairedList)
    if ($list.Count -eq 0) {
        Write-Host '  no Bluetooth audio endpoint found' -ForegroundColor Yellow
        return $list
    }
    $offCount = @($list | Where-Object { -not $_.Connected }).Count
    $shown = @($list | Where-Object { $_.Connected })
    if ($shown.Count -eq 0) {
        Write-Host '  no connected Bluetooth headset (paired but disconnected devices are skipped)' -ForegroundColor Yellow
        return $list
    }
    $colHead = if ($All) { 'Headset (all, disconnected included)' } else { 'Headset (connected)' }
    Write-Host ('  {0,-38} {1,-24} {2,-24} {3}' -f $colHead, 'Render endpoint', 'Capture endpoint', 'Verdict')
    Write-Host ('  ' + ('-' * 100)) -ForegroundColor DarkGray
    foreach ($e in $shown) {
        if ($e.RenderState -eq 1) { $rTxt = 'ACTIVE ok' }
        elseif ($e.RenderState -eq 8) { $rTxt = 'UNPLUGGED not ready' }
        else { $rTxt = (Get-StateText $e.RenderState) }

        if ($e.CapState -eq $null) {
            $capTxt = 'no capture endpoint'
            if ($e.RenderState -eq 1) { $verdict = 'abnormal: re-pair required'; $color = 'Red' }
            else { $verdict = 'abnormal: possibly LE Audio'; $color = 'Red' }
        } elseif ($e.CapState -eq 1) {
            $capTxt = 'ACTIVE available'
            if ($e.RenderState -eq 1) { $verdict = 'ok'; $color = 'Green' }
            else { $verdict = 'abnormal: render endpoint down'; $color = 'Yellow' }
        } else {
            $capTxt = (Get-StateText $e.CapState)
            $verdict = 'abnormal: call endpoint down'; $color = 'Yellow'
        }
        Write-Host ('  {0,-38} {1,-24} {2,-24} {3}' -f $e.Name, $rTxt, $capTxt, $verdict) -ForegroundColor $color
    }
    if ($offCount -gt 0) {
        Write-Host "  $offCount more paired but currently disconnected, skipped" -ForegroundColor DarkGray
    }
    return $list
}

function Reset-Pnp([string]$id, [string]$label) {
    try {
        Disable-PnpDevice -InstanceId $id -Confirm:$false -ErrorAction Stop
        Start-Sleep -Seconds 2
        Enable-PnpDevice -InstanceId $id -Confirm:$false -ErrorAction Stop
        Write-Host "  $label : OK" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "  $label : FAILED - $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

function Confirm-Step([string]$Prompt, [bool]$DefaultYes) {
    if ($Force) { Write-Host '(-Force: confirmation skipped)' -ForegroundColor Gray; return $true }
    $ans = $null
    try { $ans = Read-Host $Prompt } catch { return $false }
    if ("$ans".Trim() -eq '') { return $DefaultYes }
    return ("$ans" -match '^[Yy]')
}

# ---------------- 1) Diagnose ----------------
Write-Host 'Bluetooth headset microphone endpoints - diagnose / repair' -ForegroundColor Cyan
if ($Device) { Write-Host "Name filter: $Device" -ForegroundColor Gray }
$list = Show-Table 'Step 1: diagnose'

$online = @($list | Where-Object { $_.Connected })
$broken = @($online | Where-Object { ($_.CapState -ne 1) -or ($_.RenderState -ne 1) })
$nopair = @($online | Where-Object { $_.CapState -eq $null })
if ($Device) {
    $online = @($online | Where-Object { $_.Name -like "*$Device*" })
    $broken = @($broken | Where-Object { $_.Name -like "*$Device*" })
    $nopair = @($nopair | Where-Object { $_.Name -like "*$Device*" })
}

Write-Host ''
if ($All) {
    Write-Host ('  {0} headset(s) inspected (-All ignores the connection state); audio path ok: {1} / abnormal: {2}' -f $online.Count, ($online.Count - $broken.Count), $broken.Count) -ForegroundColor Gray
} else {
    Write-Host ('  connected headsets: {0}; audio path ok: {1} / abnormal: {2}' -f $online.Count, ($online.Count - $broken.Count), $broken.Count) -ForegroundColor Gray
}

if ($online.Count -eq 0) {
    if ($Device) { Write-Host "[verdict] no connected headset matches '$Device', nothing to do" -ForegroundColor Gray }
    else { Write-Host '[verdict] no connected Bluetooth headset, nothing to do (paired but disconnected devices are skipped)' -ForegroundColor Gray }
} elseif ($broken.Count -gt 0) {
    Write-Host '[verdict] a headset is connected but its sound or microphone endpoint is not ready -> rebuild' -ForegroundColor Yellow
} elseif ($nopair.Count -gt 0) {
    Write-Host '[verdict] a headset is connected but has no capture endpoint -> remove the pairing and pair again' -ForegroundColor Red
} else {
    Write-Host '[verdict] every connected headset has a healthy audio path' -ForegroundColor Green
}

if ($DiagnoseOnly) {
    Write-Host ''
    Write-Host '(-DiagnoseOnly: diagnosis only, nothing changed)' -ForegroundColor Gray
    return
}

# ---------------- 2) Confirm ----------------
if ($Force -and $broken.Count -eq 0) { $targets = $online }
elseif ($broken.Count -gt 0) { $targets = $broken }
else { $targets = @() }

if ($targets.Count -eq 0) {
    Write-Host ''
    Write-Host 'nothing to rebuild, done.' -ForegroundColor Green
    return
}

if ($targets.Count -eq 1) {
    $ok = Confirm-Step "Rebuild [$($targets[0].Name)] (about 20 s, audio drops briefly). Continue? (Y/N, default Y)" $true
    if (-not $ok) { Write-Host 'Cancelled, nothing changed.' -ForegroundColor Gray; return }
} else {
    Write-Host ''
    Write-Host 'Several connected headsets have a broken audio path:' -ForegroundColor Yellow
    $i = 0
    foreach ($t in $targets) {
        $i++
        Write-Host ("  [{0}] {1}   render:{2} / capture:{3}" -f $i, $t.Name, (Get-StateText $t.RenderState), $(if ($t.CapState -eq $null) { 'no capture endpoint' } else { Get-StateText $t.CapState })) -ForegroundColor Gray
    }
    Write-Host ''
    if ($Force) {
        Write-Host '(-Force: rebuild all)' -ForegroundColor Gray
    } else {
        $sel = $null
        try { $sel = Read-Host 'Enter numbers to fix only some (comma separated, e.g. 1,3), Enter = all, N = cancel' } catch { $sel = 'N' }
        if ("$sel".Trim() -eq '') { }
        elseif ("$sel".Trim() -match '^[Nn]') { Write-Host 'Cancelled, nothing changed.' -ForegroundColor Gray; return }
        else {
            $picked = @()
            foreach ($x in ("$sel".Trim() -split ',')) {
                $n = 0
                if ([int]::TryParse($x.Trim(), [ref]$n)) {
                    if ($n -ge 1 -and $n -le $targets.Count) { $picked += $targets[$n - 1] }
                }
            }
            if ($picked.Count -gt 0) { $targets = @($picked) } else { Write-Host 'Invalid selection, processing all.' -ForegroundColor Yellow }
        }
    }
}

# ---------------- 3) Elevation ----------------
$isAdmin = (New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host ''
    Write-Host 'Rebuild needs administrator rights, asking for elevation (click Yes in UAC)...' -ForegroundColor Yellow
    $argList = @('-NoProfile','-ExecutionPolicy','Bypass','-File',"`"$PSCommandPath`"",'-Force')
    if ($Device) { $argList += @('-Device', $Device) }
    try { Start-Process -FilePath 'powershell.exe' -Verb RunAs -ArgumentList $argList -ErrorAction Stop }
    catch { Write-Host ('Elevation failed: ' + $_.Exception.Message) -ForegroundColor Red }
    return
}

# ---------------- 4) Rebuild ----------------
Write-Host ''
Write-Host '=== Step 2: rebuild ===' -ForegroundColor Cyan

$hfpGroups = $targets | Where-Object { $_.HfpId } | Group-Object HfpId
foreach ($g in $hfpGroups) {
    $who = ($g.Group | Select-Object -First 1).Name
    Write-Host "  [HFP] $who" -ForegroundColor Gray
    [void](Reset-Pnp $g.Name '        restart the Bluetooth call device')
}
Start-Sleep -Seconds 10

$targetKeys = @($targets | ForEach-Object { $_.Key })
$still = @(Get-PairedList | Where-Object { ($targetKeys -contains $_.Key) -and (($_.CapState -ne 1) -or ($_.RenderState -ne 1)) })

if ($still.Count -gt 0) {
    $audioIds = @()
    foreach ($e in $targets) {
        $dev = $null
        if ($e.AudioDev) {
            $dev = Get-PnpDevice -Class MEDIA -ErrorAction SilentlyContinue | Where-Object { $_.FriendlyName -eq $e.AudioDev } | Select-Object -First 1
        }
        if (-not $dev) {
            $dev = Get-PnpDevice -Class MEDIA -ErrorAction SilentlyContinue | Where-Object { $_.FriendlyName -match 'Bluetooth.*Audio' } | Select-Object -First 1
        }
        if ($dev) { $audioIds += $dev.InstanceId }
    }
    $audioIds = @($audioIds | Select-Object -Unique)
    if ($audioIds.Count -gt 0) {
        Write-Host ''
        Write-Host '  endpoints still inactive, deep repair: restart the parent audio device' -ForegroundColor Yellow
        foreach ($id in $audioIds) { [void](Reset-Pnp $id '        restart the parent audio device') }
        Start-Sleep -Seconds 12
    }
}

# ---------------- 5) Verify ----------------
$list2 = Show-Table 'Step 3: verify after rebuild'
$online2 = @($list2 | Where-Object { $_.Connected })
if ($Device) { $online2 = @($online2 | Where-Object { $_.Name -like "*$Device*" }) }
$bad2 = @($online2 | Where-Object { ($_.CapState -ne 1) -or ($_.RenderState -ne 1) })

Write-Host ''
if ($bad2.Count -eq 0) {
    Write-Host '[result] success: every connected headset has both render and capture endpoints ready' -ForegroundColor Green
    Write-Host '       next: fully quit the browser/app -> reopen it -> pick the headset microphone in its settings' -ForegroundColor Gray
} else {
    Write-Host ('[result] still abnormal: {0} headset(s): {1}' -f $bad2.Count, (($bad2 | ForEach-Object { $_.Name }) -join ', ')) -ForegroundColor Red
    Write-Host '       1) is the headset also connected to a phone? Multipoint takes the call channel; disconnect the phone first' -ForegroundColor Gray
    Write-Host '       2) Settings -> Bluetooth & devices -> the headset -> Remove device, then pair again' -ForegroundColor Gray
    Write-Host '       3) reboot, then run this script again' -ForegroundColor Gray
}
Write-Host ''
Write-Host 'Press any key to close this window...' -ForegroundColor Gray
try { $null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown') } catch { }
