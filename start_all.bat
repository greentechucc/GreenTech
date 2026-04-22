@echo off
echo Iniciando todos los microservicios de GreenTech (Arquitectura NestJS)...
set BASE_DIR=%~dp0

echo 1. Iniciando API Gateway...
start "API_Gateway" cmd /k "cd /d %BASE_DIR%api-gateway && npm run start"

echo 2. Iniciando CRM Service...
start "CRM_Service" cmd /k "cd /d %BASE_DIR%crm-service && npm run start"

echo 3. Iniciando Quotation Service...
start "Quotation_Service" cmd /k "cd /d %BASE_DIR%quotation-service && npm run start"

echo 4. Iniciando Project Service...
start "Project_Service" cmd /k "cd /d %BASE_DIR%project-service && npm run start"

echo 5. Iniciando Permit Service...
start "Permit_Service" cmd /k "cd /d %BASE_DIR%permit-service && npm run start"

echo 6. Iniciando Monitoring Service...
start "Monitoring_Service" cmd /k "cd /d %BASE_DIR%monitoring-service && npm run start"

echo 7. Iniciando Billing Service...
start "Billing_Service" cmd /k "cd /d %BASE_DIR%billing-service && npm run start"

echo 8. Iniciando Client Portal Service...
start "Client_Portal_Service" cmd /k "cd /d %BASE_DIR%client-portal-service && npm run start"

echo 9. Iniciando Analytics Service...
start "Analytics_Service" cmd /k "cd /d %BASE_DIR%analytics-service && npm run start"

echo.
echo Todos los servicios han sido lanzados en ventanas independientes.
echo Asegurate de que el docker-compose (bases de datos y redis) este corriendo.
pause
