// Performance Monitoring and Optimization Utilities

class PerformanceMonitor {
    constructor() {
        this.metrics = {
            pageLoad: 0,
            apiCalls: [],
            cacheHits: 0,
            cacheMisses: 0
        };
        
        this.init();
    }

    init() {
        // Monitor page load performance
        if (window.performance && window.performance.timing) {
            window.addEventListener('load', () => {
                const timing = window.performance.timing;
                this.metrics.pageLoad = timing.loadEventEnd - timing.navigationStart;
                console.log(`⚡ Page loaded in ${this.metrics.pageLoad}ms`);
                
                // Log detailed timing
                if (this.metrics.pageLoad > 3000) {
                    console.warn('⚠️ Slow page load detected. Consider optimizing resources.');
                }
            });
        }

        // Monitor API performance
        this.monitorAPIPerformance();
        
        // Periodic cache cleanup
        this.setupCacheCleanup();
    }

    // Monitor API call performance
    monitorAPIPerformance() {
        const originalFetch = window.api?.fetch;
        if (originalFetch && window.api) {
            window.api.fetch = async (...args) => {
                const startTime = Date.now();
                const endpoint = args[0];
                
                try {
                    const result = await originalFetch.apply(window.api, args);
                    const duration = Date.now() - startTime;
                    
                    this.metrics.apiCalls.push({
                        endpoint,
                        duration,
                        timestamp: Date.now(),
                        cached: duration < 50 // Likely cached if < 50ms
                    });
                    
                    if (duration < 50) {
                        this.metrics.cacheHits++;
                    } else {
                        this.metrics.cacheMisses++;
                    }
                    
                    // Keep only last 50 API calls
                    if (this.metrics.apiCalls.length > 50) {
                        this.metrics.apiCalls.shift();
                    }
                    
                    return result;
                } catch (error) {
                    throw error;
                }
            };
        }
    }

    // Setup automatic cache cleanup
    setupCacheCleanup() {
        // Clear expired cache every 10 minutes
        setInterval(() => {
            if (window.api && typeof window.api.clearExpiredCache === 'function') {
                window.api.clearExpiredCache();
                console.log('🧹 Periodic cache cleanup completed');
            }
        }, 600000); // 10 minutes
    }

    // Get performance report
    getReport() {
        const totalAPICalls = this.metrics.apiCalls.length;
        const avgAPITime = totalAPICalls > 0 
            ? this.metrics.apiCalls.reduce((sum, call) => sum + call.duration, 0) / totalAPICalls 
            : 0;
        const cacheHitRate = this.metrics.cacheHits + this.metrics.cacheMisses > 0
            ? (this.metrics.cacheHits / (this.metrics.cacheHits + this.metrics.cacheMisses) * 100).toFixed(1)
            : 0;

        return {
            pageLoadTime: `${this.metrics.pageLoad}ms`,
            totalAPICalls,
            avgAPITime: `${avgAPITime.toFixed(0)}ms`,
            cacheHitRate: `${cacheHitRate}%`,
            cacheHits: this.metrics.cacheHits,
            cacheMisses: this.metrics.cacheMisses
        };
    }

    // Log performance report
    logReport() {
        const report = this.getReport();
        console.log('📊 Performance Report:', report);
    }
}

// Debounce utility
function debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle utility
function throttle(func, limit = 100) {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Lazy load images
function setupLazyLoading() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        observer.unobserve(img);
                    }
                }
            });
        });

        // Observe all images with data-src attribute
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    } else {
        // Fallback for older browsers
        document.querySelectorAll('img[data-src]').forEach(img => {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
        });
    }
}

// Preload critical resources
function preloadResource(url, type = 'fetch') {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    
    if (type === 'image') {
        link.as = 'image';
    } else if (type === 'font') {
        link.as = 'font';
        link.crossOrigin = 'anonymous';
    } else {
        link.as = 'fetch';
        link.crossOrigin = 'anonymous';
    }
    
    document.head.appendChild(link);
}

// Memory cleanup utility
function cleanupMemory() {
    // Clear old items from storage
    const now = Date.now();
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
    
    try {
        // Clean old recents
        const recents = storage.getRecents();
        Object.keys(recents).forEach(key => {
            if (now - recents[key].viewedAt > maxAge) {
                delete recents[key];
            }
        });
        storage.set('recents', recents);
        
        console.log('🧹 Memory cleanup completed');
    } catch (error) {
        console.error('Memory cleanup error:', error);
    }
}

// Initialize performance monitoring
const performanceMonitor = new PerformanceMonitor();

// Run memory cleanup on app start
setTimeout(cleanupMemory, 5000);

// Export utilities
window.performanceUtils = {
    debounce,
    throttle,
    setupLazyLoading,
    preloadResource,
    cleanupMemory,
    performanceMonitor
};

// Log performance report in console (for debugging)
setTimeout(() => {
    performanceMonitor.logReport();
}, 10000); // After 10 seconds
