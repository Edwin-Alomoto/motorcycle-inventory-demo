// Dashboard del Administrador
class AdminDashboard {
    constructor() {
        // Verificar autenticación sin crear nueva instancia
        const session = localStorage.getItem('session');
        this.session = session ? JSON.parse(session) : null;
        
        // Para pruebas, permitir inicialización sin sesión
        if (!this.session || this.session.role !== 'admin') {
            console.warn('No hay sesión de admin válida, inicializando en modo prueba');
            this.session = {
                name: 'Usuario de Prueba',
                role: 'admin',
                id: 'test-user'
            };
        }
        
        // Inicializar variables
        this.qrTimeout = null;
        this.reparacionActual = null;
        this.materialesReparacion = [];
        this.reparacionEditando = null;
        this.clienteEditando = null;
        this.proveedorEditando = null;
        
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
        
        // Verificar que el modal de productos esté disponible
        this.verificarModalProductos();
    }
    
    // Verificar que el modal de productos esté correctamente configurado
    verificarModalProductos() {
        const modalElement = document.getElementById('productoModal');
        if (!modalElement) {
            console.error('Modal de productos no encontrado');
            return;
        }
        
        // Verificar que todos los campos del formulario existan
        const camposRequeridos = [
            'codigoProducto', 'nombreProducto', 'descripcionProducto', 
            'codigoQRProducto', 'precioProducto', 'descuentoMinimoProducto',
            'descuentoMaximoProducto', 'stockProducto', 'stockMinimoProducto',
            'stockMaximoProducto', 'proveedorProducto'
        ];
        
        const camposFaltantes = [];
        camposRequeridos.forEach(campo => {
            if (!document.getElementById(campo)) {
                camposFaltantes.push(campo);
            }
        });
        
        if (camposFaltantes.length > 0) {
            console.error('Campos faltantes en el modal de productos:', camposFaltantes);
        } else {
            console.log('Modal de productos configurado correctamente');
        }
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
        
        // Evento para resetear modal de proveedores cuando se cierre
        const proveedorModal = document.getElementById('proveedorModal');
        if (proveedorModal) {
            proveedorModal.addEventListener('hidden.bs.modal', () => {
                this.resetearModalProveedor();
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
        let ventas = this.getVentas();
        
        // Si no hay ventas, generar datos de ejemplo
        if (ventas.length === 0) {
            ventas = this.generarVentasEjemplo();
            localStorage.setItem('ventas', JSON.stringify(ventas));
        }
        
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
                <td>${(producto.descuentoMinimo || producto.descuento || 0) > 0 ? `${producto.descuentoMinimo || producto.descuento || 0}%` : '-'}</td>
                <td>${(producto.descuentoMaximo || 0) > 0 ? `${producto.descuentoMaximo}%` : '-'}</td>
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
                    <button class="btn btn-sm btn-outline-primary" onclick="editarProducto('${producto.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="eliminarProducto('${producto.id}')">
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
                <td>${(producto.descuentoMinimo || producto.descuento || 0) > 0 ? `${producto.descuentoMinimo || producto.descuento || 0}%` : '-'}</td>
                <td>${(producto.descuentoMaximo || 0) > 0 ? `${producto.descuentoMaximo}%` : '-'}</td>
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
                    <button class="btn btn-sm btn-outline-primary" onclick="editarProducto('${producto.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="eliminarProducto('${producto.id}')">
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
        const codigoQR = document.getElementById('codigoQRProducto').value || codigo; // Si no se ingresa QR, usar el código
        const precio = parseFloat(document.getElementById('precioProducto').value);
        const descuentoMinimo = parseFloat(document.getElementById('descuentoMinimoProducto').value) || 0;
        const descuentoMaximo = parseFloat(document.getElementById('descuentoMaximoProducto').value) || 0;
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
            codigoQR,
            precio,
            descuentoMinimo,
            descuentoMaximo,
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
                    <button class="btn btn-sm btn-outline-primary" onclick="editarProveedor('${proveedor.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="eliminarProveedor('${proveedor.id}')">
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
        this.resetearModalProveedor();
    }
    
    actualizarProveedor() {
        const ruc = document.getElementById('rucProveedor').value;
        const nombre = document.getElementById('nombreProveedor').value;
        const direccion = document.getElementById('direccionProveedor').value;
        const telefono = document.getElementById('telefonoProveedor').value;
        const email = document.getElementById('emailProveedor').value;
        
        if (!ruc || !nombre || !direccion || !telefono || !email) {
            this.showNotification('Por favor complete todos los campos', 'warning');
            return;
        }
        
        // Verificar que el RUC no esté duplicado (excluyendo el proveedor actual)
        const proveedores = this.getProveedores();
        const proveedorDuplicado = proveedores.find(p => p.ruc === ruc && p.id !== this.proveedorEditando.id);
        if (proveedorDuplicado) {
            this.showNotification('El RUC ya está registrado por otro proveedor', 'danger');
            return;
        }
        
        // Actualizar el proveedor
        const index = proveedores.findIndex(p => p.id === this.proveedorEditando.id);
        if (index === -1) {
            this.showNotification('Proveedor no encontrado', 'error');
            return;
        }
        
        proveedores[index] = {
            ...this.proveedorEditando,
            ruc,
            nombre,
            direccion,
            telefono,
            email,
            fechaActualizacion: new Date().toISOString()
        };
        
        localStorage.setItem('proveedores', JSON.stringify(proveedores));
        
        this.showNotification('Proveedor actualizado exitosamente', 'success');
        this.cerrarModal('proveedorModal');
        this.loadProveedores();
        this.resetearModalProveedor();
    }
    
    resetearModalProveedor() {
        // Limpiar el formulario
        document.getElementById('proveedorForm').reset();
        
        // Restaurar el título y botón del modal
        document.querySelector('#proveedorModal .modal-title').textContent = 'Nuevo Proveedor';
        document.querySelector('#proveedorModal .btn-primary').textContent = 'Guardar';
        
        // Restaurar el onclick del botón para usar guardarProveedor
        const btnGuardar = document.querySelector('#proveedorModal .btn-primary');
        btnGuardar.onclick = () => this.guardarProveedor();
        
        // Limpiar la variable de edición
        this.proveedorEditando = null;
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
        this.resetearModalCliente();
    }
    
    actualizarCliente() {
        const cedula = document.getElementById('cedulaCliente').value;
        const nombre = document.getElementById('nombreCliente').value;
        const direccion = document.getElementById('direccionCliente').value;
        const telefono = document.getElementById('telefonoCliente').value;
        const email = document.getElementById('emailCliente').value;
        
        if (!cedula || !nombre || !direccion || !telefono || !email) {
            this.showNotification('Por favor complete todos los campos', 'warning');
            return;
        }
        
        // Verificar que la cédula no esté duplicada (excluyendo el cliente actual)
        const clientes = this.getClientes();
        const clienteDuplicado = clientes.find(c => c.cedula === cedula && c.id !== this.clienteEditando.id);
        if (clienteDuplicado) {
            this.showNotification('La cédula/RUC ya está registrado por otro cliente', 'danger');
            return;
        }
        
        // Actualizar el cliente
        const index = clientes.findIndex(c => c.id === this.clienteEditando.id);
        if (index === -1) {
            this.showNotification('Cliente no encontrado', 'error');
            return;
        }
        
        clientes[index] = {
            ...this.clienteEditando,
            cedula,
            nombre,
            direccion,
            telefono,
            email,
            fechaActualizacion: new Date().toISOString()
        };
        
        localStorage.setItem('clientes', JSON.stringify(clientes));
        
        this.showNotification('Cliente actualizado exitosamente', 'success');
        this.cerrarModal('clienteModal');
        this.loadClientes();
        this.resetearModalCliente();
    }
    
    resetearModalCliente() {
        // Limpiar el formulario
        document.getElementById('clienteForm').reset();
        
        // Restaurar el título y botón del modal
        document.querySelector('#clienteModal .modal-title').textContent = 'Nuevo Cliente';
        document.querySelector('#clienteModal .btn-primary').textContent = 'Guardar';
        
        // Restaurar el onclick del botón para usar guardarCliente
        const btnGuardar = document.querySelector('#clienteModal .btn-primary');
        btnGuardar.onclick = () => this.guardarCliente();
        
        // Limpiar la variable de edición
        this.clienteEditando = null;
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
                    <select class="form-select form-select-sm estado-reparacion-select" 
                            onchange="adminDashboard.cambiarEstadoReparacion('${reparacion.id}', this.value)"
                            data-estado="${reparacion.estado}"
                            style="min-width: 120px;">
                        <option value="pendiente" ${reparacion.estado === 'pendiente' ? 'selected' : ''}>Pendiente</option>
                        <option value="en-proceso" ${reparacion.estado === 'en-proceso' ? 'selected' : ''}>En Proceso</option>
                        <option value="espera" ${reparacion.estado === 'espera' ? 'selected' : ''}>En Espera</option>
                        <option value="finalizada" ${reparacion.estado === 'finalizada' ? 'selected' : ''}>Finalizada</option>
                    </select>
                </td>
                <td>${reparacion.mecanico}</td>
                <td>${new Date(reparacion.fecha).toLocaleDateString()}</td>
                <td>
                    <div class="btn-group" role="group">
                        <button class="btn btn-sm btn-outline-primary" onclick="adminDashboard.registrarMateriales('${reparacion.id}')" title="Registrar materiales">
                            <i class="fas fa-tools"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-info" onclick="adminDashboard.verFotosReparacion('${reparacion.id}')" title="Ver fotos">
                            <i class="fas fa-camera"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-warning" onclick="adminDashboard.editarReparacion('${reparacion.id}')" title="Editar reparación">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-success" onclick="adminDashboard.finalizarReparacion('${reparacion.id}')" title="Finalizar reparación">
                            <i class="fas fa-check"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="adminDashboard.eliminarReparacion('${reparacion.id}')" title="Eliminar reparación">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
        
        this.actualizarSelectClientesReparacion();
        this.actualizarSelectMecanicosReparacion();
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
    
    // Gestión de Materiales de Reparación
    registrarMateriales(reparacionId) {
        this.reparacionActual = reparacionId;
        this.materialesReparacion = [];
        
        // Cargar productos en el select
        const productos = this.getProductos().filter(p => p.stock > 0);
        const select = document.getElementById('productoMaterial');
        select.innerHTML = '<option value="">Seleccionar producto</option>';
        productos.forEach(producto => {
            const option = document.createElement('option');
            option.value = producto.id;
            option.textContent = `${producto.nombre} - $${producto.precio}`;
            option.dataset.precio = producto.precio;
            select.appendChild(option);
        });
        
        // Mostrar modal
        const modal = new bootstrap.Modal(document.getElementById('materialesModal'));
        modal.show();
        
        // Actualizar la lista de materiales registrados (inicialmente vacía)
        this.actualizarMaterialesRegistrados();
    }
    
    actualizarPrecioMaterial() {
        const select = document.getElementById('productoMaterial');
        const precioInput = document.getElementById('precioMaterial');
        
        if (select.value) {
            const option = select.options[select.selectedIndex];
            precioInput.value = option.dataset.precio;
            
            // Actualizar descuento máximo si el checkbox está marcado
            const descuentoCheck = document.getElementById('check_descuento_material');
            if (descuentoCheck && descuentoCheck.checked) {
                this.actualizarDescuentoMaximo();
            }
        } else {
            precioInput.value = '';
        }
    }
    
    mostrarSeccionProductoNoEncontrado() {
        const section = document.getElementById('productoNoEncontradoSection');
        const select = document.getElementById('productoMaterial');
        const btn = document.getElementById('btnProductoNoEncontrado');
        
        if (section.style.display === 'none') {
            section.style.display = 'block';
            select.value = '';
            select.disabled = true;
            btn.innerHTML = '<i class="fas fa-times me-1"></i>Cancelar producto nuevo';
            btn.className = 'btn btn-outline-secondary';
        } else {
            section.style.display = 'none';
            select.disabled = false;
            btn.innerHTML = '<i class="fas fa-plus-circle me-1"></i>Producto no encontrado en inventario';
            btn.className = 'btn btn-outline-warning';
            
            // Limpiar campos del producto nuevo
            document.getElementById('nuevoProductoNombre').value = '';
            document.getElementById('nuevoProductoDescripcion').value = '';
            document.getElementById('nuevoProductoPrecio').value = '';
            document.getElementById('nuevoProductoProveedor').value = '';
        }
    }
    
    agregarMaterial() {
        const productoId = document.getElementById('productoMaterial').value;
        const cantidad = parseInt(document.getElementById('cantidadMaterial').value);
        const observaciones = document.getElementById('observacionesMaterial').value;
        
        // Capturar descuento
        const descuentoCheck = document.getElementById('check_descuento_material');
        const descuentoInput = document.getElementById('descuentoMaterial');
        const descuento = descuentoCheck && descuentoCheck.checked ? parseFloat(descuentoInput.value) || 0 : 0;
        
        // Verificar si es un producto del inventario o uno nuevo
        const esProductoNuevo = document.getElementById('productoNoEncontradoSection').style.display !== 'none';
        
        if (esProductoNuevo) {
            // Agregar producto nuevo
            this.agregarProductoNuevo(cantidad, observaciones, descuento);
        } else {
            // Agregar producto del inventario
            if (!productoId || cantidad <= 0) {
                this.showNotification('Por favor complete los campos requeridos', 'warning');
                return;
            }
            
            const productos = this.getProductos();
            const producto = productos.find(p => p.id === productoId);
            
            if (!producto || cantidad > producto.stock) {
                this.showNotification('Cantidad no disponible en stock', 'warning');
                return;
            }
            
            const material = {
                id: Date.now().toString(),
                producto: producto.nombre,
                cantidad,
                precio: producto.precio,
                descuento: descuento,
                precioConDescuento: this.calcularPrecioConDescuento(producto.precio, descuento),
                observaciones,
                tipo: 'inventario'
            };
            
            this.materialesReparacion.push(material);
            this.actualizarMaterialesRegistrados();
            
            // Limpiar formulario
            document.getElementById('productoMaterial').value = '';
            document.getElementById('cantidadMaterial').value = '';
            document.getElementById('precioMaterial').value = '';
            document.getElementById('observacionesMaterial').value = '';
            document.getElementById('check_descuento_material').checked = false;
            document.getElementById('descuentoMaterial').value = '0';
            document.getElementById('descuentoMaterial').disabled = true;
            document.getElementById('descuentoMaterialInfo').style.display = 'none';
        }
    }
    
    agregarProductoNuevo(cantidad, observaciones, descuento) {
        const nombre = document.getElementById('nuevoProductoNombre').value;
        const descripcion = document.getElementById('nuevoProductoDescripcion').value;
        const precio = parseFloat(document.getElementById('nuevoProductoPrecio').value) || 0;
        const proveedor = document.getElementById('nuevoProductoProveedor').value;
        
        if (!nombre || cantidad <= 0) {
            this.showNotification('Por favor complete el nombre del producto y la cantidad', 'warning');
            return;
        }
        
        // Crear solicitud de adquisición
        const solicitudAdquisicion = {
            id: Date.now().toString(),
            nombre,
            descripcion,
            precioEstimado: precio,
            proveedorSugerido: proveedor,
            cantidadSolicitada: cantidad,
            observaciones,
            descuento: descuento,
            reparacionId: this.reparacionActual,
            fechaSolicitud: new Date().toISOString(),
            estado: 'pendiente',
            solicitadoPor: this.session.name
        };
        
        // Guardar solicitud de adquisición
        const solicitudes = this.getSolicitudesAdquisicion();
        solicitudes.push(solicitudAdquisicion);
        localStorage.setItem('solicitudesAdquisicion', JSON.stringify(solicitudes));
        
        // Crear material pendiente
        const material = {
            id: Date.now().toString(),
            producto: nombre,
            cantidad,
            precio: precio,
            descuento: descuento,
            precioConDescuento: this.calcularPrecioConDescuento(precio, descuento),
            observaciones,
            tipo: 'pendiente',
            solicitudId: solicitudAdquisicion.id
        };
        
        this.materialesReparacion.push(material);
        this.actualizarMaterialesRegistrados();
        
        // Crear notificación para el administrador
        this.crearNotificacionAdquisicion(solicitudAdquisicion);
        
        // Limpiar formulario
        this.mostrarSeccionProductoNoEncontrado();
        document.getElementById('cantidadMaterial').value = '';
        document.getElementById('observacionesMaterial').value = '';
        document.getElementById('check_descuento_material').checked = false;
        document.getElementById('descuentoMaterial').value = '0';
        document.getElementById('descuentoMaterial').disabled = true;
        document.getElementById('descuentoMaterialInfo').style.display = 'none';
        
        this.showNotification('Producto agregado como solicitud de adquisición', 'success');
    }
    
    crearNotificacionAdquisicion(solicitud) {
        const notificacion = {
            id: Date.now().toString(),
            titulo: 'Nueva Solicitud de Adquisición',
            mensaje: `Se solicita adquirir ${solicitud.cantidadSolicitada} unidades de "${solicitud.nombre}" para reparación #${solicitud.reparacionId}`,
            tipo: 'warning',
            fecha: new Date().toISOString(),
            leida: false,
            solicitudId: solicitud.id,
            destinatario: 'admin'
        };
        
        const notificaciones = this.getNotificaciones();
        notificaciones.unshift(notificacion);
        localStorage.setItem('notificaciones', JSON.stringify(notificaciones));
    }
    
    actualizarMaterialesRegistrados() {
        const container = document.getElementById('materialesRegistrados');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (this.materialesReparacion.length === 0) {
            container.innerHTML = '<div class="text-center text-muted p-3"><i class="fas fa-box-open me-2"></i>No hay materiales registrados</div>';
            return;
        }
        
        this.materialesReparacion.forEach((material, index) => {
            const div = document.createElement('div');
            const esPendiente = material.tipo === 'pendiente';
            const bgClass = esPendiente ? 'bg-warning bg-opacity-10' : 'bg-light';
            const borderClass = esPendiente ? 'border-warning' : 'border';
            
            div.className = `d-flex justify-content-between align-items-center mb-2 p-2 ${borderClass} rounded ${bgClass}`;
            
            let statusBadge = '';
            if (esPendiente) {
                statusBadge = '<span class="badge bg-warning text-dark me-2">Pendiente de Adquisición</span>';
            }
            
            // Calcular precio final con descuento
            const precioFinal = material.descuento && material.descuento > 0 
                ? material.precioConDescuento || this.calcularPrecioConDescuento(material.precio, material.descuento)
                : material.precio;
            
            const subtotal = precioFinal * material.cantidad;
            
            // Mostrar información de descuento
            let descuentoInfo = '';
            if (material.descuento && material.descuento > 0) {
                descuentoInfo = `
                    <br><small class="text-success">
                        <i class="fas fa-tag me-1"></i>Descuento: $${material.descuento.toFixed(2)} 
                        ($${material.precio} → $${precioFinal.toFixed(2)})
                    </small>
                `;
            }
            
            div.innerHTML = `
                <div>
                    <div class="d-flex align-items-center">
                        ${statusBadge}
                        <strong>${material.producto}</strong>
                    </div>
                    <small class="text-muted">Cantidad: ${material.cantidad} - $${material.precio} c/u</small>
                    ${descuentoInfo}
                    ${material.observaciones ? `<br><small class="text-muted">${material.observaciones}</small>` : ''}
                    ${esPendiente ? '<br><small class="text-warning"><i class="fas fa-clock me-1"></i>Esperando adquisición</small>' : ''}
                </div>
                <div class="d-flex align-items-center gap-2">
                    <span class="fw-bold">$${subtotal.toFixed(2)}</span>
                    <button class="btn btn-sm btn-outline-danger" onclick="adminDashboard.removerMaterial(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            container.appendChild(div);
        });
    }
    
    removerMaterial(index) {
        this.materialesReparacion.splice(index, 1);
        this.actualizarMaterialesRegistrados();
    }
    
    // Funciones de descuento para materiales
    toggleDescuentoMaterial() {
        const descuentoCheck = document.getElementById('check_descuento_material');
        const descuentoInput = document.getElementById('descuentoMaterial');
        const descuentoInfo = document.getElementById('descuentoMaterialInfo');
        const descuentoError = document.getElementById('descuentoMaterialError');
        
        if (descuentoCheck && descuentoInput) {
            descuentoInput.disabled = !descuentoCheck.checked;
            
            if (descuentoCheck.checked) {
                descuentoInput.value = '0';
                descuentoInfo.style.display = 'block';
                descuentoError.style.display = 'none';
                this.actualizarDescuentoMaximo();
            } else {
                descuentoInput.value = '0';
                descuentoInfo.style.display = 'none';
                descuentoError.style.display = 'none';
            }
        }
    }
    
    actualizarDescuentoMaximo() {
        const productoSelect = document.getElementById('productoMaterial');
        const descuentoMaximoSpan = document.getElementById('descuentoMaximoPermitido');
        
        if (productoSelect && productoSelect.value && descuentoMaximoSpan) {
            const productos = this.getProductos();
            const producto = productos.find(p => p.id === productoSelect.value);
            
            if (producto) {
                // Determinar descuento máximo basado en el producto
                let descuentoMaximo = 20; // Valor por defecto
                
                if (producto.descuentoMaximo) {
                    descuentoMaximo = producto.descuentoMaximo;
                } else if (producto.precio > 100) {
                    descuentoMaximo = 15; // Productos caros, menos descuento
                } else if (producto.precio > 50) {
                    descuentoMaximo = 20; // Productos medios
                } else {
                    descuentoMaximo = 25; // Productos baratos, más descuento
                }
                
                descuentoMaximoSpan.textContent = `${descuentoMaximo}%`;
                
                // Actualizar el max del input
                const descuentoInput = document.getElementById('descuentoMaterial');
                if (descuentoInput) {
                    descuentoInput.max = descuentoMaximo;
                    descuentoInput.dataset.maxDescuento = descuentoMaximo;
                }
            }
        }
    }
    
    validarDescuentoMaterial() {
        const descuentoInput = document.getElementById('descuentoMaterial');
        const descuentoError = document.getElementById('descuentoMaterialError');
        const descuentoErrorTexto = document.getElementById('descuentoErrorTexto');
        
        if (!descuentoInput || descuentoInput.disabled) return;
        
        const descuento = parseFloat(descuentoInput.value) || 0;
        const maxDescuento = parseFloat(descuentoInput.dataset.maxDescuento) || 20;
        
        if (descuento < 0) {
            this.mostrarErrorDescuento('El descuento no puede ser negativo');
            descuentoInput.value = '0';
        } else if (descuento > maxDescuento) {
            this.mostrarErrorDescuento(`El descuento no puede superar el ${maxDescuento}%`);
            descuentoInput.value = maxDescuento;
        } else if (descuento > 0 && descuento <= maxDescuento) {
            descuentoError.style.display = 'none';
        }
    }
    
    mostrarErrorDescuento(mensaje) {
        const descuentoError = document.getElementById('descuentoMaterialError');
        const descuentoErrorTexto = document.getElementById('descuentoErrorTexto');
        
        if (descuentoError && descuentoErrorTexto) {
            descuentoErrorTexto.textContent = mensaje;
            descuentoError.style.display = 'block';
            
            // Ocultar el error después de 3 segundos
            setTimeout(() => {
                descuentoError.style.display = 'none';
            }, 3000);
        }
    }
    
    calcularPrecioConDescuento(precio, descuento) {
        if (descuento <= 0) return precio;
        return precio - descuento;
    }
    
    // Finalización de Reparaciones
    finalizarReparacion(reparacionId) {
        const reparaciones = this.getReparaciones();
        const reparacion = reparaciones.find(r => r.id === reparacionId);
        
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
                            
                            <!-- Campo de Mano de Obra -->
                            <div class="mano-obra-section mb-4">
                                <div class="card">
                                    <div class="card-header bg-light">
                                        <h6 class="mb-0">
                                            <i class="fas fa-dollar-sign me-2 text-success"></i>
                                            Mano de Obra
                                        </h6>
                                    </div>
                                    <div class="card-body">
                                        <div class="row">
                                            <div class="col-md-6">
                                                <div class="mb-3">
                                                    <label for="manoObra" class="form-label">Costo de Mano de Obra ($)</label>
                                                    <input type="number" class="form-control" id="manoObra" 
                                                           placeholder="0.00" step="0.01" min="0" 
                                                           value="${reparacion.manoObra || ''}">
                                                    <div class="form-text">
                                                        <i class="fas fa-info-circle me-1"></i>
                                                        Ingrese el costo de la mano de obra aplicada
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="col-md-6">
                                                <div class="mb-3">
                                                    <label for="observacionesManoObra" class="form-label">Observaciones</label>
                                                    <textarea class="form-control" id="observacionesManoObra" 
                                                              rows="2" placeholder="Detalles adicionales sobre la mano de obra...">${reparacion.observacionesManoObra || ''}</textarea>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="finalizar-reparacion-section">
                                
                                <div class="foto-instructions">
                                    <i class="fas fa-lightbulb"></i>
                                    <strong>Importante:</strong> Capture o suba fotografías como evidencia del trabajo finalizado. 
                                    Las fotografías finales son obligatorias para completar la reparación.
                                </div>
                                
                                <div class="fotos-container" id="fotosFinalesContainer">
                                    <div class="foto-placeholder" onclick="capturarFoto('fotosFinales')">
                                        <i class="fas fa-camera"></i>
                                        <span>Capturar<br>Foto</span>
                                    </div>
                                    <div class="foto-placeholder" onclick="subirArchivo('fotosFinales')">
                                        <i class="fas fa-upload"></i>
                                        <span>Subir<br>Imágenes</span>
                                    </div>
                                </div>
                                
                                <!-- Contenedor para mostrar las fotos capturadas -->
                                <div id="fotosFinales" class="fotos-display-container mt-3" style="min-height: 100px; border: 2px dashed #dee2e6; border-radius: 8px; padding: 10px; text-align: center;">
                                    <div class="text-muted">
                                        <i class="fas fa-images me-2"></i>
                                        Las fotos capturadas aparecerán aquí
                                    </div>
                                </div>
                                
                                <div class="text-center mt-3">
                                    <small class="text-muted">
                                        <i class="fas fa-shield-alt me-1"></i>
                                        Las fotografías se almacenan de forma segura y forman parte del historial de la reparación
                                    </div>
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
        // Verificar que el fotoManager esté disponible
        if (!window.fotoManager) {
            this.showNotification('Error: Sistema de fotos no disponible', 'error');
            return;
        }
        
        // Verificar que hay fotos finales
        const fotosFinales = window.fotoManager.obtenerFotos('fotosFinales');
        
        if (!fotosFinales || fotosFinales.length === 0) {
            this.showNotification('Debe capturar al menos una foto final como evidencia', 'warning');
            return;
        }
        
        // Capturar datos de mano de obra
        const manoObra = parseFloat(document.getElementById('manoObra').value) || 0;
        const observacionesManoObra = document.getElementById('observacionesManoObra').value;
        
        const reparaciones = this.getReparaciones();
        const reparacion = reparaciones.find(r => r.id === reparacionId);
        
        if (reparacion) {
            reparacion.estado = 'finalizada';
            reparacion.materiales = [...this.materialesReparacion];
            reparacion.fotosFinales = fotosFinales;
            reparacion.fechaFinalizacion = new Date().toISOString();
            reparacion.manoObra = manoObra;
            reparacion.observacionesManoObra = observacionesManoObra;
            
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
        try {
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
            
            // Total materiales
            y += 10;
            doc.setFontSize(14);
            doc.text('TOTAL MATERIALES:', 140, y);
            doc.text(`$${totalMateriales.toFixed(2)}`, 180, y);
            y += 15;
        } else {
            let y = 100;
        }
        
        // Mano de obra
        if (reparacion.manoObra && reparacion.manoObra > 0) {
            doc.setFontSize(12);
            doc.text('MANO DE OBRA:', 20, y);
            doc.text(`$${reparacion.manoObra.toFixed(2)}`, 180, y);
            y += 10;
            
            if (reparacion.observacionesManoObra) {
                doc.setFontSize(10);
                doc.text('Observaciones:', 20, y);
                y += 5;
                doc.text(reparacion.observacionesManoObra, 20, y);
                y += 10;
            }
        }
        
        // Total general
        const totalMateriales = reparacion.materiales ? reparacion.materiales.reduce((sum, material) => {
            const subtotal = material.precio * material.cantidad;
            return sum + subtotal;
        }, 0) : 0;
        const totalGeneral = totalMateriales + (reparacion.manoObra || 0);
        
        doc.setFontSize(14);
        doc.text('TOTAL GENERAL:', 140, y);
        doc.text(`$${totalGeneral.toFixed(2)}`, 180, y);
        
        // Información de evidencia fotográfica
        const yFinal = y + 20; // Usar la posición final después del total general
        doc.setFontSize(12);
        doc.text('EVIDENCIA FOTOGRÁFICA:', 20, yFinal);
        doc.text(`Fotos iniciales: ${reparacion.fotosIniciales ? reparacion.fotosIniciales.length : 0}`, 20, yFinal + 10);
        doc.text(`Fotos finales: ${reparacion.fotosFinales ? reparacion.fotosFinales.length : 0}`, 20, yFinal + 20);
        
        // Guardar PDF
        doc.save(`reparacion-${reparacion.id}.pdf`);
        } catch (error) {
            console.error('Error al generar recibo de reparación:', error);
            this.showNotification('Error al generar el recibo PDF', 'error');
        }
    }
    
    // Cambio de estado de reparaciones
    cambiarEstadoReparacion(reparacionId, nuevoEstado) {
        const reparaciones = this.getReparaciones();
        const reparacion = reparaciones.find(r => r.id === reparacionId);
        
        if (!reparacion) {
            this.showNotification('Reparación no encontrada', 'error');
            return;
        }
        
        const estadoAnterior = reparacion.estado;
        reparacion.estado = nuevoEstado;
        
        // Guardar cambios
        localStorage.setItem('reparaciones', JSON.stringify(reparaciones));
        
        // Actualizar el atributo data-estado del dropdown
        const dropdown = document.querySelector(`select[onchange*="${reparacionId}"]`);
        if (dropdown) {
            dropdown.setAttribute('data-estado', nuevoEstado);
        }
        
        // Mostrar notificación
        this.showNotification(`Estado cambiado de "${estadoAnterior}" a "${nuevoEstado}"`, 'success');
        
        // Crear notificación del cambio
        this.crearNotificacion(
            'Estado de reparación actualizado', 
            `Reparación #${reparacionId} cambió de ${estadoAnterior} a ${nuevoEstado}`, 
            'info'
        );
        
        // Actualizar dashboard si es necesario
        this.loadDashboardData();
    }
    
    // Visualización de fotos de reparaciones
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
    
    // Edición de reparaciones
    editarReparacion(reparacionId) {
        const reparaciones = this.getReparaciones();
        const reparacion = reparaciones.find(r => r.id === reparacionId);
        
        if (!reparacion) {
            this.showNotification('Reparación no encontrada', 'error');
            return;
        }
        
        // Llenar el formulario con los datos de la reparación
        document.getElementById('clienteReparacion').value = reparacion.cliente;
        document.getElementById('mecanicoReparacion').value = reparacion.mecanico;
        document.getElementById('marcaMoto').value = reparacion.marca;
        document.getElementById('modeloMoto').value = reparacion.modelo;
        document.getElementById('fallaReparacion').value = reparacion.falla;
        
        // Cargar fotos existentes si las hay
        if (reparacion.fotosIniciales && reparacion.fotosIniciales.length > 0) {
            this.cargarFotosExistentes(reparacion.fotosIniciales);
        }
        
        // Guardar el ID de la reparación que se está editando
        this.reparacionEditando = reparacionId;
        
        // Cambiar el título del modal
        const modalTitle = document.querySelector('#reparacionModal .modal-title');
        if (modalTitle) {
            modalTitle.textContent = 'Editar Reparación';
        }
        
        // Cambiar el botón de guardar
        const guardarBtn = document.querySelector('#reparacionModal .btn-primary');
        if (guardarBtn) {
            guardarBtn.textContent = 'Actualizar';
            guardarBtn.onclick = () => this.actualizarReparacion();
        }
        
        // Mostrar el modal
        const modal = new bootstrap.Modal(document.getElementById('reparacionModal'));
        modal.show();
    }
    
    actualizarReparacion() {
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
        
        const reparaciones = this.getReparaciones();
        const index = reparaciones.findIndex(r => r.id === this.reparacionEditando);
        
        if (index > -1) {
            reparaciones[index].cliente = cliente;
            reparaciones[index].mecanico = mecanico;
            reparaciones[index].marca = marca;
            reparaciones[index].modelo = modelo;
            reparaciones[index].falla = falla;
            reparaciones[index].fotosIniciales = fotosIniciales;
            
            localStorage.setItem('reparaciones', JSON.stringify(reparaciones));
            
            this.showNotification('Reparación actualizada exitosamente', 'success');
            this.cerrarModal('reparacionModal');
            this.loadReparaciones();
            
            // Limpiar la variable de edición
            this.reparacionEditando = null;
        }
    }
    
    // Eliminación de reparaciones
    eliminarReparacion(reparacionId) {
        if (confirm('¿Está seguro de eliminar esta reparación?')) {
            const reparaciones = this.getReparaciones();
            const index = reparaciones.findIndex(r => r.id === reparacionId);
            
            if (index > -1) {
                reparaciones.splice(index, 1);
                localStorage.setItem('reparaciones', JSON.stringify(reparaciones));
                
                this.showNotification('Reparación eliminada exitosamente', 'success');
                this.loadReparaciones();
                this.loadDashboardData();
            }
        }
    }
    
    // Función para cargar fotos existentes en el modal de edición
    cargarFotosExistentes(fotos) {
        const container = document.getElementById('fotosIniciales');
        if (!container) return;
        
        // Limpiar contenedor
        container.innerHTML = '';
        
        if (fotos && fotos.length > 0) {
            fotos.forEach((foto, index) => {
                const fotoDiv = document.createElement('div');
                fotoDiv.className = 'foto-item';
                fotoDiv.style.cssText = 'display: inline-block; margin: 5px; position: relative;';
                
                fotoDiv.innerHTML = `
                    <img src="${foto.data}" alt="Foto inicial ${index + 1}" 
                         style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; cursor: pointer;" 
                         onclick="window.fotoManager.verFoto('${foto.data}')">
                    <button type="button" class="btn btn-sm btn-danger" 
                            style="position: absolute; top: -5px; right: -5px; width: 20px; height: 20px; padding: 0; border-radius: 50%; font-size: 10px;"
                            onclick="adminDashboard.eliminarFotoExistente(${index})">
                        <i class="fas fa-times"></i>
                    </button>
                `;
                
                container.appendChild(fotoDiv);
            });
        }
        
        // Inicializar el fotoManager con las fotos existentes
        if (window.fotoManager) {
            window.fotoManager.fotosIniciales = fotos || [];
        }
    }
    
    // Función para eliminar una foto existente
    eliminarFotoExistente(index) {
        if (window.fotoManager && window.fotoManager.fotosIniciales) {
            window.fotoManager.fotosIniciales.splice(index, 1);
            this.cargarFotosExistentes(window.fotoManager.fotosIniciales);
        }
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
    
    actualizarSelectClientesReparacion() {
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
    
    // Funciones del buscador de clientes
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
    
    // Carga Masiva
    cargarProductosMasivo() {
        console.log('Iniciando carga masiva de productos...');
        
        const fileInput = document.getElementById('archivoProductosMasivo');
        if (!fileInput) {
            console.error('No se encontró el input de archivo');
            this.showNotification('Error: No se encontró el campo de archivo', 'danger');
            return;
        }
        
        const file = fileInput.files[0];
        
        if (!file) {
            this.showNotification('Por favor seleccione un archivo', 'warning');
            return;
        }
        
        console.log('Archivo seleccionado:', file.name, 'Tamaño:', file.size);
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                console.log('Archivo leído correctamente');
                const csv = e.target.result;
                
                // Remover BOM si existe y líneas vacías
                let csvContent = csv.replace(/^\uFEFF/, ''); // Remover BOM
                const lines = csvContent.split('\n').filter(line => line.trim());
                
                console.log('Líneas encontradas:', lines.length);
                
                if (lines.length < 2) {
                    this.showNotification('El archivo debe contener al menos una línea de encabezados y una línea de datos', 'warning');
                    return;
                }
                
                // Verificar si la primera línea es sep=,
                let startIndex = 0;
                let separator = ',';
                if (lines[0].startsWith('sep=')) {
                    separator = lines[0].substring(4); // Extraer el separador después de 'sep='
                    startIndex = 1;
                    console.log('Separador detectado:', separator);
                } else {
                    // Detectar automáticamente el separador
                    const firstDataLine = lines[startIndex];
                    if (firstDataLine.includes(';')) {
                        separator = ';';
                    } else if (firstDataLine.includes(',')) {
                        separator = ',';
                    }
                    console.log('Separador automático detectado:', separator);
                }
                
                const headers = lines[startIndex].split(separator);
                console.log('Headers encontrados:', headers);
                
                let productosCargados = 0;
                let productosDuplicados = 0;
                let productosConError = 0;
                
                for (let i = startIndex + 1; i < lines.length; i++) {
                    if (lines[i].trim()) {
                        try {
                            const values = lines[i].split(separator);
                            const codigo = values[0]?.trim();
                            
                            if (!codigo) {
                                console.warn(`Línea ${i + 1}: Código vacío, saltando...`);
                                productosConError++;
                                continue;
                            }
                            
                            // Verificar si el código ya existe
                            const productos = this.getProductos();
                            const productoExistente = productos.find(p => p.codigo === codigo);
                            
                            if (productoExistente) {
                                console.log(`Producto duplicado encontrado: ${codigo}`);
                                productosDuplicados++;
                                continue; // Saltar productos duplicados
                            }
                            
                            const producto = {
                                id: Date.now().toString() + i,
                                codigo: codigo,
                                nombre: values[1]?.trim() || 'Sin nombre',
                                descripcion: values[2]?.trim() || 'Sin descripción',
                                codigoQR: values[3]?.trim() || codigo, // Si no hay QR, usar el código
                                precio: parseFloat(values[4]) || 0,
                                descuentoMinimo: parseFloat(values[5]) || 0,
                                descuentoMaximo: parseFloat(values[6]) || 0,
                                stock: parseInt(values[7]) || 0,
                                stockMinimo: parseInt(values[8]) || 5,
                                stockMaximo: parseInt(values[9]) || 100,
                                estado: values[10]?.trim() || 'Activo',
                                proveedor: values[11]?.trim() || 'Sin proveedor',
                                fechaCreacion: new Date().toISOString()
                            };
                            
                            productos.push(producto);
                            productosCargados++;
                            console.log(`Producto cargado: ${codigo} - ${producto.nombre}`);
                            
                        } catch (error) {
                            console.error(`Error procesando línea ${i + 1}:`, error);
                            productosConError++;
                        }
                    }
                }
                
                // Guardar todos los productos de una vez
                const productos = this.getProductos();
                localStorage.setItem('productos', JSON.stringify(productos));
                
                // Cerrar modal
                const modalElement = document.getElementById('cargaMasivaProductosModal');
                if (modalElement) {
                    const modal = bootstrap.Modal.getInstance(modalElement);
                    if (modal) {
                        modal.hide();
                    }
                }
                
                // Mostrar notificación con resultados
                let mensaje = `${productosCargados} productos cargados exitosamente`;
                if (productosDuplicados > 0) {
                    mensaje += `. ${productosDuplicados} productos duplicados fueron omitidos`;
                }
                if (productosConError > 0) {
                    mensaje += `. ${productosConError} productos con errores fueron omitidos`;
                }
                
                console.log('Resultado final:', mensaje);
                this.showNotification(mensaje, 'success');
                
                // Recargar datos
                this.loadProductos();
                this.loadDashboardData();
                
                // Limpiar formulario
                const form = document.getElementById('cargaMasivaProductosForm');
                if (form) {
                    form.reset();
                }
                
            } catch (error) {
                console.error('Error general al procesar el archivo:', error);
                this.showNotification('Error al procesar el archivo: ' + error.message, 'danger');
            }
        };
        
        reader.onerror = (error) => {
            console.error('Error al leer el archivo:', error);
            this.showNotification('Error al leer el archivo', 'danger');
        };
        
        reader.readAsText(file);
    }
    
    descargarFormatoProductos() {
        // Crear contenido CSV con headers y ejemplos
        const csvContent = `sep=;
codigo;nombre;descripcion;codigoQR;precio;descuentoMinimo;descuentoMaximo;stock;stockMinimo;stockMaximo;estado;proveedor
PROD001;Aceite de Motor 4T;Aceite sintético para motos 4T 1L;PROD001;15.50;0.00;0.00;50;5;100;Activo;Aceites Pro
PROD002;Filtro de Aire;Filtro de aire de alta calidad universal;PROD002;8.75;0.00;0.00;30;5;100;Activo;Filtros Max
PROD003;Pastillas de Freno;Par de pastillas de freno delantero;PROD003;12.00;0.00;0.00;25;5;100;Activo;Frenos Seguros
PROD004;Cadena de Transmisión;Cadena de transmisión 520 para motos;PROD004;45.00;0.00;0.00;15;5;100;Activo;Transmisiones Rápidas
PROD005;Bujía NGK;Bujía NGK CR8E para motos;PROD005;5.25;0.00;0.00;100;5;100;Activo;Bujías Elite`;
        
        // Crear blob con BOM para Excel
        const BOM = '\uFEFF';
        const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', 'formato_productos.csv');
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
        
        this.showNotification('Formato CSV descargado exitosamente', 'success');
    }
    
    cargarProveedoresMasivo() {
        console.log('Iniciando carga masiva de proveedores...');
        
        const fileInput = document.getElementById('archivoProveedoresMasivo');
        if (!fileInput) {
            console.error('No se encontró el input de archivo de proveedores');
            this.showNotification('Error: No se encontró el campo de archivo', 'danger');
            return;
        }
        
        const file = fileInput.files[0];
        
        if (!file) {
            this.showNotification('Por favor seleccione un archivo', 'warning');
            return;
        }
        
        console.log('Archivo de proveedores seleccionado:', file.name, 'Tamaño:', file.size);
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                console.log('Archivo de proveedores leído correctamente');
                const csv = e.target.result;
                
                // Remover BOM si existe y líneas vacías
                let csvContent = csv.replace(/^\uFEFF/, ''); // Remover BOM
                const lines = csvContent.split('\n').filter(line => line.trim());
                
                console.log('Líneas de proveedores encontradas:', lines.length);
                
                if (lines.length < 2) {
                    this.showNotification('El archivo debe contener al menos una línea de encabezados y una línea de datos', 'warning');
                    return;
                }
                
                // Verificar si la primera línea es sep=,
                let startIndex = 0;
                let separator = ',';
                if (lines[0].startsWith('sep=')) {
                    separator = lines[0].substring(4); // Extraer el separador después de 'sep='
                    startIndex = 1;
                    console.log('Separador de proveedores detectado:', separator);
                } else {
                    // Detectar automáticamente el separador
                    const firstDataLine = lines[startIndex];
                    if (firstDataLine.includes(';')) {
                        separator = ';';
                    } else if (firstDataLine.includes(',')) {
                        separator = ',';
                    }
                    console.log('Separador automático de proveedores detectado:', separator);
                }
                
                const headers = lines[startIndex].split(separator);
                console.log('Headers de proveedores encontrados:', headers);
                
                let proveedoresCargados = 0;
                let proveedoresDuplicados = 0;
                let proveedoresConError = 0;
                
                for (let i = startIndex + 1; i < lines.length; i++) {
                    if (lines[i].trim()) {
                        try {
                            const values = lines[i].split(separator);
                            const ruc = values[0]?.trim();
                            
                            if (!ruc) {
                                console.warn(`Línea ${i + 1}: RUC vacío, saltando...`);
                                proveedoresConError++;
                                continue;
                            }
                            
                            // Verificar si el RUC ya existe
                            const proveedores = this.getProveedores();
                            const proveedorExistente = proveedores.find(p => p.ruc === ruc);
                            
                            if (proveedorExistente) {
                                console.log(`Proveedor duplicado encontrado: ${ruc}`);
                                proveedoresDuplicados++;
                                continue; // Saltar proveedores duplicados
                            }
                            
                            const proveedor = {
                                id: Date.now().toString() + i,
                                ruc: ruc,
                                nombre: values[1]?.trim() || 'Sin nombre',
                                direccion: values[2]?.trim() || 'Sin dirección',
                                telefono: values[3]?.trim() || 'Sin teléfono',
                                email: values[4]?.trim() || 'Sin email',
                                fechaCreacion: new Date().toISOString()
                            };
                            
                            proveedores.push(proveedor);
                            proveedoresCargados++;
                            console.log(`Proveedor cargado: ${ruc} - ${proveedor.nombre}`);
                            
                        } catch (error) {
                            console.error(`Error procesando línea ${i + 1} de proveedores:`, error);
                            proveedoresConError++;
                        }
                    }
                }
                
                // Guardar todos los proveedores de una vez
                const proveedores = this.getProveedores();
                localStorage.setItem('proveedores', JSON.stringify(proveedores));
                
                // Cerrar modal
                const modalElement = document.getElementById('cargaMasivaProveedoresModal');
                if (modalElement) {
                    const modal = bootstrap.Modal.getInstance(modalElement);
                    if (modal) {
                        modal.hide();
                    }
                }
                
                // Mostrar notificación con resultados
                let mensaje = `${proveedoresCargados} proveedores cargados exitosamente`;
                if (proveedoresDuplicados > 0) {
                    mensaje += `. ${proveedoresDuplicados} proveedores duplicados fueron omitidos`;
                }
                if (proveedoresConError > 0) {
                    mensaje += `. ${proveedoresConError} proveedores con errores fueron omitidos`;
                }
                
                console.log('Resultado final de proveedores:', mensaje);
                this.showNotification(mensaje, 'success');
                
                // Recargar datos
                this.loadProveedores();
                this.loadDashboardData();
                
                // Limpiar formulario
                const form = document.getElementById('cargaMasivaProveedoresForm');
                if (form) {
                    form.reset();
                }
                
            } catch (error) {
                console.error('Error general al procesar archivo de proveedores:', error);
                this.showNotification('Error al procesar el archivo: ' + error.message, 'danger');
            }
        };
        
        reader.onerror = (error) => {
            console.error('Error al leer archivo de proveedores:', error);
            this.showNotification('Error al leer el archivo', 'danger');
        };
        
        reader.readAsText(file);
    }
    
    descargarFormatoProveedores() {
        // Crear contenido CSV con headers y ejemplos
        const csvContent = `sep=;
ruc;nombre;direccion;telefono;email
12345678901;Distribuidora Motos;Av. Principal 123;0987654321;contacto@distribuidora.com
98765432109;Repuestos SA;Calle Secundaria 456;0123456789;info@repuestos.com
45678912301;Aceites Pro;Av. Industrial 789;0555666777;ventas@aceitespro.com
78912345602;Filtros Max;Calle Comercial 321;0444555666;info@filtrosmax.com
32165498703;Frenos Seguros;Av. Técnica 654;0333444555;contacto@frenosseguros.com`;
        
        // Crear blob con BOM para Excel
        const BOM = '\uFEFF';
        const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', 'formato_proveedores.csv');
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
        
        this.showNotification('Formato CSV descargado exitosamente', 'success');
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
    
    getSolicitudesAdquisicion() {
        return JSON.parse(localStorage.getItem('solicitudesAdquisicion') || '[]');
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
    
    // Función para resetear el modal de reparación después de guardar
    resetearModalReparacion() {
        // Limpiar formulario
        document.getElementById('reparacionForm').reset();
        
        // Limpiar fotos
        const fotosContainer = document.getElementById('fotosIniciales');
        if (fotosContainer) {
            fotosContainer.innerHTML = '';
        }
        
        // Resetear fotoManager si está disponible
        if (window.fotoManager) {
            window.fotoManager.fotosIniciales = [];
        }
        
        // Restaurar título y botón originales
        const modalTitle = document.querySelector('#reparacionModal .modal-title');
        if (modalTitle) {
            modalTitle.textContent = 'Nueva Reparación';
        }
        
        const guardarBtn = document.querySelector('#reparacionModal .btn-primary');
        if (guardarBtn) {
            guardarBtn.textContent = 'Guardar';
            guardarBtn.onclick = () => this.guardarReparacion();
        }
        
        // Limpiar variable de edición
        this.reparacionEditando = null;
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
        
        // Si es el modal de reparación, resetear completamente
        if (modalId === 'reparacionModal') {
            this.resetearModalReparacion();
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
        console.log('Editando producto con ID:', id);
        
        const productos = this.getProductos();
        const producto = productos.find(p => p.id === id);
        
        if (!producto) {
            this.showNotification('Producto no encontrado', 'error');
            return;
        }
        
        console.log('Producto encontrado:', producto);
        
        // Llenar el modal con los datos del producto
        const codigoInput = document.getElementById('codigoProducto');
        const nombreInput = document.getElementById('nombreProducto');
        const descripcionInput = document.getElementById('descripcionProducto');
        const codigoQRInput = document.getElementById('codigoQRProducto');
        const precioInput = document.getElementById('precioProducto');
        const descuentoMinimoInput = document.getElementById('descuentoMinimoProducto');
        const descuentoMaximoInput = document.getElementById('descuentoMaximoProducto');
        const stockInput = document.getElementById('stockProducto');
        const stockMinimoInput = document.getElementById('stockMinimoProducto');
        const stockMaximoInput = document.getElementById('stockMaximoProducto');
        const proveedorInput = document.getElementById('proveedorProducto');
        
        // Verificar que todos los elementos existan
        if (!codigoInput || !nombreInput || !descripcionInput || !codigoQRInput || 
            !precioInput || !descuentoMinimoInput || !descuentoMaximoInput || 
            !stockInput || !stockMinimoInput || !stockMaximoInput || !proveedorInput) {
            console.error('No se encontraron todos los elementos del formulario');
            this.showNotification('Error al cargar el formulario de edición', 'error');
            return;
        }
        
        // Llenar los campos con los datos del producto
        codigoInput.value = producto.codigo || '';
        nombreInput.value = producto.nombre || '';
        descripcionInput.value = producto.descripcion || '';
        codigoQRInput.value = producto.codigoQR || producto.codigo || '';
        precioInput.value = producto.precio || '';
        descuentoMinimoInput.value = producto.descuentoMinimo || producto.descuento || 0;
        descuentoMaximoInput.value = producto.descuentoMaximo || 0;
        stockInput.value = producto.stock || '';
        stockMinimoInput.value = producto.stockMinimo || 5;
        stockMaximoInput.value = producto.stockMaximo || 100;
        proveedorInput.value = producto.proveedor || '';
        
        // Generar vista previa del QR
        const codigoParaQR = producto.codigoQR || producto.codigo || 'PROD-' + Date.now();
        this.generarVistaPreviaQR(codigoParaQR);
        
        // Cambiar el título del modal
        const modalTitle = document.querySelector('#productoModal .modal-title');
        if (modalTitle) {
            modalTitle.textContent = 'Editar Producto';
        }
        
        // Cambiar el botón de guardar
        const btnGuardar = document.querySelector('#productoModal .btn-primary');
        if (btnGuardar) {
            btnGuardar.textContent = 'Actualizar';
            btnGuardar.onclick = () => this.actualizarProducto(id);
        }
        
        // Mostrar el modal
        const modalElement = document.getElementById('productoModal');
        if (modalElement) {
            const modal = new bootstrap.Modal(modalElement);
            modal.show();
        } else {
            console.error('Modal de producto no encontrado');
            this.showNotification('Error al abrir el modal de edición', 'error');
        }
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
        console.log('Actualizando producto con ID:', id);
        
        // Obtener valores del formulario
        const codigoInput = document.getElementById('codigoProducto');
        const nombreInput = document.getElementById('nombreProducto');
        const descripcionInput = document.getElementById('descripcionProducto');
        const codigoQRInput = document.getElementById('codigoQRProducto');
        const precioInput = document.getElementById('precioProducto');
        const descuentoMinimoInput = document.getElementById('descuentoMinimoProducto');
        const descuentoMaximoInput = document.getElementById('descuentoMaximoProducto');
        const stockInput = document.getElementById('stockProducto');
        const stockMinimoInput = document.getElementById('stockMinimoProducto');
        const stockMaximoInput = document.getElementById('stockMaximoProducto');
        const proveedorInput = document.getElementById('proveedorProducto');
        
        // Verificar que todos los elementos existan
        if (!codigoInput || !nombreInput || !descripcionInput || !codigoQRInput || 
            !precioInput || !descuentoMinimoInput || !descuentoMaximoInput || 
            !stockInput || !stockMinimoInput || !stockMaximoInput || !proveedorInput) {
            console.error('No se encontraron todos los elementos del formulario');
            this.showNotification('Error al obtener datos del formulario', 'error');
            return;
        }
        
        // Obtener valores
        const codigo = codigoInput.value.trim();
        const nombre = nombreInput.value.trim();
        const descripcion = descripcionInput.value.trim();
        const codigoQR = codigoQRInput.value.trim() || codigo; // Si no se ingresa QR, usar el código
        const precio = parseFloat(precioInput.value);
        const descuentoMinimo = parseFloat(descuentoMinimoInput.value) || 0;
        const descuentoMaximo = parseFloat(descuentoMaximoInput.value) || 0;
        const stock = parseInt(stockInput.value);
        const stockMinimo = parseInt(stockMinimoInput.value);
        const stockMaximo = parseInt(stockMaximoInput.value);
        const proveedor = proveedorInput.value.trim();
        
        // Validar campos requeridos
        if (!codigo || !nombre || !precio || !stock || !stockMinimo || !stockMaximo || !proveedor) {
            this.showNotification('Por favor complete todos los campos requeridos', 'warning');
            return;
        }
        
        // Validar valores numéricos
        if (isNaN(precio) || precio <= 0) {
            this.showNotification('El precio debe ser un número mayor a 0', 'warning');
            return;
        }
        
        if (isNaN(stock) || stock < 0) {
            this.showNotification('El stock debe ser un número mayor o igual a 0', 'warning');
            return;
        }
        
        if (isNaN(stockMinimo) || stockMinimo < 0) {
            this.showNotification('El stock mínimo debe ser un número mayor o igual a 0', 'warning');
            return;
        }
        
        if (isNaN(stockMaximo) || stockMaximo <= stockMinimo) {
            this.showNotification('El stock máximo debe ser mayor al stock mínimo', 'warning');
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
                codigoQR,
                precio,
                descuentoMinimo,
                descuentoMaximo,
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
        
        // Limpiar vista previa del QR
        this.generarVistaPreviaQR('');
        
        // Restaurar título del modal
        document.querySelector('#productoModal .modal-title').textContent = 'Nuevo Producto';
        
        // Restaurar botón de guardar
        const btnGuardar = document.querySelector('#productoModal .btn-primary');
        btnGuardar.textContent = 'Guardar';
        btnGuardar.onclick = () => this.guardarProducto();
    }
    
    abrirModalNuevoProducto() {
        // Limpiar formulario
        document.getElementById('productoForm').reset();
        
        // Generar vista previa del QR con código por defecto
        this.generarVistaPreviaQR('');
        
        // Restaurar título del modal
        document.querySelector('#productoModal .modal-title').textContent = 'Nuevo Producto';
        
        // Restaurar botón de guardar
        const btnGuardar = document.querySelector('#productoModal .btn-primary');
        btnGuardar.textContent = 'Guardar';
        btnGuardar.onclick = () => this.guardarProducto();
        
        // Mostrar el modal
        const modal = new bootstrap.Modal(document.getElementById('productoModal'));
        modal.show();
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
        const proveedores = this.getProveedores();
        const proveedor = proveedores.find(p => p.id === id);
        
        if (!proveedor) {
            this.showNotification('Proveedor no encontrado', 'error');
            return;
        }
        
        // Marcar que estamos editando
        this.proveedorEditando = proveedor;
        
        // Llenar el modal con los datos del proveedor
        document.getElementById('rucProveedor').value = proveedor.ruc;
        document.getElementById('nombreProveedor').value = proveedor.nombre;
        document.getElementById('direccionProveedor').value = proveedor.direccion;
        document.getElementById('telefonoProveedor').value = proveedor.telefono;
        document.getElementById('emailProveedor').value = proveedor.email;
        
        // Cambiar el título del modal y el texto del botón
        document.querySelector('#proveedorModal .modal-title').textContent = 'Editar Proveedor';
        document.querySelector('#proveedorModal .btn-primary').textContent = 'Actualizar';
        
        // Cambiar el onclick del botón para usar actualizarProveedor
        const btnGuardar = document.querySelector('#proveedorModal .btn-primary');
        btnGuardar.onclick = () => this.actualizarProveedor();
        
        // Abrir el modal
        const modal = new bootstrap.Modal(document.getElementById('proveedorModal'));
        modal.show();
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
        const clientes = this.getClientes();
        const cliente = clientes.find(c => c.id === id);
        
        if (!cliente) {
            this.showNotification('Cliente no encontrado', 'error');
            return;
        }
        
        // Marcar que estamos editando
        this.clienteEditando = cliente;
        
        // Llenar el modal con los datos del cliente
        document.getElementById('cedulaCliente').value = cliente.cedula;
        document.getElementById('nombreCliente').value = cliente.nombre;
        document.getElementById('direccionCliente').value = cliente.direccion;
        document.getElementById('telefonoCliente').value = cliente.telefono;
        document.getElementById('emailCliente').value = cliente.email;
        
        // Cambiar el título del modal y el texto del botón
        document.querySelector('#clienteModal .modal-title').textContent = 'Editar Cliente';
        document.querySelector('#clienteModal .btn-primary').textContent = 'Actualizar';
        
        // Cambiar el onclick del botón para usar actualizarCliente
        const btnGuardar = document.querySelector('#clienteModal .btn-primary');
        btnGuardar.onclick = () => this.actualizarCliente();
        
        // Abrir el modal
        const modal = new bootstrap.Modal(document.getElementById('clienteModal'));
        modal.show();
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
        let ventas = JSON.parse(localStorage.getItem('ventas') || '[]');
        
        // Si no hay ventas, generar datos de ejemplo
        if (ventas.length === 0) {
            ventas = this.generarVentasEjemplo();
            localStorage.setItem('ventas', JSON.stringify(ventas));
        }
        
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

    generarVentasEjemplo() {
        const ventasEjemplo = [
            {
                numero: 'F001-2024',
                cliente: 'Juan Pérez',
                productos: [
                    { nombre: 'Filtro de aceite Honda', precio: 15.50, cantidad: 2 },
                    { nombre: 'Aceite de motor 10W-30', precio: 25.00, cantidad: 1 }
                ],
                subtotal: 56.00,
                iva: 6.72,
                total: 62.72,
                fecha: new Date(2024, 11, 15).toISOString()
            },
            {
                numero: 'F002-2024',
                cliente: 'María González',
                productos: [
                    { nombre: 'Batería de moto 12V', precio: 45.00, cantidad: 1 },
                    { nombre: 'Cable de bujía', precio: 8.50, cantidad: 1 }
                ],
                subtotal: 53.50,
                iva: 6.42,
                total: 59.92,
                fecha: new Date(2024, 11, 14).toISOString()
            },
            {
                numero: 'F003-2024',
                cliente: 'Carlos Rodríguez',
                productos: [
                    { nombre: 'Freno de disco delantero', precio: 35.00, cantidad: 1 },
                    { nombre: 'Pastillas de freno', precio: 12.00, cantidad: 2 }
                ],
                subtotal: 59.00,
                iva: 7.08,
                total: 66.08,
                fecha: new Date(2024, 11, 13).toISOString()
            },
            {
                numero: 'F004-2024',
                cliente: 'Ana Martínez',
                productos: [
                    { nombre: 'Cadena de transmisión', precio: 28.00, cantidad: 1 },
                    { nombre: 'Piñón trasero', precio: 18.50, cantidad: 1 }
                ],
                subtotal: 46.50,
                iva: 5.58,
                total: 52.08,
                fecha: new Date(2024, 11, 12).toISOString()
            },
            {
                numero: 'F005-2024',
                cliente: 'Luis Torres',
                productos: [
                    { nombre: 'Espejo retrovisor derecho', precio: 22.00, cantidad: 1 },
                    { nombre: 'Manillar de aluminio', precio: 55.00, cantidad: 1 }
                ],
                subtotal: 77.00,
                iva: 9.24,
                total: 86.24,
                fecha: new Date(2024, 11, 11).toISOString()
            }
        ];
        
        return ventasEjemplo;
    }

    renderVentasTable(ventas, tableElement) {
        if (ventas.length === 0) {
            tableElement.innerHTML = '<tr><td colspan="8" class="text-center text-muted">No hay ventas registradas</td></tr>';
            return;
        }

        tableElement.innerHTML = ventas.map(factura => {
            const productos = factura.productos.map(p => p.nombre).join(', ');
            const fecha = new Date(factura.fecha).toLocaleDateString('es-ES');
            const nombreCliente = typeof factura.cliente === 'string' ? factura.cliente : factura.cliente.nombre;
            
            return `
                <tr>
                    <td>${factura.numero}</td>
                    <td>${nombreCliente}</td>
                    <td>${productos}</td>
                    <td>$${factura.subtotal.toFixed(2)}</td>
                    <td>$${factura.iva.toFixed(2)}</td>
                    <td>$${factura.total.toFixed(2)}</td>
                    <td>${fecha}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary" onclick="adminDashboard.verFactura('${factura.numero}')" title="Ver detalles de la venta">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-success" onclick="adminDashboard.descargarFactura('${factura.numero}')" title="Descargar factura PDF">
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
            const nombreCliente = typeof factura.cliente === 'string' ? factura.cliente : factura.cliente.nombre;
            
            return `
                <tr>
                    <td>${factura.numero}</td>
                    <td>${nombreCliente}</td>
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
        const ventas = JSON.parse(localStorage.getItem('ventas') || '[]');
        const searchTerm = document.getElementById('searchVentas')?.value.toLowerCase() || '';
        const filtroMes = document.getElementById('filtroMesVentas')?.value || '';
        
        let ventasFiltradas = ventas;
        
        // Filtrar por búsqueda
        if (searchTerm) {
            ventasFiltradas = ventasFiltradas.filter(factura => {
                const nombreCliente = typeof factura.cliente === 'string' ? factura.cliente : factura.cliente.nombre;
                return nombreCliente.toLowerCase().includes(searchTerm) ||
                       factura.numero.toLowerCase().includes(searchTerm) ||
                       factura.productos.some(p => p.nombre.toLowerCase().includes(searchTerm));
            });
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
        const ventas = JSON.parse(localStorage.getItem('ventas') || '[]');
        const factura = ventas.find(f => f.numero === numeroFactura);
        
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
                            <h5 class="modal-title"><i class="fas fa-receipt me-2"></i>Factura ${factura.numero}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row">
                                <div class="col-md-6">
                                    <h6>Datos del Cliente</h6>
                                    ${typeof factura.cliente === 'string' ? 
                                        `<p><strong>Nombre:</strong> ${factura.cliente}</p>
                                         <p><strong>Cédula/RUC:</strong> No especificada</p>
                                         <p><strong>Dirección:</strong> No especificada</p>
                                         <p><strong>Teléfono:</strong> No especificado</p>` :
                                        `<p><strong>Nombre:</strong> ${factura.cliente.nombre}</p>
                                         <p><strong>Cédula/RUC:</strong> ${factura.cliente.cedula || 'No especificada'}</p>
                                         <p><strong>Dirección:</strong> ${factura.cliente.direccion || 'No especificada'}</p>
                                         <p><strong>Teléfono:</strong> ${factura.cliente.telefono || 'No especificado'}</p>`
                                    }
                                </div>
                                <div class="col-md-6">
                                    <h6><i class="fas fa-file-invoice me-2"></i>Datos de la Factura</h6>
                                    <p><strong>Número:</strong> ${factura.numero}</p>
                                    <p><strong>Fecha:</strong> ${new Date(factura.fecha).toLocaleDateString('es-ES')}</p>
                                    <p><strong>Vendedor:</strong> ${factura.vendedor}</p>
                                </div>
                            </div>
                            <hr>
                            <h6><i class="fas fa-boxes me-2"></i>Productos</h6>
                            <div class="table-responsive">
                                <table class="table table-sm table-striped">
                                    <thead class="table-light">
                                        <tr>
                                            <th>Producto</th>
                                            <th>Cantidad</th>
                                            <th>Precio Unit.</th>
                                            <th>Descuento</th>
                                            <th>Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${factura.productos.map(p => `
                                            <tr>
                                                <td>${p.nombre}</td>
                                                <td>${p.cantidad}</td>
                                                <td>$${p.precio.toFixed(2)}</td>
                                                <td>${p.descuento && p.descuento > 0 ? `<span class="text-success">-$${p.descuento.toFixed(2)}</span>` : '-'}</td>
                                                <td>$${((p.precio - (p.descuento || 0)) * p.cantidad).toFixed(2)}</td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                            <div class="row mt-3">
                                <div class="col-md-6 offset-md-6">
                                    <table class="table table-sm table-borderless">
                                        <tr>
                                            <td><strong>Subtotal:</strong></td>
                                            <td>$${(factura.subtotalSinDescuento || factura.subtotal).toFixed(2)}</td>
                                        </tr>
                                        ${factura.descuentoTotal && factura.descuentoTotal > 0 ? `
                                        <tr class="table-success">
                                            <td><strong>Descuento:</strong></td>
                                            <td class="text-success">-$${factura.descuentoTotal.toFixed(2)}</td>
                                        </tr>
                                        ` : ''}
                                        <tr>
                                            <td><strong>Subtotal con descuento:</strong></td>
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
        const ventas = JSON.parse(localStorage.getItem('ventas') || '[]');
        const factura = ventas.find(f => f.numero === numeroFactura);
        
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
        let ventas = this.getVentas();
        
        // Si no hay ventas, generar datos de ejemplo
        if (ventas.length === 0) {
            ventas = this.generarVentasEjemplo();
            localStorage.setItem('ventas', JSON.stringify(ventas));
        }
        
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
        
        // Configurar eventos para el código QR
        this.setupQREvents();
    }
    
    // Funciones para el código QR
    setupQREvents() {
        const codigoQRInput = document.getElementById('codigoQRProducto');
        const codigoInput = document.getElementById('codigoProducto');
        
        if (codigoQRInput) {
            codigoQRInput.addEventListener('input', (e) => {
                const valor = e.target.value || codigoInput?.value || '';
                // Agregar un pequeño delay para evitar generación excesiva
                clearTimeout(this.qrTimeout);
                this.qrTimeout = setTimeout(() => {
                    this.generarVistaPreviaQR(valor);
                }, 300);
            });
        }
        
        if (codigoInput) {
            codigoInput.addEventListener('input', (e) => {
                const codigoQRValor = codigoQRInput?.value || '';
                const valor = codigoQRValor || e.target.value || '';
                // Agregar un pequeño delay para evitar generación excesiva
                clearTimeout(this.qrTimeout);
                this.qrTimeout = setTimeout(() => {
                    this.generarVistaPreviaQR(valor);
                }, 300);
            });
        }
    }
    
    generarVistaPreviaQR(texto) {
        const qrPreview = document.getElementById('qrPreview');
        if (!qrPreview) {
            return;
        }
        
        // Si no hay texto, generar un código por defecto
        if (!texto) {
            texto = 'PROD-' + Date.now();
        }
        
        // Limpiar el contenedor
        qrPreview.innerHTML = '';
        
        try {
            // Verificar si la librería QR está disponible
            if (typeof QRCode === 'undefined') {
                qrPreview.innerHTML = '<small class="text-warning">Librería QR no disponible</small>';
                return;
            }
            
            // Intentar primero con toDataURL
            if (QRCode.toDataURL) {
                QRCode.toDataURL(texto, {
                    width: 120,
                    height: 120,
                    margin: 2,
                    color: {
                        dark: '#000000',
                        light: '#FFFFFF'
                    }
                }, (error, url) => {
                    if (error) {
                        console.error('Error con toDataURL:', error);
                        // Intentar con toCanvas como fallback
                        this.generarQRConCanvas(texto, qrPreview);
                    } else {
                        // Crear imagen del QR
                        const img = document.createElement('img');
                        img.src = url;
                        img.alt = 'Código QR';
                        img.style.maxWidth = '100%';
                        img.style.height = 'auto';
                        qrPreview.appendChild(img);
                    }
                });
            } else {
                // Fallback a toCanvas
                this.generarQRConCanvas(texto, qrPreview);
            }
        } catch (error) {
            console.error('Error en generarVistaPreviaQR:', error);
            // Intentar con toCanvas como último recurso
            this.generarQRConCanvas(texto, qrPreview);
        }
    }
    
    generarQRConCanvas(texto, qrPreview) {
        try {
            if (QRCode.toCanvas) {
                QRCode.toCanvas(qrPreview, texto, {
                    width: 120,
                    height: 120,
                    margin: 2,
                    color: {
                        dark: '#000000',
                        light: '#FFFFFF'
                    }
                }, (error) => {
                    if (error) {
                        console.error('Error con toCanvas:', error);
                        qrPreview.innerHTML = '<small class="text-danger">Error al generar QR</small>';
                    }
                });
            } else {
                qrPreview.innerHTML = '<small class="text-danger">Métodos QR no disponibles</small>';
            }
        } catch (error) {
            console.error('Error en generarQRConCanvas:', error);
            qrPreview.innerHTML = '<small class="text-danger">Error al generar QR</small>';
        }
    }

    // Función para generar PDF de productos con códigos QR
    async generarPDFProductos() {
        try {
            console.log('Iniciando generación de PDF...');
            
            const productos = this.getProductos();
            console.log('Productos encontrados:', productos.length);
            
            if (productos.length === 0) {
                this.showNotification('No hay productos para generar el PDF', 'warning');
                return;
            }

            // Mostrar indicador de carga
            this.showNotification('Generando PDF con códigos QR...', 'info');

            // Verificar que jsPDF esté disponible
            if (typeof window.jspdf === 'undefined') {
                throw new Error('jsPDF no está disponible');
            }

            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            // Configuración del documento
            const pageWidth = doc.internal.pageSize.width;
            const pageHeight = doc.internal.pageSize.height;
            const margin = 20;
            const contentWidth = pageWidth - (margin * 2);
            
            // Título del documento
            doc.setFontSize(20);
            doc.setFont('helvetica', 'bold');
            doc.text('Catálogo de Productos', pageWidth / 2, 30, { align: 'center' });
            
            doc.setFontSize(12);
            doc.setFont('helvetica', 'normal');
            doc.text(`Generado el: ${new Date().toLocaleDateString('es-ES')}`, pageWidth / 2, 40, { align: 'center' });
            
            let yPosition = 60;
            let productIndex = 0;
            
            for (const producto of productos) {
                console.log(`Procesando producto ${productIndex + 1}: ${producto.nombre}`);
                
                // Verificar si necesitamos una nueva página
                if (yPosition > pageHeight - 120) {
                    doc.addPage();
                    yPosition = 30;
                }
                
                // Generar código QR para el producto
                const qrData = JSON.stringify({
                    id: producto.id,
                    codigo: producto.codigo,
                    nombre: producto.nombre,
                    precio: producto.precio,
                    descripcion: producto.descripcion
                });
                
                try {
                    // Generar QR como imagen base64
                    console.log('Generando QR para:', producto.nombre);
                    const qrImage = await this.generarQRAsDataURL(qrData);
                    
                    // Calcular posición centrada para el QR
                    const qrSize = 40;
                    const qrX = margin + (contentWidth - qrSize) / 2;
                    
                    // Agregar código QR centrado
                    doc.addImage(qrImage, 'PNG', qrX, yPosition, qrSize, qrSize);
                    
                    // Información del producto debajo del QR
                    const textY = yPosition + qrSize + 10;
                    
                    // Nombre del producto
                    doc.setFontSize(16);
                    doc.setFont('helvetica', 'bold');
                    doc.text(producto.nombre, pageWidth / 2, textY, { align: 'center' });
                    
                    // Descripción
                    doc.setFontSize(12);
                    doc.setFont('helvetica', 'normal');
                    const descripcion = producto.descripcion || 'Sin descripción';
                    const maxWidth = contentWidth - 20;
                    const descripcionLines = doc.splitTextToSize(descripcion, maxWidth);
                    
                    let descY = textY + 10;
                    for (const line of descripcionLines) {
                        doc.text(line, pageWidth / 2, descY, { align: 'center' });
                        descY += 6;
                    }
                    
                    // Precio
                    doc.setFontSize(14);
                    doc.setFont('helvetica', 'bold');
                    doc.text(`$${producto.precio}`, pageWidth / 2, descY + 5, { align: 'center' });
                    
                    // Línea separadora
                    yPosition = descY + 20;
                    doc.line(margin, yPosition, pageWidth - margin, yPosition);
                    yPosition += 15;
                    
                } catch (qrError) {
                    console.error('Error generando QR para producto:', producto.nombre, qrError);
                    
                    // Continuar sin QR si hay error
                    doc.setFontSize(16);
                    doc.setFont('helvetica', 'bold');
                    doc.text(producto.nombre, pageWidth / 2, yPosition + 20, { align: 'center' });
                    
                    doc.setFontSize(12);
                    doc.setFont('helvetica', 'normal');
                    const descripcion = producto.descripcion || 'Sin descripción';
                    const maxWidth = contentWidth - 20;
                    const descripcionLines = doc.splitTextToSize(descripcion, maxWidth);
                    
                    let descY = yPosition + 30;
                    for (const line of descripcionLines) {
                        doc.text(line, pageWidth / 2, descY, { align: 'center' });
                        descY += 6;
                    }
                    
                    doc.setFontSize(14);
                    doc.setFont('helvetica', 'bold');
                    doc.text(`$${producto.precio}`, pageWidth / 2, descY + 5, { align: 'center' });
                    
                    yPosition = descY + 20;
                    doc.line(margin, yPosition, pageWidth - margin, yPosition);
                    yPosition += 15;
                }
                
                productIndex++;
            }
            
            // Guardar el PDF
            const filename = `catalogo-productos-${new Date().toISOString().split('T')[0]}.pdf`;
            console.log('Guardando PDF como:', filename);
            doc.save(filename);
            
            this.showNotification('PDF generado exitosamente', 'success');
            
        } catch (error) {
            console.error('Error generando PDF:', error);
            this.showNotification('Error al generar el PDF: ' + error.message, 'danger');
        }
    }

    // Función auxiliar para generar QR como DataURL
    async generarQRAsDataURL(text) {
        return new Promise((resolve, reject) => {
            try {
                QRCode.toDataURL(text, {
                    width: 128,
                    margin: 2,
                    color: {
                        dark: '#000000',
                        light: '#FFFFFF'
                    }
                }, (error, url) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(url);
                    }
                });
            } catch (error) {
                reject(error);
            }
        });
    }
}

// Funciones globales para los botones
function showSection(sectionName) {
    if (window.adminDashboard) {
        window.adminDashboard.showSection(sectionName);
    } else {
        console.error('adminDashboard no está inicializado');
    }
}

function showTab(tabName) {
    console.log('Función global showTab llamada con:', tabName);
    if (window.adminDashboard) {
        window.adminDashboard.showTab(tabName);
    } else {
        console.error('adminDashboard no está inicializado');
    }
}

// Función global para editar productos
function editarProducto(id) {
    console.log('Función global editarProducto llamada con ID:', id);
    
    // Intentar usar el dashboard si está disponible
    if (window.adminDashboard && typeof window.adminDashboard.editarProducto === 'function') {
        try {
            window.adminDashboard.editarProducto(id);
            return;
        } catch (error) {
            console.error('Error al ejecutar editarProducto del dashboard:', error);
        }
    }
    
    // Si el dashboard no está disponible, usar la función directa
    console.log('Usando función directa de edición');
    editarProductoDirecto(id);
}

// Función directa para editar productos (sin depender del dashboard)
function editarProductoDirecto(id) {
    console.log('Editando producto con ID:', id);
    
    const productos = JSON.parse(localStorage.getItem('productos') || '[]');
    const producto = productos.find(p => p.id === id);
    
    if (!producto) {
        console.error('Producto no encontrado');
        alert('Producto no encontrado');
        return;
    }
    
    console.log('Producto encontrado:', producto);
    
    // Llenar el modal con los datos del producto
    const codigoInput = document.getElementById('codigoProducto');
    const nombreInput = document.getElementById('nombreProducto');
    const descripcionInput = document.getElementById('descripcionProducto');
    const codigoQRInput = document.getElementById('codigoQRProducto');
    const precioInput = document.getElementById('precioProducto');
    const descuentoMinimoInput = document.getElementById('descuentoMinimoProducto');
    const descuentoMaximoInput = document.getElementById('descuentoMaximoProducto');
    const stockInput = document.getElementById('stockProducto');
    const stockMinimoInput = document.getElementById('stockMinimoProducto');
    const stockMaximoInput = document.getElementById('stockMaximoProducto');
    const proveedorInput = document.getElementById('proveedorProducto');
    
    // Verificar que todos los elementos existan
    if (!codigoInput || !nombreInput || !descripcionInput || !codigoQRInput || 
        !precioInput || !descuentoMinimoInput || !descuentoMaximoInput || 
        !stockInput || !stockMinimoInput || !stockMaximoInput || !proveedorInput) {
        console.error('No se encontraron todos los elementos del formulario');
        alert('Error al cargar el formulario de edición');
        return;
    }
    
    // Llenar los campos con los datos del producto
    codigoInput.value = producto.codigo || '';
    nombreInput.value = producto.nombre || '';
    descripcionInput.value = producto.descripcion || '';
    codigoQRInput.value = producto.codigoQR || producto.codigo || '';
    precioInput.value = producto.precio || '';
    descuentoMinimoInput.value = producto.descuentoMinimo || producto.descuento || 0;
    descuentoMaximoInput.value = producto.descuentoMaximo || 0;
    stockInput.value = producto.stock || '';
    stockMinimoInput.value = producto.stockMinimo || 5;
    stockMaximoInput.value = producto.stockMaximo || 100;
    proveedorInput.value = producto.proveedor || '';
    
            // Generar vista previa del QR inmediatamente
        const codigoParaQR = producto.codigoQR || producto.codigo || 'PROD-' + Date.now();
        setTimeout(() => {
            generarVistaPreviaQR(codigoParaQR);
        }, 100);
    
    // Cambiar el título del modal
    const modalTitle = document.querySelector('#productoModal .modal-title');
    if (modalTitle) {
        modalTitle.textContent = 'Editar Producto';
    }
    
    // Cambiar el botón de guardar
    const btnGuardar = document.querySelector('#productoModal .btn-primary');
    if (btnGuardar) {
        btnGuardar.textContent = 'Actualizar';
        btnGuardar.onclick = () => actualizarProductoDirecto(id);
    }
    
    // Mostrar el modal
    const modalElement = document.getElementById('productoModal');
    if (modalElement) {
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
    } else {
        console.error('Modal de producto no encontrado');
        alert('Error al abrir el modal de edición');
    }
}



// Función directa para actualizar productos
function actualizarProductoDirecto(id) {
    console.log('Actualizando producto con ID:', id);
    
    // Obtener valores del formulario
    const codigo = document.getElementById('codigoProducto').value.trim();
    const nombre = document.getElementById('nombreProducto').value.trim();
    const descripcion = document.getElementById('descripcionProducto').value.trim();
    const codigoQR = document.getElementById('codigoQRProducto').value.trim() || codigo;
    const precio = parseFloat(document.getElementById('precioProducto').value);
    const descuentoMinimo = parseFloat(document.getElementById('descuentoMinimoProducto').value) || 0;
    const descuentoMaximo = parseFloat(document.getElementById('descuentoMaximoProducto').value) || 0;
    const stock = parseInt(document.getElementById('stockProducto').value);
    const stockMinimo = parseInt(document.getElementById('stockMinimoProducto').value);
    const stockMaximo = parseInt(document.getElementById('stockMaximoProducto').value);
    const proveedor = document.getElementById('proveedorProducto').value.trim();
    
    // Validar campos requeridos
    if (!codigo || !nombre || !precio || !stock || !stockMinimo || !stockMaximo || !proveedor) {
        alert('Por favor complete todos los campos requeridos');
        return;
    }
    
    // Actualizar el producto
    const productos = JSON.parse(localStorage.getItem('productos') || '[]');
    const index = productos.findIndex(p => p.id === id);
    
    if (index > -1) {
        productos[index] = {
            ...productos[index],
            codigo,
            nombre,
            descripcion,
            codigoQR,
            precio,
            descuentoMinimo,
            descuentoMaximo,
            stock,
            stockMinimo,
            stockMaximo,
            proveedor,
            fechaActualizacion: new Date().toISOString()
        };
        
        localStorage.setItem('productos', JSON.stringify(productos));
        console.log('Producto actualizado:', productos[index]);
        alert('Producto actualizado exitosamente');
        
        // Cerrar modal y actualizar tabla
        const modal = bootstrap.Modal.getInstance(document.getElementById('productoModal'));
        modal.hide();
        
        // Recargar la tabla si el dashboard está disponible
        if (window.adminDashboard && typeof window.adminDashboard.loadProductos === 'function') {
            window.adminDashboard.loadProductos();
        }
        
        // Restaurar modal
        resetearModalProducto();
    } else {
        alert('Producto no encontrado');
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
    
    // Usar directamente la imagen QR
    setTimeout(() => {
        mostrarQRImagen(texto);
    }, 100);
    
    function mostrarQRImagen(texto) {
        console.log('Mostrando imagen QR');
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

// Función para resetear modal de producto
function resetearModalProducto() {
    const form = document.getElementById('productoForm');
    if (form) {
        form.reset();
    }
    
    generarVistaPreviaQR('');
    
    const modalTitle = document.querySelector('#productoModal .modal-title');
    if (modalTitle) {
        modalTitle.textContent = 'Nuevo Producto';
    }
    
    const btnGuardar = document.querySelector('#productoModal .btn-primary');
    if (btnGuardar) {
        btnGuardar.textContent = 'Guardar';
        btnGuardar.onclick = () => guardarProducto();
    }
}

// Función para configurar actualización QR en tiempo real
function configurarActualizacionQR() {
    const codigoQRInput = document.getElementById('codigoQRProducto');
    if (codigoQRInput) {
        // Remover event listeners anteriores para evitar duplicados
        codigoQRInput.removeEventListener('input', actualizarQRInput);
        codigoQRInput.addEventListener('input', actualizarQRInput);
        console.log('Configuración de actualización QR configurada');
    }
}

// Función para actualizar QR cuando se escribe en el campo
function actualizarQRInput() {
    const texto = this.value.trim();
    if (texto) {
        generarVistaPreviaQR(texto);
    } else {
        // Si está vacío, generar QR con el código del producto
        const codigoProducto = document.getElementById('codigoProducto');
        if (codigoProducto && codigoProducto.value.trim()) {
            generarVistaPreviaQR(codigoProducto.value.trim());
        }
    }
}

// Función global para eliminar productos
function eliminarProducto(id) {
    console.log('Función global eliminarProducto llamada con ID:', id);
    console.log('Estado de window.adminDashboard:', window.adminDashboard);
    
    if (window.adminDashboard && typeof window.adminDashboard.eliminarProducto === 'function') {
        try {
            window.adminDashboard.eliminarProducto(id);
        } catch (error) {
            console.error('Error al ejecutar eliminarProducto:', error);
            alert('Error al eliminar el producto: ' + error.message);
        }
    } else {
        console.error('adminDashboard no está inicializado o no tiene el método eliminarProducto');
        console.log('adminDashboard disponible:', window.adminDashboard);
        alert('Error: El sistema no está inicializado correctamente. Por favor, recarga la página.');
    }
}

function guardarProducto() {
    adminDashboard.guardarProducto();
}

function actualizarProducto(id) {
    adminDashboard.actualizarProducto(id);
}

function abrirModalNuevoProducto() {
    adminDashboard.abrirModalNuevoProducto();
}

function confirmarEliminarProducto(id) {
    adminDashboard.confirmarEliminarProducto(id);
}

function procesarCargaMasivaProductos() {
    console.log('Función global procesarCargaMasivaProductos llamada');
    
    if (window.adminDashboard && typeof window.adminDashboard.cargarProductosMasivo === 'function') {
        try {
            window.adminDashboard.cargarProductosMasivo();
        } catch (error) {
            console.error('Error al ejecutar cargarProductosMasivo:', error);
            alert('Error al procesar la carga masiva: ' + error.message);
        }
    } else {
        console.error('adminDashboard no está inicializado o no tiene el método cargarProductosMasivo');
        alert('Error: El sistema no está inicializado correctamente. Por favor, recarga la página.');
    }
}

function procesarCargaMasivaProveedores() {
    console.log('Función global procesarCargaMasivaProveedores llamada');
    
    if (window.adminDashboard && typeof window.adminDashboard.cargarProveedoresMasivo === 'function') {
        try {
            window.adminDashboard.cargarProveedoresMasivo();
        } catch (error) {
            console.error('Error al ejecutar cargarProveedoresMasivo:', error);
            alert('Error al procesar la carga masiva de proveedores: ' + error.message);
        }
    } else {
        console.error('adminDashboard no está inicializado o no tiene el método cargarProveedoresMasivo');
        alert('Error: El sistema no está inicializado correctamente. Por favor, recarga la página.');
    }
}

function descargarFormatoProductos() {
    console.log('Función global descargarFormatoProductos llamada');
    
    if (window.adminDashboard && typeof window.adminDashboard.descargarFormatoProductos === 'function') {
        try {
            window.adminDashboard.descargarFormatoProductos();
        } catch (error) {
            console.error('Error al ejecutar descargarFormatoProductos:', error);
            alert('Error al descargar el formato: ' + error.message);
        }
    } else {
        console.error('adminDashboard no está inicializado o no tiene el método descargarFormatoProductos');
        alert('Error: El sistema no está inicializado correctamente. Por favor, recarga la página.');
    }
}

function descargarFormatoProveedores() {
    console.log('Función global descargarFormatoProveedores llamada');
    
    if (window.adminDashboard && typeof window.adminDashboard.descargarFormatoProveedores === 'function') {
        try {
            window.adminDashboard.descargarFormatoProveedores();
        } catch (error) {
            console.error('Error al ejecutar descargarFormatoProveedores:', error);
            alert('Error al descargar el formato de proveedores: ' + error.message);
        }
    } else {
        console.error('adminDashboard no está inicializado o no tiene el método descargarFormatoProveedores');
        alert('Error: El sistema no está inicializado correctamente. Por favor, recarga la página.');
    }
}

function guardarProveedor() {
    adminDashboard.guardarProveedor();
}

// Función global para editar proveedores
function editarProveedor(id) {
    console.log('Función global editarProveedor llamada con ID:', id);
    
    // Intentar usar el dashboard si está disponible
    if (window.adminDashboard && typeof window.adminDashboard.editarProveedor === 'function') {
        try {
            window.adminDashboard.editarProveedor(id);
            return;
        } catch (error) {
            console.error('Error al ejecutar editarProveedor del dashboard:', error);
        }
    }
    
    // Si el dashboard no está disponible, usar la función directa
    console.log('Usando función directa de edición de proveedor');
    editarProveedorDirecto(id);
}

// Función directa para editar proveedores (sin depender del dashboard)
function editarProveedorDirecto(id) {
    console.log('Editando proveedor con ID:', id);
    
    const proveedores = JSON.parse(localStorage.getItem('proveedores') || '[]');
    const proveedor = proveedores.find(p => p.id === id);
    
    if (!proveedor) {
        console.error('Proveedor no encontrado');
        alert('Proveedor no encontrado');
        return;
    }
    
    console.log('Proveedor encontrado:', proveedor);
    
    // Llenar el modal con los datos del proveedor
    const rucInput = document.getElementById('rucProveedor');
    const nombreInput = document.getElementById('nombreProveedor');
    const direccionInput = document.getElementById('direccionProveedor');
    const telefonoInput = document.getElementById('telefonoProveedor');
    const emailInput = document.getElementById('emailProveedor');
    
    // Verificar que todos los elementos existan
    if (!rucInput || !nombreInput || !direccionInput || !telefonoInput || !emailInput) {
        console.error('No se encontraron todos los elementos del formulario de proveedor');
        alert('Error al cargar el formulario de edición de proveedor');
        return;
    }
    
    // Llenar los campos con los datos del proveedor
    rucInput.value = proveedor.ruc || '';
    nombreInput.value = proveedor.nombre || '';
    direccionInput.value = proveedor.direccion || '';
    telefonoInput.value = proveedor.telefono || '';
    emailInput.value = proveedor.email || '';
    
    // Cambiar el título del modal
    const modalTitle = document.querySelector('#proveedorModal .modal-title');
    if (modalTitle) {
        modalTitle.textContent = 'Editar Proveedor';
    }
    
    // Cambiar el botón de guardar
    const btnGuardar = document.querySelector('#proveedorModal .btn-primary');
    if (btnGuardar) {
        btnGuardar.textContent = 'Actualizar';
        btnGuardar.onclick = () => actualizarProveedorDirecto(id);
    }
    
    // Mostrar el modal
    const modalElement = document.getElementById('proveedorModal');
    if (modalElement) {
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
    } else {
        console.error('Modal de proveedor no encontrado');
        alert('Error al abrir el modal de edición de proveedor');
    }
}

// Función directa para actualizar proveedores
function actualizarProveedorDirecto(id) {
    console.log('Actualizando proveedor con ID:', id);
    
    // Obtener valores del formulario
    const ruc = document.getElementById('rucProveedor').value.trim();
    const nombre = document.getElementById('nombreProveedor').value.trim();
    const direccion = document.getElementById('direccionProveedor').value.trim();
    const telefono = document.getElementById('telefonoProveedor').value.trim();
    const email = document.getElementById('emailProveedor').value.trim();
    
    // Validar campos requeridos
    if (!ruc || !nombre || !direccion || !telefono || !email) {
        alert('Por favor complete todos los campos requeridos');
        return;
    }
    
    // Verificar que el RUC no esté duplicado (excluyendo el proveedor actual)
    const proveedores = JSON.parse(localStorage.getItem('proveedores') || '[]');
    const proveedorDuplicado = proveedores.find(p => p.ruc === ruc && p.id !== id);
    if (proveedorDuplicado) {
        alert('El RUC ya está registrado por otro proveedor');
        return;
    }
    
    // Actualizar el proveedor
    const index = proveedores.findIndex(p => p.id === id);
    
    if (index > -1) {
        proveedores[index] = {
            ...proveedores[index],
            ruc,
            nombre,
            direccion,
            telefono,
            email,
            fechaActualizacion: new Date().toISOString()
        };
        
        localStorage.setItem('proveedores', JSON.stringify(proveedores));
        console.log('Proveedor actualizado:', proveedores[index]);
        alert('Proveedor actualizado exitosamente');
        
        // Cerrar modal y actualizar tabla
        const modal = bootstrap.Modal.getInstance(document.getElementById('proveedorModal'));
        modal.hide();
        
        // Recargar la tabla si el dashboard está disponible
        if (window.adminDashboard && typeof window.adminDashboard.loadProveedores === 'function') {
            window.adminDashboard.loadProveedores();
        }
        
        // Restaurar modal
        resetearModalProveedor();
    } else {
        alert('Proveedor no encontrado');
    }
}

// Función para resetear modal de proveedor
function resetearModalProveedor() {
    const form = document.getElementById('proveedorForm');
    if (form) {
        form.reset();
    }
    
    const modalTitle = document.querySelector('#proveedorModal .modal-title');
    if (modalTitle) {
        modalTitle.textContent = 'Nuevo Proveedor';
    }
    
    const btnGuardar = document.querySelector('#proveedorModal .btn-primary');
    if (btnGuardar) {
        btnGuardar.textContent = 'Guardar';
        btnGuardar.onclick = () => guardarProveedor();
    }
}

// Función global para eliminar proveedores
function eliminarProveedor(id) {
    console.log('Función global eliminarProveedor llamada con ID:', id);
    console.log('Estado de window.adminDashboard:', window.adminDashboard);
    
    if (window.adminDashboard && typeof window.adminDashboard.eliminarProveedor === 'function') {
        try {
            window.adminDashboard.eliminarProveedor(id);
        } catch (error) {
            console.error('Error al ejecutar eliminarProveedor:', error);
            alert('Error al eliminar el proveedor: ' + error.message);
        }
    } else {
        console.error('adminDashboard no está inicializado o no tiene el método eliminarProveedor');
        console.log('adminDashboard disponible:', window.adminDashboard);
        alert('Error: El sistema no está inicializado correctamente. Por favor, recarga la página.');
    }
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

// Funciones globales para los botones
function guardarReparacion() {
    adminDashboard.guardarReparacion();
}

function agregarMaterial() {
    adminDashboard.agregarMaterial();
}

function mostrarSeccionProductoNoEncontrado() {
    adminDashboard.mostrarSeccionProductoNoEncontrado();
}

function toggleDescuentoMaterial() {
    adminDashboard.toggleDescuentoMaterial();
}

function validarDescuentoMaterial() {
    adminDashboard.validarDescuentoMaterial();
}

function actualizarPrecioMaterial() {
    adminDashboard.actualizarPrecioMaterial();
}



// Comentario: La inicialización del dashboard se maneja en el archivo HTML
// para evitar conflictos de inicialización múltiple
