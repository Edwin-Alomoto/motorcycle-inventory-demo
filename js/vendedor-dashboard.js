// Dashboard del Vendedor
class VendedorDashboard {
    constructor() {
        // Verificar autenticación sin crear nueva instancia
        const session = localStorage.getItem('session');
        this.session = session ? JSON.parse(session) : null;
        
        if (!this.session || this.session.role !== 'vendedor') {
            window.location.href = 'index.html';
            return;
        }
        
        this.productosSeleccionados = [];
        this.materialesReparacion = [];
        this.reparacionActual = null;
        
        this.init();
    }
    
    init() {
        this.setupUserInfo();
        this.setupNavigation();
        this.loadDashboardData();
        this.setupEventListeners();
        this.loadAllData();
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
            'ventas': 'Nueva Venta',
            'productos': 'Catálogo de Productos',
            'clientes': 'Gestión de Clientes',
            'reparaciones': 'Gestión de Reparaciones',
            'facturas': 'Historial de Facturas',
            'notificaciones': 'Notificaciones'
        };
        
        document.getElementById('pageTitle').textContent = titles[sectionName] || 'Dashboard';
        
        // Cargar datos específicos de la sección
        this.loadSectionData(sectionName);
    }
    
    showTab(tabName) {
        console.log('showTab vendedor llamado con:', tabName);
        
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
            console.error('Error en showTab vendedor:', error);
        }
    }
    
    loadSectionData(sectionName) {
        switch(sectionName) {
            case 'ventas':
                this.loadProductosVenta();
                this.loadClientesVenta();
                break;
            case 'productos':
                this.loadProductosCatalogo();
                break;
            case 'clientes':
                this.loadClientes();
                break;
            case 'reparaciones':
                this.loadReparaciones();
                break;
            case 'facturas':
                this.loadFacturas();
                break;
            case 'notificaciones':
                this.loadNotificaciones();
                break;
        }
    }
    
    setupEventListeners() {
        // Búsqueda de productos
        const searchProductosVenta = document.getElementById('searchProductosVenta');
        if (searchProductosVenta) {
            searchProductosVenta.addEventListener('input', (e) => {
                this.buscarProductosVenta(e.target.value);
            });
        }
        
        const searchProductosCatalogo = document.getElementById('searchProductosCatalogo');
        if (searchProductosCatalogo) {
            searchProductosCatalogo.addEventListener('input', (e) => {
                this.buscarProductosCatalogo(e.target.value);
            });
        }
        
        // Cliente en venta
        const clienteVenta = document.getElementById('clienteVenta');
        if (clienteVenta) {
            clienteVenta.addEventListener('change', () => {
                this.actualizarResumenVenta();
                this.cargarMaterialesReparacionCliente();
            });
        }
        
        // Producto material
        const productoMaterial = document.getElementById('productoMaterial');
        if (productoMaterial) {
            productoMaterial.addEventListener('change', () => {
                this.actualizarPrecioMaterial();
            });
        }
        
        // Botón para producto no encontrado
        const btnProductoNoEncontrado = document.getElementById('btnProductoNoEncontrado');
        if (btnProductoNoEncontrado) {
            btnProductoNoEncontrado.addEventListener('click', () => {
                this.mostrarSeccionProductoNoEncontrado();
            });
        }
    }
    
    loadAllData() {
        this.loadProductosVenta();
        this.loadClientesVenta();
        this.loadProductosCatalogo();
        this.loadClientes();
        this.loadReparaciones();
        this.loadFacturas();
        this.loadNotificaciones();
    }
    
    loadDashboardData() {
        // Cargar estadísticas del dashboard
        const ventas = this.getVentas();
        const reparaciones = this.getReparaciones();
        const clientes = this.getClientes();
        const productos = this.getProductos();
        
        document.getElementById('ventasDia').textContent = 
            `$${this.calcularVentasDia(ventas).toFixed(2)}`;
        document.getElementById('reparacionesPendientes').textContent = 
            reparaciones.filter(r => r.estado === 'pendiente').length;
        document.getElementById('clientesRegistrados').textContent = clientes.length;
        document.getElementById('productosDisponibles').textContent = 
            productos.filter(p => p.stock > 0).length;
        
        // Cargar ventas recientes
        this.loadVentasRecientes();
        this.loadReparacionesActivas();
    }
    
    // Gestión de Ventas
    loadProductosVenta() {
        const productos = this.getProductos().filter(p => p.stock > 0);
        const tbody = document.getElementById('productosVentaTable');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        productos.forEach(producto => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${producto.codigo}</td>
                <td>${producto.nombre}</td>
                <td>$${producto.precio}</td>
                <td>
                    <span class="badge ${producto.stock < 10 ? 'bg-danger' : 'bg-success'}">
                        ${producto.stock}
                    </span>
                </td>
                <td>
                    <input type="number" class="form-control form-control-sm" 
                           style="width: 80px;" min="1" max="${producto.stock}" 
                           value="1" id="cantidad_${producto.id}">
                </td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="vendedorDashboard.agregarProductoVenta('${producto.id}')">
                        <i class="fas fa-plus"></i> Agregar
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }
    
    buscarProductosVenta(query) {
        const productos = this.getProductos().filter(p => p.stock > 0);
        const filtrados = productos.filter(p => 
            p.nombre.toLowerCase().includes(query.toLowerCase()) ||
            p.codigo.toLowerCase().includes(query.toLowerCase())
        );
        
        const tbody = document.getElementById('productosVentaTable');
        tbody.innerHTML = '';
        filtrados.forEach(producto => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${producto.codigo}</td>
                <td>${producto.nombre}</td>
                <td>$${producto.precio}</td>
                <td>
                    <span class="badge ${producto.stock < 10 ? 'bg-danger' : 'bg-success'}">
                        ${producto.stock}
                    </span>
                </td>
                <td>
                    <input type="number" class="form-control form-control-sm" 
                           style="width: 80px;" min="1" max="${producto.stock}" 
                           value="1" id="cantidad_${producto.id}">
                </td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="vendedorDashboard.agregarProductoVenta('${producto.id}')">
                        <i class="fas fa-plus"></i> Agregar
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }
    
    agregarProductoVenta(productoId) {
        const productos = this.getProductos();
        const producto = productos.find(p => p.id === productoId);
        const cantidad = parseInt(document.getElementById(`cantidad_${productoId}`).value);
        
        if (!producto || cantidad <= 0 || cantidad > producto.stock) {
            this.showNotification('Cantidad inválida', 'warning');
            return;
        }
        
        // Verificar si ya está en la lista
        const index = this.productosSeleccionados.findIndex(p => p.id === productoId);
        if (index > -1) {
            this.productosSeleccionados[index].cantidad += cantidad;
        } else {
            this.productosSeleccionados.push({
                ...producto,
                cantidad: cantidad
            });
        }
        
        this.actualizarProductosSeleccionados();
        this.actualizarResumenVenta();
        this.showNotification(`${producto.nombre} agregado a la venta`, 'success');
    }
    
    actualizarProductosSeleccionados() {
        const container = document.getElementById('productosSeleccionados');
        if (!container) return;
        
        container.innerHTML = '';
        this.productosSeleccionados.forEach((producto, index) => {
            const div = document.createElement('div');
            div.className = 'd-flex justify-content-between align-items-center mb-2 p-2 border rounded';
            div.innerHTML = `
                <div>
                    <strong>${producto.nombre}</strong><br>
                    <small class="text-muted">$${producto.precio} x ${producto.cantidad}</small>
                </div>
                <div class="d-flex align-items-center gap-2">
                    <span class="fw-bold">$${(producto.precio * producto.cantidad).toFixed(2)}</span>
                    <button class="btn btn-sm btn-outline-danger" onclick="vendedorDashboard.removerProductoVenta(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            container.appendChild(div);
        });
    }
    
    removerProductoVenta(index) {
        this.productosSeleccionados.splice(index, 1);
        this.actualizarProductosSeleccionados();
        this.actualizarResumenVenta();
    }
    
    actualizarResumenVenta() {
        const subtotal = this.productosSeleccionados.reduce((sum, p) => sum + (p.precio * p.cantidad), 0);
        const iva = subtotal * 0.12;
        const total = subtotal + iva;
        
        document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
        document.getElementById('iva').textContent = `$${iva.toFixed(2)}`;
        document.getElementById('total').textContent = `$${total.toFixed(2)}`;
    }
    
    cargarMaterialesReparacionCliente() {
        const clienteSeleccionado = document.getElementById('clienteVenta').value;
        const materialesSection = document.getElementById('materialesReparacionSection');
        const materialesContainer = document.getElementById('materialesReparacionCliente');
        
        if (!clienteSeleccionado) {
            materialesSection.style.display = 'none';
            return;
        }
        
        // Obtener reparaciones del cliente
        const reparaciones = this.getReparaciones().filter(r => r.cliente === clienteSeleccionado);
        
        if (reparaciones.length === 0) {
            materialesSection.style.display = 'none';
            return;
        }
        
        // Recolectar todos los materiales de las reparaciones del cliente
        const materialesCliente = [];
        reparaciones.forEach(reparacion => {
            if (reparacion.materiales && reparacion.materiales.length > 0) {
                reparacion.materiales.forEach(material => {
                    // Agregar información de la reparación al material
                    const materialConReparacion = {
                        ...material,
                        reparacionId: reparacion.id,
                        fechaReparacion: reparacion.fecha,
                        estadoReparacion: reparacion.estado,
                        moto: `${reparacion.marca} ${reparacion.modelo}`,
                        falla: reparacion.falla
                    };
                    materialesCliente.push(materialConReparacion);
                });
            }
        });
        
        if (materialesCliente.length === 0) {
            materialesSection.style.display = 'none';
            return;
        }
        
        // Mostrar la sección y renderizar los materiales
        materialesSection.style.display = 'block';
        this.renderizarMaterialesReparacion(materialesCliente);
    }
    
    renderizarMaterialesReparacion(materiales) {
        const container = document.getElementById('materialesReparacionCliente');
        
        if (materiales.length === 0) {
            container.innerHTML = '<p class="text-muted small">No hay materiales registrados para este cliente</p>';
            return;
        }
        
        let html = '<div class="row">';
        
        materiales.forEach((material, index) => {
            const fechaReparacion = new Date(material.fechaReparacion).toLocaleDateString();
            const estadoClass = this.getEstadoClass(material.estadoReparacion);
            
            html += `
                <div class="col-12 mb-2">
                    <div class="card border-light shadow-sm">
                        <div class="card-body p-2">
                            <div class="row align-items-center">
                                <div class="col-md-4">
                                    <strong class="text-primary">${material.producto}</strong>
                                    <br>
                                    <small class="text-muted">
                                        <i class="fas fa-motorcycle me-1"></i>${material.moto}
                                    </small>
                                </div>
                                <div class="col-md-3">
                                    <small class="text-muted">
                                        <i class="fas fa-hashtag me-1"></i>Cantidad: ${material.cantidad}
                                    </small>
                                    <br>
                                    <small class="text-muted">
                                        <i class="fas fa-dollar-sign me-1"></i>Precio: $${material.precio}
                                    </small>
                                </div>
                                <div class="col-md-3">
                                    <small class="text-muted">
                                        <i class="fas fa-calendar me-1"></i>${fechaReparacion}
                                    </small>
                                    <br>
                                    <span class="badge badge-${estadoClass} badge-sm">
                                        ${material.estadoReparacion}
                                    </span>
                                </div>
                                <div class="col-md-2 text-end">
                                    <button class="btn btn-sm btn-outline-primary" 
                                            onclick="vendedorDashboard.agregarMaterialAVenta('${material.producto}', ${material.precio})"
                                            title="Agregar a la venta">
                                        <i class="fas fa-plus"></i>
                                    </button>
                                </div>
                            </div>
                            ${material.observaciones ? `
                                <div class="row mt-1">
                                    <div class="col-12">
                                        <small class="text-muted">
                                            <i class="fas fa-comment me-1"></i>${material.observaciones}
                                        </small>
                                    </div>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        container.innerHTML = html;
    }
    
    agregarMaterialAVenta(nombreProducto, precio) {
        // Buscar el producto en el inventario
        const productos = this.getProductos();
        const producto = productos.find(p => p.nombre === nombreProducto);
        
        if (!producto) {
            this.showNotification('Producto no encontrado en el inventario', 'warning');
            return;
        }
        
        if (producto.stock <= 0) {
            this.showNotification('Producto sin stock disponible', 'warning');
            return;
        }
        
        // Verificar si ya está en la lista
        const index = this.productosSeleccionados.findIndex(p => p.id === producto.id);
        if (index > -1) {
            this.productosSeleccionados[index].cantidad += 1;
        } else {
            this.productosSeleccionados.push({
                ...producto,
                cantidad: 1
            });
        }
        
        this.actualizarProductosSeleccionados();
        this.actualizarResumenVenta();
        this.showNotification(`${nombreProducto} agregado a la venta`, 'success');
    }
    
    finalizarVenta() {
        const cliente = document.getElementById('clienteVenta').value;
        
        if (!cliente) {
            this.showNotification('Por favor seleccione un cliente', 'warning');
            return;
        }
        
        if (this.productosSeleccionados.length === 0) {
            this.showNotification('Por favor agregue productos a la venta', 'warning');
            return;
        }
        
        const subtotal = this.productosSeleccionados.reduce((sum, p) => sum + (p.precio * p.cantidad), 0);
        const iva = subtotal * 0.12;
        const total = subtotal + iva;
        
        const venta = {
            id: Date.now().toString(),
            numero: this.generarNumeroFactura(),
            cliente,
            productos: [...this.productosSeleccionados],
            subtotal,
            iva,
            total,
            fecha: new Date().toISOString(),
            vendedor: this.session.name
        };
        
        // Guardar venta
        const ventas = this.getVentas();
        ventas.push(venta);
        localStorage.setItem('ventas', JSON.stringify(ventas));
        
        // Actualizar inventario
        this.actualizarInventario();
        
        // Generar factura PDF
        this.generarFacturaPDF(venta);
        
        // Limpiar venta
        this.productosSeleccionados = [];
        this.actualizarProductosSeleccionados();
        this.actualizarResumenVenta();
        
        this.showNotification('Venta finalizada exitosamente', 'success');
        this.loadDashboardData();
    }
    
    actualizarInventario() {
        const productos = this.getProductos();
        
        this.productosSeleccionados.forEach(productoVenta => {
            const producto = productos.find(p => p.id === productoVenta.id);
            if (producto) {
                producto.stock -= productoVenta.cantidad;
            }
        });
        
        localStorage.setItem('productos', JSON.stringify(productos));
    }
    
    generarNumeroFactura() {
        const ventas = this.getVentas();
        const numero = ventas.length + 1;
        return `FAC-${new Date().getFullYear()}-${numero.toString().padStart(6, '0')}`;
    }
    
    generarFacturaPDF(venta) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Encabezado
        doc.setFontSize(20);
        doc.text('FACTURA', 105, 20, { align: 'center' });
        
        doc.setFontSize(12);
        doc.text(`Número: ${venta.numero}`, 20, 40);
        doc.text(`Fecha: ${new Date(venta.fecha).toLocaleDateString()}`, 20, 50);
        doc.text(`Vendedor: ${venta.vendedor}`, 20, 60);
        
        // Datos del cliente
        doc.text('DATOS DEL CLIENTE:', 20, 80);
        doc.text(`Cliente: ${venta.cliente}`, 20, 90);
        
        // Productos
        doc.text('PRODUCTOS:', 20, 110);
        let y = 120;
        
        venta.productos.forEach(producto => {
            doc.text(`${producto.nombre}`, 20, y);
            doc.text(`${producto.cantidad} x $${producto.precio}`, 120, y);
            doc.text(`$${(producto.precio * producto.cantidad).toFixed(2)}`, 180, y);
            y += 10;
        });
        
        // Totales
        y += 10;
        doc.text('Subtotal:', 140, y);
        doc.text(`$${venta.subtotal.toFixed(2)}`, 180, y);
        y += 10;
        doc.text('IVA (12%):', 140, y);
        doc.text(`$${venta.iva.toFixed(2)}`, 180, y);
        y += 10;
        doc.setFontSize(14);
        doc.text('TOTAL:', 140, y);
        doc.text(`$${venta.total.toFixed(2)}`, 180, y);
        
        // Guardar PDF
        doc.save(`factura-${venta.numero}.pdf`);
    }
    
    // Gestión de Productos
    loadProductosCatalogo() {
        const productos = this.getProductos();
        const tbody = document.getElementById('productosCatalogoTable');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        productos.forEach(producto => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${producto.codigo}</td>
                <td>${producto.nombre}</td>
                <td>${producto.descripcion}</td>
                <td>$${producto.precio}</td>
                <td>
                    <span class="badge ${producto.stock < 10 ? 'bg-danger' : 'bg-success'}">
                        ${producto.stock}
                    </span>
                </td>
                <td>${producto.proveedor}</td>
            `;
            tbody.appendChild(row);
        });
    }
    
    buscarProductosCatalogo(query) {
        const productos = this.getProductos();
        const filtrados = productos.filter(p => 
            p.nombre.toLowerCase().includes(query.toLowerCase()) ||
            p.codigo.toLowerCase().includes(query.toLowerCase())
        );
        
        const tbody = document.getElementById('productosCatalogoTable');
        tbody.innerHTML = '';
        filtrados.forEach(producto => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${producto.codigo}</td>
                <td>${producto.nombre}</td>
                <td>${producto.descripcion}</td>
                <td>$${producto.precio}</td>
                <td>
                    <span class="badge ${producto.stock < 10 ? 'bg-danger' : 'bg-success'}">
                        ${producto.stock}
                    </span>
                </td>
                <td>${producto.proveedor}</td>
            `;
            tbody.appendChild(row);
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
                    <button class="btn btn-sm btn-outline-primary" onclick="vendedorDashboard.editarCliente('${cliente.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="vendedorDashboard.eliminarCliente('${cliente.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }
    
    loadClientesVenta() {
        const clientes = this.getClientes();
        const select = document.getElementById('clienteVenta');
        if (!select) return;
        
        select.innerHTML = '<option value="">Seleccionar cliente</option>';
        clientes.forEach(cliente => {
            const option = document.createElement('option');
            option.value = cliente.nombre;
            option.textContent = `${cliente.nombre} - ${cliente.cedula}`;
            select.appendChild(option);
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
        this.loadClientesVenta();
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
                    <button class="btn btn-sm btn-outline-primary" onclick="vendedorDashboard.registrarMateriales('${reparacion.id}')">
                        <i class="fas fa-tools"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-success" onclick="vendedorDashboard.finalizarReparacion('${reparacion.id}')">
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-info" onclick="vendedorDashboard.verFotosReparacion('${reparacion.id}')" title="Ver fotos">
                        <i class="fas fa-camera"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
        
        this.actualizarSelectClientesReparacion();
        this.actualizarSelectMecanicosReparacion();
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
    }
    
    actualizarPrecioMaterial() {
        const select = document.getElementById('productoMaterial');
        const precioInput = document.getElementById('precioMaterial');
        
        if (select.value) {
            const option = select.options[select.selectedIndex];
            precioInput.value = option.dataset.precio;
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
        
        // Verificar si es un producto del inventario o uno nuevo
        const esProductoNuevo = document.getElementById('productoNoEncontradoSection').style.display !== 'none';
        
        if (esProductoNuevo) {
            // Agregar producto nuevo
            this.agregarProductoNuevo(cantidad, observaciones);
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
        }
    }
    
    agregarProductoNuevo(cantidad, observaciones) {
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
            
            div.innerHTML = `
                <div>
                    <div class="d-flex align-items-center">
                        ${statusBadge}
                        <strong>${material.producto}</strong>
                    </div>
                    <small class="text-muted">Cantidad: ${material.cantidad} - $${material.precio} c/u</small>
                    ${material.observaciones ? `<br><small class="text-muted">${material.observaciones}</small>` : ''}
                    ${esPendiente ? '<br><small class="text-warning"><i class="fas fa-clock me-1"></i>Esperando adquisición</small>' : ''}
                </div>
                <div class="d-flex align-items-center gap-2">
                    <span class="fw-bold">$${(material.precio * material.cantidad).toFixed(2)}</span>
                    <button class="btn btn-sm btn-outline-danger" onclick="vendedorDashboard.removerMaterial(${index})">
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
                            
                            <div class="finalizar-reparacion-section">
                                
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
                            <button type="button" class="btn btn-success" onclick="vendedorDashboard.confirmarFinalizacion('${reparacion.id}')">
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
            reparacion.materiales = [...this.materialesReparacion];
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
    
    actualizarSelectMecanicosReparacion() {
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
    
    // Gestión de Facturas
    loadFacturas() {
        const ventas = this.getVentas();
        const tbody = document.getElementById('facturasTable');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        ventas.forEach(venta => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${venta.numero}</td>
                <td>${venta.cliente}</td>
                <td>${new Date(venta.fecha).toLocaleDateString()}</td>
                <td>$${venta.subtotal.toFixed(2)}</td>
                <td>$${venta.iva.toFixed(2)}</td>
                <td>$${venta.total.toFixed(2)}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="vendedorDashboard.descargarFactura('${venta.id}')">
                        <i class="fas fa-download"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }
    
    filtrarFacturas() {
        const fechaInicio = document.getElementById('fechaInicioFacturas').value;
        const fechaFin = document.getElementById('fechaFinFacturas').value;
        
        if (!fechaInicio || !fechaFin) {
            this.showNotification('Por favor seleccione las fechas', 'warning');
            return;
        }
        
        const ventas = this.getVentas().filter(v => {
            const fecha = new Date(v.fecha);
            return fecha >= new Date(fechaInicio) && fecha <= new Date(fechaFin);
        });
        
        const tbody = document.getElementById('facturasTable');
        tbody.innerHTML = '';
        ventas.forEach(venta => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${venta.numero}</td>
                <td>${venta.cliente}</td>
                <td>${new Date(venta.fecha).toLocaleDateString()}</td>
                <td>$${venta.subtotal.toFixed(2)}</td>
                <td>$${venta.iva.toFixed(2)}</td>
                <td>$${venta.total.toFixed(2)}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="vendedorDashboard.descargarFactura('${venta.id}')">
                        <i class="fas fa-download"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }
    
    descargarFactura(ventaId) {
        const ventas = this.getVentas();
        const venta = ventas.find(v => v.id === ventaId);
        
        if (venta) {
            this.generarFacturaPDF(venta);
        }
    }
    
    // Dashboard
    loadVentasRecientes() {
        const ventas = this.getVentas();
        const tbody = document.getElementById('ventasRecientes');
        if (!tbody) return;
        
        // Obtener ventas del mes actual
        const mesActual = new Date().getMonth();
        const añoActual = new Date().getFullYear();
        
        const ventasDelMes = ventas.filter(venta => {
            const fechaVenta = new Date(venta.fecha);
            return fechaVenta.getMonth() === mesActual && fechaVenta.getFullYear() === añoActual;
        });

        // Mostrar solo las 5 más recientes del mes
        const ventasRecientes = ventasDelMes.slice(-5);
        
        tbody.innerHTML = '';
        
        if (ventasRecientes.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No hay ventas en el mes actual</td></tr>';
            return;
        }
        
        ventasRecientes.forEach(venta => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${venta.numero}</td>
                <td>${venta.cliente.nombre || venta.cliente}</td>
                <td>$${venta.total.toFixed(2)}</td>
                <td>${new Date(venta.fecha).toLocaleDateString('es-ES')}</td>
                <td><span class="badge bg-success">Completada</span></td>
            `;
            tbody.appendChild(row);
        });
    }
    
    loadReparacionesActivas() {
        const reparaciones = this.getReparaciones().filter(r => r.estado !== 'finalizada').slice(-3);
        const container = document.getElementById('reparacionesActivas');
        if (!container) return;
        
        container.innerHTML = '';
        reparaciones.forEach(reparacion => {
            const div = document.createElement('div');
            div.className = `alert alert-${this.getEstadoClass(reparacion.estado)} alert-sm`;
            div.innerHTML = `
                <h6 class="mb-1">${reparacion.cliente}</h6>
                <p class="mb-1 small">${reparacion.marca} ${reparacion.modelo}</p>
                <small class="text-muted">${new Date(reparacion.fecha).toLocaleDateString()}</small>
            `;
            container.appendChild(div);
        });
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
        return JSON.parse(localStorage.getItem('ventas') || '[]');
    }
    
    getNotificaciones() {
        return JSON.parse(localStorage.getItem('notificaciones') || '[]');
    }
    
    getSolicitudesAdquisicion() {
        return JSON.parse(localStorage.getItem('solicitudesAdquisicion') || '[]');
    }
    
    calcularVentasDia(ventas) {
        const hoy = new Date().toDateString();
        return ventas.filter(v => {
            const fecha = new Date(v.fecha).toDateString();
            return fecha === hoy;
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
    
    // Métodos para editar y eliminar (placeholder)
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
                this.loadClientesVenta();
                this.showNotification('Cliente eliminado exitosamente', 'success');
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
    
    setupNotificaciones() {
        // Cargar notificaciones iniciales
        this.loadNotificaciones();
        
        // Crear notificaciones de ejemplo si no hay ninguna
        const notificaciones = this.getNotificaciones();
        if (notificaciones.length === 0) {
            this.crearNotificacion('Bienvenido al sistema', 'Has iniciado sesión correctamente como vendedor', 'sistema');
            this.crearNotificacion('Reparación completada', 'La reparación #001 ha sido finalizada exitosamente', 'reparacion');
            this.crearNotificacion('Nueva venta', 'Se ha registrado una nueva venta por $150.00', 'venta');
            this.crearNotificacion('Stock bajo', 'El producto "Aceite de motor" tiene stock bajo (5 unidades)', 'stock');
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
    vendedorDashboard.showSection(sectionName);
}

function showTab(tabName) {
    console.log('Función global showTab vendedor llamada con:', tabName);
    if (vendedorDashboard) {
        vendedorDashboard.showTab(tabName);
    } else {
        console.error('vendedorDashboard no está inicializado');
    }
}

function guardarCliente() {
    vendedorDashboard.guardarCliente();
}

function guardarReparacion() {
    vendedorDashboard.guardarReparacion();
}

function finalizarVenta() {
    vendedorDashboard.finalizarVenta();
}

function filtrarFacturas() {
    vendedorDashboard.filtrarFacturas();
}

function marcarTodasLeidas() {
    vendedorDashboard.marcarTodasLeidas();
}

function agregarMaterial() {
    vendedorDashboard.agregarMaterial();
}

// Inicializar dashboard
let vendedorDashboard;
document.addEventListener('DOMContentLoaded', () => {
    vendedorDashboard = new VendedorDashboard();
});
