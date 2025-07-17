@echo off
echo Avvio server HTTP su http://192.168.1.12:8080
echo.
echo Per fermare il server, premi Ctrl+C
echo.

powershell -Command "& { $listener = New-Object System.Net.HttpListener; $listener.Prefixes.Add('http://192.168.1.12:8080/'); $listener.Start(); Write-Host 'Server avviato su http://192.168.1.12:8080' -ForegroundColor Green; Write-Host 'Premi Ctrl+C per fermare' -ForegroundColor Yellow; try { while ($listener.IsListening) { $context = $listener.GetContext(); $request = $context.Request; $response = $context.Response; $localPath = $request.Url.LocalPath; if ($localPath -eq '/') { $localPath = '/index.html'; } $filePath = Join-Path (Get-Location) $localPath.TrimStart('/'); Write-Host \"Richiesta: $localPath\" -ForegroundColor Cyan; if (Test-Path $filePath) { $content = [System.IO.File]::ReadAllBytes($filePath); $response.ContentLength64 = $content.Length; $response.OutputStream.Write($content, 0, $content.Length); Write-Host \"  -> 200 OK\" -ForegroundColor Green; } else { $response.StatusCode = 404; Write-Host \"  -> 404 Not Found\" -ForegroundColor Red; } $response.Close(); } } finally { $listener.Stop(); Write-Host 'Server fermato' -ForegroundColor Red; } }"

pause 