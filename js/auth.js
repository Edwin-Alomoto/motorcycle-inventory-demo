// Sistema de autenticación
class Auth {
    constructor() {
        this.users = {
            admin: {
                username: 'admin',
                password: 'admin123',
                role: 'admin',
                name: 'Administrador'
            },
            vendedor: {
                username: 'vendedor',
                password: 'vendedor123',
                role: 'vendedor',
                name: 'Vendedor'
            }
        };
        
        this.currentUser = null;
        this.init();
    }
    
    init() {
        // Verificar si ya hay una sesión activa
        const session = this.getSession();
        if (session) {
            this.redirectToDashboard(session.role);
            return;
        }
        
        // Configurar el formulario de login
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }
    }
    
    handleLogin(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        if (!username || !password) {
            this.showNotification('Por favor complete todos los campos', 'warning');
            return;
        }
        
        const user = this.users[username];
        
        if (!user || user.password !== password) {
            this.showNotification('Credenciales incorrectas', 'danger');
            return;
        }
        
        // Login exitoso
        this.currentUser = user;
        this.setSession(user);
        this.showNotification(`Bienvenido ${user.name}`, 'success');
        
        // Redirigir al dashboard correspondiente
        setTimeout(() => {
            this.redirectToDashboard(user.role);
        }, 1000);
    }
    
    setSession(user) {
        const session = {
            username: user.username,
            role: user.role,
            name: user.name,
            timestamp: Date.now()
        };
        localStorage.setItem('session', JSON.stringify(session));
    }
    
    getSession() {
        const session = localStorage.getItem('session');
        return session ? JSON.parse(session) : null;
    }
    
    clearSession() {
        localStorage.removeItem('session');
        this.currentUser = null;
    }
    
    redirectToDashboard(role) {
        if (role === 'admin') {
            window.location.href = 'admin-dashboard.html';
        } else if (role === 'vendedor') {
            window.location.href = 'vendedor-dashboard.html';
        }
    }
    
    showNotification(message, type = 'info') {
        // Crear notificación
        const notification = document.createElement('div');
        notification.className = `alert alert-${type} alert-dismissible fade show notification`;
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        // Agregar al DOM
        document.body.appendChild(notification);
        
        // Auto-remover después de 5 segundos
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }
    
    // Método para verificar autenticación en otras páginas
    static checkAuth() {
        const session = localStorage.getItem('session');
        const sessionData = session ? JSON.parse(session) : null;
        
        if (!sessionData) {
            window.location.href = 'index.html';
            return null;
        }
        
        return sessionData;
    }
    
    // Método para cerrar sesión
    static logout() {
        localStorage.removeItem('session');
        window.location.href = 'index.html';
    }
}

// La inicialización de Auth ahora se controla desde index.html
// para evitar conflictos con populate-data.js
