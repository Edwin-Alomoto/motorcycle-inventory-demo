# 🚀 Guía de Despliegue en Netlify

## 📋 Pasos para Desplegar

### 1. Preparar el Repositorio

Asegúrate de que tu proyecto esté en GitHub:

```bash
# Si no tienes un repositorio en GitHub
git init
git add .
git commit -m "Primer commit - Sistema de Inventario de Motocicletas"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/motorcycle-inventory-demo.git
git push -u origin main
```

### 2. Desplegar en Netlify

#### Opción A: Desde GitHub (Recomendado)

1. **Ve a [netlify.com](https://netlify.com)**
2. **Haz clic en "Sign up" o "Log in"**
3. **Conecta tu cuenta de GitHub**
4. **Haz clic en "New site from Git"**
5. **Selecciona GitHub**
6. **Busca tu repositorio: `motorcycle-inventory-demo`**
7. **Configuración del build:**
   - **Build command:** (dejar vacío)
   - **Publish directory:** `.` (punto)
8. **Haz clic en "Deploy site"**

#### Opción B: Arrastrar y Soltar

1. **Ve a [netlify.com](https://netlify.com)**
2. **Haz clic en "Sign up" o "Log in"**
3. **Arrastra tu carpeta del proyecto a la zona de "Drag and drop your site folder here"**
4. **Netlify automáticamente detectará la configuración**

### 3. Configuración Adicional

#### Variables de Entorno (Opcional)

Si necesitas configurar variables de entorno:

1. **Ve a Site settings > Environment variables**
2. **Agrega las variables necesarias**

#### Dominio Personalizado (Opcional)

1. **Ve a Site settings > Domain management**
2. **Haz clic en "Add custom domain"**
3. **Sigue las instrucciones para configurar tu dominio**

### 4. Verificar el Despliegue

Una vez desplegado, verifica que:

- ✅ **La página principal carga correctamente**
- ✅ **Los modales funcionan**
- ✅ **La carga masiva funciona**
- ✅ **Las descargas de archivos funcionan**

## 🔧 Archivos de Configuración

### `netlify.toml`
```toml
[build]
  publish = "."
  command = ""

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

### `_redirects`
```
/*    /index.html   200
```

## 🚨 Solución de Problemas

### Error: "Page not found"
- **Solución:** Verifica que el archivo `_redirects` esté en la raíz del proyecto

### Error: "Build failed"
- **Solución:** Verifica que no haya errores de JavaScript en la consola

### Error: "CORS policy"
- **Solución:** Los archivos de configuración ya incluyen headers de seguridad

### Error: "localStorage not working"
- **Solución:** Netlify soporta localStorage sin problemas

## 📱 URLs Importantes

Una vez desplegado, tendrás URLs como:
- **URL principal:** `https://tu-sitio.netlify.app`
- **URL de administración:** `https://tu-sitio.netlify.app/admin-dashboard.html`
- **URL de vendedor:** `https://tu-sitio.netlify.app/vendedor-dashboard.html`

## 🔄 Actualizaciones

Para actualizar tu sitio:

1. **Haz cambios en tu código local**
2. **Commit y push a GitHub:**
   ```bash
   git add .
   git commit -m "Actualización del sistema"
   git push
   ```
3. **Netlify automáticamente detectará los cambios y hará un nuevo deploy**

## 📊 Monitoreo

Netlify te proporciona:
- **Analytics de visitas**
- **Logs de build**
- **Estado del sitio**
- **Notificaciones de deploy**

## 🎯 Próximos Pasos

1. **Configura un dominio personalizado**
2. **Configura HTTPS automático**
3. **Configura notificaciones de deploy**
4. **Configura analytics**

## 📞 Soporte

Si tienes problemas:
1. **Revisa los logs de build en Netlify**
2. **Verifica la consola del navegador**
3. **Consulta la documentación de Netlify**
4. **Contacta al soporte de Netlify**

¡Tu sistema de inventario de motocicletas estará en línea en minutos! 🏍️✨
