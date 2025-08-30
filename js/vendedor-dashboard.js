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
        console.log('showSection llamado con:', sectionName);
        
        // Ocultar todas las secciones
        const sections = document.querySelectorAll('.content-section');
        console.log('Secciones encontradas:', sections.length);
        sections.forEach(section => {
            section.style.display = 'none';
            console.log('Sección ocultada:', section.id);
        });
        
        // Mostrar la sección seleccionada
        const targetSection = document.getElementById(`${sectionName}-section`);
        console.log('Sección objetivo:', targetSection);
        if (targetSection) {
            targetSection.style.display = 'block';
            console.log('Sección mostrada:', targetSection.id);
        } else {
            console.error('No se encontró la sección:', `${sectionName}-section`);
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
        
        const pageTitle = document.getElementById('pageTitle');
        if (pageTitle) {
            pageTitle.textContent = titles[sectionName] || 'Dashboard';
            console.log('Título actualizado:', pageTitle.textContent);
        }
        
        // Cargar datos específicos de la sección
        console.log('Cargando datos de la sección:', sectionName);
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
                // Verificar si hay una reparación finalizada para cargar
                if (this.reparacionFinalizada) {
                    setTimeout(() => {
                        this.cargarReparacionEnVentas();
                    }, 200);
                }
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
        
        // Búsqueda de cliente por cédula
        const buscarCedulaCliente = document.getElementById('buscarCedulaCliente');
        if (buscarCedulaCliente) {
            buscarCedulaCliente.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.buscarClientePorCedula();
                }
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
                    <div class="d-flex align-items-center">
                        <input type="checkbox" class="form-check-input me-2" 
                               id="check_descuento_${producto.id}" 
                               onchange="vendedorDashboard.toggleDescuento('${producto.id}')">
                        <input type="number" class="form-control form-control-sm" 
                               style="width: 80px;" min="0" max="100" step="0.01"
                               value="0" id="descuento_${producto.id}" 
                               placeholder="%" disabled>
                    </div>
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
                    <div class="d-flex align-items-center">
                        <input type="checkbox" class="form-check-input me-2" 
                               id="check_descuento_${producto.id}" 
                               onchange="vendedorDashboard.toggleDescuento('${producto.id}')">
                        <input type="number" class="form-control form-control-sm" 
                               style="width: 80px;" min="0" max="100" step="0.01"
                               value="0" id="descuento_${producto.id}" 
                               placeholder="%" disabled>
                    </div>
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
        const descuentoCheck = document.getElementById(`check_descuento_${productoId}`);
        const descuentoInput = document.getElementById(`descuento_${productoId}`);
        const descuento = descuentoCheck.checked ? parseFloat(descuentoInput.value) || 0 : 0;
        
        if (!producto || cantidad <= 0 || cantidad > producto.stock) {
            this.showNotification('Cantidad inválida', 'warning');
            return;
        }
        
        if (descuento < 0 || descuento > 100) {
            this.showNotification('El descuento debe estar entre 0% y 100%', 'warning');
            return;
        }
        
        // Verificar si ya está en la lista
        const index = this.productosSeleccionados.findIndex(p => p.id === productoId);
        if (index > -1) {
            this.productosSeleccionados[index].cantidad += cantidad;
            this.productosSeleccionados[index].descuento = descuento;
        } else {
            this.productosSeleccionados.push({
                ...producto,
                cantidad: cantidad,
                descuento: descuento
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
            
            // Determinar el estilo según el tipo de producto
            let borderClass = 'border rounded';
            let iconClass = 'fas fa-box';
            
            if (producto.tipo === 'material_reparacion') {
                borderClass = 'border border-primary rounded';
                iconClass = 'fas fa-tools';
            } else if (producto.tipo === 'mano_obra') {
                borderClass = 'border border-success rounded';
                iconClass = 'fas fa-wrench';
            }
            
            div.className = `d-flex justify-content-between align-items-center mb-2 p-2 ${borderClass}`;
            
            let observacionesHtml = '';
            if (producto.observaciones) {
                observacionesHtml = `<br><small class="text-info"><i class="fas fa-info-circle me-1"></i>${producto.observaciones}</small>`;
            }
            
            // Calcular precio con descuento
            const descuento = producto.descuento || 0;
            const precioConDescuento = producto.precio - descuento;
            const subtotal = precioConDescuento * producto.cantidad;
            const descuentoTotal = descuento * producto.cantidad;
            
            // Mostrar descuento si existe
            let descuentoHtml = '';
            if (descuento > 0) {
                descuentoHtml = `
                    <br><small class="text-success">
                        <i class="fas fa-tag me-1"></i>Descuento: $${descuento.toFixed(2)} c/u
                    </small>
                    <br><small class="text-muted">
                        <i class="fas fa-dollar-sign me-1"></i>Precio final: $${precioConDescuento.toFixed(2)} c/u
                    </small>
                `;
            }
            
            div.innerHTML = `
                <div>
                    <strong><i class="${iconClass} me-1"></i>${producto.nombre}</strong><br>
                    <small class="text-muted">$${producto.precio} x ${producto.cantidad}</small>
                    ${descuentoHtml}
                    ${observacionesHtml}
                </div>
                <div class="d-flex align-items-center gap-2">
                    <div class="text-end">
                        ${descuento > 0 ? `<small class="text-success">-$${descuentoTotal.toFixed(2)}</small><br>` : ''}
                        <span class="fw-bold">$${subtotal.toFixed(2)}</span>
                    </div>
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
        // Calcular subtotal sin descuentos
        const subtotalSinDescuento = this.productosSeleccionados.reduce((sum, p) => sum + (p.precio * p.cantidad), 0);
        
        // Calcular descuento total
        const descuentoTotal = this.productosSeleccionados.reduce((sum, p) => {
            const descuento = p.descuento || 0;
            return sum + (descuento * p.cantidad);
        }, 0);
        
        // Calcular subtotal con descuentos
        const subtotal = subtotalSinDescuento - descuentoTotal;
        const iva = subtotal * 0.12;
        const total = subtotal + iva;
        
        document.getElementById('subtotal').textContent = `$${subtotalSinDescuento.toFixed(2)}`;
        document.getElementById('descuento').textContent = `$${descuentoTotal.toFixed(2)}`;
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
        const cliente = document.getElementById('clienteVenta')?.value;
        
        if (this.productosSeleccionados.length === 0) {
            this.showNotification('Por favor agregue productos a la venta', 'warning');
            return;
        }
        
        // Si no hay cliente seleccionado, mostrar modal para capturar datos
        if (!cliente) {
            const modal = new bootstrap.Modal(document.getElementById('clienteFacturaModal'));
            modal.show();
            return;
        }
        
        // Si hay cliente, procesar venta normalmente
        this.procesarVentaConCliente(cliente);
    }
    
    procesarVentaConCliente(cliente) {
        // Calcular subtotal sin descuentos
        const subtotalSinDescuento = this.productosSeleccionados.reduce((sum, p) => sum + (p.precio * p.cantidad), 0);
        
        // Calcular descuento total
        const descuentoTotal = this.productosSeleccionados.reduce((sum, p) => {
            const descuento = p.descuento || 0;
            return sum + (descuento * p.cantidad);
        }, 0);
        
        // Calcular subtotal con descuentos
        const subtotal = subtotalSinDescuento - descuentoTotal;
        const iva = subtotal * 0.12;
        const total = subtotal + iva;
        
        const venta = {
            id: Date.now().toString(),
            numero: this.generarNumeroFactura(),
            cliente,
            productos: [...this.productosSeleccionados],
            subtotalSinDescuento,
            descuentoTotal,
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
    
    confirmarVentaSinCliente() {
        const nombreCliente = document.getElementById('nombreClienteFactura').value.trim();
        const cedulaCliente = document.getElementById('cedulaClienteFactura').value.trim();
        
        if (!nombreCliente) {
            this.showNotification('Por favor ingrese el nombre para la factura', 'warning');
            return;
        }
        
        // Crear nombre completo del cliente
        let clienteCompleto = nombreCliente;
        if (cedulaCliente) {
            clienteCompleto += ` - ${cedulaCliente}`;
        }
        
        // Cerrar modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('clienteFacturaModal'));
        modal.hide();
        
        // Procesar venta con el cliente capturado
        this.procesarVentaConCliente(clienteCompleto);
        
        // Limpiar formulario
        document.getElementById('clienteFacturaForm').reset();
    }
    
    verDetalleProducto(productoId) {
        const productos = this.getProductos();
        const producto = productos.find(p => p.id === productoId);
        
        if (!producto) {
            this.showNotification('Producto no encontrado', 'error');
            return;
        }
        
        // Llenar el modal con los datos del producto
        document.getElementById('detalleCodigoProducto').textContent = producto.codigo;
        document.getElementById('detalleNombreProducto').textContent = producto.nombre;
        document.getElementById('detalleDescripcionProducto').textContent = producto.descripcion;
        document.getElementById('detallePrecioProducto').textContent = `$${producto.precio}`;
        document.getElementById('detalleDescuentoMinimoProducto').textContent = (producto.descuentoMinimo || producto.descuento || 0) > 0 ? `$${producto.descuentoMinimo || producto.descuento || 0}` : 'Sin descuento mínimo';
        document.getElementById('detalleDescuentoMaximoProducto').textContent = (producto.descuentoMaximo || 0) > 0 ? `$${producto.descuentoMaximo}` : 'Sin descuento máximo';
        document.getElementById('detalleStockProducto').textContent = `${producto.stock} unidades`;
        document.getElementById('detalleProveedorProducto').textContent = producto.proveedor || 'No especificado';
        document.getElementById('detalleFechaProducto').textContent = producto.fechaCreacion ? 
            new Date(producto.fechaCreacion).toLocaleDateString('es-ES') : 'No especificada';
        
        // Mostrar el modal
        const modal = new bootstrap.Modal(document.getElementById('detalleProductoModal'));
        modal.show();
    }
    
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
        
        // Cargar fotos iniciales existentes
        this.cargarFotosExistentes(reparacion.fotosIniciales || []);
        
        // Guardar ID de la reparación que se está editando
        this.reparacionEditando = reparacionId;
        
        // Cambiar título del modal y botón
        document.querySelector('#reparacionModal .modal-title').textContent = 'Editar Reparación';
        document.querySelector('#reparacionModal .btn-primary').textContent = 'Actualizar';
        document.querySelector('#reparacionModal .btn-primary').onclick = () => this.actualizarReparacion();
        
        // Mostrar modal
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
        
        const reparaciones = this.getReparaciones();
        const index = reparaciones.findIndex(r => r.id === this.reparacionEditando);
        
        if (index === -1) {
            this.showNotification('Reparación no encontrada', 'error');
            return;
        }
        
        // Obtener fotos actualizadas (existentes + nuevas)
        let fotosIniciales = [];
        if (window.fotoManager && window.fotoManager.fotosIniciales) {
            fotosIniciales = window.fotoManager.fotosIniciales;
        }
        
        // Actualizar datos de la reparación
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
        
        // Restaurar modal a su estado original
        this.reparacionEditando = null;
        document.querySelector('#reparacionModal .modal-title').textContent = 'Nueva Reparación';
        document.querySelector('#reparacionModal .btn-primary').textContent = 'Guardar';
        document.querySelector('#reparacionModal .btn-primary').onclick = () => this.guardarReparacion();
        
        // Limpiar fotos del modal
        const container = document.getElementById('fotosIniciales');
        if (container) {
            container.innerHTML = '';
        }
    }
    

    
    eliminarReparacion(reparacionId) {
        if (!confirm('¿Está seguro de que desea eliminar esta reparación? Esta acción no se puede deshacer.')) {
            return;
        }
        
        const reparaciones = this.getReparaciones();
        const index = reparaciones.findIndex(r => r.id === reparacionId);
        
        if (index === -1) {
            this.showNotification('Reparación no encontrada', 'error');
            return;
        }
        
        reparaciones.splice(index, 1);
        localStorage.setItem('reparaciones', JSON.stringify(reparaciones));
        
        this.showNotification('Reparación eliminada exitosamente', 'success');
        this.loadReparaciones();
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
                <td>${(producto.descuentoMinimo || producto.descuento || 0) > 0 ? `$${producto.descuentoMinimo || producto.descuento || 0}` : '-'}</td>
                <td>
                    <span class="badge ${producto.stock < 10 ? 'bg-danger' : 'bg-success'}">
                        ${producto.stock}
                    </span>
                </td>
                <td>${producto.proveedor}</td>
                <td>
                    <button class="btn btn-sm btn-outline-info" onclick="vendedorDashboard.verDetalleProducto('${producto.id}')" title="Ver detalles">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
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
                <td>${(producto.descuentoMinimo || producto.descuento || 0) > 0 ? `$${producto.descuentoMinimo || producto.descuento || 0}` : '-'}</td>
                <td>
                    <span class="badge ${producto.stock < 10 ? 'bg-danger' : 'bg-success'}">
                        ${producto.stock}
                    </span>
                </td>
                <td>${producto.proveedor}</td>
                <td>
                    <button class="btn btn-sm btn-outline-info" onclick="vendedorDashboard.verDetalleProducto('${producto.id}')" title="Ver detalles">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
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
            option.dataset.clienteId = cliente.id;
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
        
        // Si estamos en el módulo de ventas, seleccionar automáticamente el nuevo cliente
        const ventasSection = document.getElementById('ventas-section');
        if (ventasSection && ventasSection.style.display !== 'none') {
            const clienteVentaHidden = document.getElementById('clienteVenta');
            const buscarCedulaInput = document.getElementById('buscarCedulaCliente');
            
            if (clienteVentaHidden) {
                clienteVentaHidden.value = nombre;
                this.mostrarInformacionCliente();
            }
            
            // Limpiar el campo de búsqueda y habilitar la cédula en el modal
            if (buscarCedulaInput) {
                buscarCedulaInput.value = '';
            }
            
            const cedulaInput = document.getElementById('cedulaCliente');
            if (cedulaInput) {
                cedulaInput.readOnly = false; // Habilitar edición de cédula
            }
        }
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
        this.loadClientesVenta();
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
                            onchange="vendedorDashboard.cambiarEstadoReparacion('${reparacion.id}', this.value)"
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
                        <button class="btn btn-sm btn-outline-primary" onclick="vendedorDashboard.registrarMateriales('${reparacion.id}')" title="Registrar materiales">
                            <i class="fas fa-tools"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-info" onclick="vendedorDashboard.verFotosReparacion('${reparacion.id}')" title="Ver fotos">
                            <i class="fas fa-camera"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-warning" onclick="vendedorDashboard.editarReparacion('${reparacion.id}')" title="Editar reparación">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-success" onclick="vendedorDashboard.finalizarReparacion('${reparacion.id}')" title="Finalizar reparación">
                            <i class="fas fa-check"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="vendedorDashboard.eliminarReparacion('${reparacion.id}')" title="Eliminar reparación">
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
            
            // Guardar información de la reparación finalizada para cargarla en ventas
            this.reparacionFinalizada = {
                id: reparacion.id,
                cliente: reparacion.cliente,
                materiales: reparacion.materiales || [],
                manoObra: reparacion.manoObra || 0,
                observacionesManoObra: reparacion.observacionesManoObra || '',
                marca: reparacion.marca,
                modelo: reparacion.modelo,
                falla: reparacion.falla
            };
            
            // Redirigir al módulo de ventas usando el enlace de navegación
            console.log('=== INICIANDO REDIRECCIÓN AL MÓDULO DE VENTAS ===');
            
            // Buscar el enlace de ventas y simular un clic
            const ventasLink = document.querySelector('[data-section="ventas"]');
            if (ventasLink) {
                console.log('Enlace de ventas encontrado, simulando clic...');
                ventasLink.click();
                
                // Cargar automáticamente los datos de la reparación en el módulo de ventas
                setTimeout(() => {
                    this.cargarReparacionEnVentas();
                }, 100);
                
                this.showNotification('Reparación finalizada. Cargando datos en módulo de ventas...', 'info');
                console.log('=== REDIRECCIÓN COMPLETADA ===');
            } else {
                console.error('No se encontró el enlace de ventas');
                this.showNotification('Error: No se pudo redirigir al módulo de ventas', 'error');
            }
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
    
    // Función para toggle de descuento en productos
    toggleDescuento(productoId) {
        const descuentoCheck = document.getElementById(`check_descuento_${productoId}`);
        const descuentoInput = document.getElementById(`descuento_${productoId}`);
        
        if (descuentoCheck && descuentoInput) {
            descuentoInput.disabled = !descuentoCheck.checked;
            if (!descuentoCheck.checked) {
                descuentoInput.value = '0';
            }
        }
    }
    
    // Función para toggle de descuento en materiales de reparación
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
    
    // Función para actualizar el descuento máximo permitido según el producto
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
    
    // Función para validar el descuento ingresado
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
    
    // Función para mostrar errores de descuento
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
    
    // Función para calcular precio con descuento
    calcularPrecioConDescuento(precio, descuento) {
        if (descuento <= 0) return precio;
        return precio - descuento;
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
                            onclick="vendedorDashboard.eliminarFotoExistente(${index})">
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
    
    // Función para cambiar el estado de una reparación
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
    
    // Métodos para editar y eliminar
    editarCliente(id) {
        console.log('editarCliente llamado con id:', id);
        
        const clientes = this.getClientes();
        console.log('Clientes encontrados:', clientes);
        
        const cliente = clientes.find(c => c.id === id);
        console.log('Cliente encontrado:', cliente);
        
        if (!cliente) {
            console.error('Cliente no encontrado');
            this.showNotification('Cliente no encontrado', 'error');
            return;
        }
        
        // Marcar que estamos editando
        this.clienteEditando = cliente;
        
        // Llenar el modal con los datos del cliente
        const cedulaInput = document.getElementById('cedulaCliente');
        const nombreInput = document.getElementById('nombreCliente');
        const direccionInput = document.getElementById('direccionCliente');
        const telefonoInput = document.getElementById('telefonoCliente');
        const emailInput = document.getElementById('emailCliente');
        
        if (cedulaInput) cedulaInput.value = cliente.cedula;
        if (nombreInput) nombreInput.value = cliente.nombre;
        if (direccionInput) direccionInput.value = cliente.direccion;
        if (telefonoInput) telefonoInput.value = cliente.telefono;
        if (emailInput) emailInput.value = cliente.email;
        
        console.log('Campos del modal llenados');
        
        // Cambiar el título del modal y el texto del botón
        const modalTitle = document.querySelector('#clienteModal .modal-title');
        const modalButton = document.querySelector('#clienteModal .btn-primary');
        
        if (modalTitle) modalTitle.textContent = 'Editar Cliente';
        if (modalButton) modalButton.textContent = 'Actualizar';
        
        // Cambiar el onclick del botón para usar actualizarCliente
        if (modalButton) {
            modalButton.onclick = () => this.actualizarCliente();
        }
        
        console.log('Modal configurado, intentando abrir...');
        
        // Abrir el modal
        const modalElement = document.getElementById('clienteModal');
        if (modalElement) {
            const modal = new bootstrap.Modal(modalElement);
            modal.show();
            console.log('Modal abierto exitosamente');
        } else {
            console.error('Elemento modal no encontrado');
        }
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
    
    cargarReparacionEnVentas() {
        if (!this.reparacionFinalizada) {
            console.log('No hay reparación finalizada para cargar');
            return;
        }
        
        console.log('Cargando reparación en módulo de ventas:', this.reparacionFinalizada);
        
        const reparacion = this.reparacionFinalizada;
        
        // Limpiar productos seleccionados actuales
        this.productosSeleccionados = [];
        
        // Agregar materiales de la reparación como productos de venta
        if (reparacion.materiales && reparacion.materiales.length > 0) {
            reparacion.materiales.forEach(material => {
                // Buscar el producto correspondiente en el catálogo
                const productos = this.getProductos();
                const producto = productos.find(p => p.nombre.toLowerCase().includes(material.producto.toLowerCase()) || 
                                                   p.codigo.toLowerCase().includes(material.producto.toLowerCase()));
                
                if (producto) {
                    // Agregar el material como producto de venta
                    this.productosSeleccionados.push({
                        id: producto.id,
                        nombre: producto.nombre,
                        precio: material.precio,
                        cantidad: material.cantidad,
                        descuento: material.descuento || 0,
                        tipo: 'material_reparacion',
                        reparacionId: reparacion.id
                    });
                } else {
                    // Si no se encuentra el producto, crear un item genérico
                    this.productosSeleccionados.push({
                        id: `material_${Date.now()}_${Math.random()}`,
                        nombre: material.producto,
                        precio: material.precio,
                        cantidad: material.cantidad,
                        descuento: material.descuento || 0,
                        tipo: 'material_reparacion',
                        reparacionId: reparacion.id
                    });
                }
            });
        }
        
        // Agregar mano de obra como item de venta
        if (reparacion.manoObra && reparacion.manoObra > 0) {
            this.productosSeleccionados.push({
                id: `mano_obra_${reparacion.id}`,
                nombre: `Mano de Obra - Reparación #${reparacion.id}`,
                precio: reparacion.manoObra,
                cantidad: 1,
                descuento: 0,
                tipo: 'mano_obra',
                reparacionId: reparacion.id,
                observaciones: reparacion.observacionesManoObra
            });
        }
        
        // Buscar y seleccionar automáticamente el cliente de la reparación
        const clientes = this.getClientes();
        const cliente = clientes.find(c => c.nombre === reparacion.cliente);
        
        if (cliente) {
            const clienteVentaHidden = document.getElementById('clienteVenta');
            const buscarCedulaInput = document.getElementById('buscarCedulaCliente');
            
            if (clienteVentaHidden && buscarCedulaInput) {
                clienteVentaHidden.value = cliente.nombre;
                buscarCedulaInput.value = cliente.cedula;
                this.mostrarInformacionCliente();
            }
        }
        
        // Mostrar información de la reparación en "Detalles de la Venta"
        this.mostrarInformacionReparacion(reparacion);
        
        // Actualizar la interfaz
        this.actualizarProductosSeleccionados();
        this.actualizarResumenVenta();
        
        // Mostrar información de la reparación
        this.mostrarInformacionReparacion(reparacion);
        
        // Limpiar la reparación finalizada
        this.reparacionFinalizada = null;
        
        console.log('Reparación cargada exitosamente en módulo de ventas');
    }
    
    buscarClientePorCedula() {
        const cedulaInput = document.getElementById('buscarCedulaCliente');
        const clienteVentaHidden = document.getElementById('clienteVenta');
        
        if (!cedulaInput || !clienteVentaHidden) return;
        
        const cedula = cedulaInput.value.trim();
        
        if (!cedula) {
            this.showNotification('Por favor ingrese una cédula o RUC', 'warning');
            return;
        }
        
        // Verificar si es una cédula por defecto
        const clientePorDefecto = this.obtenerClientePorDefecto(cedula);
        if (clientePorDefecto) {
            // Es una cédula por defecto, crear o seleccionar el cliente
            this.procesarClientePorDefecto(clientePorDefecto);
            return;
        }
        
        // Buscar cliente por cédula
        const clientes = this.getClientes();
        const cliente = clientes.find(c => c.cedula === cedula);
        
        if (cliente) {
            // Cliente encontrado
            clienteVentaHidden.value = cliente.nombre;
            this.mostrarInformacionCliente();
            this.ocultarInformacionReparacion(); // Ocultar información de reparación
            this.actualizarResumenVenta();
            this.cargarMaterialesReparacionCliente();
            
            this.showNotification(`Cliente encontrado: ${cliente.nombre}`, 'success');
        } else {
            // Cliente no encontrado
            clienteVentaHidden.value = '';
            this.ocultarInformacionCliente();
            this.ocultarInformacionReparacion(); // Ocultar información de reparación
            
            // Mostrar opción para crear nuevo cliente
            this.mostrarOpcionCrearCliente(cedula);
        }
    }
    
    obtenerClientePorDefecto(cedula) {
        // Lista de cédulas por defecto con sus datos correspondientes
        const clientesPorDefecto = {
            '1234567890': {
                nombre: 'Juan Pérez',
                direccion: 'Av. Principal 123, Quito',
                telefono: '0987654321',
                email: 'juan.perez@email.com'
            },
            '0987654321': {
                nombre: 'María González',
                direccion: 'Calle Secundaria 456, Guayaquil',
                telefono: '0998765432',
                email: 'maria.gonzalez@email.com'
            },
            '1111111111': {
                nombre: 'Carlos Rodríguez',
                direccion: 'Av. Los Shyris 789, Quito',
                telefono: '0977777777',
                email: 'carlos.rodriguez@email.com'
            },
            '2222222222': {
                nombre: 'Ana López',
                direccion: 'Calle Amazonas 321, Cuenca',
                telefono: '0966666666',
                email: 'ana.lopez@email.com'
            }
        };
        
        return clientesPorDefecto[cedula] || null;
    }
    
    procesarClientePorDefecto(datosCliente) {
        const cedulaInput = document.getElementById('buscarCedulaCliente');
        const cedula = cedulaInput.value.trim();
        const clientes = this.getClientes();
        
        // Verificar si ya existe el cliente por defecto
        const clienteExistente = clientes.find(c => c.cedula === cedula);
        
        if (clienteExistente) {
            // Si ya existe, seleccionarlo
            const clienteVentaHidden = document.getElementById('clienteVenta');
            if (clienteVentaHidden) {
                clienteVentaHidden.value = clienteExistente.nombre;
                this.mostrarInformacionCliente();
                this.actualizarResumenVenta();
                this.cargarMaterialesReparacionCliente();
            }
            
            this.showNotification(`Cliente por defecto encontrado: ${clienteExistente.nombre}`, 'success');
        } else {
            // Si no existe, crearlo automáticamente
            const clientePorDefecto = {
                id: Date.now().toString(),
                cedula: cedula,
                nombre: datosCliente.nombre,
                direccion: datosCliente.direccion,
                telefono: datosCliente.telefono,
                email: datosCliente.email,
                fechaCreacion: new Date().toISOString()
            };
            
            clientes.push(clientePorDefecto);
            localStorage.setItem('clientes', JSON.stringify(clientes));
            
            // Seleccionar el cliente creado
            const clienteVentaHidden = document.getElementById('clienteVenta');
            if (clienteVentaHidden) {
                clienteVentaHidden.value = clientePorDefecto.nombre;
                this.mostrarInformacionCliente();
                this.actualizarResumenVenta();
                this.cargarMaterialesReparacionCliente();
            }
            
            this.showNotification(`Cliente por defecto creado: ${clientePorDefecto.nombre}`, 'success');
            console.log('Cliente por defecto creado:', clientePorDefecto);
        }
    }
    
    mostrarOpcionCrearCliente(cedula) {
        const infoSection = document.getElementById('infoClienteSection');
        if (!infoSection) return;
        
        infoSection.innerHTML = `
            <div class="alert alert-warning">
                <h6 class="alert-heading">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    Cliente no encontrado
                </h6>
                <p class="mb-2">No se encontró un cliente con la cédula/RUC: <strong>${cedula}</strong></p>
                <div class="d-grid gap-2">
                    <button class="btn btn-success btn-sm" onclick="vendedorDashboard.crearClienteConCedula('${cedula}')">
                        <i class="fas fa-plus me-2"></i>
                        Crear nuevo cliente con esta cédula
                    </button>
                </div>
            </div>
        `;
        infoSection.style.display = 'block';
    }
    
    crearClienteConCedula(cedula) {
        // Pre-llenar el modal de cliente con la cédula
        const cedulaInput = document.getElementById('cedulaCliente');
        if (cedulaInput) {
            cedulaInput.value = cedula;
            cedulaInput.readOnly = true; // Hacer la cédula de solo lectura
        }
        
        // Mostrar el modal
        const modal = new bootstrap.Modal(document.getElementById('clienteModal'));
        modal.show();
        
        // Ocultar la sección de información
        this.ocultarInformacionCliente();
    }
    
    ocultarInformacionCliente() {
        const infoSection = document.getElementById('infoClienteSection');
        if (infoSection) {
            infoSection.style.display = 'none';
        }
    }
    
    ocultarInformacionReparacion() {
        const infoSection = document.getElementById('infoReparacionSection');
        if (infoSection) {
            infoSection.style.display = 'none';
        }
    }
    
    mostrarInformacionCliente() {
        const clienteVentaHidden = document.getElementById('clienteVenta');
        const infoSection = document.getElementById('infoClienteSection');
        
        if (!clienteVentaHidden || !infoSection) return;
        
        const clienteSeleccionado = clienteVentaHidden.value;
        
        if (!clienteSeleccionado) {
            infoSection.style.display = 'none';
            return;
        }
        
        // Buscar el cliente seleccionado
        const clientes = this.getClientes();
        const cliente = clientes.find(c => c.nombre === clienteSeleccionado);
        
        if (cliente) {
            // Mostrar información del cliente
            infoSection.innerHTML = `
                <div class="card border-primary">
                    <div class="card-header bg-primary text-white py-2">
                        <h6 class="mb-0">
                            <i class="fas fa-user-check me-2"></i>
                            Información del Cliente
                        </h6>
                    </div>
                    <div class="card-body py-2">
                        <!-- Nombre del cliente en la parte superior -->
                        <div class="text-center mb-3">
                            <h5 class="text-primary mb-0">
                                <i class="fas fa-user me-2"></i>
                                ${cliente.nombre}
                            </h5>
                            <small class="text-muted">Cliente registrado</small>
                        </div>
                        <hr class="my-2">
                        <div class="row">
                            <div class="col-6">
                                <small class="text-muted">Cédula/RUC:</small><br>
                                <strong id="cedulaClienteInfo">${cliente.cedula}</strong>
                            </div>
                            <div class="col-6">
                                <small class="text-muted">Teléfono:</small><br>
                                <strong id="telefonoClienteInfo">${cliente.telefono}</strong>
                            </div>
                        </div>
                        <div class="mt-2">
                            <small class="text-muted">Dirección:</small><br>
                            <strong id="direccionClienteInfo">${cliente.direccion}</strong>
                        </div>
                    </div>
                </div>
            `;
            infoSection.style.display = 'block';
        } else {
            infoSection.style.display = 'none';
        }
    }
    
    mostrarInformacionReparacion(reparacion) {
        // Actualizar la sección de información de reparación en "Detalles de la Venta"
        const infoSection = document.getElementById('infoReparacionSection');
        
        if (infoSection) {
            infoSection.innerHTML = `
                <div class="alert alert-info">
                    <h6 class="alert-heading">
                        <i class="fas fa-tools me-2"></i>
                        Información de Reparación #${reparacion.id}
                    </h6>
                    <div class="row">
                        <div class="col-md-6">
                            <strong>Moto:</strong> ${reparacion.marca} ${reparacion.modelo}<br>
                            <strong>Falla:</strong> ${reparacion.falla}
                        </div>
                        <div class="col-md-6">
                            <strong>Materiales:</strong> ${reparacion.materiales ? reparacion.materiales.length : 0} items<br>
                            <strong>Mano de Obra:</strong> $${reparacion.manoObra ? reparacion.manoObra.toFixed(2) : '0.00'}<br>
                            <strong>Estado:</strong> <span class="badge bg-success">Finalizada</span>
                        </div>
                    </div>
                </div>
            `;
            infoSection.style.display = 'block';
        }
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

function confirmarVentaSinCliente() {
    vendedorDashboard.confirmarVentaSinCliente();
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
