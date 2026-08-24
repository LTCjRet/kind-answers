<#
    Review-Changes.ps1 - show what you actually changed, in prose.

    "git diff" shows changed HTML lines, which is unreadable for editing work
    and hides a one-word factual change inside a reflowed paragraph. This
    strips the markup from both versions and compares the SENTENCES, so you
    see what a reader would see change.

    Writes REVIEW.txt next to the script and prints a summary.
    Read-only. Changes nothing, commits nothing.

    Run:  .\Review.bat
      or: powershell -NoProfile -ExecutionPolicy Bypass -File .\Review-Changes.ps1

    -Since <ref>   compare against something other than the default.
                   Default is HEAD - i.e. everything not yet committed.
                   Use "origin/main" to see everything not yet published.
#>

[CmdletBinding()]
param(
    [string]$Since = 'HEAD',
    [string]$Root
)

$ErrorActionPreference = 'Stop'
if (-not $Root) {
    if     ($PSScriptRoot)                { $Root = $PSScriptRoot }
    elseif ($PSCommandPath)               { $Root = Split-Path -Parent $PSCommandPath }
    elseif ($MyInvocation.MyCommand.Path) { $Root = Split-Path -Parent $MyInvocation.MyCommand.Path }
    else                                  { $Root = (Get-Location).Path }
}
$Root = $Root.TrimEnd('\')
if ($Root -and (Test-Path -LiteralPath $Root)) { $Root = (Resolve-Path -LiteralPath $Root).Path }
if (-not $Root -or -not (Test-Path -LiteralPath $Root)) {
    Write-Host "Could not resolve the site folder. Pass -Root explicitly." -ForegroundColor Red; exit 1
}
Set-Location -LiteralPath $Root

function Say ($m, $c = 'Gray') { Write-Host $m -ForegroundColor $c }

# Turn a page into the sentences a reader would actually read.
function Get-Sentences ([string]$t) {
    if (-not $t) { return @() }
    $t = [regex]::Replace($t, '<script.*?</script>', ' ', 'Singleline, IgnoreCase')
    $t = [regex]::Replace($t, '<style.*?</style>',   ' ', 'Singleline, IgnoreCase')
    $t = [regex]::Replace($t, '<svg.*?</svg>', ' [inline diagram] ', 'Singleline, IgnoreCase')
    $t = [regex]::Replace($t, '<head.*?</head>', ' ', 'Singleline, IgnoreCase')
    $t = [regex]::Replace($t, '<nav.*?</nav>',   ' ', 'Singleline, IgnoreCase')
    $t = [regex]::Replace($t, '<footer.*?</footer>', ' ', 'Singleline, IgnoreCase')
    $t = [regex]::Replace($t, '<[^>]+>', ' ')
    $map = @{
        '&mdash;' = '-';  '&ndash;' = '-';   '&rsquo;' = "'";  '&lsquo;' = "'"
        '&ldquo;' = '"';  '&rdquo;' = '"';   '&amp;'   = '&';  '&nbsp;'  = ' '
        '&middot;'= '.';  '&hellip;'= '...'; '&eacute;'= 'e';  '&egrave;'= 'e'
        '&acirc;' = 'a';  '&frac12;'= '1/2'; '&rarr;'  = '->'; '&larr;'  = '<-'
        '&copy;'  = '(c)';'&quot;'   = '"'
    }
    foreach ($k in $map.Keys) { $t = $t.Replace($k, $map[$k]) }
    $t = [regex]::Replace($t, '\s+', ' ').Trim()
    return @([regex]::Split($t, '(?<=[.!?:])\s+') |
             ForEach-Object { $_.Trim() } |
             Where-Object { $_.Length -gt 3 })
}

Say ""
Say "Kind Answers - what changed" 'White'
Say "  comparing working files against: $Since" 'DarkGray'

# Which pages differ?
$changed = @(git diff --name-only $Since -- '*.html' 2>$null) | Where-Object { $_ }
$untracked = @(git ls-files --others --exclude-standard -- '*.html') | Where-Object { $_ }
$all = @($changed + $untracked | Sort-Object -Unique)

if ($all.Count -eq 0) {
    Say ""
    Say "  No page has changed since $Since." 'Yellow'
    Say "  Nothing to review." 'Yellow'
    exit 0
}

Say "  $($all.Count) page(s) changed" 'DarkGray'
Say ""

$out = New-Object System.Text.StringBuilder
[void]$out.AppendLine("KIND ANSWERS - PROSE REVIEW")
[void]$out.AppendLine("Generated $(Get-Date -Format 'yyyy-MM-dd HH:mm')")
[void]$out.AppendLine("Comparing working files against: $Since")
[void]$out.AppendLine(("=" * 74))
[void]$out.AppendLine("")
[void]$out.AppendLine("Navigation, footers, <head> and inline diagrams are excluded, so what")
[void]$out.AppendLine("follows is the readable text only. REMOVED lines are what a reader would")
[void]$out.AppendLine("no longer see; ADDED lines are what they would see instead.")
[void]$out.AppendLine("")

$totalAdd = 0; $totalDel = 0

foreach ($f in $all) {
    $newRaw = ''
    if (Test-Path -LiteralPath $f) { $newRaw = Get-Content -LiteralPath $f -Raw -Encoding UTF8 }
    $oldRaw = ''
    $shown = git show "${Since}:$f" 2>$null
    if ($LASTEXITCODE -eq 0 -and $shown) { $oldRaw = ($shown -join "`n") }

    $oldS = @(Get-Sentences $oldRaw)
    $newS = @(Get-Sentences $newRaw)

    $diff = @()
    if ($oldS.Count -eq 0) {
        $diff = $newS | ForEach-Object { [pscustomobject]@{ SideIndicator = '=>'; InputObject = $_ } }
    } elseif ($newS.Count -eq 0) {
        $diff = $oldS | ForEach-Object { [pscustomobject]@{ SideIndicator = '<='; InputObject = $_ } }
    } else {
        $diff = @(Compare-Object -ReferenceObject $oldS -DifferenceObject $newS)
    }

    $removed = @($diff | Where-Object { $_.SideIndicator -eq '<=' })
    $added   = @($diff | Where-Object { $_.SideIndicator -eq '=>' })
    if ($removed.Count -eq 0 -and $added.Count -eq 0) { continue }

    $totalAdd += $added.Count; $totalDel += $removed.Count
    Say ("  {0,-26} -{1,-4} +{2}" -f $f, $removed.Count, $added.Count) 'Cyan'

    [void]$out.AppendLine(("-" * 74))
    [void]$out.AppendLine($f)
    [void]$out.AppendLine(("-" * 74))
    if ($removed.Count -gt 0) {
        [void]$out.AppendLine("")
        [void]$out.AppendLine("REMOVED:")
        foreach ($r in $removed) { [void]$out.AppendLine("  - " + $r.InputObject) }
    }
    if ($added.Count -gt 0) {
        [void]$out.AppendLine("")
        [void]$out.AppendLine("ADDED:")
        foreach ($a in $added) { [void]$out.AppendLine("  + " + $a.InputObject) }
    }
    [void]$out.AppendLine("")
}

# Images and links added or removed - easy to miss in prose.
[void]$out.AppendLine(("=" * 74))
[void]$out.AppendLine("IMAGE AND LINK CHANGES")
[void]$out.AppendLine(("=" * 74))
$imgDiff = @(git diff -U0 $Since -- '*.html' 2>$null |
             Where-Object { $_ -match '^[+-]' -and $_ -notmatch '^[+-][+-]' -and $_ -match '(src|href)="' })
if ($imgDiff.Count -gt 0) {
    foreach ($l in $imgDiff) {
        foreach ($m in [regex]::Matches($l, '(?:src|href)="([^"]+)"')) {
            $sign = $l.Substring(0,1)
            [void]$out.AppendLine("  $sign $($m.Groups[1].Value)")
        }
    }
} else {
    [void]$out.AppendLine("  none")
}

$path = Join-Path $Root 'REVIEW.txt'
[System.IO.File]::WriteAllText($path, $out.ToString(), (New-Object System.Text.UTF8Encoding($false)))

Say ""
Say "  $totalDel sentence(s) removed, $totalAdd added" 'White'
Say "  Written to REVIEW.txt" 'Green'
Say ""
Say "  Hand REVIEW.txt to Claude and the evidence logs get reconciled to match." 'DarkGray'
exit 0
