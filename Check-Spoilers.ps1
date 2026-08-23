<#
    Check-Spoilers.ps1 - narrative discipline check for Kind Answers.

    This account deliberately withholds the events of 7 October 1918 until
    6-october.html, because that is the order in which the compiler learned
    them. It is very easy to undo that by accident - a caption, a date in a
    table, a stray word in a nav label.

    This script reads every page that comes BEFORE the reveal and fails if it
    finds anything that gives the outcome away.

    Read-only. Exit 0 = clean, 1 = something leaks.

    Run:  powershell -NoProfile -ExecutionPolicy Bypass -File .\Check-Spoilers.ps1
#>

[CmdletBinding()]
param([string]$Root)

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

# Pages the reader sees BEFORE the October chapter.
$before = @('index.html','1-chase-city.html','2-june-1917.html','3-crossings.html',
            '4-sergeants-job.html','5-two-companies.html','6-apremont.html',
            'company-organization.html')

# Things that would give it away. Deliberately broad - false positives are
# cheap, a spoiled reveal is not.
$patterns = @(
    @{ P = 'killed in action|\bK\.I\.A\b';             W = 'killed in action' }
    @{ P = '7 October 1918|7 Oct 1918';                W = 'the date of his death' }
    @{ P = '\bgrave\b|\bcemeter|\bburial\b|\bburied\b';W = 'burial language' }
    @{ P = '\bheadstone\b|\bposthum|\bmemorial\b';     W = 'memorial language' }
    @{ P = '\bfuneral\b|\bmourn|\bwidow';              W = 'mourning language' }
    @{ P = 'graves registration';                      W = 'Graves Registration' }
    @{ P = '1895\s*[-\u2013]\s*1918|1918\s*\)';       W = 'a closing date for Alexander' }
    @{ P = 'portrait-alexander';                       W = 'a portrait of Alexander (held until the reveal)' }
    @{ P = 'Soldiers of the Great War';                W = 'the memorial volume title' }
    @{ P = 'sotgw';                                    W = 'the memorial volume image' }
)

# Known and accepted: generic statements about officers as a class.
# Known-good phrases that trip the broad patterns above. Each is here because
# it was checked by hand and is not a disclosure.
$allowed = @(
    'were killed accordingly',          # officers as a class, not Alexander
    'hundred and eighty miles',         # Caldwell County to Chase City - correct
    'Bullock takes it on 7 October',    # a command date, deliberately unexplained
    'Bullock 7 October 1918'            # same date in the command table
)

# NOTE on the two Bullock exceptions: the Apremont chapter shows that Company L
# changed commander on 7 October 1918 and says openly that something happened
# that day, without saying what. That is the intended tension, not a disclosure -
# the reader is told to turn the page. Both were checked by hand. Do not widen
# these into a blanket allowance for the date itself.

Write-Host ""
Write-Host "Kind Answers - spoiler discipline check" -ForegroundColor White
Write-Host "  $Root"
Write-Host "  $($before.Count) page(s) precede the reveal" -ForegroundColor DarkGray
Write-Host ""

$leaks = 0
foreach ($f in $before) {
    $path = Join-Path $Root $f
    if (-not (Test-Path -LiteralPath $path)) {
        Write-Host "  [FAIL] $f is missing" -ForegroundColor Red; $leaks++; continue
    }
    $raw  = Get-Content -LiteralPath $path -Raw -Encoding UTF8
    $text = [regex]::Replace($raw, '<[^>]+>', ' ')
    $hit  = $false
    foreach ($rule in $patterns) {
        foreach ($m in [regex]::Matches($text, $rule.P, 'IgnoreCase')) {
            $s = [Math]::Max(0, $m.Index - 60)
            $len = [Math]::Min(140, $text.Length - $s)
            $ctx = ($text.Substring($s, $len) -replace '\s+', ' ').Trim()
            if ($allowed | Where-Object { $ctx -like "*$_*" }) { continue }
            Write-Host "  [LEAK] $f - $($rule.W)" -ForegroundColor Red
            Write-Host "         ...$ctx..." -ForegroundColor DarkGray
            $leaks++; $hit = $true
        }
    }
    if (-not $hit) { Write-Host "  [ OK ] $f" -ForegroundColor DarkGreen }
}

Write-Host ""
if ($leaks -gt 0) {
    Write-Host "FAILED - $leaks leak(s). The reveal is spoiled before 7-october.html." -ForegroundColor Red
    exit 1
}
Write-Host "PASSED - the outcome is not disclosed before the October chapter." -ForegroundColor Green
exit 0
