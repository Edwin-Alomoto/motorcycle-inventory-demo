# 📱 Librería de Códigos QR - Motorcycle Inventory Demo

Esta librería te permite generar códigos QR directamente en tu aplicación de inventario de motocicletas.

## 🚀 Instalación

La librería ya está instalada en tu proyecto. Si necesitas reinstalarla:

```bash
npm install qrcode
```

## 📁 Archivos Incluidos

- `qr-generator.html` - Demo completo de la funcionalidad
- `js/qr-generator.js` - Librería principal de generación de QR
- `qr-integration-example.html` - Ejemplos de integración en el sistema
- `QR-README.md` - Este archivo de documentación

## 🔧 Uso Básico

### 1. Incluir la librería en tu HTML

```html
<!-- Incluir la librería QR desde CDN -->
<script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js"></script>

<!-- Incluir tu archivo de funciones -->
<script src="js/qr-generator.js"></script>
```

### 2. Crear una instancia del generador

```javascript
const qrGenerator = new QRGenerator();
```

### 3. Generar un código QR simple

```javascript
// Generar QR en un elemento HTML
await qrGenerator.generateQR('https://www.ejemplo.com', document.getElementById('qrContainer'));

// Generar QR como imagen base64
const qrImage = await qrGenerator.generateQRAsDataURL('https://www.ejemplo.com');
```

## 🏍️ Casos de Uso Específicos

### Generar QR para Motocicletas

```javascript
const motorcycle = {
    id: 'M001',
    marca: 'Honda',
    modelo: 'CBR 600RR',
    año: '2023',
    precio: '$15,000'
};

await qrGenerator.generateMotorcycleQR(motorcycle, document.getElementById('qrContainer'));
```

### Generar QR para Contactos

```javascript
const contact = {
    nombre: 'Juan Pérez',
    empresa: 'MotoShop',
    telefono: '+1 234 567 890',
    email: 'juan@motoshop.com'
};

await qrGenerator.generateContactQR(contact, document.getElementById('qrContainer'));
```

### Generar QR para WiFi

```javascript
const wifi = {
    ssid: 'MotoShop_WiFi',
    type: 'WPA',
    password: 'moto123456'
};

await qrGenerator.generateWiFiQR(wifi, document.getElementById('qrContainer'));
```

## 🎨 Personalización

### Opciones de Configuración

```javascript
const options = {
    width: 256,                    // Tamaño del QR
    color: {
        dark: '#000000',           // Color del QR
        light: '#FFFFFF'           // Color de fondo
    },
    margin: 2,                     // Margen alrededor del QR
    errorCorrectionLevel: 'M'      // Nivel de corrección de errores
};

await qrGenerator.generateQR('Texto', element, options);
```

### Colores Personalizados

```javascript
// QR azul con fondo blanco
await qrGenerator.generateQR('Texto', element, {
    color: {
        dark: '#2196F3',
        light: '#FFFFFF'
    }
});

// QR verde con fondo gris
await qrGenerator.generateQR('Texto', element, {
    color: {
        dark: '#4CAF50',
        light: '#F5F5F5'
    }
});
```

## 🔌 Integración en tu Dashboard

### Agregar Botón QR en Tablas

```html
<!-- En tu tabla de motocicletas -->
<tr>
    <td>Honda CBR 600RR</td>
    <td>2023</td>
    <td>$15,000</td>
    <td>
        <button class="btn btn-success" onclick="showMotorcycleQR('M001')">
            📱 Generar QR
        </button>
    </td>
</tr>
```

### Función para Mostrar QR

```javascript
function showMotorcycleQR(motorcycleId) {
    // Obtener datos de la motocicleta
    const motorcycle = getMotorcycleById(motorcycleId);
    
    // Mostrar modal con QR
    qrGenerator.showQRModal(JSON.stringify(motorcycle), {
        title: 'QR de Motocicleta',
        filename: `moto-${motorcycleId}.png`
    });
}
```

### Agregar Columna QR en tu Tabla

```javascript
// En tu función de renderizado de tabla
function renderMotorcycleTable(motorcycles) {
    const tableBody = document.getElementById('motorcycleTableBody');
    tableBody.innerHTML = '';
    
    motorcycles.forEach(motorcycle => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${motorcycle.marca}</td>
            <td>${motorcycle.modelo}</td>
            <td>${motorcycle.año}</td>
            <td>${motorcycle.precio}</td>
            <td>
                <button class="btn btn-sm btn-success" onclick="showMotorcycleQR('${motorcycle.id}')">
                    📱 QR
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}
```

## 📱 Modal de QR

La librería incluye un modal automático que puedes usar:

```javascript
qrGenerator.showQRModal('Texto del QR', {
    title: 'Título del Modal',
    filename: 'archivo-qr.png',
    qrOptions: {
        width: 300,
        color: { dark: '#000000', light: '#FFFFFF' }
    }
});
```

## 💾 Descarga de Códigos QR

### Descarga Automática

```javascript
// El modal incluye un botón de descarga automático
qrGenerator.showQRModal('Texto', { filename: 'mi-qr.png' });
```

### Descarga Manual

```javascript
// Descargar QR desde un elemento
const qrContainer = document.getElementById('qrContainer');
qrGenerator.downloadQR(qrContainer, 'codigo-qr.png');
```

## 🎯 Ejemplos Prácticos

### 1. QR para Etiquetas de Productos

```javascript
function generateProductLabelQR(product) {
    const productInfo = {
        tipo: 'Motocicleta',
        marca: product.marca,
        modelo: product.modelo,
        año: product.año,
        precio: product.precio,
        especificaciones: product.especificaciones,
        contacto: 'MotoShop - Tel: +1 234 567 890'
    };
    
    qrGenerator.showQRModal(JSON.stringify(productInfo), {
        title: 'Etiqueta QR del Producto',
        filename: `etiqueta-${product.id}.png`
    });
}
```

### 2. QR para Información del Negocio

```javascript
function generateBusinessQR() {
    const businessInfo = {
        nombre: 'MotoShop',
        direccion: '123 Calle Principal, Ciudad',
        telefono: '+1 234 567 890',
        email: 'info@motoshop.com',
        website: 'www.motoshop.com',
        horarios: 'Lun-Vie: 9AM-6PM, Sáb: 9AM-4PM'
    };
    
    qrGenerator.showQRModal(JSON.stringify(businessInfo), {
        title: 'QR del Negocio',
        filename: 'motoshop-contacto.png'
    });
}
```

### 3. QR para Reparaciones

```javascript
function generateRepairQR(repair) {
    const repairInfo = {
        id: repair.id,
        cliente: repair.cliente,
        motocicleta: repair.motocicleta,
        descripcion: repair.descripcion,
        fecha: repair.fecha,
        estado: repair.estado,
        costo: repair.costo
    };
    
    qrGenerator.showQRModal(JSON.stringify(repairInfo), {
        title: 'QR de Reparación',
        filename: `reparacion-${repair.id}.png`
    });
}
```

## 🚨 Manejo de Errores

```javascript
try {
    await qrGenerator.generateQR('Texto', element);
} catch (error) {
    console.error('Error generando QR:', error);
    element.innerHTML = '<p style="color: red;">Error generando código QR</p>';
}
```

## 📱 Compatibilidad

- ✅ Navegadores modernos (Chrome, Firefox, Safari, Edge)
- ✅ Dispositivos móviles
- ✅ Generación de QR en tiempo real
- ✅ Descarga de imágenes PNG
- ✅ Personalización completa de colores y tamaños

## 🔗 Enlaces Útiles

- [Documentación oficial de qrcode](https://github.com/soldair/node-qrcode)
- [Generador de códigos QR online](https://qr-code-generator.com/)
- [Lector de códigos QR online](https://www.qr-code-generator.com/qr-code-reader/)

## 📞 Soporte

Si tienes problemas con la librería:

1. Verifica que la librería `qrcode` esté instalada
2. Revisa la consola del navegador para errores
3. Asegúrate de que el elemento HTML existe antes de generar el QR
4. Verifica que el texto no esté vacío

---

¡Disfruta generando códigos QR para tu inventario de motocicletas! 🏍️📱
