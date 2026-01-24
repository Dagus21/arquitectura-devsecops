# ==============================================================================
# SCRIPT DE ARRANQUE FRONTEND (DASHBOARD) - SMART RESTORE
# ==============================================================================

# Configuración
$ConfigPath = "src/app/core/config/api.config.ts"
$LocalApiUrl = "http://localhost:8080/api"

# 1. Definir el contenido TEMPLATE (Lo que debe ir a Producción/Git)
$TemplateContent = @"
export const API_CONFIG = {
  apiUrl: '__API_URL__'
};
"@

# 2. Definir el contenido LOCAL (Para trabajar en tu PC)
$LocalContent = @"
export const API_CONFIG = {
  apiUrl: '$LocalApiUrl'
};
"@

Write-Host "⚙️  Configurando entorno local..." -ForegroundColor Cyan

try {
    # 3. Sobrescribir con la configuración LOCAL
    Set-Content -Path $ConfigPath -Value $LocalContent
    Write-Host "✅ api.config.ts apunta a: $LocalApiUrl" -ForegroundColor Green
    
    Write-Host "🚀 Iniciando Angular... (Presiona Ctrl+C para detener)" -ForegroundColor Yellow
    
    # 4. Iniciar el servidor (El script se queda pausado aquí hasta que canceles)
    ng serve
}
finally {
    # 5. BLOQUE DE RESTAURACIÓN (Se ejecuta siempre al salir, error o Ctrl+C)
    Write-Host "`n♻️  Restaurando archivo para Producción (Git)..." -ForegroundColor Magenta
    Set-Content -Path $ConfigPath -Value $TemplateContent
    Write-Host "✅ api.config.ts restaurado con el placeholder '__API_URL__'" -ForegroundColor Green
}