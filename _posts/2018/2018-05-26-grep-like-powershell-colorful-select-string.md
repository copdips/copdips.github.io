---
last_modified_at: 2019-12-31 22:24:25
title: "Select-ColorString : A Unix's grep-like Powershell Cmdlet Based On Select-String With Color"
excerpt: "Select-String with color, make Select-String of Powershell to highlight the search pattern like grep in Unix."
tags:
  - powershell
  - string
  - regex
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

# Update 2019-12-28 Powershell 7 Select-String default highlighting

Update 2019-12-28: It's very exciting to see that **since [Powershell 7](https://github.com/PowerShell/PowerShell/pull/8963), the Select-String has highlighting (internal name: emphasis) by default**. It uses similar way (index, length) to find and highlight the matches. The emphasis uses negative colors based on your PowerShell background and text colors. To [disable the emphasis](https://docs.microsoft.com/en-us/powershell/module/microsoft.powershell.utility/select-string?view=powershell-7), use the `-NoEmphasis` switch. **So I highly recommend everyone to switch to Powershell 7 ([RC is supported by Microsoft](https://devblogs.microsoft.com/powershell/announcing-the-powershell-7-0-release-candidate/))**, it has also many other new powerful features.

BTW, in Powershell 7, Select-String `-AllMatches` is set as $false by default. I think it would be nice to have an inverse switch -NoAllMatches just like -NoEmphasis, and let -AllMatches to be $true by default.

**Update 2019-12-31**: I just found [a workaround here](https://github.com/PowerShell/PowerShell/issues/11447#issuecomment-569854982), by specifying `$PSDefaultParameterValues['Select-String:AllMatches'] = $true` in the Profile.ps1. I don't know if you have the same feeling as the mine, this feature is killing, it will help me for many other things :)

Powershell 7 Select-String default highlighting demo:

![](https://github.com/copdips/copdips.github.io/raw/master/_image/blog/2018-05-26-grep-like-powershell-colorful-select-string/powershell7-default-highlighting.png)


The original post before the Emphasis has been introduced in Powershell 7:

> [Select-String](https://docs.microsoft.com/en-us/powershell/module/microsoft.powershell.utility/select-string?view=powershell-6) in Powershell is a very powerful cmdlet to search a string or a pattern in input or files. It's very much like the famous command-line [grep](https://www.gnu.org/savannah-checkouts/gnu/grep/manual/grep.html) in Unix. But from my personal point of view, it's a little bit pity that Select-String doesn't highlight the matching patterns, so I will show you in this post how to make it possible (more or less) with Select-ColorString.

# Trace-Word

First of all, I must mention another powershell cmdlet [Trace-Word that I read on Prateek Singh's blog ridicurious.com](https://ridicurious.com/2018/03/14/highlight-words-in-powershell-console/).

Let me show you a screenshot of his Trace-Word to let you have an idea about what it can do:

![](https://github.com/copdips/copdips.github.io/raw/master/_image/blog/2018-05-26-grep-like-powershell-colorful-select-string/trace-word-screenshot.png)

Indeed, I was deeply impressed when I read his post, the color in Powershell string search results had been one of my most expected Powershell functionalities. Prateek Singh made it, thanks!

When I checked the code source of Trace-Word, I found the cmdlet logic is:

1. Firstly reads the input content line by line:

    ```powershell
    $content | ForEach-Object {...}
    ```

1. And then splits each line by white-space:
    ```powershell
    `$_.split() | Where-Object {
        -not [string]::IsNullOrWhiteSpace($_)
    } | ForEach-Object{...}
    ```

1. At last checks each splitted token against the searching words:
    ```powershell
    if($Token -like "*$Word*") {
        $before, $after = $Token -Split "$Word";
        ...
    }
    ```

1. Now we have `$before, $Word, $after`, so just need to `Write-Host $Word with color` to highlight the wanted $Word.

That's done, pretty cool and quite straightforward, nothing complicated, I like it so much.

I contacted Prateek to ask if I can use his idea to write something similar but with another method, he said YES and that comes my Select-ColorString, thanks Prateek again.

# Select-ColorString

Although Prateek Singh's Trace-Word is wonderful enough, I still want a bit more capabilities: the regex and the customizable color choice.

The first thing that I thought about the regex is `Select-String` which I'm using almost everyday with sls.

> Sometimes I was obliged to use the DOS command-line `findstr` due to that Select-String catches the input too earlier before it is been displayed a pure string on console screen. But findstr just finds what you want among what is shown on the screen. Although `$input | Out-String | Select-String` might solve the issue sometimes but it's not sexy to use 2 cmdlets to do one single task and sometimes this workaround even doesn't work.

Powershell Select-String returns some `MatchInfo` objects, from its MemberType, the `Matches` property is what I will use to color the matching patterns. The `Index` key gives the index of the first char of the matching pattern in a given line string, with that I know from where I could Write-Host with color.

```powershell
PS> 'a is good, b is good too' | sls good -AllMatches | gm


   TypeName:Microsoft.PowerShell.Commands.MatchInfo

Name         MemberType Definition
----         ---------- ----------
Equals       Method     bool Equals(System.Object obj)
GetHashCode  Method     int GetHashCode()
GetType      Method     type GetType()
RelativePath Method     string RelativePath(string directory)
ToString     Method     string ToString(), string ToString(string directory)
Context      Property   Microsoft.PowerShell.Commands.MatchInfoContext Context {get;set;}
Filename     Property   string Filename {get;}
IgnoreCase   Property   bool IgnoreCase {get;set;}
Line         Property   string Line {get;set;}
LineNumber   Property   int LineNumber {get;set;}
Matches      Property   System.Text.RegularExpressions.Match[] Matches {get;set;}
Path         Property   string Path {get;set;}
Pattern      Property   string Pattern {get;set;}


PS> 'a is good, b is good too' | sls good -AllMatches | % matches


Groups   : {0}
Success  : True
Name     : 0
Captures : {0}
Index    : 5
Length   : 4
Value    : good

Groups   : {0}
Success  : True
Name     : 0
Captures : {0}
Index    : 16
Length   : 4
Value    : good
```

So for my Select-ColorString, its logic is:

1. Split the input content in lines.

    ```powershell
    foreach ($line in $Content) {...}
    ```

1. Find all the matches in a given line.

    ```powershell
    $paramSelectString = @{
            Pattern       = $Pattern
            AllMatches    = $true
            CaseSensitive = $CaseSensitive
    }
    $matchList = $line | Select-String @paramSelectString
    ```

1. Write `without color` for the string before the match.

    ```powershell
    $index = 0
    foreach ($myMatch in $matchList.Matches) {
        $length = $myMatch.Index - $index
        Write-Host $line.Substring($index, $length) -NoNewline
        ...
    }
    ```

1. Right after, write the match `with color`.

    ```powershell
    foreach ($myMatch in $matchList.Matches) {
        ...
        $paramWriteHost = @{
            Object          = $line.Substring($myMatch.Index, $myMatch.Length)
            NoNewline       = $true
            ForegroundColor = $ForegroundColor
            BackgroundColor = $BackgroundColor
        }
        Write-Host @paramWriteHost
        ...
    }
    ```

1. Recalculate the index for the next match in the same line.

    ```powershell
    $index = 0
    foreach ($myMatch in $matchList.Matches) {
        ...
        $index = $myMatch.Index + $myMatch.Length
    }
    ```

1. When there's no more matches in the same line, just write `without color` all the rest.

    ```powershell
    $index = 0
    foreach ($myMatch in $matchList.Matches) {
        ...
        $index = $myMatch.Index + $myMatch.Length
    }
    Write-Host $line.Substring($index)
    ```

That's all, let's see a demo on Select-ColorString.

# Select-ColorString demo

The demo reads in real-time a test file and use Select-ColorString to highlight the keyword `warn`

![](https://github.com/copdips/copdips.github.io/raw/master/_image/blog/2018-05-26-grep-like-powershell-colorful-select-string/Select-ColorString-demo.gif)

# Select-String & -Split

In fact Powershell -split operator can also [take regex pattern](https://docs.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_split?view=powershell-6#options), and is as powerful as Select-String can do in terms of searching pattern. The reason that I chose Select-String instead of -split is because :

1. Select-String makes sense to 'port' Unix grep on Powershell, they're both for searching patterns and display them.

1. -split just splits the line by pattern, you still need to iterate on each splitted token and perform a -like or -match operation, which might take more time to display then Select-String does, as the later stores the matches already, it just needs to move the index and display the matches in color. But to be honest, I've never tested the execution duration difference between -split and Select-String, maybe -split is faster.

When I have time, I will write new function based on -split with regex to test its power.

# Trace-Word & Select-ColorString

Both of them are in my toolkit, and I use them in different scenarios.

- When I only need to search patterns based on words, I will `use Trace-Word`, as it can display different colors on different words. A typical use case is monitoring the log files which have some keywords like info, warning, error, etc. The output is much more beautiful.
- When I need to search patterns which include white space for example, I will `use Select-ColorString` as it takes regex and it doesn't split the line by white space in advance

BTW, I also set an alias on each of them:

```powershell
PS> Set-Alias tw Trace-Word
PS> Set-Alias scs Select-ColorString
```

# Update 2018-11-19 on new switch -MultiColorsForSimplePattern

I added a new switch [-MultiColorsForSimplePattern](https://github.com/copdips/PSScripts/commit/76361019f11602d607e7d95199a6f34e0a666c39) last week. This switch enables the Select-ColorString to display the different keywords in different colors just like Trace-Word. This is very useful at least for me to search some keywords like *error*, *warning* in the log files.

![](https://github.com/copdips/copdips.github.io/raw/master/_image/blog/2018-05-26-grep-like-powershell-colorful-select-string/new-switch-MultiColorsForSimplePattern.PNG)

There's a limitation on this new switch that the multicolors only works for simple pattern which contains only keywords separated by "\|" as shown in above screenshot. And it cannot be used with regex, this is because by using regex, the color selection will take much more time than the simple keywords. Maybe in the future I will add a new switch **-MultiColorsForRegexPatternWithFastCpu**.

# Select-ColorString source code

Finally, you can find the the source code of [Select-ColorString on Github](https://github.com/copdips/PSScripts/blob/master/Text/Select-ColorString.ps1).

> As I forced to use only a few of the original Select-String's parameters, Select-ColorString cannot do everything that Select-String does, that's why I said *more or less* at the beginning of this post.
>
> Some better ways that I think to archive the goal is whether use [ValueFromRemainingArguments](https://docs.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_functions_advanced_parameters?view=powershell-6#valuefromremainingarguments-argument) to send all the remaing non-handled Select-ColorString parameters to Select-String, whether let Microsoft Powershell team to modify directly the [Types.ps1xml](https://docs.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_types.ps1xml?view=powershell-6)


{% highlight powershell linenos %}
function Select-ColorString {
     <#
    .SYNOPSIS

    Find the matches in a given content by the pattern and write the matches in color like grep.

    .NOTES

    inspired by: https://ridicurious.com/2018/03/14/highlight-words-in-powershell-console/

    .EXAMPLE

    > 'aa bb cc', 'A line' | Select-ColorString a

    Both line 'aa bb cc' and line 'A line' are displayed as both contain "a" case insensitive.

    .EXAMPLE

    > 'aa bb cc', 'A line' | Select-ColorString a -NotMatch

    Nothing will be displayed as both lines have "a".

    .EXAMPLE

    > 'aa bb cc', 'A line' | Select-ColorString a -CaseSensitive

    Only line 'aa bb cc' is displayed with color on all occurrences of "a" case sensitive.

    .EXAMPLE

    > 'aa bb cc', 'A line' | Select-ColorString '(a)|(\sb)' -CaseSensitive -BackgroundColor White

    Only line 'aa bb cc' is displayed with background color White on all occurrences of regex '(a)|(\sb)' case sensitive.

    .EXAMPLE

    > 'aa bb cc', 'A line' | Select-ColorString b -KeepNotMatch

    Both line 'aa bb cc' and 'A line' are displayed with color on all occurrences of "b" case insensitive,
    and for lines without the keyword "b", they will be only displayed but without color.

    .EXAMPLE

    > Get-Content app.log -Wait -Tail 100 | Select-ColorString "error|warning|critical" -MultiColorsForSimplePattern -KeepNotMatch

    Search the 3 key words "error", "warning", and "critical" in the last 100 lines of the active file app.log and display the 3 key words in 3 colors.
    For lines without the keys words, hey will be only displayed but without color.

    .EXAMPLE

    > Get-Content "C:\Windows\Logs\DISM\dism.log" -Tail 100 -Wait | Select-ColorString win

    Find and color the keyword "win" in the last ongoing 100 lines of dism.log.

    .EXAMPLE

    > Get-WinEvent -FilterHashtable @{logname='System'; StartTime = (Get-Date).AddDays(-1)} | Select-Object time*,level*,message | Select-ColorString win

    Find and color the keyword "win" in the System event log from the last 24 hours.
    #>

    [Cmdletbinding(DefaultParametersetName = 'Match')]
    param(
        [Parameter(
            Position = 0)]
        [ValidateNotNullOrEmpty()]
        [String]$Pattern = $(throw "$($MyInvocation.MyCommand.Name) : " `
                + "Cannot bind null or empty value to the parameter `"Pattern`""),

        [Parameter(
            ValueFromPipeline = $true,
            HelpMessage = "String or list of string to be checked against the pattern")]
        [String[]]$Content,

        [Parameter()]
        [ValidateSet(
            'Black',
            'DarkBlue',
            'DarkGreen',
            'DarkCyan',
            'DarkRed',
            'DarkMagenta',
            'DarkYellow',
            'Gray',
            'DarkGray',
            'Blue',
            'Green',
            'Cyan',
            'Red',
            'Magenta',
            'Yellow',
            'White')]
        [String]$ForegroundColor = 'Black',

        [Parameter()]
        [ValidateSet(
            'Black',
            'DarkBlue',
            'DarkGreen',
            'DarkCyan',
            'DarkRed',
            'DarkMagenta',
            'DarkYellow',
            'Gray',
            'DarkGray',
            'Blue',
            'Green',
            'Cyan',
            'Red',
            'Magenta',
            'Yellow',
            'White')]
        [ValidateScript( {
                if ($Host.ui.RawUI.BackgroundColor -eq $_) {
                    throw "Current host background color is also set to `"$_`", " `
                        + "please choose another color for a better readability"
                }
                else {
                    return $true
                }
            })]
        [String]$BackgroundColor = 'Yellow',

        [Parameter()]
        [Switch]$CaseSensitive,

        [Parameter(
            HelpMessage = "Available only if the pattern is simple non-regex string " `
                + "separated by '|', use this switch with fast CPU.")]
        [Switch]$MultiColorsForSimplePattern,

        [Parameter(
            ParameterSetName = 'NotMatch',
            HelpMessage = "If true, write only not matching lines; " `
                + "if false, write only matching lines")]
        [Switch]$NotMatch,

        [Parameter(
            ParameterSetName = 'Match',
            HelpMessage = "If true, write all the lines; " `
                + "if false, write only matching lines")]
        [Switch]$KeepNotMatch
    )

    begin {
        $paramSelectString = @{
            Pattern       = $Pattern
            AllMatches    = $true
            CaseSensitive = $CaseSensitive
        }
        $writeNotMatch = $KeepNotMatch -or $NotMatch

        [System.Collections.ArrayList]$colorList =  [System.Enum]::GetValues([System.ConsoleColor])
        $currentBackgroundColor = $Host.ui.RawUI.BackgroundColor
        $colorList.Remove($currentBackgroundColor.ToString())
        $colorList.Remove($ForegroundColor)
        $colorList.Reverse()
        $colorCount = $colorList.Count

        if ($MultiColorsForSimplePattern) {
            # Get all the console foreground and background colors mapping display effet:
            # https://gist.github.com/timabell/cc9ca76964b59b2a54e91bda3665499e
            $patternToColorMapping = [Ordered]@{}
            # Available only if the pattern is a simple non-regex string separated by '|', use this with fast CPU.
            # We dont support regex as -Pattern for this switch as it will need much more CPU.
            # This switch is useful when you need to search some words,
            # for example searching "error|warn|crtical" these 3 words in a log file.
            $expectedMatches = $Pattern.split("|")
            $expectedMatchesCount = $expectedMatches.Count
            if ($expectedMatchesCount -ge $colorCount) {
                Write-Host "The switch -MultiColorsForSimplePattern is True, " `
                    + "but there're more patterns than the available colors number " `
                    + "which is $colorCount, so rotation color list will be used." `
                    -ForegroundColor Yellow
            }
            0..($expectedMatchesCount -1) | % {
                $patternToColorMapping.($expectedMatches[$_]) = $colorList[$_ % $colorCount]
            }

        }
    }

    process {
        foreach ($line in $Content) {
            $matchList = $line | Select-String @paramSelectString

            if (0 -lt $matchList.Count) {
                if (-not $NotMatch) {
                    $index = 0
                    foreach ($myMatch in $matchList.Matches) {
                        $length = $myMatch.Index - $index
                        Write-Host $line.Substring($index, $length) -NoNewline

                        $expectedBackgroupColor = $BackgroundColor
                        if ($MultiColorsForSimplePattern) {
                            $expectedBackgroupColor = $patternToColorMapping[$myMatch.Value]
                        }

                        $paramWriteHost = @{
                            Object          = $line.Substring($myMatch.Index, $myMatch.Length)
                            NoNewline       = $true
                            ForegroundColor = $ForegroundColor
                            BackgroundColor = $expectedBackgroupColor
                        }
                        Write-Host @paramWriteHost

                        $index = $myMatch.Index + $myMatch.Length
                    }
                    Write-Host $line.Substring($index)
                }
            }
            else {
                if ($writeNotMatch) {
                    Write-Host "$line"
                }
            }
        }
    }

    end {
    }
}
{% endhighlight %}
