# Repacks the editable sources back into the self-extracting index.html.
#
#   _template_extracted.html  -> the page HTML/CSS + inline scripts
#   _bundle.js                -> the JS bundle (incl. EN/FR translation dictionary)
#
# Run this after editing either source, then commit & push.
# Usage:  ./build.ps1

$ErrorActionPreference = 'Stop'
$dir = $PSScriptRoot
$enc = New-Object System.Text.UTF8Encoding $false
$index = Join-Path $dir 'index.html'

if (-not (Test-Path $index)) { throw "index.html not found in $dir" }

$lines = [System.IO.File]::ReadAllLines($index)

# Locate the JSON payload lines (the line right after each bundler script tag).
$manifestLine = -1; $templateLine = -1
for ($i = 0; $i -lt $lines.Count; $i++) {
  if ($lines[$i] -match '__bundler/manifest')  { $manifestLine = $i + 1 }
  if ($lines[$i] -match '__bundler/template')  { $templateLine = $i + 1 }
}
if ($manifestLine -lt 0 -or $templateLine -lt 0) { throw "Could not find bundler manifest/template in index.html" }

# --- 1) Recompress _bundle.js into the manifest (the application/javascript asset) ---
$manifest = $lines[$manifestLine] | ConvertFrom-Json
$jsUuid = ($manifest.PSObject.Properties | Where-Object { $_.Value.mime -eq 'application/javascript' } | Select-Object -First 1).Name
if (-not $jsUuid) { throw "No application/javascript asset found in manifest" }

$js  = [System.IO.File]::ReadAllText((Join-Path $dir '_bundle.js'), $enc)
$raw = $enc.GetBytes($js)
$out = New-Object System.IO.MemoryStream
$gz  = New-Object System.IO.Compression.GZipStream($out, [System.IO.Compression.CompressionMode]::Compress)
$gz.Write($raw, 0, $raw.Length); $gz.Close()
$manifest.$jsUuid.data = [System.Convert]::ToBase64String($out.ToArray())
$lines[$manifestLine] = ($manifest | ConvertTo-Json -Depth 8 -Compress)

# --- 2) Repack _template_extracted.html into the template payload ---
$html = [System.IO.File]::ReadAllText((Join-Path $dir '_template_extracted.html'), $enc)
$lines[$templateLine] = ($html | ConvertTo-Json -Compress)

[System.IO.File]::WriteAllLines($index, $lines, $enc)

# --- 3) Verify the round-trips ---
$check = [System.IO.File]::ReadAllLines($index)
$tpl = $check[$templateLine] | ConvertFrom-Json
$cb  = [System.Convert]::FromBase64String(($check[$manifestLine] | ConvertFrom-Json).$jsUuid.data)
$ms  = New-Object System.IO.MemoryStream(,$cb)
$d   = New-Object System.IO.Compression.GZipStream($ms, [System.IO.Compression.CompressionMode]::Decompress)
$sr  = New-Object System.IO.StreamReader($d); $back = $sr.ReadToEnd(); $sr.Close()

Write-Host "Built index.html"
Write-Host ("  template: {0} chars" -f $tpl.Length)
Write-Host ("  bundle JS: {0} chars" -f $back.Length)
Write-Host "Preview:  python -m http.server 8098   ->   http://localhost:8098/index.html"
