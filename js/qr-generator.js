/**
 * Generador de Códigos QR para Motorcycle Inventory Demo
 * Utiliza la librería qrcode para generar códigos QR
 */

class QRGenerator {
    constructor() {
        this.defaultOptions = {
            width: 256,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            },
            margin: 2,
            errorCorrectionLevel: 'M'
        };
    }

    /**
     * Genera un código QR en un elemento HTML
     * @param {string} text - Texto o URL para el código QR
     * @param {HTMLElement} element - Elemento donde se mostrará el QR
     * @param {Object} options - Opciones personalizadas
     */
    async generateQR(text, element, options = {}) {
        try {
            const finalOptions = { ...this.defaultOptions, ...options };
            
            // Limpiar el elemento
            element.innerHTML = '';
            
            // Generar el código QR
            await QRCode.toCanvas(element, text, finalOptions);
            
            return true;
        } catch (error) {
            console.error('Error generando código QR:', error);
            throw error;
        }
    }

    /**
     * Genera un código QR como imagen base64
     * @param {string} text - Texto o URL para el código QR
     * @param {Object} options - Opciones personalizadas
     * @returns {Promise<string>} - Imagen en formato base64
     */
    async generateQRAsDataURL(text, options = {}) {
        try {
            const finalOptions = { ...this.defaultOptions, ...options };
            return await QRCode.toDataURL(text, finalOptions);
        } catch (error) {
            console.error('Error generando código QR como data URL:', error);
            throw error;
        }
    }

    /**
     * Genera un código QR para una motocicleta
     * @param {Object} motorcycle - Objeto con información de la motocicleta
     * @param {HTMLElement} element - Elemento donde se mostrará el QR
     */
    async generateMotorcycleQR(motorcycle, element) {
        const qrData = {
            id: motorcycle.id,
            marca: motorcycle.marca,
            modelo: motorcycle.modelo,
            año: motorcycle.año,
            precio: motorcycle.precio,
            fecha: new Date().toISOString()
        };
        
        const qrText = JSON.stringify(qrData);
        await this.generateQR(qrText, element, { width: 200 });
    }

    /**
     * Genera un código QR para información de contacto
     * @param {Object} contact - Información de contacto
     * @param {HTMLElement} element - Elemento donde se mostrará el QR
     */
    async generateContactQR(contact, element) {
        const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${contact.nombre}
ORG:${contact.empresa || ''}
TEL:${contact.telefono || ''}
EMAIL:${contact.email || ''}
ADR:${contact.direccion || ''}
END:VCARD`;
        
        await this.generateQR(vcard, element, { width: 200 });
    }

    /**
     * Genera un código QR para WiFi
     * @param {Object} wifi - Información de WiFi
     * @param {HTMLElement} element - Elemento donde se mostrará el QR
     */
    async generateWiFiQR(wifi, element) {
        const wifiString = `WIFI:S:${wifi.ssid};T:${wifi.type || 'WPA'};P:${wifi.password || ''};;`;
        await this.generateQR(wifiString, element, { width: 200 });
    }

    /**
     * Descarga el código QR generado
     * @param {HTMLElement} element - Elemento que contiene el canvas del QR
     * @param {string} filename - Nombre del archivo
     */
    downloadQR(element, filename = 'codigo-qr.png') {
        const canvas = element.querySelector('canvas');
        if (canvas) {
            const link = document.createElement('a');
            link.download = filename;
            link.href = canvas.toDataURL();
            link.click();
        }
    }

    /**
     * Crea un botón para generar QR
     * @param {string} text - Texto para el QR
     * @param {Object} options - Opciones del botón
     * @returns {HTMLButtonElement} - Botón generado
     */
    createQRButton(text, options = {}) {
        const button = document.createElement('button');
        button.textContent = options.text || 'Generar QR';
        button.className = options.className || 'btn btn-primary';
        button.onclick = () => this.showQRModal(text, options);
        return button;
    }

    /**
     * Muestra un modal con el código QR
     * @param {string} text - Texto para el QR
     * @param {Object} options - Opciones del modal
     */
    async showQRModal(text, options = {}) {
        // Crear modal
        const modal = document.createElement('div');
        modal.className = 'qr-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        `;

        const modalContent = document.createElement('div');
        modalContent.className = 'qr-modal-content';
        modalContent.style.cssText = `
            background: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            max-width: 400px;
            width: 90%;
        `;

        const title = document.createElement('h3');
        title.textContent = options.title || 'Código QR Generado';

        const qrContainer = document.createElement('div');
        qrContainer.id = 'qr-modal-container';

        const downloadBtn = document.createElement('button');
        downloadBtn.textContent = 'Descargar';
        downloadBtn.className = 'btn btn-success';
        downloadBtn.style.marginTop = '15px';
        downloadBtn.onclick = () => this.downloadQR(qrContainer, options.filename || 'codigo-qr.png');

        const closeBtn = document.createElement('button');
        closeBtn.textContent = 'Cerrar';
        closeBtn.className = 'btn btn-secondary';
        closeBtn.style.marginLeft = '10px';
        closeBtn.onclick = () => document.body.removeChild(modal);

        modalContent.appendChild(title);
        modalContent.appendChild(qrContainer);
        modalContent.appendChild(downloadBtn);
        modalContent.appendChild(closeBtn);
        modal.appendChild(modalContent);

        document.body.appendChild(modal);

        // Generar QR
        try {
            await this.generateQR(text, qrContainer, options.qrOptions);
        } catch (error) {
            qrContainer.innerHTML = '<p style="color: red;">Error generando código QR</p>';
        }
    }
}

// Función de utilidad para crear un botón de QR simple
function createSimpleQRButton(text, targetElement, buttonText = 'Generar QR') {
    const qrGen = new QRGenerator();
    const button = document.createElement('button');
    button.textContent = buttonText;
    button.className = 'btn btn-primary';
    button.onclick = async () => {
        try {
            await qrGen.generateQR(text, targetElement);
        } catch (error) {
            console.error('Error:', error);
        }
    };
    return button;
}

// Exportar para uso en otros archivos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { QRGenerator, createSimpleQRButton };
}
