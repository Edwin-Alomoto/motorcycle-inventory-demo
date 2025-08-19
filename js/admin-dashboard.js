// Dashboard del Administrador
class AdminDashboard {
    constructor() {
        // Verificar autenticación sin crear nueva instancia
        const session = localStorage.getItem('session');
        this.session = session ? JSON.parse(session) : null;
        
        if (!this.session || this.session.role !== 'admin') {
            window.location.href = 'index.html';
            return;
        }
        
        this.init();
    }
    
    init() {
        this.setupUserInfo();
        this.setupNavigation();
        this.loadDashboardData();
        this.setupEventListeners();
        this.loadAllData();
        this.setupClienteSearch();
        this.setupNotificaciones();
    }
    
    setupUserInfo() {
        document.getElementById('userName').textContent = this.session.name;
        document.getElementById('userAvatar').textContent = this.session.name.charAt(0);
    }
    
    setupNavigation() {
        const navLinks = document.querySelectorAll('.sidebar .nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.getAttribute('data-section');
                this.showSection(section);
                
                // Actualizar navegación activa
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            });
        });
    }
    
    showSection(sectionName) {
        // Ocultar todas las secciones
        const sections = document.querySelectorAll('.content-section');
        sections.forEach(section => section.style.display = 'none');
        
        // Mostrar la sección seleccionada
        const targetSection = document.getElementById(`${sectionName}-section`);
        if (targetSection) {
            targetSection.style.display = 'block';
        }
        
        // Actualizar título de la página
        const titles = {
            'dashboard': 'Dashboard',
            'productos': 'Gestión de Productos',
            'proveedores': 'Gestión de Proveedores',
            'clientes': 'Gestión de Clientes',
            'reparaciones': 'Gestión de Reparaciones',
            'ventas': 'Historial de Ventas',
            'mecanicos': 'Gestión de Mecánicos',
            'carga-masiva': 'Carga Masiva',
            'reportes': 'Reportes',
            'notificaciones': 'Notificaciones'
        };
        
        document.getElementById('pageTitle').textContent = titles[sectionName] || 'Dashboard';
        
        // Cargar datos específicos de la sección
        this.loadSectionData(sectionName);
    }
    
    showTab(tabName) {
        console.log('showTab llamado con:', tabName);
        
        try {
            // Ocultar todas las pestañas
            const tabContents = document.querySelectorAll('.tab-content');
            console.log('Pestañas encontradas:', tabContents.length);
            tabContents.forEach(tab => {
                tab.classList.remove('active');
                tab.style.display = 'none';
                console.log('Pestaña:', tab.id, 'ocultada');
            });
            
            // Remover clase active de todos los botones
            const tabButtons = document.querySelectorAll('.tab-btn');
            tabButtons.forEach(btn => btn.classList.remove('active'));
            
            // Mostrar la pestaña seleccionada
            const targetTab = document.getElementById(`tab-${tabName}`);
            console.log('Pestaña objetivo:', targetTab);
            if (targetTab) {
                targetTab.classList.add('active');
                targetTab.style.display = 'block';
                console.log('Pestaña activada:', targetTab.id);
            } else {
                console.error('No se encontró la pestaña:', `tab-${tabName}`);
            }
            
            // Activar el botón correspondiente
            const activeButton = document.querySelector(`[onclick="showTab('${tabName}')"]`);
            if (activeButton) {
                activeButton.classList.add('active');
                console.log('Botón activado:', activeButton.textContent.trim());
            }
        } catch (error) {
            console.error('Error en showTab:', error);
        }
    }
    
    loadSectionData(sectionName) {
        switch(sectionName) {
            case 'productos':
                this.loadProductos();
                break;
            case 'proveedores':
                this.loadProveedores();
                break;
            case 'clientes':
                this.loadClientes();
                break;
            case 'reparaciones':
                this.loadReparaciones();
                break;
            case 'ventas':
                this.loadVentas();
                break;
            case 'mecanicos':
                this.loadMecanicos();
                break;
            case 'notificaciones':
                this.loadNotificaciones();
                break;
            case 'carga-masiva':
                this.setupComprasListeners();
                this.loadHistorialCompras();
                break;
        }
    }
    
    setupEventListeners() {
        // Búsqueda de productos
        const searchProductos = document.getElementById('searchProductos');
        if (searchProductos) {
            searchProductos.addEventListener('input', (e) => {
                this.buscarProductos(e.target.value);
            });
        }
        
        // Evento para resetear modal de productos cuando se cierre
        const productoModal = document.getElementById('productoModal');
        if (productoModal) {
            productoModal.addEventListener('hidden.bs.modal', () => {
                this.resetearModalProducto();
            });
        }
        
        // Formularios
        this.setupFormListeners();
    }
    
    setupFormListeners() {
        // Carga masiva
        const cargaProductosForm = document.getElementById('cargaProductosForm');
        if (cargaProductosForm) {
            cargaProductosForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.cargarProductosMasivo();
            });
        }
        
        const cargaProveedoresForm = document.getElementById('cargaProveedoresForm');
        if (cargaProveedoresForm) {
            cargaProveedoresForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.cargarProveedoresMasivo();
            });
        }
        
        // Reportes
        const reporteVentasForm = document.getElementById('reporteVentasForm');
        if (reporteVentasForm) {
            reporteVentasForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.generarReporteVentas();
            });
        }
        
        const reporteInventarioForm = document.getElementById('reporteInventarioForm');
        if (reporteInventarioForm) {
            reporteInventarioForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.generarReporteInventario();
            });
        }
        
        const reporteReparacionesForm = document.getElementById('reporteReparacionesForm');
        if (reporteReparacionesForm) {
            reporteReparacionesForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.generarReporteReparaciones();
            });
        }
    }
    
    loadAllData() {
        this.loadProductos();
        this.loadProveedores();
        this.loadClientes();
        this.loadReparaciones();
        this.loadMecanicos();
        this.loadNotificaciones();
    }
    
    loadDashboardData() {
        // Cargar estadísticas del dashboard
        const productos = this.getProductos();
        const reparaciones = this.getReparaciones();
        const ventas = this.getVentas();
        
        document.getElementById('totalProductos').textContent = productos.length;
        document.getElementById('reparacionesPendientes').textContent = 
            reparaciones.filter(r => r.estado === 'pendiente').length;
        document.getElementById('ventasMes').textContent = 
            `$${this.calcularVentasMes(ventas).toFixed(2)}`;
        document.getElementById('stockBajo').textContent = 
            productos.filter(p => p.stock < 10).length;
        
        // Cargar reparaciones recientes
        this.loadReparacionesRecientes();
        this.loadVentasRecientes();
    }
    
    // Gestión de Productos
    loadProductos() {
        const productos = this.getProductos();
        const tbody = document.getElementById('productosTable');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        productos.forEach(producto => {
            // Determinar el estado del stock
            const stockMinimo = producto.stockMinimo || 5; // Valor por defecto si no existe
            const stockMaximo = producto.stockMaximo || 100; // Valor por defecto si no existe
            let estadoStock = 'bg-success';
            let estadoTexto = 'Normal';
            
            if (producto.stock <= stockMinimo) {
                estadoStock = 'bg-danger';
                estadoTexto = 'Crítico';
            } else if (producto.stock <= stockMinimo * 1.5) {
                estadoStock = 'bg-warning';
                estadoTexto = 'Bajo';
            } else if (producto.stock >= stockMaximo * 0.9) {
                estadoStock = 'bg-info';
                estadoTexto = 'Alto';
            }
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${producto.codigo}</td>
                <td>${producto.nombre}</td>
                <td>${producto.descripcion}</td>
                <td>$${producto.precio}</td>
                <td>${producto.descuento ? `$${producto.descuento}` : '-'}</td>
                <td>
                    <span class="badge ${producto.stock <= stockMinimo ? 'bg-danger' : 'bg-success'}">
                        ${producto.stock}
                    </span>
                </td>
                <td>
                    <span class="badge ${estadoStock}">
                        ${estadoTexto}
                    </span>
                </td>
                <td>${producto.proveedor}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="adminDashboard.editarProducto('${producto.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="adminDashboard.eliminarProducto('${producto.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
        
        // Actualizar select de proveedores en el modal
        this.actualizarSelectProveedores();
    }
    
    buscarProductos(query) {
        const productos = this.getProductos();
        const filtrados = productos.filter(p => 
            p.nombre.toLowerCase().includes(query.toLowerCase()) ||
            p.codigo.toLowerCase().includes(query.toLowerCase())
        );
        
        const tbody = document.getElementById('productosTable');
        tbody.innerHTML = '';
        filtrados.forEach(producto => {
            // Determinar el estado del stock
            const stockMinimo = producto.stockMinimo || 5; // Valor por defecto si no existe
            const stockMaximo = producto.stockMaximo || 100; // Valor por defecto si no existe
            let estadoStock = 'bg-success';
            let estadoTexto = 'Normal';
            
            if (producto.stock <= stockMinimo) {
                estadoStock = 'bg-danger';
                estadoTexto = 'Crítico';
            } else if (producto.stock <= stockMinimo * 1.5) {
                estadoStock = 'bg-warning';
                estadoTexto = 'Bajo';
            } else if (producto.stock >= stockMaximo * 0.9) {
                estadoStock = 'bg-info';
                estadoTexto = 'Alto';
            }
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${producto.codigo}</td>
                <td>${producto.nombre}</td>
                <td>${producto.descripcion}</td>
                <td>$${producto.precio}</td>
                <td>${producto.descuento ? `$${producto.descuento}` : '-'}</td>
                <td>
                    <span class="badge ${producto.stock <= stockMinimo ? 'bg-danger' : 'bg-success'}">
                        ${producto.stock}
                    </span>
                </td>
                <td>
                    <span class="badge ${estadoStock}">
                        ${estadoTexto}
                    </span>
                </td>
                <td>${producto.proveedor}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="adminDashboard.editarProducto('${producto.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="adminDashboard.eliminarProducto('${producto.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }
    
    guardarProducto() {
        const codigo = document.getElementById('codigoProducto').value;
        const nombre = document.getElementById('nombreProducto').value;
        const descripcion = document.getElementById('descripcionProducto').value;
        const precio = parseFloat(document.getElementById('precioProducto').value);
        const descuento = parseFloat(document.getElementById('descuentoProducto').value) || 0;
        const stock = parseInt(document.getElementById('stockProducto').value);
        const stockMinimo = parseInt(document.getElementById('stockMinimoProducto').value);
        const stockMaximo = parseInt(document.getElementById('stockMaximoProducto').value);
        const proveedor = document.getElementById('proveedorProducto').value;
        
        if (!codigo || !nombre || !precio || !stock || !stockMinimo || !stockMaximo || !proveedor) {
            this.showNotification('Por favor complete todos los campos requeridos', 'warning');
            return;
        }
        
        // Verificar que el código no esté duplicado
        const productos = this.getProductos();
        if (productos.find(p => p.codigo === codigo)) {
            this.showNotification('El código de producto ya existe', 'danger');
            return;
        }
        
        const producto = {
            id: Date.now().toString(),
            codigo,
            nombre,
            descripcion,
            precio,
            descuento,
            stock,
            stockMinimo,
            stockMaximo,
            proveedor,
            fechaCreacion: new Date().toISOString()
        };
        
        productos.push(producto);
        localStorage.setItem('productos', JSON.stringify(productos));
        
        this.showNotification('Producto guardado exitosamente', 'success');
        this.cerrarModal('productoModal');
        this.loadProductos();
        this.loadDashboardData();
    }
    
    // Gestión de Proveedores
    loadProveedores() {
        const proveedores = this.getProveedores();
        const tbody = document.getElementById('proveedoresTable');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        proveedores.forEach(proveedor => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${proveedor.ruc}</td>
                <td>${proveedor.nombre}</td>
                <td>${proveedor.direccion}</td>
                <td>${proveedor.telefono}</td>
                <td>${proveedor.email}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="adminDashboard.editarProveedor('${proveedor.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="adminDashboard.eliminarProveedor('${proveedor.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
        
        this.actualizarSelectProveedores();
    }
    
    guardarProveedor() {
        const ruc = document.getElementById('rucProveedor').value;
        const nombre = document.getElementById('nombreProveedor').value;
        const direccion = document.getElementById('direccionProveedor').value;
        const telefono = document.getElementById('telefonoProveedor').value;
        const email = document.getElementById('emailProveedor').value;
        
        if (!ruc || !nombre || !direccion || !telefono || !email) {
            this.showNotification('Por favor complete todos los campos', 'warning');
            return;
        }
        
        // Verificar que el RUC no esté duplicado
        const proveedores = this.getProveedores();
        if (proveedores.find(p => p.ruc === ruc)) {
            this.showNotification('El RUC ya está registrado', 'danger');
            return;
        }
        
        const proveedor = {
            id: Date.now().toString(),
            ruc,
            nombre,
            direccion,
            telefono,
            email,
            fechaCreacion: new Date().toISOString()
        };
        
        proveedores.push(proveedor);
        localStorage.setItem('proveedores', JSON.stringify(proveedores));
        
        this.showNotification('Proveedor guardado exitosamente', 'success');
        this.cerrarModal('proveedorModal');
        this.loadProveedores();
    }
    
    actualizarSelectProveedores() {
        const proveedores = this.getProveedores();
        const select = document.getElementById('proveedorProducto');
        if (!select) return;
        
        select.innerHTML = '<option value="">Seleccionar proveedor</option>';
        proveedores.forEach(proveedor => {
            const option = document.createElement('option');
            option.value = proveedor.nombre;
            option.textContent = proveedor.nombre;
            select.appendChild(option);
        });
    }
    
    // Gestión de Clientes
    loadClientes() {
        const clientes = this.getClientes();
        const tbody = document.getElementById('clientesTable');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        clientes.forEach(cliente => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${cliente.cedula}</td>
                <td>${cliente.nombre}</td>
                <td>${cliente.direccion}</td>
                <td>${cliente.telefono}</td>
                <td>${cliente.email}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="adminDashboard.editarCliente('${cliente.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="adminDashboard.eliminarCliente('${cliente.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }
    
    guardarCliente() {
        const cedula = document.getElementById('cedulaCliente').value;
        const nombre = document.getElementById('nombreCliente').value;
        const direccion = document.getElementById('direccionCliente').value;
        const telefono = document.getElementById('telefonoCliente').value;
        const email = document.getElementById('emailCliente').value;
        
        if (!cedula || !nombre || !direccion || !telefono || !email) {
            this.showNotification('Por favor complete todos los campos', 'warning');
            return;
        }
        
        // Verificar que la cédula no esté duplicada
        const clientes = this.getClientes();
        if (clientes.find(c => c.cedula === cedula)) {
            this.showNotification('La cédula/RUC ya está registrado', 'danger');
            return;
        }
        
        const cliente = {
            id: Date.now().toString(),
            cedula,
            nombre,
            direccion,
            telefono,
            email,
            fechaCreacion: new Date().toISOString()
        };
        
        clientes.push(cliente);
        localStorage.setItem('clientes', JSON.stringify(clientes));
        
        this.showNotification('Cliente guardado exitosamente', 'success');
        this.cerrarModal('clienteModal');
        this.loadClientes();
    }
    
    // Gestión de Reparaciones
    loadReparaciones() {
        const reparaciones = this.getReparaciones();
        const tbody = document.getElementById('reparacionesTable');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        reparaciones.forEach(reparacion => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${reparacion.id}</td>
                <td>${reparacion.cliente}</td>
                <td>${reparacion.marca} ${reparacion.modelo}</td>
                <td>${reparacion.falla}</td>
                <td>
                    <span class="badge badge-${this.getEstadoClass(reparacion.estado)}">
                        ${reparacion.estado}
                    </span>
                </td>
                <td>${reparacion.mecanico}</td>
                <td>${new Date(reparacion.fecha).toLocaleDateString()}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="adminDashboard.editarReparacion('${reparacion.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-success" onclick="adminDashboard.finalizarReparacion('${reparacion.id}')">
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-info" onclick="adminDashboard.verFotosReparacion('${reparacion.id}')" title="Ver fotos">
                        <i class="fas fa-camera"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }
    
    loadReparacionesRecientes() {
        const reparaciones = this.getReparaciones().slice(-5);
        const tbody = document.getElementById('reparacionesRecientes');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        reparaciones.forEach(reparacion => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${reparacion.cliente}</td>
                <td>${reparacion.marca} ${reparacion.modelo}</td>
                <td>
                    <span class="badge badge-${this.getEstadoClass(reparacion.estado)}">
                        ${reparacion.estado}
                    </span>
                </td>
                <td>${reparacion.mecanico}</td>
                <td>${new Date(reparacion.fecha).toLocaleDateString()}</td>
            `;
            tbody.appendChild(row);
        });
    }
    
    guardarReparacion() {
        const cliente = document.getElementById('clienteReparacion').value;
        const mecanico = document.getElementById('mecanicoReparacion').value;
        const marca = document.getElementById('marcaMoto').value;
        const modelo = document.getElementById('modeloMoto').value;
        const falla = document.getElementById('fallaReparacion').value;
        
        if (!cliente || !mecanico || !marca || !modelo || !falla) {
            this.showNotification('Por favor complete todos los campos', 'warning');
            return;
        }
        
        // Obtener fotografías de evidencia
        const fotosIniciales = window.fotoManager ? window.fotoManager.obtenerFotos('fotosIniciales') : [];
        
        const reparacion = {
            id: Date.now().toString(),
            cliente,
            mecanico,
            marca,
            modelo,
            falla,
            estado: 'pendiente',
            fecha: new Date().toISOString(),
            materiales: [],
            observaciones: '',
            fotosIniciales: fotosIniciales,
            fotosFinales: []
        };
        
        const reparaciones = this.getReparaciones();
        reparaciones.push(reparacion);
        localStorage.setItem('reparaciones', JSON.stringify(reparaciones));
        
        this.showNotification('Reparación registrada exitosamente', 'success');
        this.cerrarModal('reparacionModal');
        this.loadReparaciones();
        this.loadDashboardData();
        
        // Crear notificación
        this.crearNotificacion('Nueva reparación registrada', `Se ha registrado una nueva reparación para ${cliente}`, 'info');
    }
    
    // Gestión de Mecánicos
    loadMecanicos() {
        const mecanicos = this.getMecanicos();
        const tbody = document.getElementById('mecanicosTable');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        mecanicos.forEach(mecanico => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${mecanico.id}</td>
                <td>${mecanico.nombre}</td>
                <td>${mecanico.especialidad}</td>
                <td>${mecanico.telefono}</td>
                <td>
                    <span class="badge bg-success">Activo</span>
                </td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="adminDashboard.editarMecanico('${mecanico.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="adminDashboard.eliminarMecanico('${mecanico.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
        
        this.actualizarSelectMecanicos();
    }
    
    guardarMecanico() {
        const nombre = document.getElementById('nombreMecanico').value;
        const especialidad = document.getElementById('especialidadMecanico').value;
        const telefono = document.getElementById('telefonoMecanico').value;
        
        if (!nombre || !especialidad || !telefono) {
            this.showNotification('Por favor complete todos los campos', 'warning');
            return;
        }
        
        const mecanico = {
            id: Date.now().toString(),
            nombre,
            especialidad,
            telefono,
            fechaCreacion: new Date().toISOString()
        };
        
        const mecanicos = this.getMecanicos();
        mecanicos.push(mecanico);
        localStorage.setItem('mecanicos', JSON.stringify(mecanicos));
        
        this.showNotification('Mecánico guardado exitosamente', 'success');
        this.cerrarModal('mecanicoModal');
        this.loadMecanicos();
    }
    
    actualizarSelectMecanicos() {
        const mecanicos = this.getMecanicos();
        const select = document.getElementById('mecanicoReparacion');
        if (!select) return;
        
        select.innerHTML = '<option value="">Seleccionar mecánico</option>';
        mecanicos.forEach(mecanico => {
            const option = document.createElement('option');
            option.value = mecanico.nombre;
            option.textContent = mecanico.nombre;
            select.appendChild(option);
        });
    }
    
    // Carga Masiva
    cargarProductosMasivo() {
        const fileInput = document.getElementById('archivoProductosMasivo');
        const file = fileInput.files[0];
        
        if (!file) {
            this.showNotification('Por favor seleccione un archivo', 'warning');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const csv = e.target.result;
                const lines = csv.split('\n');
                const headers = lines[0].split(',');
                
                let productosCargados = 0;
                let productosDuplicados = 0;
                
                for (let i = 1; i < lines.length; i++) {
                    if (lines[i].trim()) {
                        const values = lines[i].split(',');
                        const codigo = values[0]?.trim();
                        
                        // Verificar si el código ya existe
                        const productos = this.getProductos();
                        const productoExistente = productos.find(p => p.codigo === codigo);
                        
                        if (productoExistente) {
                            productosDuplicados++;
                            continue; // Saltar productos duplicados
                        }
                        
                        const producto = {
                            id: Date.now().toString() + i,
                            codigo: codigo,
                            nombre: values[1]?.trim(),
                            descripcion: values[2]?.trim(),
                            precio: parseFloat(values[3]) || 0,
                            descuento: 0, // Valor por defecto
                            stock: parseInt(values[4]) || 0,
                            stockMinimo: 5, // Valor por defecto
                            stockMaximo: 100, // Valor por defecto
                            proveedor: values[5]?.trim(),
                            fechaCreacion: new Date().toISOString()
                        };
                        
                        productos.push(producto);
                        localStorage.setItem('productos', JSON.stringify(productos));
                        productosCargados++;
                    }
                }
                
                // Cerrar modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('cargaMasivaProductosModal'));
                modal.hide();
                
                // Mostrar notificación con resultados
                let mensaje = `${productosCargados} productos cargados exitosamente`;
                if (productosDuplicados > 0) {
                    mensaje += `. ${productosDuplicados} productos duplicados fueron omitidos`;
                }
                
                this.showNotification(mensaje, 'success');
                this.loadProductos();
                this.loadDashboardData();
                
                // Limpiar formulario
                document.getElementById('cargaMasivaProductosForm').reset();
                
            } catch (error) {
                this.showNotification('Error al procesar el archivo: ' + error.message, 'danger');
            }
        };
        reader.readAsText(file);
    }
    
    cargarProveedoresMasivo() {
        const fileInput = document.getElementById('archivoProveedoresMasivo');
        const file = fileInput.files[0];
        
        if (!file) {
            this.showNotification('Por favor seleccione un archivo', 'warning');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const csv = e.target.result;
                const lines = csv.split('\n');
                
                let proveedoresCargados = 0;
                let proveedoresDuplicados = 0;
                
                for (let i = 1; i < lines.length; i++) {
                    if (lines[i].trim()) {
                        const values = lines[i].split(',');
                        const ruc = values[0]?.trim();
                        
                        // Verificar si el RUC ya existe
                        const proveedores = this.getProveedores();
                        const proveedorExistente = proveedores.find(p => p.ruc === ruc);
                        
                        if (proveedorExistente) {
                            proveedoresDuplicados++;
                            continue; // Saltar proveedores duplicados
                        }
                        
                        const proveedor = {
                            id: Date.now().toString() + i,
                            ruc: ruc,
                            nombre: values[1]?.trim(),
                            direccion: values[2]?.trim(),
                            telefono: values[3]?.trim(),
                            email: values[4]?.trim(),
                            fechaCreacion: new Date().toISOString()
                        };
                        
                        proveedores.push(proveedor);
                        localStorage.setItem('proveedores', JSON.stringify(proveedores));
                        proveedoresCargados++;
                    }
                }
                
                // Cerrar modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('cargaMasivaProveedoresModal'));
                modal.hide();
                
                // Mostrar notificación con resultados
                let mensaje = `${proveedoresCargados} proveedores cargados exitosamente`;
                if (proveedoresDuplicados > 0) {
                    mensaje += `. ${proveedoresDuplicados} proveedores duplicados fueron omitidos`;
                }
                
                this.showNotification(mensaje, 'success');
                this.loadProveedores();
                
                // Limpiar formulario
                document.getElementById('cargaMasivaProveedoresForm').reset();
                
            } catch (error) {
                this.showNotification('Error al procesar el archivo: ' + error.message, 'danger');
            }
        };
        reader.readAsText(file);
    }
    
    // Reportes
    generarReporteVentas() {
        const fechaInicio = document.getElementById('fechaInicioVentas').value;
        const fechaFin = document.getElementById('fechaFinVentas').value;
        
        if (!fechaInicio || !fechaFin) {
            this.showNotification('Por favor seleccione las fechas', 'warning');
            return;
        }
        
        const ventas = this.getVentas().filter(v => {
            const fecha = new Date(v.fecha);
            return fecha >= new Date(fechaInicio) && fecha <= new Date(fechaFin);
        });
        
        const total = ventas.reduce((sum, v) => sum + v.total, 0);
        const cantidad = ventas.length;
        
        this.mostrarReporte('Reporte de Ventas', {
            'Período': `${fechaInicio} a ${fechaFin}`,
            'Total de Ventas': `$${total.toFixed(2)}`,
            'Cantidad de Facturas': cantidad,
            'Promedio por Venta': `$${(total / cantidad || 0).toFixed(2)}`
        });
    }
    
    generarReporteInventario() {
        const fechaInicio = document.getElementById('fechaInicioInventario').value;
        const fechaFin = document.getElementById('fechaFinInventario').value;
        
        if (!fechaInicio || !fechaFin) {
            this.showNotification('Por favor seleccione las fechas', 'warning');
            return;
        }
        
        const productos = this.getProductos();
        const stockBajo = productos.filter(p => p.stock < 10);
        const valorTotal = productos.reduce((sum, p) => sum + (p.precio * p.stock), 0);
        
        this.mostrarReporte('Reporte de Inventario', {
            'Período': `${fechaInicio} a ${fechaFin}`,
            'Total de Productos': productos.length,
            'Productos con Stock Bajo': stockBajo.length,
            'Valor Total del Inventario': `$${valorTotal.toFixed(2)}`
        });
    }
    
    generarReporteReparaciones() {
        const fechaInicio = document.getElementById('fechaInicioReparaciones').value;
        const fechaFin = document.getElementById('fechaFinReparaciones').value;
        
        if (!fechaInicio || !fechaFin) {
            this.showNotification('Por favor seleccione las fechas', 'warning');
            return;
        }
        
        const reparaciones = this.getReparaciones().filter(r => {
            const fecha = new Date(r.fecha);
            return fecha >= new Date(fechaInicio) && fecha <= new Date(fechaFin);
        });
        
        const pendientes = reparaciones.filter(r => r.estado === 'pendiente').length;
        const enProceso = reparaciones.filter(r => r.estado === 'en-proceso').length;
        const finalizadas = reparaciones.filter(r => r.estado === 'finalizada').length;
        
        this.mostrarReporte('Reporte de Reparaciones', {
            'Período': `${fechaInicio} a ${fechaFin}`,
            'Total de Reparaciones': reparaciones.length,
            'Pendientes': pendientes,
            'En Proceso': enProceso,
            'Finalizadas': finalizadas
        });
    }
    
    mostrarReporte(titulo, datos) {
        let contenido = `<h3>${titulo}</h3><table class="table">`;
        for (const [key, value] of Object.entries(datos)) {
            contenido += `<tr><td><strong>${key}:</strong></td><td>${value}</td></tr>`;
        }
        contenido += '</table>';
        
        const modal = new bootstrap.Modal(document.createElement('div'));
        modal.element.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">${titulo}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        ${contenido}
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                        <button type="button" class="btn btn-primary" onclick="window.print()">Imprimir</button>
                    </div>
                </div>
            </div>
        `;
        modal.show();
    }
    
    // Notificaciones
    loadNotificaciones() {
        const notificaciones = this.getNotificaciones();
        this.actualizarNotificacionesDropdown(notificaciones);
        this.actualizarNotificacionesBadge(notificaciones);
    }
    
    actualizarNotificacionesDropdown(notificaciones) {
        const container = document.getElementById('notificacionesList');
        const emptyElement = document.getElementById('notificacionesEmpty');
        
        if (!container) return;
        
        // Limpiar contenido existente excepto el header
        const headerElements = container.querySelectorAll('.dropdown-header, .dropdown-divider');
        container.innerHTML = '';
        headerElements.forEach(el => container.appendChild(el));
        
        if (notificaciones.length === 0) {
            if (emptyElement) {
                emptyElement.style.display = 'block';
            }
            return;
        }
        
        if (emptyElement) {
            emptyElement.style.display = 'none';
        }
        
        // Mostrar las últimas 5 notificaciones en el dropdown
        const notificacionesRecientes = notificaciones.slice(0, 5);
        notificacionesRecientes.forEach(notif => {
            const li = document.createElement('li');
            li.className = `notificacion-item ${notif.leida ? 'leida' : ''}`;
            li.onclick = () => this.marcarLeida(notif.id);
            
            const tiempoTranscurrido = this.calcularTiempoTranscurrido(notif.fecha);
            
            li.innerHTML = `
                <div class="d-flex align-items-start">
                    <span class="notificacion-tipo ${notif.tipo}"></span>
                    <div class="flex-grow-1">
                        <div class="notificacion-titulo">${notif.titulo}</div>
                        <div class="notificacion-mensaje">${notif.mensaje}</div>
                        <div class="notificacion-tiempo">${tiempoTranscurrido}</div>
                    </div>
                </div>
            `;
            container.appendChild(li);
        });
        

    }
    
    actualizarNotificacionesBadge(notificaciones) {
        const badge = document.getElementById('notificacionesBadge');
        if (!badge) return;
        
        const noLeidas = notificaciones.filter(n => !n.leida).length;
        
        if (noLeidas > 0) {
            badge.textContent = noLeidas > 99 ? '99+' : noLeidas;
            badge.style.display = 'block';
        } else {
            badge.style.display = 'none';
        }
    }
    

    
    calcularTiempoTranscurrido(fecha) {
        const ahora = new Date();
        const fechaNotif = new Date(fecha);
        const diferencia = ahora - fechaNotif;
        
        const minutos = Math.floor(diferencia / (1000 * 60));
        const horas = Math.floor(diferencia / (1000 * 60 * 60));
        const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
        
        if (minutos < 1) return 'Ahora mismo';
        if (minutos < 60) return `Hace ${minutos} min`;
        if (horas < 24) return `Hace ${horas} h`;
        if (dias < 7) return `Hace ${dias} días`;
        
        return fechaNotif.toLocaleDateString();
    }
    

    
    crearNotificacion(titulo, mensaje, tipo = 'info') {
        const notificacion = {
            id: Date.now().toString(),
            titulo,
            mensaje,
            tipo,
            fecha: new Date().toISOString(),
            leida: false
        };
        
        const notificaciones = this.getNotificaciones();
        notificaciones.unshift(notificacion);
        localStorage.setItem('notificaciones', JSON.stringify(notificaciones));
    }
    
    marcarLeida(id) {
        const notificaciones = this.getNotificaciones();
        const notif = notificaciones.find(n => n.id === id);
        if (notif) {
            notif.leida = true;
            localStorage.setItem('notificaciones', JSON.stringify(notificaciones));
            this.loadNotificaciones();
            
            // Cerrar el dropdown después de marcar como leída
            const dropdown = document.getElementById('notificacionesDropdown');
            if (dropdown) {
                const bootstrapDropdown = bootstrap.Dropdown.getInstance(dropdown);
                if (bootstrapDropdown) {
                    bootstrapDropdown.hide();
                }
            }
        }
    }
    

    
    // Utilidades
    getProductos() {
        return JSON.parse(localStorage.getItem('productos') || '[]');
    }
    
    getProveedores() {
        return JSON.parse(localStorage.getItem('proveedores') || '[]');
    }
    
    getClientes() {
        return JSON.parse(localStorage.getItem('clientes') || '[]');
    }
    
    getReparaciones() {
        return JSON.parse(localStorage.getItem('reparaciones') || '[]');
    }
    
    getMecanicos() {
        return JSON.parse(localStorage.getItem('mecanicos') || '[]');
    }
    
    getVentas() {
        return JSON.parse(localStorage.getItem('facturas') || '[]');
    }
    
    getNotificaciones() {
        return JSON.parse(localStorage.getItem('notificaciones') || '[]');
    }
    
    calcularVentasMes(ventas) {
        const mesActual = new Date().getMonth();
        const añoActual = new Date().getFullYear();
        
        return ventas.filter(v => {
            const fecha = new Date(v.fecha);
            return fecha.getMonth() === mesActual && fecha.getFullYear() === añoActual;
        }).reduce((sum, v) => sum + v.total, 0);
    }
    
    getEstadoClass(estado) {
        const clases = {
            'pendiente': 'pendiente',
            'en-proceso': 'en-proceso',
            'finalizada': 'finalizada',
            'espera': 'espera'
        };
        return clases[estado] || 'pendiente';
    }
    
    cerrarModal(modalId) {
        const modal = bootstrap.Modal.getInstance(document.getElementById(modalId));
        if (modal) {
            modal.hide();
        }
        
        // Limpiar formulario
        const form = document.querySelector(`#${modalId} form`);
        if (form) {
            form.reset();
        }
    }
    
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
    
    // Métodos para editar y eliminar productos
    editarProducto(id) {
        const productos = this.getProductos();
        const producto = productos.find(p => p.id === id);
        
        if (!producto) {
            this.showNotification('Producto no encontrado', 'error');
            return;
        }
        
        // Llenar el modal con los datos del producto
        document.getElementById('codigoProducto').value = producto.codigo;
        document.getElementById('nombreProducto').value = producto.nombre;
        document.getElementById('descripcionProducto').value = producto.descripcion || '';
        document.getElementById('precioProducto').value = producto.precio;
        document.getElementById('descuentoProducto').value = producto.descuento || 0;
        document.getElementById('stockProducto').value = producto.stock;
        document.getElementById('stockMinimoProducto').value = producto.stockMinimo;
        document.getElementById('stockMaximoProducto').value = producto.stockMaximo;
        document.getElementById('proveedorProducto').value = producto.proveedor;
        
        // Cambiar el título del modal
        document.querySelector('#productoModal .modal-title').textContent = 'Editar Producto';
        
        // Cambiar el botón de guardar
        const btnGuardar = document.querySelector('#productoModal .btn-primary');
        btnGuardar.textContent = 'Actualizar';
        btnGuardar.onclick = () => this.actualizarProducto(id);
        
        // Mostrar el modal
        const modal = new bootstrap.Modal(document.getElementById('productoModal'));
        modal.show();
    }
    
    eliminarProducto(id) {
        const productos = this.getProductos();
        const producto = productos.find(p => p.id === id);
        
        if (!producto) {
            this.showNotification('Producto no encontrado', 'error');
            return;
        }
        
        // Llenar el modal de confirmación con los datos del producto
        document.getElementById('eliminarProductoCodigo').textContent = producto.codigo;
        document.getElementById('eliminarProductoNombre').textContent = producto.nombre;
        document.getElementById('eliminarProductoPrecio').textContent = `$${producto.precio}`;
        document.getElementById('eliminarProductoStock').textContent = producto.stock;
        document.getElementById('eliminarProductoProveedor').textContent = producto.proveedor;
        
        // Formatear fecha de creación
        const fechaCreacion = producto.fechaCreacion ? new Date(producto.fechaCreacion).toLocaleDateString('es-ES') : 'No disponible';
        document.getElementById('eliminarProductoFecha').textContent = fechaCreacion;
        
        // Configurar el botón de confirmación
        const btnConfirmar = document.getElementById('confirmarEliminarProducto');
        btnConfirmar.onclick = () => this.confirmarEliminarProducto(id);
        
        // Mostrar el modal
        const modal = new bootstrap.Modal(document.getElementById('eliminarProductoModal'));
        modal.show();
    }
    
    actualizarProducto(id) {
        const codigo = document.getElementById('codigoProducto').value;
        const nombre = document.getElementById('nombreProducto').value;
        const descripcion = document.getElementById('descripcionProducto').value;
        const precio = parseFloat(document.getElementById('precioProducto').value);
        const descuento = parseFloat(document.getElementById('descuentoProducto').value) || 0;
        const stock = parseInt(document.getElementById('stockProducto').value);
        const stockMinimo = parseInt(document.getElementById('stockMinimoProducto').value);
        const stockMaximo = parseInt(document.getElementById('stockMaximoProducto').value);
        const proveedor = document.getElementById('proveedorProducto').value;
        
        if (!codigo || !nombre || !precio || !stock || !stockMinimo || !stockMaximo || !proveedor) {
            this.showNotification('Por favor complete todos los campos requeridos', 'warning');
            return;
        }
        
        // Verificar que el código no esté duplicado (excluyendo el producto actual)
        const productos = this.getProductos();
        const productoExistente = productos.find(p => p.codigo === codigo && p.id !== id);
        if (productoExistente) {
            this.showNotification('El código de producto ya existe', 'danger');
            return;
        }
        
        // Actualizar el producto
        const index = productos.findIndex(p => p.id === id);
        if (index > -1) {
            productos[index] = {
                ...productos[index],
                codigo,
                nombre,
                descripcion,
                precio,
                descuento,
                stock,
                stockMinimo,
                stockMaximo,
                proveedor,
                fechaActualizacion: new Date().toISOString()
            };
            
            localStorage.setItem('productos', JSON.stringify(productos));
            this.showNotification('Producto actualizado exitosamente', 'success');
            this.cerrarModal('productoModal');
            this.loadProductos();
            this.loadDashboardData();
            
            // Restaurar el modal para nuevos productos
            this.resetearModalProducto();
        } else {
            this.showNotification('Producto no encontrado', 'error');
        }
    }
    
    resetearModalProducto() {
        // Limpiar formulario
        document.getElementById('productoForm').reset();
        
        // Restaurar título del modal
        document.querySelector('#productoModal .modal-title').textContent = 'Nuevo Producto';
        
        // Restaurar botón de guardar
        const btnGuardar = document.querySelector('#productoModal .btn-primary');
        btnGuardar.textContent = 'Guardar';
        btnGuardar.onclick = () => this.guardarProducto();
    }
    
    confirmarEliminarProducto(id) {
        const productos = this.getProductos();
        const producto = productos.find(p => p.id === id);
        
        if (!producto) {
            this.showNotification('Producto no encontrado', 'error');
            return;
        }
        
        // Eliminar el producto
        const index = productos.findIndex(p => p.id === id);
        if (index > -1) {
            productos.splice(index, 1);
            localStorage.setItem('productos', JSON.stringify(productos));
            
            // Cerrar el modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('eliminarProductoModal'));
            modal.hide();
            
            // Actualizar interfaz
            this.loadProductos();
            this.loadDashboardData();
            this.showNotification(`Producto "${producto.nombre}" eliminado exitosamente`, 'success');
        }
    }
    
    editarProveedor(id) {
        this.showNotification('Funcionalidad de edición en desarrollo', 'info');
    }
    
    eliminarProveedor(id) {
        if (confirm('¿Está seguro de eliminar este proveedor?')) {
            const proveedores = this.getProveedores();
            const index = proveedores.findIndex(p => p.id === id);
            if (index > -1) {
                proveedores.splice(index, 1);
                localStorage.setItem('proveedores', JSON.stringify(proveedores));
                this.loadProveedores();
                this.showNotification('Proveedor eliminado exitosamente', 'success');
            }
        }
    }
    
    editarCliente(id) {
        this.showNotification('Funcionalidad de edición en desarrollo', 'info');
    }
    
    eliminarCliente(id) {
        if (confirm('¿Está seguro de eliminar este cliente?')) {
            const clientes = this.getClientes();
            const index = clientes.findIndex(c => c.id === id);
            if (index > -1) {
                clientes.splice(index, 1);
                localStorage.setItem('clientes', JSON.stringify(clientes));
                this.loadClientes();
                this.showNotification('Cliente eliminado exitosamente', 'success');
            }
        }
    }
    
    editarReparacion(id) {
        this.showNotification('Funcionalidad de edición en desarrollo', 'info');
    }
    
    finalizarReparacion(id) {
        const reparaciones = this.getReparaciones();
        const reparacion = reparaciones.find(r => r.id === id);
        
        if (!reparacion) {
            this.showNotification('Reparación no encontrada', 'error');
            return;
        }
        
        // Crear modal para finalizar reparación con fotos finales
        let modalContent = `
            <div class="modal fade" id="finalizarReparacionModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header bg-primary text-white">
                            <h5 class="modal-title">
                                <i class="fas fa-check-circle me-2"></i>
                                Finalizar Reparación #${reparacion.id}
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="alert alert-info">
                                <i class="fas fa-info-circle me-2"></i>
                                <strong>Confirmar Finalización:</strong> ¿Está seguro de finalizar esta reparación?
                            </div>
                            
                            <div class="reparacion-info-container">
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <strong><i class="fas fa-user me-2 text-primary"></i>Cliente:</strong><br>
                                            <span class="text-muted">${reparacion.cliente}</span>
                                        </div>
                                        <div class="mb-3">
                                            <strong><i class="fas fa-motorcycle me-2 text-primary"></i>Moto:</strong><br>
                                            <span class="text-muted">${reparacion.marca} ${reparacion.modelo}</span>
                                        </div>
                                        <div class="mb-3">
                                            <strong><i class="fas fa-tools me-2 text-primary"></i>Mecánico:</strong><br>
                                            <span class="text-muted">${reparacion.mecanico}</span>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <strong><i class="fas fa-exclamation-triangle me-2 text-warning"></i>Falla:</strong><br>
                                            <span class="text-muted">${reparacion.falla}</span>
                                        </div>
                                        <div class="mb-3">
                                            <strong><i class="fas fa-clock me-2 text-info"></i>Estado Actual:</strong><br>
                                            <span class="badge badge-${this.getEstadoClass(reparacion.estado)}">
                                                ${reparacion.estado}
                                            </span>
                                        </div>
                                        <div class="mb-3">
                                            <strong><i class="fas fa-calendar me-2 text-success"></i>Fecha:</strong><br>
                                            <span class="text-muted">${new Date(reparacion.fecha).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <hr>
                            
                            <div class="finalizar-reparacion-section">
                                <div class="foto-evidence-header">
                                    <h6><i class="fas fa-camera"></i>Fotografías Finales de Evidencia</h6>
                                </div>
                                
                                <div class="foto-instructions">
                                    <i class="fas fa-lightbulb"></i>
                                    <strong>Importante:</strong> Capture o suba fotografías como evidencia del trabajo finalizado. 
                                    Las fotografías finales son obligatorias para completar la reparación.
                                </div>
                                
                                <div class="fotos-container" id="fotosFinalesContainer">
                                    <div class="foto-placeholder" onclick="window.fotoManager.capturarFoto('fotosFinales')">
                                        <i class="fas fa-camera"></i>
                                        <span>Capturar<br>Foto</span>
                                    </div>
                                    <div class="foto-placeholder" onclick="window.fotoManager.subirArchivo('fotosFinales')">
                                        <i class="fas fa-upload"></i>
                                        <span>Subir<br>Imágenes</span>
                                    </div>
                                </div>
                                
                                <div class="text-center mt-3">
                                    <small class="text-muted">
                                        <i class="fas fa-shield-alt me-1"></i>
                                        Las fotografías se almacenan de forma segura y forman parte del historial de la reparación
                                    </small>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                                <i class="fas fa-times me-1"></i>Cancelar
                            </button>
                            <button type="button" class="btn btn-success" onclick="adminDashboard.confirmarFinalizacion('${reparacion.id}')">
                                <i class="fas fa-check me-1"></i>Finalizar Reparación
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Remover modal anterior si existe
        const modalAnterior = document.getElementById('finalizarReparacionModal');
        if (modalAnterior) {
            modalAnterior.remove();
        }
        
        // Agregar nuevo modal al body
        document.body.insertAdjacentHTML('beforeend', modalContent);
        
        // Mostrar modal
        const modal = new bootstrap.Modal(document.getElementById('finalizarReparacionModal'));
        modal.show();
    }
    
    confirmarFinalizacion(reparacionId) {
        // Verificar que hay fotos finales
        const fotosFinales = window.fotoManager ? window.fotoManager.obtenerFotos('fotosFinales') : [];
        
        if (!fotosFinales || fotosFinales.length === 0) {
            this.showNotification('Debe capturar al menos una foto final como evidencia', 'warning');
            return;
        }
        
        const reparaciones = this.getReparaciones();
        const reparacion = reparaciones.find(r => r.id === reparacionId);
        
        if (reparacion) {
            reparacion.estado = 'finalizada';
            reparacion.fotosFinales = fotosFinales;
            reparacion.fechaFinalizacion = new Date().toISOString();
            
            localStorage.setItem('reparaciones', JSON.stringify(reparaciones));
            
            // Cerrar modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('finalizarReparacionModal'));
            if (modal) {
                modal.hide();
            }
            
            this.loadReparaciones();
            this.loadDashboardData();
            this.showNotification('Reparación finalizada exitosamente con evidencia fotográfica', 'success');
            
            // Generar recibo de reparación
            this.generarReciboReparacion(reparacion);
        }
    }
    
    generarReciboReparacion(reparacion) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Encabezado
        doc.setFontSize(20);
        doc.text('RECIBO DE REPARACIÓN', 105, 20, { align: 'center' });
        
        doc.setFontSize(12);
        doc.text(`ID: ${reparacion.id}`, 20, 40);
        doc.text(`Fecha: ${new Date(reparacion.fecha).toLocaleDateString()}`, 20, 50);
        doc.text(`Cliente: ${reparacion.cliente}`, 20, 60);
        doc.text(`Moto: ${reparacion.marca} ${reparacion.modelo}`, 20, 70);
        doc.text(`Mecánico: ${reparacion.mecanico}`, 20, 80);
        
        // Materiales si existen
        if (reparacion.materiales && reparacion.materiales.length > 0) {
            doc.text('MATERIALES UTILIZADOS:', 20, 100);
            let y = 110;
            let totalMateriales = 0;
            
            reparacion.materiales.forEach(material => {
                doc.text(`${material.producto}`, 20, y);
                doc.text(`${material.cantidad} x $${material.precio}`, 120, y);
                const subtotal = material.precio * material.cantidad;
                doc.text(`$${subtotal.toFixed(2)}`, 180, y);
                totalMateriales += subtotal;
                y += 10;
            });
            
            // Total
            y += 10;
            doc.setFontSize(14);
            doc.text('TOTAL MATERIALES:', 140, y);
            doc.text(`$${totalMateriales.toFixed(2)}`, 180, y);
        }
        
        // Información de evidencia fotográfica
        const yFinal = reparacion.materiales && reparacion.materiales.length > 0 ? 140 : 100;
        doc.setFontSize(12);
        doc.text('EVIDENCIA FOTOGRÁFICA:', 20, yFinal);
        doc.text(`Fotos iniciales: ${reparacion.fotosIniciales ? reparacion.fotosIniciales.length : 0}`, 20, yFinal + 10);
        doc.text(`Fotos finales: ${reparacion.fotosFinales ? reparacion.fotosFinales.length : 0}`, 20, yFinal + 20);
        
        // Guardar PDF
        doc.save(`reparacion-${reparacion.id}.pdf`);
    }
    
    editarMecanico(id) {
        this.showNotification('Funcionalidad de edición en desarrollo', 'info');
    }
    
    eliminarMecanico(id) {
        if (confirm('¿Está seguro de eliminar este mecánico?')) {
            const mecanicos = this.getMecanicos();
            const index = mecanicos.findIndex(m => m.id === id);
            if (index > -1) {
                mecanicos.splice(index, 1);
                localStorage.setItem('mecanicos', JSON.stringify(mecanicos));
                this.loadMecanicos();
                this.showNotification('Mecánico eliminado exitosamente', 'success');
            }
        }
    }
    
    verFotosReparacion(id) {
        const reparaciones = this.getReparaciones();
        const reparacion = reparaciones.find(r => r.id === id);
        
        if (!reparacion) {
            this.showNotification('Reparación no encontrada', 'error');
            return;
        }
        
        // Crear modal para mostrar las fotos
        let modalContent = `
            <div class="modal fade" id="fotosReparacionModal" tabindex="-1">
                <div class="modal-dialog modal-xl">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Fotografías de Evidencia - Reparación #${reparacion.id}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row">
                                <div class="col-md-6">
                                    <h6>Fotos Iniciales (${reparacion.fotosIniciales ? reparacion.fotosIniciales.length : 0})</h6>
                                    <div class="fotos-gallery">
        `;
        
        if (reparacion.fotosIniciales && reparacion.fotosIniciales.length > 0) {
            reparacion.fotosIniciales.forEach(foto => {
                modalContent += `
                    <div class="foto-item" style="display: inline-block; margin: 5px;">
                        <img src="${foto.data}" alt="Foto inicial" style="width: 100px; height: 100px; object-fit: cover; border-radius: 8px; cursor: pointer;" 
                             onclick="window.fotoManager.verFoto('${foto.data}')">
                    </div>
                `;
            });
        } else {
            modalContent += '<p class="text-muted">No hay fotos iniciales</p>';
        }
        
        modalContent += `
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <h6>Fotos Finales (${reparacion.fotosFinales ? reparacion.fotosFinales.length : 0})</h6>
                                    <div class="fotos-gallery">
        `;
        
        if (reparacion.fotosFinales && reparacion.fotosFinales.length > 0) {
            reparacion.fotosFinales.forEach(foto => {
                modalContent += `
                    <div class="foto-item" style="display: inline-block; margin: 5px;">
                        <img src="${foto.data}" alt="Foto final" style="width: 100px; height: 100px; object-fit: cover; border-radius: 8px; cursor: pointer;" 
                             onclick="window.fotoManager.verFoto('${foto.data}')">
                    </div>
                `;
            });
        } else {
            modalContent += '<p class="text-muted">No hay fotos finales</p>';
        }
        
        modalContent += `
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Remover modal anterior si existe
        const modalAnterior = document.getElementById('fotosReparacionModal');
        if (modalAnterior) {
            modalAnterior.remove();
        }
        
        // Agregar nuevo modal al body
        document.body.insertAdjacentHTML('beforeend', modalContent);
        
        // Mostrar modal
        const modal = new bootstrap.Modal(document.getElementById('fotosReparacionModal'));
        modal.show();
    }

    // Métodos para gestión de ventas
    loadVentas() {
        const ventas = JSON.parse(localStorage.getItem('facturas') || '[]');
        const ventasTable = document.getElementById('ventasTable');
        const ventasRecientes = document.getElementById('ventasRecientes');
        
        if (ventasTable) {
            this.renderVentasTable(ventas, ventasTable);
        }
        
        if (ventasRecientes) {
            this.renderVentasRecientes(ventas, ventasRecientes);
        }
        
        // Configurar búsqueda y filtros
        this.setupVentasFilters();
    }

    renderVentasTable(ventas, tableElement) {
        if (ventas.length === 0) {
            tableElement.innerHTML = '<tr><td colspan="8" class="text-center text-muted">No hay ventas registradas</td></tr>';
            return;
        }

        tableElement.innerHTML = ventas.map(factura => {
            const productos = factura.productos.map(p => p.nombre).join(', ');
            const fecha = new Date(factura.fecha).toLocaleDateString('es-ES');
            
            return `
                <tr>
                    <td>${factura.numero}</td>
                    <td>${factura.cliente.nombre}</td>
                    <td>${productos}</td>
                    <td>$${factura.subtotal.toFixed(2)}</td>
                    <td>$${factura.iva.toFixed(2)}</td>
                    <td>$${factura.total.toFixed(2)}</td>
                    <td>${fecha}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary" onclick="adminDashboard.verFactura('${factura.numero}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-success" onclick="adminDashboard.descargarFactura('${factura.numero}')">
                            <i class="fas fa-download"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    renderVentasRecientes(ventas, containerElement) {
        // Obtener ventas del mes actual
        const mesActual = new Date().getMonth();
        const añoActual = new Date().getFullYear();
        
        const ventasDelMes = ventas.filter(factura => {
            const fechaFactura = new Date(factura.fecha);
            return fechaFactura.getMonth() === mesActual && fechaFactura.getFullYear() === añoActual;
        });

        // Mostrar solo las 5 más recientes
        const ventasRecientes = ventasDelMes.slice(0, 5);

        if (ventasRecientes.length === 0) {
            containerElement.innerHTML = '<p class="text-muted text-center">No hay ventas en el mes actual</p>';
            return;
        }

        containerElement.innerHTML = ventasRecientes.map(factura => {
            const productos = factura.productos.map(p => p.nombre).join(', ');
            const fecha = new Date(factura.fecha).toLocaleDateString('es-ES');
            
            return `
                <tr>
                    <td>${factura.numero}</td>
                    <td>${factura.cliente.nombre}</td>
                    <td>${productos}</td>
                    <td>$${factura.total.toFixed(2)}</td>
                    <td>${fecha}</td>
                </tr>
            `;
        }).join('');
    }

    setupVentasFilters() {
        const searchInput = document.getElementById('searchVentas');
        const filtroMes = document.getElementById('filtroMesVentas');
        
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filtrarVentas();
            });
        }
        
        if (filtroMes) {
            filtroMes.addEventListener('change', () => {
                this.filtrarVentas();
            });
        }
    }

    filtrarVentas() {
        const ventas = JSON.parse(localStorage.getItem('facturas') || '[]');
        const searchTerm = document.getElementById('searchVentas')?.value.toLowerCase() || '';
        const filtroMes = document.getElementById('filtroMesVentas')?.value || '';
        
        let ventasFiltradas = ventas;
        
        // Filtrar por búsqueda
        if (searchTerm) {
            ventasFiltradas = ventasFiltradas.filter(factura => 
                factura.cliente.nombre.toLowerCase().includes(searchTerm) ||
                factura.numero.toLowerCase().includes(searchTerm) ||
                factura.productos.some(p => p.nombre.toLowerCase().includes(searchTerm))
            );
        }
        
        // Filtrar por mes
        if (filtroMes) {
            const mesSeleccionado = parseInt(filtroMes);
            ventasFiltradas = ventasFiltradas.filter(factura => {
                const fechaFactura = new Date(factura.fecha);
                return fechaFactura.getMonth() === (mesSeleccionado - 1);
            });
        }
        
        const ventasTable = document.getElementById('ventasTable');
        if (ventasTable) {
            this.renderVentasTable(ventasFiltradas, ventasTable);
        }
    }

    verFactura(numeroFactura) {
        const facturas = JSON.parse(localStorage.getItem('facturas') || '[]');
        const factura = facturas.find(f => f.numero === numeroFactura);
        
        if (!factura) {
            this.showNotification('Factura no encontrada', 'error');
            return;
        }

        // Crear modal para mostrar detalles de la factura
        const modalContent = `
            <div class="modal fade" id="facturaModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Factura ${factura.numero}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row">
                                <div class="col-md-6">
                                    <h6>Datos del Cliente</h6>
                                    <p><strong>Nombre:</strong> ${factura.cliente.nombre}</p>
                                    <p><strong>Cédula/RUC:</strong> ${factura.cliente.cedula}</p>
                                    <p><strong>Dirección:</strong> ${factura.cliente.direccion}</p>
                                    <p><strong>Teléfono:</strong> ${factura.cliente.telefono}</p>
                                </div>
                                <div class="col-md-6">
                                    <h6>Datos de la Factura</h6>
                                    <p><strong>Número:</strong> ${factura.numero}</p>
                                    <p><strong>Fecha:</strong> ${new Date(factura.fecha).toLocaleDateString('es-ES')}</p>
                                    <p><strong>Vendedor:</strong> ${factura.vendedor}</p>
                                </div>
                            </div>
                            <hr>
                            <h6>Productos</h6>
                            <div class="table-responsive">
                                <table class="table table-sm">
                                    <thead>
                                        <tr>
                                            <th>Producto</th>
                                            <th>Cantidad</th>
                                            <th>Precio Unit.</th>
                                            <th>Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${factura.productos.map(p => `
                                            <tr>
                                                <td>${p.nombre}</td>
                                                <td>${p.cantidad}</td>
                                                <td>$${p.precio.toFixed(2)}</td>
                                                <td>$${(p.precio * p.cantidad).toFixed(2)}</td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                            <div class="row">
                                <div class="col-md-6 offset-md-6">
                                    <table class="table table-sm">
                                        <tr>
                                            <td><strong>Subtotal:</strong></td>
                                            <td>$${factura.subtotal.toFixed(2)}</td>
                                        </tr>
                                        <tr>
                                            <td><strong>IVA (12%):</strong></td>
                                            <td>$${factura.iva.toFixed(2)}</td>
                                        </tr>
                                        <tr>
                                            <td><strong>Total:</strong></td>
                                            <td><strong>$${factura.total.toFixed(2)}</strong></td>
                                        </tr>
                                    </table>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-success" onclick="adminDashboard.descargarFactura('${factura.numero}')">
                                <i class="fas fa-download"></i> Descargar PDF
                            </button>
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Remover modal anterior si existe
        const modalAnterior = document.getElementById('facturaModal');
        if (modalAnterior) {
            modalAnterior.remove();
        }

        // Agregar nuevo modal al body
        document.body.insertAdjacentHTML('beforeend', modalContent);

        // Mostrar modal
        const modal = new bootstrap.Modal(document.getElementById('facturaModal'));
        modal.show();
    }

    descargarFactura(numeroFactura) {
        const facturas = JSON.parse(localStorage.getItem('facturas') || '[]');
        const factura = facturas.find(f => f.numero === numeroFactura);
        
        if (!factura) {
            this.showNotification('Factura no encontrada', 'error');
            return;
        }

        // Generar PDF usando jsPDF (similar al método del vendedor)
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Configurar fuente y tamaños
        doc.setFontSize(18);
        doc.text('FACTURA', 105, 20, { align: 'center' });
        
        doc.setFontSize(12);
        doc.text(`Número: ${factura.numero}`, 20, 40);
        doc.text(`Fecha: ${new Date(factura.fecha).toLocaleDateString('es-ES')}`, 20, 50);
        
        // Datos del cliente
        doc.text('DATOS DEL CLIENTE:', 20, 70);
        doc.setFontSize(10);
        doc.text(`Nombre: ${factura.cliente.nombre}`, 20, 80);
        doc.text(`Cédula/RUC: ${factura.cliente.cedula}`, 20, 90);
        doc.text(`Dirección: ${factura.cliente.direccion}`, 20, 100);
        doc.text(`Teléfono: ${factura.cliente.telefono}`, 20, 110);

        // Productos
        doc.setFontSize(12);
        doc.text('PRODUCTOS:', 20, 130);
        
        let y = 140;
        factura.productos.forEach((producto, index) => {
            if (y > 250) {
                doc.addPage();
                y = 20;
            }
            
            doc.setFontSize(10);
            doc.text(`${index + 1}. ${producto.nombre}`, 20, y);
            doc.text(`Cantidad: ${producto.cantidad}`, 120, y);
            doc.text(`Precio: $${producto.precio.toFixed(2)}`, 160, y);
            y += 10;
        });

        // Totales
        y += 10;
        doc.setFontSize(12);
        doc.text(`Subtotal: $${factura.subtotal.toFixed(2)}`, 120, y);
        y += 10;
        doc.text(`IVA (12%): $${factura.iva.toFixed(2)}`, 120, y);
        y += 10;
        doc.setFontSize(14);
        doc.text(`TOTAL: $${factura.total.toFixed(2)}`, 120, y);

        // Guardar PDF
        doc.save(`factura-${factura.numero}.pdf`);
        this.showNotification('Factura descargada exitosamente', 'success');
    }

    updateDashboardStats() {
        // Actualizar estadísticas del dashboard
        const productos = JSON.parse(localStorage.getItem('productos') || '[]');
        const reparaciones = JSON.parse(localStorage.getItem('reparaciones') || '[]');
        const facturas = JSON.parse(localStorage.getItem('facturas') || '[]');
        
        // Total productos
        document.getElementById('totalProductos').textContent = productos.length;
        
        // Reparaciones pendientes
        const reparacionesPendientes = reparaciones.filter(r => 
            r.estado === 'pendiente' || r.estado === 'en-proceso'
        ).length;
        document.getElementById('reparacionesPendientes').textContent = reparacionesPendientes;
        
        // Ventas del mes
        const mesActual = new Date().getMonth();
        const añoActual = new Date().getFullYear();
        const ventasDelMes = facturas.filter(factura => {
            const fechaFactura = new Date(factura.fecha);
            return fechaFactura.getMonth() === mesActual && fechaFactura.getFullYear() === añoActual;
        });
        
        const totalVentasMes = ventasDelMes.reduce((total, factura) => total + factura.total, 0);
        document.getElementById('ventasMes').textContent = `$${totalVentasMes.toFixed(2)}`;
        
        // Stock bajo (productos con stock menor o igual al stock mínimo)
        const stockBajo = productos.filter(p => {
            const stockMinimo = p.stockMinimo || 5; // Valor por defecto si no existe
            return p.stock <= stockMinimo;
        }).length;
        document.getElementById('stockBajo').textContent = stockBajo;
    }

    loadVentasRecientes() {
        const ventas = this.getVentas();
        const ventasRecientes = document.getElementById('ventasRecientes');
        
        if (!ventasRecientes) return;
        
        // Obtener ventas del mes actual
        const mesActual = new Date().getMonth();
        const añoActual = new Date().getFullYear();
        
        const ventasDelMes = ventas.filter(factura => {
            const fechaFactura = new Date(factura.fecha);
            return fechaFactura.getMonth() === mesActual && fechaFactura.getFullYear() === añoActual;
        });

        // Mostrar solo las 5 más recientes
        const ventasRecientesList = ventasDelMes.slice(0, 5);

        if (ventasRecientesList.length === 0) {
            ventasRecientes.innerHTML = '<p class="text-muted text-center">No hay ventas en el mes actual</p>';
            return;
        }

        ventasRecientes.innerHTML = ventasRecientesList.map(factura => {
            const productos = factura.productos.map(p => p.nombre).join(', ');
            const fecha = new Date(factura.fecha).toLocaleDateString('es-ES');
            
            return `
                <tr>
                    <td>${factura.numero}</td>
                    <td>${factura.cliente.nombre}</td>
                    <td>${productos}</td>
                    <td>$${factura.total.toFixed(2)}</td>
                    <td>${fecha}</td>
                </tr>
            `;
        }).join('');
    }

    exportarVentas() {
        const ventas = this.getVentas();
        if (ventas.length === 0) {
            this.showNotification('No hay ventas para exportar', 'warning');
            return;
        }

        // Crear contenido CSV
        let csvContent = 'Número Factura,Cliente,Productos,Subtotal,IVA,Total,Fecha\n';
        
        ventas.forEach(factura => {
            const productos = factura.productos.map(p => p.nombre).join('; ');
            const fecha = new Date(factura.fecha).toLocaleDateString('es-ES');
            
            csvContent += `"${factura.numero}","${factura.cliente.nombre}","${productos}",${factura.subtotal},${factura.iva},${factura.total},"${fecha}"\n`;
        });

        // Crear y descargar archivo
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `ventas-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.showNotification('Ventas exportadas exitosamente', 'success');
    }

    // Gestión de Listas de Compras
    setupComprasListeners() {
        // Formulario de carga masiva de compras
        const listaComprasForm = document.getElementById('listaComprasForm');
        if (listaComprasForm) {
            listaComprasForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.cargarComprasMasivo();
            });
        }

        // Configurar selects de productos y proveedores
        this.actualizarSelectProductosCompra();
        this.actualizarSelectProveedoresCompra();
        
        // Establecer fecha actual por defecto
        const fechaCompra = document.getElementById('fechaCompra');
        if (fechaCompra) {
            fechaCompra.value = new Date().toISOString().split('T')[0];
        }
    }

    actualizarSelectProductosCompra() {
        const productos = this.getProductos();
        const select = document.getElementById('productoCompra');
        if (!select) return;
        
        select.innerHTML = '<option value="">Seleccionar producto</option>';
        productos.forEach(producto => {
            const option = document.createElement('option');
            option.value = producto.id;
            option.textContent = `${producto.codigo} - ${producto.nombre}`;
            option.dataset.precio = producto.precio;
            select.appendChild(option);
        });
    }

    actualizarSelectProveedoresCompra() {
        const proveedores = this.getProveedores();
        const select = document.getElementById('proveedorCompra');
        if (!select) return;
        
        select.innerHTML = '<option value="">Seleccionar proveedor</option>';
        proveedores.forEach(proveedor => {
            const option = document.createElement('option');
            option.value = proveedor.id;
            option.textContent = proveedor.nombre;
            select.appendChild(option);
        });
    }

    agregarItemCompra() {
        const productoId = document.getElementById('productoCompra').value;
        const cantidad = parseInt(document.getElementById('cantidadCompra').value);
        const precioUnit = parseFloat(document.getElementById('precioCompra').value);
        const proveedorId = document.getElementById('proveedorCompra').value;

        if (!productoId || !cantidad || !precioUnit || !proveedorId) {
            this.showNotification('Por favor complete todos los campos', 'warning');
            return;
        }

        const productos = this.getProductos();
        const proveedores = this.getProveedores();
        
        const producto = productos.find(p => p.id === productoId);
        const proveedor = proveedores.find(p => p.id === proveedorId);

        if (!producto || !proveedor) {
            this.showNotification('Producto o proveedor no encontrado', 'error');
            return;
        }

        const item = {
            id: Date.now().toString(),
            productoId,
            productoNombre: producto.nombre,
            productoCodigo: producto.codigo,
            cantidad,
            precioUnit,
            subtotal: cantidad * precioUnit,
            proveedorId,
            proveedorNombre: proveedor.nombre
        };

        // Agregar a la lista temporal
        if (!this.itemsCompraTemporal) {
            this.itemsCompraTemporal = [];
        }
        this.itemsCompraTemporal.push(item);

        this.renderItemsCompra();
        this.calcularTotalCompra();
        this.limpiarFormularioCompra();
    }

    renderItemsCompra() {
        const tbody = document.getElementById('itemsCompraTable');
        if (!tbody || !this.itemsCompraTemporal) return;

        tbody.innerHTML = this.itemsCompraTemporal.map(item => `
            <tr>
                <td>${item.productoCodigo} - ${item.productoNombre}</td>
                <td>${item.cantidad}</td>
                <td>$${item.precioUnit.toFixed(2)}</td>
                <td>$${item.subtotal.toFixed(2)}</td>
                <td>${item.proveedorNombre}</td>
                <td>
                    <button class="btn btn-sm btn-outline-danger" onclick="adminDashboard.eliminarItemCompra('${item.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    calcularTotalCompra() {
        if (!this.itemsCompraTemporal) {
            document.getElementById('totalCompra').textContent = '$0.00';
            return;
        }

        const total = this.itemsCompraTemporal.reduce((sum, item) => sum + item.subtotal, 0);
        document.getElementById('totalCompra').textContent = `$${total.toFixed(2)}`;
    }

    eliminarItemCompra(itemId) {
        this.itemsCompraTemporal = this.itemsCompraTemporal.filter(item => item.id !== itemId);
        this.renderItemsCompra();
        this.calcularTotalCompra();
    }

    limpiarFormularioCompra() {
        document.getElementById('productoCompra').value = '';
        document.getElementById('cantidadCompra').value = '';
        document.getElementById('precioCompra').value = '';
        document.getElementById('proveedorCompra').value = '';
    }

    limpiarListaCompra() {
        this.itemsCompraTemporal = [];
        this.renderItemsCompra();
        this.calcularTotalCompra();
        this.limpiarFormularioCompra();
        document.getElementById('observacionesCompra').value = '';
        document.getElementById('numeroFacturaCompra').value = '';
    }

    procesarCompra() {
        if (!this.itemsCompraTemporal || this.itemsCompraTemporal.length === 0) {
            this.showNotification('No hay items en la lista de compra', 'warning');
            return;
        }

        const fechaCompra = document.getElementById('fechaCompra').value;
        const numeroFactura = document.getElementById('numeroFacturaCompra').value;
        const observaciones = document.getElementById('observacionesCompra').value;

        if (!fechaCompra) {
            this.showNotification('Por favor seleccione la fecha de compra', 'warning');
            return;
        }

        // Crear registro de compra
        const compra = {
            id: Date.now().toString(),
            fecha: fechaCompra,
            numeroFactura: numeroFactura || null,
            observaciones: observaciones || '',
            items: [...this.itemsCompraTemporal],
            total: this.itemsCompraTemporal.reduce((sum, item) => sum + item.subtotal, 0),
            fechaCreacion: new Date().toISOString()
        };

        // Guardar compra en historial
        const compras = this.getCompras();
        compras.push(compra);
        localStorage.setItem('compras', JSON.stringify(compras));

        // Actualizar inventario
        this.actualizarInventarioCompra(compra);

        this.showNotification('Compra procesada exitosamente', 'success');
        this.limpiarListaCompra();
        this.loadHistorialCompras();
        this.loadDashboardData();
    }

    actualizarInventarioCompra(compra) {
        const productos = this.getProductos();
        
        compra.items.forEach(item => {
            const producto = productos.find(p => p.id === item.productoId);
            if (producto) {
                producto.stock += item.cantidad;
                // Opcional: actualizar precio promedio
                // producto.precio = ((producto.precio * producto.stock) + (item.precioUnit * item.cantidad)) / (producto.stock + item.cantidad);
            }
        });

        localStorage.setItem('productos', JSON.stringify(productos));
    }

    cargarComprasMasivo() {
        const fileInput = document.getElementById('archivoCompras');
        const file = fileInput.files[0];
        
        if (!file) {
            this.showNotification('Por favor seleccione un archivo', 'warning');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const csv = e.target.result;
                const lines = csv.split('\n');
                
                let comprasCargadas = 0;
                for (let i = 1; i < lines.length; i++) {
                    if (lines[i].trim()) {
                        const values = lines[i].split(',');
                        // Formato esperado: Producto,Cantidad,PrecioUnit,Proveedor,Fecha,NumeroFactura
                        const productoNombre = values[0]?.trim();
                        const cantidad = parseInt(values[1]) || 0;
                        const precioUnit = parseFloat(values[2]) || 0;
                        const proveedorNombre = values[3]?.trim();
                        const fecha = values[4]?.trim() || new Date().toISOString().split('T')[0];
                        const numeroFactura = values[5]?.trim() || '';
                        
                        if (productoNombre && cantidad > 0 && precioUnit > 0 && proveedorNombre) {
                            // Buscar producto y proveedor por nombre
                            const productos = this.getProductos();
                            const proveedores = this.getProveedores();
                            
                            const producto = productos.find(p => p.nombre.toLowerCase().includes(productoNombre.toLowerCase()));
                            const proveedor = proveedores.find(p => p.nombre.toLowerCase().includes(proveedorNombre.toLowerCase()));
                            
                            if (producto && proveedor) {
                                const item = {
                                    id: Date.now().toString() + i,
                                    productoId: producto.id,
                                    productoNombre: producto.nombre,
                                    productoCodigo: producto.codigo,
                                    cantidad,
                                    precioUnit,
                                    subtotal: cantidad * precioUnit,
                                    proveedorId: proveedor.id,
                                    proveedorNombre: proveedor.nombre
                                };
                                
                                if (!this.itemsCompraTemporal) {
                                    this.itemsCompraTemporal = [];
                                }
                                this.itemsCompraTemporal.push(item);
                                comprasCargadas++;
                            }
                        }
                    }
                }
                
                this.showNotification(`${comprasCargadas} items cargados a la lista de compra`, 'success');
                this.renderItemsCompra();
                this.calcularTotalCompra();
                
            } catch (error) {
                this.showNotification('Error al procesar el archivo', 'danger');
            }
        };
        reader.readAsText(file);
    }

    loadHistorialCompras() {
        const compras = this.getCompras();
        const tbody = document.getElementById('historialComprasTable');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        compras.forEach(compra => {
            const productos = compra.items.map(item => `${item.productoNombre} (${item.cantidad})`).join(', ');
            const fecha = new Date(compra.fecha).toLocaleDateString('es-ES');
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${fecha}</td>
                <td>${compra.numeroFactura || '-'}</td>
                <td>${compra.items[0]?.proveedorNombre || '-'}</td>
                <td>${productos}</td>
                <td>$${compra.total.toFixed(2)}</td>
                <td>${compra.observaciones || '-'}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="adminDashboard.verDetalleCompra('${compra.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    verDetalleCompra(compraId) {
        const compras = this.getCompras();
        const compra = compras.find(c => c.id === compraId);
        
        if (!compra) {
            this.showNotification('Compra no encontrada', 'error');
            return;
        }

        // Crear modal para mostrar detalles de la compra
        const modalContent = `
            <div class="modal fade" id="detalleCompraModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Detalle de Compra</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row">
                                <div class="col-md-6">
                                    <h6>Información General</h6>
                                    <p><strong>Fecha:</strong> ${new Date(compra.fecha).toLocaleDateString('es-ES')}</p>
                                    <p><strong>N° Factura:</strong> ${compra.numeroFactura || 'No especificado'}</p>
                                    <p><strong>Total:</strong> $${compra.total.toFixed(2)}</p>
                                </div>
                                <div class="col-md-6">
                                    <h6>Observaciones</h6>
                                    <p>${compra.observaciones || 'Sin observaciones'}</p>
                                </div>
                            </div>
                            <hr>
                            <h6>Productos Comprados</h6>
                            <div class="table-responsive">
                                <table class="table table-sm">
                                    <thead>
                                        <tr>
                                            <th>Producto</th>
                                            <th>Cantidad</th>
                                            <th>Precio Unit.</th>
                                            <th>Subtotal</th>
                                            <th>Proveedor</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${compra.items.map(item => `
                                            <tr>
                                                <td>${item.productoCodigo} - ${item.productoNombre}</td>
                                                <td>${item.cantidad}</td>
                                                <td>$${item.precioUnit.toFixed(2)}</td>
                                                <td>$${item.subtotal.toFixed(2)}</td>
                                                <td>${item.proveedorNombre}</td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Remover modal anterior si existe
        const modalAnterior = document.getElementById('detalleCompraModal');
        if (modalAnterior) {
            modalAnterior.remove();
        }

        // Agregar nuevo modal al body
        document.body.insertAdjacentHTML('beforeend', modalContent);

        // Mostrar modal
        const modal = new bootstrap.Modal(document.getElementById('detalleCompraModal'));
        modal.show();
    }

    getCompras() {
        return JSON.parse(localStorage.getItem('compras') || '[]');
    }

    // Funciones del buscador de clientes
    setupClienteSearch() {
        const inputCliente = document.getElementById('clienteReparacion');
        const dropdown = document.getElementById('clientesDropdown');
        
        if (!inputCliente) return;
        
        // Configurar event listeners para el buscador
        inputCliente.removeEventListener('input', this.handleClienteSearch);
        inputCliente.removeEventListener('focus', this.handleClienteFocus);
        inputCliente.removeEventListener('blur', this.handleClienteBlur);
        
        inputCliente.addEventListener('input', this.handleClienteSearch.bind(this));
        inputCliente.addEventListener('focus', this.handleClienteFocus.bind(this));
        inputCliente.addEventListener('blur', this.handleClienteBlur.bind(this));
        
        if (dropdown) {
            dropdown.removeEventListener('click', this.handleClienteDropdownClick);
            dropdown.addEventListener('click', this.handleClienteDropdownClick.bind(this));
        }
    }

    handleClienteSearch(event) {
        const searchTerm = event.target.value.toLowerCase();
        const clientes = this.getClientes();
        const dropdown = document.getElementById('clientesDropdown');
        
        if (!dropdown) return;
        
        if (searchTerm.length < 2) {
            dropdown.style.display = 'none';
            return;
        }
        
        const filteredClientes = clientes.filter(cliente => 
            cliente.nombre.toLowerCase().includes(searchTerm) ||
            cliente.cedula.toLowerCase().includes(searchTerm)
        );
        
        this.mostrarResultadosCliente(filteredClientes);
    }

    handleClienteFocus(event) {
        const searchTerm = event.target.value.toLowerCase();
        const clientes = this.getClientes();
        const dropdown = document.getElementById('clientesDropdown');
        
        if (!dropdown) return;
        
        if (searchTerm.length >= 2) {
            const filteredClientes = clientes.filter(cliente => 
                cliente.nombre.toLowerCase().includes(searchTerm) ||
                cliente.cedula.toLowerCase().includes(searchTerm)
            );
            this.mostrarResultadosCliente(filteredClientes);
        }
    }

    handleClienteBlur(event) {
        // Pequeño delay para permitir el clic en el dropdown
        setTimeout(() => {
            const dropdown = document.getElementById('clientesDropdown');
            if (dropdown) {
                dropdown.style.display = 'none';
            }
        }, 200);
    }

    handleClienteDropdownClick(event) {
        const target = event.target.closest('.cliente-item');
        if (!target) return;
        
        const clienteId = target.dataset.clienteId;
        const clientes = this.getClientes();
        const cliente = clientes.find(c => c.id === clienteId);
        
        if (cliente) {
            const inputCliente = document.getElementById('clienteReparacion');
            inputCliente.value = cliente.nombre;
            inputCliente.dataset.clienteId = cliente.id;
            
            const dropdown = document.getElementById('clientesDropdown');
            if (dropdown) {
                dropdown.style.display = 'none';
            }
        }
    }

    mostrarResultadosCliente(clientes) {
        const dropdown = document.getElementById('clientesDropdown');
        if (!dropdown) return;
        
        if (clientes.length === 0) {
            dropdown.innerHTML = '<div class="p-2 text-muted">No se encontraron clientes</div>';
        } else {
            dropdown.innerHTML = clientes.map(cliente => `
                <div class="cliente-item p-2 border-bottom" data-cliente-id="${cliente.id}" style="cursor: pointer;">
                    <div class="fw-bold">${cliente.nombre}</div>
                    <small class="text-muted">${cliente.cedula}</small>
                </div>
            `).join('');
        }
        
        dropdown.style.display = 'block';
    }
    
    setupNotificaciones() {
        // Cargar notificaciones iniciales
        this.loadNotificaciones();
        
        // Crear notificaciones de ejemplo si no hay ninguna
        const notificaciones = this.getNotificaciones();
        if (notificaciones.length === 0) {
            this.crearNotificacion('Bienvenido al sistema', 'Has iniciado sesión correctamente como administrador', 'sistema');
            this.crearNotificacion('Nueva solicitud de compra', 'Se ha recibido una nueva solicitud de adquisición', 'stock');
            this.crearNotificacion('Reporte mensual', 'El reporte de ventas del mes está listo para revisión', 'sistema');
            this.crearNotificacion('Stock crítico', 'El producto "Filtro de aire" tiene stock crítico (2 unidades)', 'stock');
        }
        
        // Configurar actualización automática cada 30 segundos
        setInterval(() => {
            this.loadNotificaciones();
        }, 30000);
        
        // Configurar evento para cerrar dropdown al hacer clic fuera
        document.addEventListener('click', (e) => {
            const dropdown = document.getElementById('notificacionesDropdown');
            const dropdownMenu = document.getElementById('notificacionesList');
            
            if (dropdown && dropdownMenu && !dropdown.contains(e.target) && !dropdownMenu.contains(e.target)) {
                const bootstrapDropdown = bootstrap.Dropdown.getInstance(dropdown);
                if (bootstrapDropdown) {
                    bootstrapDropdown.hide();
                }
            }
        });
    }
}

// Funciones globales para los botones
function showSection(sectionName) {
    adminDashboard.showSection(sectionName);
}

function showTab(tabName) {
    console.log('Función global showTab llamada con:', tabName);
    if (adminDashboard) {
        adminDashboard.showTab(tabName);
    } else {
        console.error('adminDashboard no está inicializado');
    }
}

function guardarProducto() {
    adminDashboard.guardarProducto();
}

function actualizarProducto(id) {
    adminDashboard.actualizarProducto(id);
}

function confirmarEliminarProducto(id) {
    adminDashboard.confirmarEliminarProducto(id);
}

function procesarCargaMasivaProductos() {
    adminDashboard.cargarProductosMasivo();
}

function procesarCargaMasivaProveedores() {
    adminDashboard.cargarProveedoresMasivo();
}

function guardarProveedor() {
    adminDashboard.guardarProveedor();
}

function guardarCliente() {
    adminDashboard.guardarCliente();
}

function guardarReparacion() {
    adminDashboard.guardarReparacion();
}

function guardarMecanico() {
    adminDashboard.guardarMecanico();
}



function exportarVentas() {
    adminDashboard.exportarVentas();
}

// Funciones globales para Lista de Compras
function agregarItemCompra() {
    adminDashboard.agregarItemCompra();
}

function limpiarListaCompra() {
    adminDashboard.limpiarListaCompra();
}

function procesarCompra() {
    adminDashboard.procesarCompra();
}

// Inicializar dashboard
let adminDashboard;
document.addEventListener('DOMContentLoaded', () => {
    adminDashboard = new AdminDashboard();
});
