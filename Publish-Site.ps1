<#
    Publish-Site.ps1 - commit and push the Kind Answers site to GitHub.

    Runs Check-Site.ps1 first and REFUSES TO PUSH if it fails.
    Shows you exactly what will change and asks before doing anything.

    Run:  powershell -NoProfile -ExecutionPolicy Bypass -File .\Publish-Site.ps1 -Message "what changed"
    Or:   .\Publish.bat "what changed"

    -DryRun   show what would happen, change nothing, push nothing
    -Force    skip the confirmation prompt (does NOT skip the pre-flight check)
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$Message,
    [switch]$DryRun,
    [switch]$Force,
    [string]$Root
)

$ErrorActionPreference = 'Stop'

# Resolve our own folder. $PSScriptRoot is empty in some invocation modes
# (notably when used as a param() default under Windows PowerShell), which is
# what produced "Cannot bind argument to parameter 'LiteralPath'". Try every
# reliable source in turn and fail loudly rather than passing an empty string.
if (-not $Root) {
    if     ($PSScriptRoot)                 { $Root = $PSScriptRoot }
    elseif ($PSCommandPath)                { $Root = Split-Path -Parent $PSCommandPath }
    elseif ($MyInvocation.MyCommand.Path)  { $Root = Split-Path -Parent $MyInvocation.MyCommand.Path }
    else                                   { $Root = (Get-Location).Path }
}
$Root = $Root.TrimEnd('\')
if ($Root -and (Test-Path -LiteralPath $Root)) {
    $Root = (Resolve-Path -LiteralPath $Root).Path   # normalise "C:\x\." to "C:\x"
}
if (-not $Root -or -not (Test-Path -LiteralPath $Root)) {
    Write-Host "Could not work out which folder this script is in." -ForegroundColor Red
    Write-Host "Re-run it with the folder given explicitly, for example:" -ForegroundColor Yellow
    Write-Host '    .\Publish-Site.ps1 -Root "C:\path\to\kind-answers"' -ForegroundColor Yellow
    exit 1
}
Set-Location -LiteralPath $Root

function Say ($m, $c = 'Gray') { Write-Host $m -ForegroundColor $c }

Say ""
Say "Kind Answers - publish" 'White'
Say "  repo:   $Root"

# ------------------------------------------------------------------ 0. sanity
if (-not (Test-Path (Join-Path $Root '.git'))) {
    Say "  No .git here. Nothing to publish from." 'Red'; exit 1
}
$remote = "$(git remote get-url origin 2>$null | Select-Object -First 1)".Trim()
if (-not $remote) { Say "  No 'origin' remote configured." 'Red'; exit 1 }
Say "  remote: $remote"

$branch = "$(git rev-parse --abbrev-ref HEAD | Select-Object -First 1)".Trim()
Say "  branch: $branch"
if ($branch -ne 'main') {
    Say ""
    Say "  You are on '$branch', not 'main'. GitHub Pages publishes from main." 'Yellow'
    if (-not $Force) {
        if ((Read-Host "  Continue anyway? (yes/no)") -ne 'yes') { Say "  Stopped." 'Yellow'; exit 1 }
    }
}

# ------------------------------------------------------------- 1. pre-flight
Say ""
Say "Running pre-flight check..." 'Cyan'
& (Join-Path $Root 'Check-Site.ps1') -Root $Root
if ($LASTEXITCODE -ne 0) {
    Say ""
    Say "PRE-FLIGHT FAILED. Nothing has been committed and nothing has been pushed." 'Red'
    Say "Fix the problems above and run again." 'Red'
    exit 1
}

# ------------------------------------------------------------ 2. what changes
Say ""
Say "Changes to be published:" 'Cyan'
$status = git status --porcelain
if (-not $status) {
    Say "  Working tree is clean - nothing to publish." 'Yellow'
    $aheadRaw = (git rev-list --count "origin/$branch..$branch" 2>$null | Select-Object -First 1)
    $ahead = 0
    [void][int]::TryParse(("$aheadRaw").Trim(), [ref]$ahead)
    if ($ahead -gt 0) {
        Say "  But $ahead local commit(s) have not been pushed." 'Yellow'
        if ($DryRun) { Say "  [dry run] would push them." 'DarkGray'; exit 0 }
        if ($Force -or (Read-Host "  Push them now? (yes/no)") -eq 'yes') {
            git push origin $branch
            Say "  Pushed." 'Green'
        }
    }
    exit 0
}
$status | ForEach-Object { Say "  $_" }

Say ""
Say "Line-level diff (text files):" 'Cyan'
git diff --stat -- '*.html' '*.css' '*.md' 'LICENSE' 'robots.txt' | ForEach-Object { Say "  $_" }

# Substantive changes should be accompanied by a revision entry. Git records
# what changed in a file; CHANGELOG.md records why the history changed. Only the
# second is meaningful to a researcher reading this in ten years.
$contentChanged = $status | Where-Object { $_ -match '\.(html|css)$' }
$logChanged     = $status | Where-Object { $_ -match 'CHANGELOG\.md$' }
if ($contentChanged -and -not $logChanged) {
    Say ""
    Say "  NOTE - content changed but CHANGELOG.md did not." 'Yellow'
    Say "  Git will record the diff, but not what evidence caused it." 'Yellow'
    Say "  Consider adding a revision entry before publishing." 'Yellow'
}

# Deletions deserve a second look - this is the R9 lesson.
$deletions = $status | Where-Object { $_ -match '^\s*D' }
if ($deletions) {
    Say ""
    Say "  WARNING - this commit DELETES files:" 'Red'
    $deletions | ForEach-Object { Say "    $_" 'Red' }
    Say "  Deletions stay recoverable in git history, but check this is intended." 'Yellow'
}

if ($DryRun) {
    Say ""
    Say "[dry run] Would commit with message:" 'DarkGray'
    Say "[dry run]   $Message" 'DarkGray'
    Say "[dry run] Would push to $remote ($branch). Nothing was changed." 'DarkGray'
    exit 0
}

# --------------------------------------------------------------- 3. confirm
if (-not $Force) {
    Say ""
    $answer = Read-Host "Commit and push to a PUBLIC repository? (yes/no)"
    if ($answer -ne 'yes') { Say "Stopped. Nothing committed, nothing pushed." 'Yellow'; exit 1 }
}

# ------------------------------------------------------------ 4. commit/push
Say ""
git add -A
git commit -m $Message
if ($LASTEXITCODE -ne 0) { Say "Commit failed. Nothing pushed." 'Red'; exit 1 }

git push origin $branch
if ($LASTEXITCODE -ne 0) {
    Say ""
    Say "Push failed. The commit is saved locally - nothing is lost." 'Red'
    Say "Common cause: credentials. Try 'git push' by hand to see the prompt." 'Yellow'
    exit 1
}

Say ""
Say "Published." 'Green'
Say "  https://ltcjret.github.io/kind-answers/" 'Green'
Say "  Pages usually rebuilds within a minute." 'DarkGray'
