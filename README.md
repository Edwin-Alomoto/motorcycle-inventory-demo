# Sistema de Gestión de Inventario y Reparaciones de Motos

Un sistema web completo para la gestión de inventario, ventas y reparaciones de motos, desarrollado con HTML, CSS y JavaScript puro.

## 🚀 Características Principales

### Roles de Usuario
- **Administrador**: Gestión completa del sistema
- **Vendedor**: Ventas, facturación y reparaciones

### Funcionalidades del Administrador
- ✅ Gestión de productos y proveedores
- ✅ Carga masiva de datos desde archivos CSV
- ✅ Gestión de clientes y mecánicos
- ✅ Reportes de ventas, inventario y reparaciones
- ✅ Sistema de notificaciones
- ✅ Dashboard con estadísticas en tiempo real

### Funcionalidades del Vendedor
- ✅ Sistema de ventas con facturación automática
- ✅ Generación de facturas en PDF
- ✅ Gestión de reparaciones
- ✅ Registro de materiales utilizados
- ✅ Generación de recibos de reparación
- ✅ Búsqueda de productos en tiempo real
- ✅ Captura de fotografías de evidencia en reparaciones

## 📋 Requisitos del Sistema

- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- Conexión a internet (para cargar librerías externas)
- No requiere servidor web (funciona completamente en el navegador)

## 🛠️ Instalación y Uso

### 1. Descarga del Proyecto
```bash
# Clonar o descargar el proyecto
git clone [URL_DEL_REPOSITORIO]
cd sistema-reparacion-motos
```

### 2. Ejecutar el Sistema
1. Abrir el archivo `index.html` en tu navegador web
2. O usar un servidor local:
   ```bash
   # Con Python 3
   python -m http.server 8000
   
   # Con Node.js
   npx http-server
   
   # Con PHP
   php -S localhost:8000
   ```

### 3. Acceso al Sistema
- **URL**: `http://localhost:8000` (si usas servidor local) o abrir directamente `index.html`

### 4. Solución de Problemas
Si experimentas refrescos múltiples al cargar `index.html`:
- El sistema ha sido optimizado para evitar este problema
- Se eliminó el uso de `alert()` que causaba conflictos
- Se implementó un sistema de inicialización secuencial
- Si persiste el problema, puedes usar `test-refresh.html` para diagnosticar

## 🔐 Credenciales de Acceso

### Administrador
- **Usuario**: `admin`
- **Contraseña**: `admin123`
- **Rol**: Administrador

### Vendedor
- **Usuario**: `vendedor`
- **Contraseña**: `vendedor123`
- **Rol**: Vendedor

## 📊 Datos de Ejemplo

El sistema incluye datos de ejemplo para demostrar todas las funcionalidades:

### Datos Incluidos
- **5 Proveedores** - Con información completa de contacto
- **8 Productos** - Con diferentes categorías y precios
- **5 Clientes** - Con datos personales completos
- **5 Mecánicos** - Con especialidades diferentes
- **5 Reparaciones** - En diferentes estados (pendiente, en proceso, finalizada, espera)
- **5 Ventas** - Con cálculos de IVA incluidos
- **5 Notificaciones** - De diferentes tipos (info, warning, success)

### Poblamiento Automático
Los datos se cargan automáticamente la primera vez que se abre el sistema. Si deseas poblar los datos manualmente:

1. Abrir `populate.html` en el navegador
2. Hacer clic en "Poblar Datos de Ejemplo"
3. Los datos se cargarán en el LocalStorage del navegador

### Datos de Ejemplo Incluidos

#### Proveedores
- MotoParts Ecuador S.A.
- Repuestos Honda Guayaquil
- Yamaha Parts Center
- Suzuki Repuestos Cuenca
- Kawasaki Ecuador

#### Productos
- Aceite de Motor 4T ($12.50)
- Filtro de Aceite Honda ($8.75)
- Batería 12V 7Ah ($45.00)
- Cadena de Transmisión ($28.90)
- Pastillas de Freno ($15.30)
- Bujía NGK ($6.50)
- Llanta Trasera 130/70-17 ($85.00)
- Espejo Retrovisor ($22.40)

#### Clientes
- Carlos Mendoza (1723456789)
- María González (0845678901)
- Roberto Silva (1756789012)
- Ana Torres (1767890123)
- Luis Herrera (0858901234)

#### Mecánicos
- Juan Pérez (Mecánica General)
- Pedro López (Sistema Eléctrico)
- Miguel Rodríguez (Suspensión y Frenos)
- Diego Castro (Motor y Transmisión)
- Fernando Morales (Diagnóstico Electrónico)

## 📁 Estructura del Proyecto

```
sistema-reparacion-motos/
├── index.html                 # Página de login
├── populate.html              # Página para poblar datos de ejemplo
├── test-refresh.html          # Página de prueba para diagnosticar refrescos
├── admin-dashboard.html       # Dashboard del administrador
├── vendedor-dashboard.html    # Dashboard del vendedor
├── css/
│   └── styles.css            # Estilos personalizados
├── js/
│   ├── auth.js               # Sistema de autenticación
│   ├── populate-data.js      # Script para poblar datos de ejemplo
│   ├── foto-manager.js       # Gestión de fotografías de evidencia
│   ├── admin-dashboard.js    # Lógica del administrador
│   └── vendedor-dashboard.js # Lógica del vendedor
├── ejemplos/
│   ├── productos.csv         # Ejemplo de archivo CSV para productos
│   └── proveedores.csv       # Ejemplo de archivo CSV para proveedores
└── README.md                 # Este archivo
```

## 🎯 Casos de Uso Implementados

### UC1 - Registrar Producto (Administrador)
- ✅ RF1.1: Ingreso de información básica del producto
- ✅ RF1.2: Validación de código único
- ✅ RF1.3: Guardado en inventario

### UC2 - Registrar Proveedor (Administrador)
- ✅ RF2.1: Ingreso de datos del proveedor
- ✅ RF2.2: Validación de RUC único
- ✅ RF2.3: Relación con productos

### UC3 - Carga Masiva de Datos (Administrador)
- ✅ RF3.1: Carga de archivos CSV
- ✅ RF3.2: Validación de formato
- ✅ RF3.3: Importación a base de datos

### UC4 - Registrar Cliente (Vendedor/Administrador)
- ✅ RF4.1: Ingreso de datos del cliente
- ✅ RF4.2: Validación de identificación única

### UC5 - Buscar Producto (Vendedor)
- ✅ RF5.1: Búsqueda por nombre o código
- ✅ RF5.2: Visualización de disponibilidad y precio

### UC6 - Emitir Factura (Vendedor)
- ✅ RF6.1: Agregar productos a la factura
- ✅ RF6.2: Cálculo automático de IVA (12%)
- ✅ RF6.3: Generación y guardado de factura
- ✅ RF6.4: Actualización automática del inventario

### UC7 - Registrar Moto para Reparación (Vendedor)
- ✅ RF7.1: Registro de motos con datos completos

### UC8 - Asignar Mecánico (Administrador/Vendedor)
- ✅ RF8.1: Asignación de mecánicos a reparaciones

### UC9 - Registrar Materiales Utilizados (Vendedor)
- ✅ RF9.1: Registro de materiales en reparaciones

### UC10 - Finalizar Reparación (Vendedor)
- ✅ RF10.1: Marcado como finalizada
- ✅ RF10.2: Cierre formal de orden
- ✅ RF10.3: Generación de recibo con detalles
- ✅ RF10.4: Captura de fotografías de evidencia (iniciales y finales)

### UC11 - Reportes (Administrador)
- ✅ RF11.1: Reportes de ventas por período
- ✅ RF11.2: Reportes de inventario
- ✅ RF11.3: Reportes de reparaciones

## 💾 Almacenamiento de Datos

El sistema utiliza **LocalStorage** del navegador para simular una base de datos. Los datos se almacenan en:

- `productos`: Catálogo de productos
- `proveedores`: Información de proveedores
- `clientes`: Base de datos de clientes
- `reparaciones`: Registro de reparaciones
- `mecanicos`: Lista de mecánicos
- `ventas`: Historial de ventas
- `notificaciones`: Sistema de notificaciones

## 📊 Funcionalidades Avanzadas

### Sistema de Facturación
- Generación automática de números de factura
- Cálculo automático de IVA (12%)
- Generación de PDF descargable
- Cumplimiento con formato ecuatoriano

### Gestión de Reparaciones
- Estados: Pendiente, En Proceso, Finalizada, En Espera
- Registro de materiales utilizados
- Asignación de mecánicos
- Generación de recibos de reparación
- Captura de fotografías de evidencia (iniciales y finales)
- Vista previa y gestión de fotos

### Sistema de Notificaciones
- Notificaciones en tiempo real
- Diferentes tipos: info, warning, success, danger
- Marcado como leídas
- Historial de notificaciones

### Carga Masiva
- Importación desde archivos CSV
- Validación de datos
- Actualización automática del inventario

## 🔧 Personalización

### Modificar Credenciales
Editar el archivo `js/auth.js`:
```javascript
this.users = {
    admin: {
        username: 'admin',
        password: 'tu_contraseña',
        role: 'admin',
        name: 'Tu Nombre'
    },
    // Agregar más usuarios aquí
};
```

### Cambiar Estilos
Modificar el archivo `css/styles.css` para personalizar la apariencia.

### Agregar Funcionalidades
Los archivos JavaScript están organizados en clases para facilitar la extensión:
- `AdminDashboard`: Funcionalidades del administrador
- `VendedorDashboard`: Funcionalidades del vendedor
- `Auth`: Sistema de autenticación

## 🚨 Consideraciones Importantes

### Seguridad
- Este es un sistema frontend puro, no incluye seguridad de servidor
- Las credenciales están hardcodeadas (solo para demostración)
- Para producción, implementar autenticación segura

### Datos
- Los datos se almacenan en el navegador del usuario
- Al limpiar el caché se pierden los datos
- Para persistencia, considerar migrar a una base de datos real

### Compatibilidad
- Funciona en navegadores modernos
- Requiere JavaScript habilitado
- Optimizado para pantallas de escritorio y móviles

## 📞 Soporte

Para reportar problemas o solicitar nuevas funcionalidades:

1. Revisar la documentación existente
2. Verificar la consola del navegador para errores
3. Contactar al equipo de desarrollo

## 📄 Licencia

Este proyecto está desarrollado con fines educativos y demostrativos.

---

**Desarrollado con ❤️ para la gestión eficiente de talleres de motos**
