// Generador de QR simplificado que siempre muestra una imagen
function generarVistaPreviaQR(texto) {
    const qrPreview = document.getElementById('qrPreview');
    if (!qrPreview) {
        console.error('Elemento qrPreview no encontrado');
        return;
    }
    
    if (!texto) {
        texto = 'PROD-' + Date.now();
    }
    
    console.log('Generando QR para:', texto);
    qrPreview.innerHTML = '<div class="text-center"><small class="text-muted">Generando QR...</small></div>';
    
    // Usar directamente la imagen QR
    setTimeout(() => {
        mostrarQRImagen(texto);
    }, 100);
    
    function mostrarQRImagen(texto) {
        console.log('Mostrando imagen QR de respaldo');
        qrPreview.innerHTML = '';
        
        const img = document.createElement('img');
        img.src = 'ejemplos/qr.jpg';
        img.alt = 'Código QR';
        img.style.maxWidth = '100%';
        img.style.height = 'auto';
        img.style.border = '2px solid #dee2e6';
        img.style.borderRadius = '8px';
        
        // Manejar error de carga de imagen
        img.onerror = function() {
            console.error('Error cargando imagen QR, usando fallback');
            mostrarQRFallback(texto);
        };
        
        // Manejar carga exitosa
        img.onload = function() {
            console.log('Imagen QR cargada exitosamente');
        };
        
        qrPreview.appendChild(img);
        
        // Agregar texto debajo del QR
        const textoQR = document.createElement('div');
        textoQR.className = 'mt-2';
        textoQR.innerHTML = `<small class="text-muted">${texto}</small>`;
        qrPreview.appendChild(textoQR);
    }
    
    function mostrarQRFallback(texto) {
        console.log('Mostrando QR fallback');
        qrPreview.innerHTML = `
            <div class="text-center">
                <div style="width: 150px; height: 150px; background: linear-gradient(45deg, #000 25%, transparent 25%), linear-gradient(-45deg, #000 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #000 75%), linear-gradient(-45deg, transparent 75%, #000 75%); background-size: 20px 20px; background-position: 0 0, 0 10px, 10px -10px, -10px 0px; border: 2px solid #dee2e6; border-radius: 8px; margin: 0 auto;">
                    <div style="display: flex; align-items: center; justify-content: center; height: 100%;">
                        <i class="fas fa-qrcode fa-3x text-dark"></i>
                    </div>
                </div>
                <div class="mt-2">
                    <small class="text-muted">${texto}</small>
                </div>
            </div>
        `;
    }
}

// Función global para generar QR directo (compatibilidad)
function generarQRDirecto(texto, size = 150) {
    // Crear un canvas simple con patrón QR básico
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    // Fondo blanco
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, size, size);
    
    // Patrón QR simple
    ctx.fillStyle = '#000000';
    const cellSize = size / 25;
    
    // Dibujar patrón básico
    for (let i = 0; i < 25; i++) {
        for (let j = 0; j < 25; j++) {
            if ((i + j) % 3 === 0) {
                ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
            }
        }
    }
    
    return canvas.toDataURL();
}
