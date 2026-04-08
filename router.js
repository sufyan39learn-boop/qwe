// Simple Client-Side Router for Clean URLs
class Router {
    constructor() {
        this.routes = {};
        this.currentRoute = null;
        this.init();
    }

    init() {
        // Listen for hash changes
        window.addEventListener('hashchange', () => this.handleRoute());
        
        // Handle initial load
        this.handleRoute();
    }

    register(path, handler) {
        this.routes[path] = handler;
    }

    navigate(path) {
        window.location.hash = path;
    }

    handleRoute() {
        const hash = window.location.hash.slice(1) || 'home';
        const [route, ...params] = hash.split('/');
        
        console.log('🧭 Navigating to:', route, params);
        
        this.currentRoute = route;
        
        // Update active nav link
        this.updateActiveNav(route);
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Close mobile sidebar
        this.closeMobileSidebar();
        
        // Route to appropriate page
        if (this.routes[route]) {
            this.routes[route](params);
        } else {
            console.warn('⚠️ Route not found:', route);
            this.navigate('home');
        }
    }

    updateActiveNav(route) {
        // Remove active class from all nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        // Add active class to current route
        const activeLink = document.querySelector(`.nav-link[href="#${route}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }

    closeMobileSidebar() {
        const sidebar = document.getElementById('sidebar');
        if (sidebar && window.innerWidth < 1024) {
            sidebar.classList.remove('open');
        }
    }

    getCurrentRoute() {
        return this.currentRoute;
    }

    getParams() {
        const hash = window.location.hash.slice(1) || 'home';
        const [, ...params] = hash.split('/');
        return params;
    }
}

// Create global router instance
window.router = new Router();

// Helper function to navigate
function navigate(path) {
    router.navigate(path);
}

// Export for use in other files
window.navigate = navigate;
