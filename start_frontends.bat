@echo off
echo Iniciando interfaces de usuario (Next.js)...
set BASE_DIR=%~dp0

echo 1. Iniciando Admin Web (Panel de Control) en puerto 3005...
start "Admin_Web" cmd /k "cd /d %BASE_DIR%admin-web && npm run dev"

echo 2. Iniciando Portal Cliente (Customer Web) en puerto 3011...
start "Customer_Web" cmd /k "cd /d %BASE_DIR%customer-web && npm run dev"

echo.
echo Las interfaces estan iniciando en ventanas independientes.
echo Admin Web estara en: http://localhost:3005
echo Customer Web estara en: http://localhost:3011
pause
