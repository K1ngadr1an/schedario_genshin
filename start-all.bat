@echo off
echo Avvio automatico di tutti i servizi...
echo.

echo 1. Avvio server WebSocket...
start WebSocket Server" py websocket-server.py

echo 2. Attendo 3econdi per l'avvio del WebSocket...
timeout /t 3obreak > nul

echo 3. Avvio server HTTP...
start HTTP Server" py -m http.server 8080

echo.
echo ✅ Tutti i servizi avviati!
echo 🌐 Server HTTP: http://localhost:880echo 🔌 Server WebSocket: ws://192168.1125ho.
echo Premi CTRL+C per fermare tutti i servizi
pause 