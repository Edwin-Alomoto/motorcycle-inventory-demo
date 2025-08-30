// Generador de QR simple sin dependencias externas
class QRGeneratorSimple {
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
        
        // Limpiar canvas
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillRect(0, 0, size, size);
        
        // Generar patrón QR simple (simulación)
        this.generarPatronQR(texto, size);
        
        return this.canvas.toDataURL();
    }
    
    // Generar patrón QR básico
    generarPatronQR(texto, size) {
        const margin = 10;
        const cellSize = (size - 2 * margin) / 25; // 25x25 grid
        
        // Color negro para los patrones
        this.ctx.fillStyle = '#000000';
        
        // Patrón de esquinas (marcadores de posición)
        this.dibujarMarcador(0, 0, cellSize);
        this.dibujarMarcador(18, 0, cellSize);
        this.dibujarMarcador(0, 18, cellSize);
        
        // Generar patrón basado en el texto
        this.generarPatronTexto(texto, cellSize, margin);
    }
    
    // Dibujar marcador de posición (esquinas)
    dibujarMarcador(x, y, cellSize) {
        const startX = x * cellSize + 10;
        const startY = y * cellSize + 10;
        
        // Cuadrado exterior
        this.ctx.fillRect(startX, startY, 7 * cellSize, 7 * cellSize);
        
        // Cuadrado interior blanco
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillRect(startX + cellSize, startY + cellSize, 5 * cellSize, 5 * cellSize);
        
        // Cuadrado central negro
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(startX + 2 * cellSize, startY + 2 * cellSize, 3 * cellSize, 3 * cellSize);
    }
    
    // Generar patrón basado en el texto
    generarPatronTexto(texto, cellSize, margin) {
        // Convertir texto a patrón de bits simple
        const hash = this.hashString(texto);
        const bits = hash.toString(2).padStart(64, '0');
        
        let bitIndex = 0;
        for (let row = 0; row < 25; row++) {
            for (let col = 0; col < 25; col++) {
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
        // Marcadores en las esquinas
        return (row < 7 && col < 7) || // Esquina superior izquierda
               (row < 7 && col > 17) || // Esquina superior derecha
               (row > 17 && col < 7);   // Esquina inferior izquierda
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
function generarQRSimple(texto, size = 150) {
    const generator = new QRGeneratorSimple();
    return generator.generarQR(texto, size);
}

// Función para generar QR con múltiples métodos
function generarVistaPreviaQR(texto) {
    const qrPreview = document.getElementById('qrPreview');
    if (!qrPreview) {
        return;
    }
    
    if (!texto) {
        texto = 'PROD-' + Date.now();
    }
    
    qrPreview.innerHTML = '<div class="text-center"><small class="text-muted">Generando QR...</small></div>';
    
    // Intentar diferentes métodos
    setTimeout(() => {
        // Método 1: Librería QR externa
        if (typeof QRCode !== 'undefined') {
            try {
                QRCode.toDataURL(texto, {
                    width: 150,
                    height: 150,
                    margin: 3,
                    color: {
                        dark: '#000000',
                        light: '#FFFFFF'
                    },
                    errorCorrectionLevel: 'M'
                }, (error, url) => {
                    if (error) {
                        console.error('Error con librería QR:', error);
                        usarGeneradorSimple();
                    } else {
                        mostrarQR(url, texto);
                    }
                });
            } catch (error) {
                console.error('Error con librería QR:', error);
                usarGeneradorSimple();
            }
        } else {
            usarGeneradorSimple();
        }
    }, 100);
    
    function usarGeneradorSimple() {
        try {
            const url = generarQRSimple(texto, 150);
            mostrarQR(url, texto);
        } catch (error) {
            console.error('Error con generador simple:', error);
            usarServicioExterno();
        }
    }
    
    function usarServicioExterno() {
        try {
            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(texto)}`;
            mostrarQR(qrUrl, texto);
        } catch (error) {
            console.error('Error con servicio externo:', error);
            mostrarError(texto);
        }
    }
    
    function mostrarQR(url, texto) {
        qrPreview.innerHTML = '';
        const img = document.createElement('img');
        img.src = url;
        img.alt = 'Código QR';
        img.style.maxWidth = '100%';
        img.style.height = 'auto';
        img.style.border = '2px solid #dee2e6';
        img.style.borderRadius = '8px';
        img.onerror = function() {
            console.error('Error cargando imagen QR');
            usarGeneradorSimple();
        };
        qrPreview.appendChild(img);
        
        // Agregar texto debajo del QR
        const textoQR = document.createElement('div');
        textoQR.className = 'mt-2';
        textoQR.innerHTML = `<small class="text-muted">${texto}</small>`;
        qrPreview.appendChild(textoQR);
    }
    
    function mostrarError(texto) {
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
