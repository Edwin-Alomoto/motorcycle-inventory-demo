# Motorcycle Inventory Demo - Deploy en Vercel

## Descripción
Sistema de gestión de inventario para taller de motocicletas con módulos de:
- Administración de productos y proveedores
- Gestión de ventas
- Control de reparaciones
- Gestión de clientes

## Tecnologías Utilizadas
- HTML5, CSS3, JavaScript (ES6+)
- Bootstrap 5 para el diseño responsivo
- Chart.js para gráficas
- jsPDF para generación de PDFs
- LocalStorage para persistencia de datos

## Estructura del Proyecto
```
motorcycle-inventory-demo/
├── index.html                 # Página principal
├── admin-dashboard.html       # Dashboard de administrador
├── vendedor-dashboard.html    # Dashboard de vendedor
├── css/                       # Estilos CSS
├── js/                        # Scripts JavaScript
├── ejemplos/                  # Datos de ejemplo
└── vercel.json               # Configuración de Vercel
```

## Características Principales
- ✅ Gestión completa de productos con descuentos mínimos y máximos
- ✅ Sistema de ventas con facturación
- ✅ Control de reparaciones con evidencia fotográfica
- ✅ Gestión de clientes y proveedores
- ✅ Dashboard con gráficas y estadísticas
- ✅ Generación de PDFs (facturas y recibos)
- ✅ Interfaz responsiva y moderna

## Deploy en Vercel

### Opción 1: Deploy desde GitHub (Recomendado)
1. Sube tu código a un repositorio de GitHub
2. Ve a [vercel.com](https://vercel.com) y crea una cuenta
3. Haz clic en "New Project"
4. Importa tu repositorio de GitHub
5. Vercel detectará automáticamente la configuración
6. Haz clic en "Deploy"

### Opción 2: Deploy desde Vercel CLI
1. Instala Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Inicia sesión:
   ```bash
   vercel login
   ```

3. Deploy desde el directorio del proyecto:
   ```bash
   vercel
   ```

### Opción 3: Drag & Drop
1. Ve a [vercel.com](https://vercel.com)
2. Arrastra y suelta la carpeta del proyecto
3. Vercel hará el deploy automáticamente

## Configuración Específica
- **Framework Preset**: Other
- **Build Command**: (dejar vacío)
- **Output Directory**: (dejar vacío)
- **Install Command**: (dejar vacío)

## Variables de Entorno
No se requieren variables de entorno para este proyecto ya que utiliza LocalStorage.

## Dominio Personalizado
Después del deploy, puedes configurar un dominio personalizado desde el dashboard de Vercel.

## Actualizaciones
Para actualizar el sitio:
1. Haz cambios en tu código local
2. Sube los cambios a GitHub (si usas Git)
3. Vercel detectará automáticamente los cambios y hará un nuevo deploy

## Soporte
Si tienes problemas con el deploy, revisa:
- La consola de Vercel para errores de build
- Los logs del deploy
- La configuración del archivo `vercel.json`
