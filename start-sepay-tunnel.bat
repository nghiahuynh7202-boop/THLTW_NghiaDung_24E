@echo off
chcp 65001 > nul
cls
echo ============================================================
echo   KHOI DONG CLOUDFLARE TUNNEL CHO SEPAY WEBHOOK (PORT 8000)
echo ============================================================
echo.
echo [!] LUU Y:
echo 1. Localtunnel (loca.lt) thuong bi loi HTTP 511 do trang chan bot.
echo 2. Cloudflare Tunnel (trycloudflare.com) khong bi loi 511, SePay ban webhook 100%% thanh cong!
echo 3. Sau khi khoi dong, hay COPY duong link:
echo    https://xxxx.trycloudflare.com
echo 4. Dan vao SePay Webhook URL:
echo    https://xxxx.trycloudflare.com/api/sepay/webhook
echo.
echo Dang ket noi tunnel toi http://127.0.0.1:8000...
echo ============================================================
echo.

"%~dp0cloudflared.exe" tunnel --url http://127.0.0.1:8000
pause
