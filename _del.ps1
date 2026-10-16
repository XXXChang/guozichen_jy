$path = 'd:\guozichen_jy\pages\days.html'
$lines = Get-Content $path -Encoding UTF8
$total = $lines.Count
Write-Host "Total: $total"
# 保留 line 1..1157, 跳到 line 1229 之后
# flowCanvas script 段在 1158-1228
$head = $lines[0..1156]
$tail = $lines[1228..($total-1)]
$new = $head + $tail
$new | Set-Content $path -Encoding UTF8 -NoNewline
Write-Host "Done. New total: $($new.Count)"
