<#
    Checkpoint-Page.ps1 - save a restore point after editing a page.

    Commits your work LOCALLY. Does not push. Nothing becomes public.

    Every checkpoint is a point you can return to, so if the fourth page you
    edit goes wrong you lose that page and not the three before it.

    Run:  .\Checkpoint.bat "what you changed"
      or: powershell -NoProfile -ExecutionPolicy Bypass -File .\Checkpoint-Page.ps1 -Message "..."

    -Full    also run the complete pre-flight and spoiler checks first.
             Slower. Worth doing every few pages, and always before you push.
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$Message,
    [switch]$Full,
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

Say ""
Say "Checkpoint" 'White'

$status = @(git status --porcelain) | Where-Object { $_ }
if ($status.Count -eq 0) {
    Say "  Nothing has changed since the last checkpoint." 'Yellow'
    exit 0
}

Say ""
Say "  Files changed:" 'Cyan'
$status | ForEach-Object { Say "    $_" }

# --------------------------------------------------- fast structural check
# Not the full pre-flight - just the things a hand edit breaks most often,
# and which are silent failures if they get through.
Say ""
Say "  Checking page structure..." 'Cyan'
$problems = 0
$pages = @(git ls-files --cached --others --exclude-standard -- '*.html') | Where-Object { $_ -and (Test-Path -LiteralPath $_) }
foreach ($p in $pages) {
    $t = Get-Content -LiteralPath $p -Raw -Encoding UTF8
    $name = Split-Path $p -Leaf
    if ($t -notmatch '(?i)</html>\s*$')            { Say "    [!] $name does not end with </html> - truncated?" 'Red'; $problems++ }
    if ($t -notmatch '(?i)<meta charset')          { Say "    [!] $name lost its charset declaration" 'Red'; $problems++ }
    if ($t -notmatch 'name="robots"')              { Say "    [!] $name lost its noindex tag" 'Red'; $problems++ }
    if ($name -ne '404.html' -and $name -ne 'company-organization.html') {
        if ($t -notmatch '(?s)<nav class="top">.*?</nav>')       { Say "    [!] $name lost its navigation block" 'Red'; $problems++ }
        if ($t -notmatch '(?s)<footer class="site">.*?</footer>'){ Say "    [!] $name lost its footer" 'Red'; $problems++ }
    }
    $open  = ([regex]::Matches($t, '<div\b')).Count
    $close = ([regex]::Matches($t, '</div>')).Count
    if ($open -ne $close) { Say "    [!] $name has $open <div> and $close </div> - unbalanced" 'Yellow' }
    # A BOM will not break the page but makes the whole file look changed.
    $bytes = [System.IO.File]::ReadAllBytes((Join-Path $Root $p))
    if ($bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF) {
        Say "    [!] $name was saved WITH a byte-order mark - set Notepad++ to 'UTF-8' not 'UTF-8-BOM'" 'Yellow'
    }
}
if ($problems -eq 0) { Say "    structure intact" 'DarkGreen' }

if ($problems -gt 0) {
    Say ""
    Say "  $problems structural problem(s). These are silent failures - the page" 'Red'
    Say "  may still look fine in a browser. Fix them before checkpointing." 'Red'
    Say ""
    if ((Read-Host "  Checkpoint anyway? (yes/no)") -ne 'yes') { Say "  Stopped." 'Yellow'; exit 1 }
}

# --------------------------------------------------------- optional full run
if ($Full) {
    Say ""
    Say "  Running full pre-flight..." 'Cyan'
    & (Join-Path $Root 'Check-Site.ps1') -Root $Root
    if ($LASTEXITCODE -ne 0) { Say "  Pre-flight failed. Not checkpointing." 'Red'; exit 1 }
    Say ""
    Say "  Running spoiler check..." 'Cyan'
    & (Join-Path $Root 'Check-Spoilers.ps1') -Root $Root
    if ($LASTEXITCODE -ne 0) { Say "  Spoiler check failed. Not checkpointing." 'Red'; exit 1 }
}

# ------------------------------------------------------------------- commit
git add -A
git commit -m "wip: $Message" | Out-Null
if ($LASTEXITCODE -ne 0) { Say "  Commit failed." 'Red'; exit 1 }

$sha = "$(git rev-parse --short HEAD)".Trim()
$ahead = "$(git rev-list --count origin/main..HEAD 2>$null | Select-Object -First 1)".Trim()

Say ""
Say "  Checkpointed as $sha - saved locally, NOT published." 'Green'
if ($ahead) { Say "  $ahead checkpoint(s) waiting to be published." 'DarkGray' }
Say ""
Say "  To see everything you have changed since the live site:" 'DarkGray'
Say "    .\Review.bat" 'DarkGray'
Say "  To undo just this checkpoint and get the files back as they were:" 'DarkGray'
Say "    git reset --soft HEAD~1" 'DarkGray'
exit 0
