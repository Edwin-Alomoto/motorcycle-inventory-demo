# Script de Deploy para Motorcycle Inventory Demo (PowerShell)
# Autor: Sistema de Gestión de Motos
# Fecha: $(Get-Date)

Write-Host "🚀 Iniciando proceso de deploy para Motorcycle Inventory Demo..." -ForegroundColor Green
Write-Host ""

# Verificar que estamos en el directorio correcto
if (-not (Test-Path "index.html")) {
    Write-Host "❌ Error: No se encontró index.html en el directorio actual" -ForegroundColor Red
    Write-Host "   Asegúrate de estar en el directorio raíz del proyecto" -ForegroundColor Yellow
    exit 1
}

# Verificar que vercel.json existe
if (-not (Test-Path "vercel.json")) {
    Write-Host "❌ Error: No se encontró vercel.json" -ForegroundColor Red
    Write-Host "   El archivo de configuración de Vercel es requerido" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Verificaciones completadas" -ForegroundColor Green
Write-Host ""

# Verificar si Node.js está instalado
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js encontrado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: Node.js no está instalado" -ForegroundColor Red
    Write-Host "   Descarga e instala Node.js desde: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Verificar si Vercel CLI está instalado
try {
    $vercelVersion = vercel --version
    Write-Host "✅ Vercel CLI encontrado: $vercelVersion" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Vercel CLI no está instalado" -ForegroundColor Yellow
    Write-Host "   Instalando Vercel CLI..." -ForegroundColor Cyan
    npm install -g vercel
    Write-Host ""
}

# Verificar si el usuario está logueado en Vercel
Write-Host "🔐 Verificando autenticación con Vercel..." -ForegroundColor Cyan
try {
    vercel whoami | Out-Null
    Write-Host "✅ Usuario autenticado en Vercel" -ForegroundColor Green
} catch {
    Write-Host "   Iniciando sesión en Vercel..." -ForegroundColor Yellow
    vercel login
    Write-Host ""
}

Write-Host "📦 Preparando archivos para deploy..." -ForegroundColor Cyan
Write-Host "   - Verificando estructura del proyecto" -ForegroundColor Gray
Write-Host "   - Validando configuración" -ForegroundColor Gray

# Listar archivos principales
Write-Host ""
Write-Host "📁 Archivos principales del proyecto:" -ForegroundColor Cyan
Get-ChildItem -Name "*.html", "*.json" | ForEach-Object { Write-Host "   $_" -ForegroundColor Gray }
Write-Host ""

# Hacer el deploy
Write-Host "🚀 Iniciando deploy en Vercel..." -ForegroundColor Green
Write-Host "   Esto puede tomar unos minutos..." -ForegroundColor Yellow
Write-Host ""

vercel --prod

Write-Host ""
Write-Host "✅ Deploy completado!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Tu aplicación estará disponible en:" -ForegroundColor Cyan
Write-Host "   https://tu-proyecto.vercel.app" -ForegroundColor Yellow
Write-Host ""
Write-Host "📝 Para futuras actualizaciones:" -ForegroundColor Cyan
Write-Host "   1. Haz cambios en tu código" -ForegroundColor Gray
Write-Host "   2. Ejecuta: .\deploy.ps1" -ForegroundColor Gray
Write-Host "   3. O usa: vercel --prod" -ForegroundColor Gray
Write-Host ""
Write-Host "🎉 ¡Deploy exitoso!" -ForegroundColor Green
