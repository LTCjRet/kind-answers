<#
    Check-Site.ps1 - pre-flight verification for the Kind Answers site.

    Read-only. Makes no changes to any file, ever. Safe to run at any time.
    Exit code 0 = clean, 1 = at least one FAIL.

    Publish-Site.ps1 will not push unless this exits 0.

    Run:  powershell -NoProfile -ExecutionPolicy Bypass -File .\Check-Site.ps1
#>

[CmdletBinding()]
param(
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
    Write-Host '    .\Check-Site.ps1 -Root "C:\path\to\kind-answers"' -ForegroundColor Yellow
    exit 1
}

$fails = 0
$warns = 0

function Ok   ($m) { Write-Host "  [ OK ] $m" -ForegroundColor DarkGreen }
function Fail ($m) { Write-Host "  [FAIL] $m" -ForegroundColor Red;    $script:fails++ }
function Warn ($m) { Write-Host "  [warn] $m" -ForegroundColor Yellow; $script:warns++ }
function Head ($m) { Write-Host ""; Write-Host $m -ForegroundColor Cyan }

Write-Host ""
Write-Host "Kind Answers - pre-flight check" -ForegroundColor White
Write-Host "  $Root"

Push-Location -LiteralPath $Root

# What would actually be published? Not "what is in the folder" - that would
# include gitignored working files, and would make the check scan its own
# secrets list. Ask git: tracked files, plus untracked files that are not
# ignored. That set is exactly what a commit would contain.
$publishSet = @()
$gitAvailable = $false
try {
    $null = git rev-parse --is-inside-work-tree 2>$null
    if ($LASTEXITCODE -eq 0) {
        $gitAvailable = $true
        $publishSet = @(git ls-files --cached --others --exclude-standard) |
                      Where-Object { $_ } |
                      ForEach-Object { Join-Path $Root $_ } |
                      Where-Object { Test-Path -LiteralPath $_ }
    }
} catch { }

if (-not $gitAvailable -or $publishSet.Count -eq 0) {
    Write-Host "  (no git here - falling back to scanning the folder, minus ignored files)" -ForegroundColor DarkGray
    $publishSet = Get-ChildItem -LiteralPath $Root -Recurse -File |
                  Where-Object { $_.FullName -notmatch '\\\.git\\' -and $_.Name -ne '.check-secrets.txt' } |
                  ForEach-Object { $_.FullName }
} else {
    Write-Host "  $($publishSet.Count) file(s) would be published" -ForegroundColor DarkGray
}

# Belt and braces: never scan or publish the local secrets list.
$publishSet = $publishSet | Where-Object { (Split-Path $_ -Leaf) -ne '.check-secrets.txt' }
$allFiles = $publishSet | ForEach-Object { Get-Item -LiteralPath $_ }

# ---------------------------------------------------------------- 1. forbidden
# NOTE: this script is itself published. Every pattern below is therefore
# GENERIC by design - no literal secret is written here, because writing one
# here would publish it. Literal strings live in .check-secrets.txt, which is
# listed in .gitignore and never leaves the machine.
$forbidden = @(
    @{ Pattern = '\bC-\d{9,10}\b';      Why = 'an NPRC case number (these double as PDF passwords)' }
    @{ Pattern = '[A-Za-z0-9._%+-]+@(?!example\.)[A-Za-z0-9.-]+\.[A-Za-z]{2,}'; Why = 'an email address' }
    @{ Pattern = '[A-Za-z]:\\Users\\';  Why = 'a local Windows user path' }
    @{ Pattern = '\b[GH]:\\';           Why = 'a local drive path' }
    @{ Pattern = '\b\d{2}_(INBOX|RECORDS|ANALYSIS|DOSSIERS|ADMIN|ARCHIVE|CONTEXT|WRITING)\b';
       Why = 'a private research folder name' }
    @{ Pattern = '\b(password|passcode)\s*[:=]\s*\S';  Why = 'something labelled as a password' }
)

# Optional local-only additions: one literal string or regex per line,
# blank lines and # comments ignored. This file must stay gitignored.
$secretsFile = Join-Path $Root '.check-secrets.txt'
if (Test-Path $secretsFile) {
    $extra = 0
    foreach ($line in (Get-Content -LiteralPath $secretsFile)) {
        $t = $line.Trim()
        if ($t -and -not $t.StartsWith('#')) {
            $forbidden += @{ Pattern = [regex]::Escape($t); Why = 'a locally-defined forbidden string' }
            $extra++
        }
    }
    Write-Host "  (loaded $extra local pattern(s) from .check-secrets.txt)" -ForegroundColor DarkGray
}

Head "1. Forbidden strings"
$pubFiles = $allFiles | Where-Object { $_.Extension -match '^\.(html|css|js|md|txt|json|xml)$' }
foreach ($rule in $forbidden) {
    $hits = @()
    foreach ($f in $pubFiles) {
        # LICENSE and README legitimately name the case-free policy; scan them anyway.
        $n = 0
        foreach ($line in (Get-Content -LiteralPath $f.FullName -Encoding UTF8)) {
            $n++
            if ($line -match $rule.Pattern) {
                $hits += "$($f.Name):$n"
            }
        }
    }
    if ($hits.Count -gt 0) {
        Fail "$($rule.Why) -> $($hits -join ', ')"
    }
}
if ($fails -eq 0) { Ok "no forbidden strings in $($pubFiles.Count) text files" }

# ------------------------------------------------------------ 2. file integrity
Head "2. File integrity (the R9 check)"
$empty = $allFiles | Where-Object { $_.Length -eq 0 -and $_.Name -ne '.nojekyll' }
if ($empty) { Fail "zero-byte file(s): $($empty.Name -join ', ')" } else { Ok "no zero-byte files" }

# NUL bytes inside a text file mean corruption, not content.
$nul = @()
foreach ($f in ($allFiles | Where-Object { $_.Extension -match '^\.(html|css|js|md|txt)$' })) {
    $bytes = [System.IO.File]::ReadAllBytes($f.FullName)
    if ($bytes -contains 0) { $nul += $f.Name }
}
if ($nul) { Fail "NUL bytes in text file(s): $($nul -join ', ')" } else { Ok "no NUL-corrupted text files" }

# Truncation guard: an HTML page that does not close is a half-written file.
$trunc = @()
foreach ($f in ($allFiles | Where-Object { $_.Extension -eq '.html' })) {
    $txt = Get-Content -LiteralPath $f.FullName -Raw -Encoding UTF8
    if ($txt -notmatch '(?i)</html>\s*$') { $trunc += $f.Name }
    elseif ($txt.Length -lt 500)          { $trunc += "$($f.Name) (suspiciously short)" }
}
if ($trunc) { Fail "truncated or unterminated HTML: $($trunc -join ', ')" } else { Ok "all HTML files terminate properly" }

# --------------------------------------------------------- 3. asset resolution
Head "3. Asset and link resolution (exact case - GitHub Pages is Linux)"
$assetDir = Join-Path $Root 'assets'
$onDisk = @{}
if (Test-Path $assetDir) {
    Get-ChildItem -LiteralPath $assetDir -File | ForEach-Object { $onDisk[$_.Name] = $true }
}
$missing = @(); $caseOnly = @(); $orphan = @{}
$onDisk.Keys | ForEach-Object { $orphan[$_] = $true }

foreach ($f in ($allFiles | Where-Object { $_.Extension -eq '.html' })) {
    $txt = Get-Content -LiteralPath $f.FullName -Raw -Encoding UTF8
    foreach ($m in [regex]::Matches($txt, '(?:src|href)="assets/([^"]+)"')) {
        $name = $m.Groups[1].Value
        $orphan.Remove($name) | Out-Null
        if (-not $onDisk.ContainsKey($name)) {
            $ci = $onDisk.Keys | Where-Object { $_ -ieq $name }
            if ($ci) { $caseOnly += "$($f.Name): 'assets/$name' should be 'assets/$ci'" }
            else     { $missing  += "$($f.Name): assets/$name" }
        }
    }
    foreach ($m in [regex]::Matches($txt, 'href="([0-9a-zA-Z._-]+\.html)"')) {
        $t = $m.Groups[1].Value
        if (-not (Test-Path (Join-Path $Root $t))) { $missing += "$($f.Name): $t" }
    }
}
if ($missing)  { Fail "unresolved reference(s): $($missing -join '; ') " } else { Ok "every reference resolves" }
if ($caseOnly) { Fail "case mismatch - works on Windows, 404s on GitHub Pages: $($caseOnly -join '; ') " }
else           { Ok "all references match on-disk case exactly" }
$orphanList = @($orphan.Keys)
if ($orphanList.Count -gt 0) { Warn "$($orphanList.Count) unreferenced asset(s): $($orphanList -join ', ')" }
else { Ok "no orphaned assets" }

# ------------------------------------------------------------- 4. strays
Head "4. Stray files that do not belong in a public repository"
$badExt = $allFiles | Where-Object { $_.Extension -match '^\.(csv|xlsx|xls|docx|doc|pdf|ps1xml|bak|tmp|zip|7z|db)$' }
if ($badExt) { Fail "research/office file(s) present: $($badExt.Name -join ', ')" } else { Ok "no research or office files" }

$badName = $allFiles | Where-Object { $_.Name -match '(?i)(RECORDS-LOG|RESEARCH-LOG|EVIDENCE-LEDGER|NEGATIVE-SEARCHES|CORRESPONDENCE|dossier|_RETROFIT)' }
if ($badName) { Fail "research artefact(s) present: $($badName.Name -join ', ')" } else { Ok "no research artefacts" }

# ------------------------------------------------------- 5. publishing basics
Head "5. Publishing basics"
foreach ($req in 'index.html', '.nojekyll', 'LICENSE', 'README.md', 'robots.txt', '404.html') {
    if (Test-Path (Join-Path $Root $req)) { Ok "$req present" } else { Fail "$req missing" }
}
$noindexMissing = @()
foreach ($f in ($allFiles | Where-Object { $_.Extension -eq '.html' })) {
    $txt = Get-Content -LiteralPath $f.FullName -Raw -Encoding UTF8
    if ($txt -notmatch 'name="robots"') { $noindexMissing += $f.Name }
}
if ($noindexMissing) { Warn "no noindex tag on: $($noindexMissing -join ', ')" } else { Ok "every page carries noindex" }

$notice = Get-Content -LiteralPath (Join-Path $Root 'index.html') -Raw -Encoding UTF8
if ($notice -match 'id="distribution"') { Ok "distribution notice present on start page" }
else { Fail "distribution notice missing from index.html" }

$mb = [math]::Round((($allFiles | Measure-Object Length -Sum).Sum / 1MB), 1)
if ($mb -gt 900) { Fail "repository is ${mb} MB - GitHub Pages soft limit is 1 GB" }
elseif ($mb -gt 400) { Warn "repository is ${mb} MB - getting large for Pages" }
else { Ok "total size ${mb} MB" }

# ------------------------------------------------------------------- verdict
Pop-Location

Write-Host ""
if ($fails -gt 0) {
    Write-Host "FAILED - $fails problem(s), $warns warning(s). Nothing should be published." -ForegroundColor Red
    exit 1
}
Write-Host "PASSED - 0 problems, $warns warning(s). Safe to publish." -ForegroundColor Green
exit 0
