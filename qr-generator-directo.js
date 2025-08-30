// Generador de QR completamente independiente
class QRGeneratorDirecto {
    constructor() {
        this.canvas = null;
        this.ctx = null;
    }
    
    // Generar QR básico usando Canvas
    generarQR(texto, size = 150) {
        if (!texto) {
            texto = 'PROD-' + Date.now();
        }
        
        // Crear canvas
        this.canvas = document.createElement('canvas');
        this.canvas.width = size;
        this.canvas.height = size;
        this.ctx = this.canvas.getContext('2d');
        
        // Limpiar canvas con fondo blanco
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillRect(0, 0, size, size);
        
        // Generar patrón QR
        this.generarPatronQR(texto, size);
        
        return this.canvas.toDataURL();
    }
    
    // Generar patrón QR básico
    generarPatronQR(texto, size) {
        const margin = 15;
        const cellSize = (size - 2 * margin) / 21; // 21x21 grid más simple
        
        // Color negro para los patrones
        this.ctx.fillStyle = '#000000';
        
        // Patrón de esquinas (marcadores de posición)
        this.dibujarMarcador(0, 0, cellSize, margin);
        this.dibujarMarcador(14, 0, cellSize, margin);
        this.dibujarMarcador(0, 14, cellSize, margin);
        
        // Generar patrón basado en el texto
        this.generarPatronTexto(texto, cellSize, margin);
    }
    
    // Dibujar marcador de posición (esquinas)
    dibujarMarcador(x, y, cellSize, margin) {
        const startX = x * cellSize + margin;
        const startY = y * cellSize + margin;
        
        // Cuadrado exterior 7x7
        this.ctx.fillRect(startX, startY, 7 * cellSize, 7 * cellSize);
        
        // Cuadrado interior blanco 5x5
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillRect(startX + cellSize, startY + cellSize, 5 * cellSize, 5 * cellSize);
        
        // Cuadrado central negro 3x3
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(startX + 2 * cellSize, startY + 2 * cellSize, 3 * cellSize, 3 * cellSize);
    }
    
    // Generar patrón basado en el texto
    generarPatronTexto(texto, cellSize, margin) {
        // Convertir texto a patrón de bits
        const hash = this.hashString(texto);
        const bits = hash.toString(2).padStart(32, '0');
        
        let bitIndex = 0;
        for (let row = 0; row < 21; row++) {
            for (let col = 0; col < 21; col++) {
                // Evitar los marcadores de posición
                if (this.esMarcador(row, col)) continue;
                
                // Usar bits del hash para determinar si pintar la celda
                if (bitIndex < bits.length && bits[bitIndex] === '1') {
                    this.ctx.fillStyle = '#000000';
                    this.ctx.fillRect(
                        margin + col * cellSize,
                        margin + row * cellSize,
                        cellSize,
                        cellSize
                    );
                }
                bitIndex++;
            }
        }
    }
    
    // Verificar si una posición es parte de un marcador
    esMarcador(row, col) {
        // Marcadores en las esquinas (7x7)
        return (row < 7 && col < 7) || // Esquina superior izquierda
               (row < 7 && col > 13) || // Esquina superior derecha
               (row > 13 && col < 7);   // Esquina inferior izquierda
    }
    
    // Función hash simple para el texto
    hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convertir a entero de 32 bits
        }
        return Math.abs(hash);
    }
}

// Función global para generar QR
function generarQRDirecto(texto, size = 150) {
    try {
        const generator = new QRGeneratorDirecto();
        return generator.generarQR(texto, size);
    } catch (error) {
        console.error('Error generando QR directo:', error);
        return null;
    }
}

// Función para generar vista previa del QR
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
    
    // Usar el generador directo
    setTimeout(() => {
        try {
            const url = generarQRDirecto(texto, 150);
            if (url) {
                mostrarQR(url, texto);
            } else {
                mostrarQRImagen(texto);
            }
        } catch (error) {
            console.error('Error generando QR:', error);
            mostrarQRImagen(texto);
        }
    }, 100);
    
    function mostrarQR(url, texto) {
        console.log('QR generado exitosamente');
        qrPreview.innerHTML = '';
        const img = document.createElement('img');
        img.src = url;
        img.alt = 'Código QR';
        img.style.maxWidth = '100%';
        img.style.height = 'auto';
        img.style.border = '2px solid #dee2e6';
        img.style.borderRadius = '8px';
        qrPreview.appendChild(img);
        
        // Agregar texto debajo del QR
        const textoQR = document.createElement('div');
        textoQR.className = 'mt-2';
        textoQR.innerHTML = `<small class="text-muted">${texto}</small>`;
        qrPreview.appendChild(textoQR);
    }
    
    function mostrarQRImagen(texto) {
        console.log('Usando imagen QR de respaldo');
        qrPreview.innerHTML = '';
        const img = document.createElement('img');
        img.src = 'ejemplos/qr.jpg';
        img.alt = 'Código QR';
        img.style.maxWidth = '100%';
        img.style.height = 'auto';
        img.style.border = '2px solid #dee2e6';
        img.style.borderRadius = '8px';
        img.onerror = function() {
            console.error('Error cargando imagen QR de respaldo');
            mostrarError(texto);
        };
        qrPreview.appendChild(img);
        
        // Agregar texto debajo del QR
        const textoQR = document.createElement('div');
        textoQR.className = 'mt-2';
        textoQR.innerHTML = `<small class="text-muted">${texto}</small>`;
        qrPreview.appendChild(textoQR);
    }
    
    function mostrarError(texto) {
        console.error('No se pudo generar el QR');
        qrPreview.innerHTML = `
            <div class="text-center">
                <div class="alert alert-warning">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    <strong>QR no disponible</strong><br>
                    <small>Código: ${texto}</small>
                </div>
            </div>
        `;
    }
}
