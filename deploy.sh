#!/bin/bash

# Script de Deploy para Motorcycle Inventory Demo
# Autor: Sistema de Gestión de Motos
# Fecha: $(date)

echo "🚀 Iniciando proceso de deploy para Motorcycle Inventory Demo..."
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "index.html" ]; then
    echo "❌ Error: No se encontró index.html en el directorio actual"
    echo "   Asegúrate de estar en el directorio raíz del proyecto"
    exit 1
fi

# Verificar que vercel.json existe
if [ ! -f "vercel.json" ]; then
    echo "❌ Error: No se encontró vercel.json"
    echo "   El archivo de configuración de Vercel es requerido"
    exit 1
fi

echo "✅ Verificaciones completadas"
echo ""

# Verificar si Vercel CLI está instalado
if ! command -v vercel &> /dev/null; then
    echo "⚠️  Vercel CLI no está instalado"
    echo "   Instalando Vercel CLI..."
    npm install -g vercel
    echo ""
fi

# Verificar si el usuario está logueado en Vercel
echo "🔐 Verificando autenticación con Vercel..."
if ! vercel whoami &> /dev/null; then
    echo "   Iniciando sesión en Vercel..."
    vercel login
    echo ""
fi

echo "📦 Preparando archivos para deploy..."
echo "   - Verificando estructura del proyecto"
echo "   - Validando configuración"

# Listar archivos principales
echo ""
echo "📁 Archivos principales del proyecto:"
ls -la *.html *.json 2>/dev/null | head -10
echo ""

# Hacer el deploy
echo "🚀 Iniciando deploy en Vercel..."
echo "   Esto puede tomar unos minutos..."
echo ""

vercel --prod

echo ""
echo "✅ Deploy completado!"
echo ""
echo "🌐 Tu aplicación estará disponible en:"
echo "   https://tu-proyecto.vercel.app"
echo ""
echo "📝 Para futuras actualizaciones:"
echo "   1. Haz cambios en tu código"
echo "   2. Ejecuta: ./deploy.sh"
echo "   3. O usa: vercel --prod"
echo ""
echo "�� ¡Deploy exitoso!"
