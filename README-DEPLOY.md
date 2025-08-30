# 🚀 Despliegue en Netlify - Sistema de Gestión de Motos

## 📋 Guía de Despliegue

### Opción 1: Despliegue Directo (Arrastar y Soltar)

1. **Ve a [Netlify](https://www.netlify.com/)**
2. **Crea una cuenta** gratuita
3. **Haz clic en "Sites"**
4. **Arrastra toda la carpeta** del proyecto a la zona de drop
5. **¡Listo!** Tu sitio estará disponible en unos segundos

### Opción 2: Despliegue desde GitHub (Recomendado)

#### Paso 1: Subir a GitHub
```bash
git init
git add .
git commit -m "Initial commit - Motorcycle Inventory System"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/motorcycle-inventory-demo.git
git push -u origin main
```

#### Paso 2: Conectar con Netlify
1. En Netlify, haz clic en **"New site from Git"**
2. Selecciona **"GitHub"**
3. Autoriza el acceso y selecciona tu repositorio
4. Configuración:
   - **Branch**: `main`
   - **Build command**: (vacío)
   - **Publish directory**: `.`

## 🔧 Configuración Incluida

- ✅ `netlify.toml` - Configuración de Netlify
- ✅ `_redirects` - Redirecciones SPA
- ✅ Headers de seguridad
- ✅ Optimización automática

## 📱 URLs de la Aplicación

Después del despliegue tendrás:
- **Página Principal**: `https://tu-sitio.netlify.app/`
- **Dashboard Admin**: `https://tu-sitio.netlify.app/admin-dashboard.html`
- **Dashboard Vendedor**: `https://tu-sitio.netlify.app/vendedor-dashboard.html`

## 🔐 Credenciales de Prueba

- **Administrador**: `admin` / `admin123`
- **Vendedor**: `vendedor` / `vendedor123`

## 🌟 Características

- 📱 **Responsive Design**
- 🔒 **Autenticación**
- 📄 **Generación PDF con QR**
- 📊 **Dashboard Completo**
- 🛠️ **Gestión de Inventario**

