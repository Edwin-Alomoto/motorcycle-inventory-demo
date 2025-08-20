// Script para poblar las tablas con datos de ejemplo
class DataPopulator {
    constructor() {
        this.init();
    }
    
    init() {
        // Solo poblar si no hay datos existentes
        if (this.hasExistingData()) {
            console.log('Ya existen datos en el sistema. No se poblarán datos de ejemplo.');
            return;
        }
        
        console.log('Iniciando poblamiento de datos de ejemplo...');
        
        this.populateProveedores();
        this.populateProductos();
        this.populateClientes();
        this.populateMecanicos();
        this.populateReparaciones();
        this.populateVentas();
        this.populateNotificaciones();
        
        console.log('Datos de ejemplo poblados exitosamente');
    }
    
    hasExistingData() {
        const productos = JSON.parse(localStorage.getItem('productos') || '[]');
        const proveedores = JSON.parse(localStorage.getItem('proveedores') || '[]');
        const clientes = JSON.parse(localStorage.getItem('clientes') || '[]');
        const mecanicos = JSON.parse(localStorage.getItem('mecanicos') || '[]');
        
        return productos.length > 0 || proveedores.length > 0 || 
               clientes.length > 0 || mecanicos.length > 0;
    }
    
    populateProveedores() {
        const proveedores = [
            {
                id: '1',
                ruc: '1791234567001',
                nombre: 'MotoParts Ecuador S.A.',
                direccion: 'Av. Amazonas 1234, Quito',
                telefono: '02-2345678',
                email: 'ventas@motoparts.ec',
                fechaCreacion: new Date('2024-01-15').toISOString()
            },
            {
                id: '2',
                ruc: '1792345678001',
                nombre: 'Repuestos Honda Guayaquil',
                direccion: 'Calle 9 de Octubre 567, Guayaquil',
                telefono: '04-3456789',
                email: 'info@hondaguayaquil.ec',
                fechaCreacion: new Date('2024-01-20').toISOString()
            },
            {
                id: '3',
                ruc: '1793456789001',
                nombre: 'Yamaha Parts Center',
                direccion: 'Av. 6 de Diciembre 890, Quito',
                telefono: '02-4567890',
                email: 'contacto@yamahaparts.ec',
                fechaCreacion: new Date('2024-02-01').toISOString()
            },
            {
                id: '4',
                ruc: '1794567890001',
                nombre: 'Suzuki Repuestos Cuenca',
                direccion: 'Calle Gran Colombia 234, Cuenca',
                telefono: '07-5678901',
                email: 'ventas@suzukicuenca.ec',
                fechaCreacion: new Date('2024-02-10').toISOString()
            },
            {
                id: '5',
                ruc: '1795678901001',
                nombre: 'Kawasaki Ecuador',
                direccion: 'Av. Los Shyris 456, Quito',
                telefono: '02-6789012',
                email: 'info@kawasaki.ec',
                fechaCreacion: new Date('2024-02-15').toISOString()
            }
        ];
        
        localStorage.setItem('proveedores', JSON.stringify(proveedores));
    }
    
    populateProductos() {
        const productos = [
            {
                id: '1',
                codigo: 'ACE001',
                nombre: 'Aceite de Motor 4T',
                descripcion: 'Aceite sintético para motos 4 tiempos, 1L',
                precio: 12.50,
                descuento: 2.00,
                stock: 45,
                stockMinimo: 10,
                stockMaximo: 100,
                proveedor: 'MotoParts Ecuador S.A.',
                fechaCreacion: new Date('2024-01-15').toISOString()
            },
            {
                id: '2',
                codigo: 'FIL002',
                nombre: 'Filtro de Aceite Honda',
                descripcion: 'Filtro de aceite compatible con motos Honda',
                precio: 8.75,
                descuento: 0,
                stock: 32,
                stockMinimo: 15,
                stockMaximo: 80,
                proveedor: 'Repuestos Honda Guayaquil',
                fechaCreacion: new Date('2024-01-20').toISOString()
            },
            {
                id: '3',
                codigo: 'BAT003',
                nombre: 'Batería 12V 7Ah',
                descripcion: 'Batería de gel para motos, 12V 7Ah',
                precio: 45.00,
                descuento: 5.00,
                stock: 3,
                stockMinimo: 5,
                stockMaximo: 50,
                proveedor: 'Yamaha Parts Center',
                fechaCreacion: new Date('2024-02-01').toISOString()
            },
            {
                id: '4',
                codigo: 'CAD004',
                nombre: 'Cadena de Transmisión',
                descripcion: 'Cadena de transmisión 520, 120 eslabones',
                precio: 28.90,
                descuento: 3.50,
                stock: 25,
                stockMinimo: 8,
                stockMaximo: 60,
                proveedor: 'Suzuki Repuestos Cuenca',
                fechaCreacion: new Date('2024-02-10').toISOString()
            },
            {
                id: '5',
                codigo: 'PAST005',
                nombre: 'Pastillas de Freno',
                descripcion: 'Pastillas de freno delanteras, material orgánico',
                precio: 15.30,
                descuento: 1.50,
                stock: 40,
                stockMinimo: 20,
                stockMaximo: 120,
                proveedor: 'Kawasaki Ecuador',
                fechaCreacion: new Date('2024-02-15').toISOString()
            },
            {
                id: '6',
                codigo: 'BUL006',
                nombre: 'Bujía NGK',
                descripcion: 'Bujía NGK CR8E para motos 4 tiempos',
                precio: 6.50,
                descuento: 0,
                stock: 60,
                stockMinimo: 25,
                stockMaximo: 200,
                proveedor: 'MotoParts Ecuador S.A.',
                fechaCreacion: new Date('2024-02-20').toISOString()
            },
            {
                id: '7',
                codigo: 'LLAN007',
                nombre: 'Llanta Trasera 130/70-17',
                descripcion: 'Llanta trasera Michelin Pilot Street Radial',
                precio: 85.00,
                descuento: 8.50,
                stock: 2,
                stockMinimo: 5,
                stockMaximo: 30,
                proveedor: 'Yamaha Parts Center',
                fechaCreacion: new Date('2024-02-25').toISOString()
            },
            {
                id: '8',
                codigo: 'ESP008',
                nombre: 'Espejo Retrovisor',
                descripcion: 'Espejo retrovisor derecho, universal',
                precio: 22.40,
                descuento: 0,
                stock: 30,
                stockMinimo: 10,
                stockMaximo: 80,
                proveedor: 'Repuestos Honda Guayaquil',
                fechaCreacion: new Date('2024-03-01').toISOString()
            },
            {
                id: '9',
                codigo: 'ACE009',
                nombre: 'Aceite de Transmisión',
                descripcion: 'Aceite para transmisión de motos, 500ml',
                precio: 18.75,
                descuento: 2.25,
                stock: 1,
                stockMinimo: 8,
                stockMaximo: 40,
                proveedor: 'MotoParts Ecuador S.A.',
                fechaCreacion: new Date('2024-03-05').toISOString()
            },
            {
                id: '10',
                codigo: 'FIL010',
                nombre: 'Filtro de Aire',
                descripcion: 'Filtro de aire de alto rendimiento',
                precio: 14.20,
                descuento: 0,
                stock: 4,
                stockMinimo: 6,
                stockMaximo: 50,
                proveedor: 'Repuestos Honda Guayaquil',
                fechaCreacion: new Date('2024-03-10').toISOString()
            }
        ];
        
        localStorage.setItem('productos', JSON.stringify(productos));
    }
    
    populateClientes() {
        const clientes = [
            {
                id: '1',
                cedula: '1723456789',
                nombre: 'Carlos Mendoza',
                direccion: 'Calle Los Pinos 123, Quito',
                telefono: '0987654321',
                email: 'carlos.mendoza@email.com',
                fechaCreacion: new Date('2024-01-10').toISOString()
            },
            {
                id: '2',
                cedula: '0845678901',
                nombre: 'María González',
                direccion: 'Av. Kennedy 456, Guayaquil',
                telefono: '0998765432',
                email: 'maria.gonzalez@email.com',
                fechaCreacion: new Date('2024-01-15').toISOString()
            },
            {
                id: '3',
                cedula: '1756789012',
                nombre: 'Roberto Silva',
                direccion: 'Calle Bolívar 789, Cuenca',
                telefono: '0976543210',
                email: 'roberto.silva@email.com',
                fechaCreacion: new Date('2024-01-20').toISOString()
            },
            {
                id: '4',
                cedula: '1767890123',
                nombre: 'Ana Torres',
                direccion: 'Av. 10 de Agosto 321, Quito',
                telefono: '0965432109',
                email: 'ana.torres@email.com',
                fechaCreacion: new Date('2024-02-01').toISOString()
            },
            {
                id: '5',
                cedula: '0858901234',
                nombre: 'Luis Herrera',
                direccion: 'Calle 9 de Octubre 654, Guayaquil',
                telefono: '0954321098',
                email: 'luis.herrera@email.com',
                fechaCreacion: new Date('2024-02-05').toISOString()
            }
        ];
        
        localStorage.setItem('clientes', JSON.stringify(clientes));
    }
    
    populateMecanicos() {
        const mecanicos = [
            {
                id: '1',
                nombre: 'Juan Pérez',
                especialidad: 'Mecánica General',
                telefono: '0981234567',
                fechaCreacion: new Date('2024-01-01').toISOString()
            },
            {
                id: '2',
                nombre: 'Pedro López',
                especialidad: 'Sistema Eléctrico',
                telefono: '0982345678',
                fechaCreacion: new Date('2024-01-05').toISOString()
            },
            {
                id: '3',
                nombre: 'Miguel Rodríguez',
                especialidad: 'Suspensión y Frenos',
                telefono: '0983456789',
                fechaCreacion: new Date('2024-01-10').toISOString()
            },
            {
                id: '4',
                nombre: 'Diego Castro',
                especialidad: 'Motor y Transmisión',
                telefono: '0984567890',
                fechaCreacion: new Date('2024-01-15').toISOString()
            },
            {
                id: '5',
                nombre: 'Fernando Morales',
                especialidad: 'Diagnóstico Electrónico',
                telefono: '0985678901',
                fechaCreacion: new Date('2024-01-20').toISOString()
            }
        ];
        
        localStorage.setItem('mecanicos', JSON.stringify(mecanicos));
    }
    
    populateReparaciones() {
        const reparaciones = [
            {
                id: '1',
                cliente: 'Carlos Mendoza',
                mecanico: 'Juan Pérez',
                marca: 'Honda',
                modelo: 'CG 150',
                falla: 'No enciende, problemas de batería',
                estado: 'finalizada',
                fecha: new Date('2024-02-15').toISOString(),
                materiales: [
                    { producto: 'Batería 12V 7Ah', cantidad: 1, precio: 45.00 }
                ],
                observaciones: 'Batería reemplazada, sistema funcionando correctamente',
                costoTotal: 45.00
            },
            {
                id: '2',
                cliente: 'María González',
                mecanico: 'Pedro López',
                marca: 'Yamaha',
                modelo: 'YBR 125',
                falla: 'Luces no funcionan, problema eléctrico',
                estado: 'en-proceso',
                fecha: new Date('2024-03-01').toISOString(),
                materiales: [
                    { producto: 'Bujía NGK', cantidad: 1, precio: 6.50 }
                ],
                observaciones: 'Diagnóstico en curso',
                costoTotal: 0
            },
            {
                id: '3',
                cliente: 'Roberto Silva',
                mecanico: 'Miguel Rodríguez',
                marca: 'Suzuki',
                modelo: 'GN 125',
                falla: 'Frenos desgastados, cambio de pastillas',
                estado: 'pendiente',
                fecha: new Date('2024-03-05').toISOString(),
                materiales: [],
                observaciones: 'Esperando confirmación del cliente',
                costoTotal: 0
            },
            {
                id: '4',
                cliente: 'Ana Torres',
                mecanico: 'Diego Castro',
                marca: 'Kawasaki',
                modelo: 'Ninja 250',
                falla: 'Cambio de aceite y filtro',
                estado: 'finalizada',
                fecha: new Date('2024-02-28').toISOString(),
                materiales: [
                    { producto: 'Aceite de Motor 4T', cantidad: 1, precio: 12.50 },
                    { producto: 'Filtro de Aceite Honda', cantidad: 1, precio: 8.75 }
                ],
                observaciones: 'Mantenimiento preventivo completado',
                costoTotal: 21.25
            },
            {
                id: '5',
                cliente: 'Luis Herrera',
                mecanico: 'Fernando Morales',
                marca: 'Honda',
                modelo: 'CBR 600',
                falla: 'Problemas de encendido, diagnóstico electrónico',
                estado: 'espera',
                fecha: new Date('2024-03-10').toISOString(),
                materiales: [],
                observaciones: 'Esperando repuestos del proveedor',
                costoTotal: 0
            }
        ];
        
        localStorage.setItem('reparaciones', JSON.stringify(reparaciones));
    }
    
    populateVentas() {
        const facturas = [
            {
                numero: 'FAC-001-2024',
                cliente: {
                    nombre: 'Carlos Mendoza',
                    cedula: '1723456789',
                    direccion: 'Calle Los Pinos 123, Quito',
                    telefono: '0987654321'
                },
                productos: [
                    { nombre: 'Aceite de Motor 4T', cantidad: 2, precio: 12.50 },
                    { nombre: 'Filtro de Aceite Honda', cantidad: 1, precio: 8.75 }
                ],
                subtotal: 33.75,
                iva: 4.05,
                total: 37.80,
                fecha: new Date('2024-02-20').toISOString(),
                vendedor: 'Vendedor Principal'
            },
            {
                numero: 'FAC-002-2024',
                cliente: {
                    nombre: 'María González',
                    cedula: '0845678901',
                    direccion: 'Av. Kennedy 456, Guayaquil',
                    telefono: '0998765432'
                },
                productos: [
                    { nombre: 'Batería 12V 7Ah', cantidad: 1, precio: 45.00 },
                    { nombre: 'Bujía NGK', cantidad: 2, precio: 6.50 }
                ],
                subtotal: 58.00,
                iva: 6.96,
                total: 64.96,
                fecha: new Date('2024-02-25').toISOString(),
                vendedor: 'Vendedor Principal'
            },
            {
                numero: 'FAC-003-2024',
                cliente: {
                    nombre: 'Roberto Silva',
                    cedula: '1756789012',
                    direccion: 'Calle Bolívar 789, Cuenca',
                    telefono: '0976543210'
                },
                productos: [
                    { nombre: 'Pastillas de Freno', cantidad: 1, precio: 15.30 },
                    { nombre: 'Espejo Retrovisor', cantidad: 1, precio: 22.40 }
                ],
                subtotal: 37.70,
                iva: 4.52,
                total: 42.22,
                fecha: new Date('2024-03-01').toISOString(),
                vendedor: 'Vendedor Principal'
            },
            {
                numero: 'FAC-004-2024',
                cliente: {
                    nombre: 'Ana Torres',
                    cedula: '1767890123',
                    direccion: 'Av. 10 de Agosto 321, Quito',
                    telefono: '0965432109'
                },
                productos: [
                    { nombre: 'Cadena de Transmisión', cantidad: 1, precio: 28.90 },
                    { nombre: 'Llanta Trasera 130/70-17', cantidad: 1, precio: 85.00 }
                ],
                subtotal: 113.90,
                iva: 13.67,
                total: 127.57,
                fecha: new Date('2024-03-05').toISOString(),
                vendedor: 'Vendedor Principal'
            },
            {
                numero: 'FAC-005-2024',
                cliente: {
                    nombre: 'Luis Herrera',
                    cedula: '0858901234',
                    direccion: 'Calle 9 de Octubre 654, Guayaquil',
                    telefono: '0954321098'
                },
                productos: [
                    { nombre: 'Aceite de Motor 4T', cantidad: 1, precio: 12.50 },
                    { nombre: 'Filtro de Aceite Honda', cantidad: 1, precio: 8.75 },
                    { nombre: 'Bujía NGK', cantidad: 1, precio: 6.50 }
                ],
                subtotal: 27.75,
                iva: 3.33,
                total: 31.08,
                fecha: new Date('2024-03-08').toISOString(),
                vendedor: 'Vendedor Principal'
            },
            {
                numero: 'FAC-006-2024',
                cliente: {
                    nombre: 'Carlos Mendoza',
                    cedula: '1723456789',
                    direccion: 'Calle Los Pinos 123, Quito',
                    telefono: '0987654321'
                },
                productos: [
                    { nombre: 'Llanta Trasera 130/70-17', cantidad: 1, precio: 85.00 },
                    { nombre: 'Pastillas de Freno', cantidad: 2, precio: 15.30 }
                ],
                subtotal: 115.60,
                iva: 13.87,
                total: 129.47,
                fecha: new Date('2024-03-10').toISOString(),
                vendedor: 'Vendedor Principal'
            },
            {
                numero: 'FAC-007-2024',
                cliente: {
                    nombre: 'María González',
                    cedula: '0845678901',
                    direccion: 'Av. Kennedy 456, Guayaquil',
                    telefono: '0998765432'
                },
                productos: [
                    { nombre: 'Aceite de Motor 4T', cantidad: 3, precio: 12.50 },
                    { nombre: 'Filtro de Aceite Honda', cantidad: 2, precio: 8.75 },
                    { nombre: 'Bujía NGK', cantidad: 3, precio: 6.50 }
                ],
                subtotal: 67.50,
                iva: 8.10,
                total: 75.60,
                fecha: new Date('2024-03-12').toISOString(),
                vendedor: 'Vendedor Principal'
            },
            {
                numero: 'FAC-008-2024',
                cliente: {
                    nombre: 'Roberto Silva',
                    cedula: '1756789012',
                    direccion: 'Calle Bolívar 789, Cuenca',
                    telefono: '0976543210'
                },
                productos: [
                    { nombre: 'Batería 12V 7Ah', cantidad: 1, precio: 45.00 },
                    { nombre: 'Cadena de Transmisión', cantidad: 1, precio: 28.90 }
                ],
                subtotal: 73.90,
                iva: 8.87,
                total: 82.77,
                fecha: new Date('2024-03-15').toISOString(),
                vendedor: 'Vendedor Principal'
            },
            {
                numero: 'FAC-009-2024',
                cliente: {
                    nombre: 'Ana Torres',
                    cedula: '1767890123',
                    direccion: 'Av. 10 de Agosto 321, Quito',
                    telefono: '0965432109'
                },
                productos: [
                    { nombre: 'Espejo Retrovisor', cantidad: 2, precio: 22.40 },
                    { nombre: 'Bujía NGK', cantidad: 4, precio: 6.50 }
                ],
                subtotal: 72.80,
                iva: 8.74,
                total: 81.54,
                fecha: new Date('2024-03-18').toISOString(),
                vendedor: 'Vendedor Principal'
            },
            {
                numero: 'FAC-010-2024',
                cliente: {
                    nombre: 'Luis Herrera',
                    cedula: '0858901234',
                    direccion: 'Calle 9 de Octubre 654, Guayaquil',
                    telefono: '0954321098'
                },
                productos: [
                    { nombre: 'Aceite de Motor 4T', cantidad: 2, precio: 12.50 },
                    { nombre: 'Filtro de Aceite Honda', cantidad: 1, precio: 8.75 },
                    { nombre: 'Pastillas de Freno', cantidad: 1, precio: 15.30 }
                ],
                subtotal: 49.05,
                iva: 5.89,
                total: 54.94,
                fecha: new Date('2024-03-20').toISOString(),
                vendedor: 'Vendedor Principal'
            }
        ];
        
        localStorage.setItem('facturas', JSON.stringify(facturas));
    }
    
    populateNotificaciones() {
        const notificaciones = [
            {
                id: '1',
                titulo: 'Stock Crítico - Batería 12V 7Ah',
                mensaje: 'El producto "Batería 12V 7Ah" tiene stock crítico (3 unidades, mínimo: 5)',
                tipo: 'danger',
                leida: false,
                fecha: new Date('2024-03-15').toISOString()
            },
            {
                id: '2',
                titulo: 'Stock Crítico - Llanta Trasera 130/70-17',
                mensaje: 'El producto "Llanta Trasera 130/70-17" tiene stock crítico (2 unidades, mínimo: 5)',
                tipo: 'danger',
                leida: false,
                fecha: new Date('2024-03-16').toISOString()
            },
            {
                id: '3',
                titulo: 'Stock Crítico - Aceite de Transmisión',
                mensaje: 'El producto "Aceite de Transmisión" tiene stock crítico (1 unidad, mínimo: 8)',
                tipo: 'danger',
                leida: false,
                fecha: new Date('2024-03-17').toISOString()
            },
            {
                id: '4',
                titulo: 'Stock Bajo - Filtro de Aire',
                mensaje: 'El producto "Filtro de Aire" tiene stock bajo (4 unidades, mínimo: 6)',
                tipo: 'warning',
                leida: false,
                fecha: new Date('2024-03-18').toISOString()
            },
            {
                id: '5',
                titulo: 'Reparación Pendiente',
                mensaje: 'La reparación #3 de Roberto Silva está pendiente de confirmación',
                tipo: 'warning',
                leida: false,
                fecha: new Date('2024-03-05').toISOString()
            }
        ];
        
        localStorage.setItem('notificaciones', JSON.stringify(notificaciones));
    }
    

}

// Ejecutar el poblamiento de datos solo si estamos en index.html
if (window.location.pathname.includes('index.html') || window.location.pathname.endsWith('/')) {
    document.addEventListener('DOMContentLoaded', () => {
        new DataPopulator();
    });
}
