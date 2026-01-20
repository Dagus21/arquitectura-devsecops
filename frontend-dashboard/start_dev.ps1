# ==============================================================================
# SCRIPT DE ARRANQUE FRONTEND (DASHBOARD)
# ==============================================================================

# 1. Definir la URL del Backend (Cámbiala aquí si es necesario)
$API_URL = "http://localhost:8080/api"

Write-Host "⚙️  Generando configuración para entorno local..." -ForegroundColor Cyan

# 2. Generar el archivo api.config.ts dinámicamente
$ConfigContent = @"
export const API_CONFIG = {
  apiUrl: '$API_URL'
};
"@

# Escribir el archivo en disco (Sobrescribe el existente)
$ConfigPath = "src/app/core/config/api.config.ts"
Set-Content -Path $ConfigPath -Value $ConfigContent

Write-Host "✅ Archivo de configuración generado apuntando a: $API_URL" -ForegroundColor Green
Write-Host "🚀 Iniciando Angular..." -ForegroundColor Yellow

# 3. Iniciar el servidor
ng serve