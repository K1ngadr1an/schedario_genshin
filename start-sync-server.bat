@echo off
echo ========================================
echo    SERVER SINCRONIZZAZIONE GENSIN
echo ========================================
echo.
echo Server HTTP: http://192.168.1.12:8080
echo Server WebSocket: ws://192.168.1.12:8765
echo.
echo Per fermare i server, premi Ctrl+C
echo.

REM Avvia il server WebSocket in background
start "WebSocket Server" "C:\Users\adric\AppData\Local\Programs\Python\Python311\python.exe" websocket-server.py

REM Aspetta un momento per l'avvio del WebSocket
timeout /t 2 /nobreak > nul

REM Avvia il server HTTP
echo Avvio server HTTP...
"C:\Users\adric\AppData\Local\Programs\Python\Python311\python.exe" -m http.server 8080 --bind 0.0.0.0

pause 