// Gestor de Fotografías para Reparaciones
class FotoManager {
    constructor() {
        this.stream = null;
        this.currentContainer = null;
        this.fotoTemporal = null;
        this.init();
    }
    
    init() {
        // Inicializar variables globales
        window.fotoManager = this;
    }
    
    // Capturar foto usando la cámara
    async capturarFoto(containerId) {
        this.currentContainer = containerId;
        
        try {
            // Solicitar acceso a la cámara
            this.stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'environment' // Usar cámara trasera si está disponible
                } 
            });
            
            const video = document.getElementById('cameraVideo');
            video.srcObject = this.stream;
            
            // Mostrar modal de cámara
            document.getElementById('cameraModal').style.display = 'flex';
            
        } catch (error) {
            console.error('Error al acceder a la cámara:', error);
            this.showNotification('No se pudo acceder a la cámara. Verifique los permisos.', 'warning');
        }
    }
    
    // Tomar foto desde la cámara
    tomarFoto() {
        const video = document.getElementById('cameraVideo');
        const canvas = document.getElementById('cameraCanvas');
        const context = canvas.getContext('2d');
        
        // Configurar canvas con las dimensiones del video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Dibujar el frame actual del video en el canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convertir a base64
        this.fotoTemporal = canvas.toDataURL('image/jpeg', 0.8);
        
        // Mostrar vista previa
        this.mostrarVistaPrevia(this.fotoTemporal);
        
        // Cerrar cámara
        this.cerrarCamara();
    }
    
    // Seleccionar archivo desde el dispositivo
    seleccionarArchivo(containerId) {
        this.currentContainer = containerId;
        
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.capture = 'environment'; // Preferir cámara trasera en móviles
        
        input.onchange = (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    this.fotoTemporal = e.target.result;
                    this.mostrarVistaPrevia(this.fotoTemporal);
                };
                reader.readAsDataURL(file);
            }
        };
        
        input.click();
    }
    
    // Alias para subirArchivo (compatibilidad)
    subirArchivo(containerId) {
        this.seleccionarArchivo(containerId);
    }
    
    // Mostrar vista previa de la foto
    mostrarVistaPrevia(fotoData) {
        const previewImg = document.getElementById('fotoPreview');
        previewImg.src = fotoData;
        
        const modal = new bootstrap.Modal(document.getElementById('fotoPreviewModal'));
        modal.show();
    }
    
    // Guardar foto en el contenedor
    guardarFoto() {
        if (!this.fotoTemporal || !this.currentContainer) {
            return;
        }
        
        const container = document.getElementById(this.currentContainer);
        const fotoId = 'foto_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        // Crear elemento de foto
        const fotoElement = this.crearElementoFoto(fotoId, this.fotoTemporal);
        container.appendChild(fotoElement);
        
        // Limpiar foto temporal
        this.fotoTemporal = null;
        this.currentContainer = null;
        
        // Cerrar modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('fotoPreviewModal'));
        modal.hide();
        
        this.showNotification('Foto guardada exitosamente', 'success');
    }
    
    // Crear elemento HTML para mostrar la foto
    crearElementoFoto(id, fotoData) {
        const fotoDiv = document.createElement('div');
        fotoDiv.className = 'foto-item';
        fotoDiv.id = id;
        
        fotoDiv.innerHTML = `
            <img src="${fotoData}" alt="Foto de evidencia" onclick="fotoManager.verFoto('${fotoData}')">
            <div class="foto-overlay">
                <button class="btn btn-sm btn-danger" onclick="fotoManager.eliminarFoto('${id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        return fotoDiv;
    }
    
    // Ver foto en tamaño completo
    verFoto(fotoData) {
        const previewImg = document.getElementById('fotoPreview');
        previewImg.src = fotoData;
        
        const modal = new bootstrap.Modal(document.getElementById('fotoPreviewModal'));
        modal.show();
    }
    
    // Eliminar foto
    eliminarFoto(fotoId) {
        if (confirm('¿Está seguro de eliminar esta foto?')) {
            const fotoElement = document.getElementById(fotoId);
            if (fotoElement) {
                fotoElement.remove();
                this.showNotification('Foto eliminada', 'info');
            }
        }
    }
    
    // Cerrar cámara
    cerrarCamara() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        
        document.getElementById('cameraModal').style.display = 'none';
    }
    
    // Obtener todas las fotos de un contenedor
    obtenerFotos(containerId) {
        const container = document.getElementById(containerId);
        const fotos = [];
        
        if (container) {
            const fotoElements = container.querySelectorAll('.foto-item img');
            fotoElements.forEach(img => {
                fotos.push({
                    id: img.parentElement.id,
                    data: img.src,
                    timestamp: new Date().toISOString()
                });
            });
        }
        
        return fotos;
    }
    
    // Cargar fotos en un contenedor (para edición)
    cargarFotos(containerId, fotos) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        container.innerHTML = '';
        
        if (fotos && fotos.length > 0) {
            fotos.forEach(foto => {
                const fotoElement = this.crearElementoFoto(foto.id, foto.data);
                container.appendChild(fotoElement);
            });
        }
    }
    
    // Mostrar notificación
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `alert alert-${type} alert-dismissible fade show notification`;
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }
}

// Funciones globales para compatibilidad con onclick
function capturarFoto(containerId) {
    if (window.fotoManager) {
        window.fotoManager.capturarFoto(containerId);
    }
}

function seleccionarArchivo(containerId) {
    if (window.fotoManager) {
        window.fotoManager.seleccionarArchivo(containerId);
    }
}

function subirArchivo(containerId) {
    if (window.fotoManager) {
        window.fotoManager.seleccionarArchivo(containerId);
    }
}

function tomarFoto() {
    if (window.fotoManager) {
        window.fotoManager.tomarFoto();
    }
}

function guardarFoto() {
    if (window.fotoManager) {
        window.fotoManager.guardarFoto();
    }
}

function cerrarCamara() {
    if (window.fotoManager) {
        window.fotoManager.cerrarCamara();
    }
}

// Inicializar el gestor de fotos cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    new FotoManager();
});
