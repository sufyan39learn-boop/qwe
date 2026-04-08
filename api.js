// API Base URL
const API_BASE = 'https://quran.yousefheiba.com/api';

// API Client with advanced caching
class APIClient {
    constructor() {
        this.memoryCache = new Map(); // In-memory cache
        this.cacheExpiry = 3600000; // 1 hour
        this.pendingRequests = new Map(); // Prevent duplicate requests
        this.localStorageCacheKey = 'quran_api_cache';
        this.maxRetries = 3;
        this.retryDelay = 1000;
        
        // Load localStorage cache on init
        this.loadLocalStorageCache();
    }

    // Load cached data from localStorage
    loadLocalStorageCache() {
        try {
            const cached = localStorage.getItem(this.localStorageCacheKey);
            if (cached) {
                const parsedCache = JSON.parse(cached);
                Object.entries(parsedCache).forEach(([key, value]) => {
                    // Only load if not expired
                    if (Date.now() - value.timestamp < this.cacheExpiry) {
                        this.memoryCache.set(key, value);
                    }
                });
                console.log('📦 Loaded cache from localStorage:', this.memoryCache.size, 'entries');
            }
        } catch (error) {
            console.error('Failed to load cache from localStorage:', error);
        }
    }

    // Save cache to localStorage
    saveToLocalStorage() {
        try {
            const cacheObj = {};
            this.memoryCache.forEach((value, key) => {
                cacheObj[key] = value;
            });
            localStorage.setItem(this.localStorageCacheKey, JSON.stringify(cacheObj));
        } catch (error) {
            console.error('Failed to save cache to localStorage:', error);
        }
    }

    // Generic fetch with advanced caching and duplicate prevention
    async fetch(endpoint, options = {}) {
        const cacheKey = `${endpoint}${JSON.stringify(options)}`;
        
        // Check memory cache first
        if (this.memoryCache.has(cacheKey)) {
            const cached = this.memoryCache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheExpiry) {
                console.log('📦 Memory cache hit:', endpoint);
                return cached.data;
            } else {
                // Remove expired cache
                this.memoryCache.delete(cacheKey);
            }
        }

        // Check if there's already a pending request for this endpoint
        if (this.pendingRequests.has(cacheKey)) {
            console.log('⏳ Waiting for pending request:', endpoint);
            return await this.pendingRequests.get(cacheKey);
        }

        // Create new request promise
        const requestPromise = this.fetchWithRetry(endpoint, options, cacheKey);
        this.pendingRequests.set(cacheKey, requestPromise);

        try {
            const data = await requestPromise;
            return data;
        } finally {
            // Remove from pending requests
            this.pendingRequests.delete(cacheKey);
        }
    }

    // Fetch with retry logic
    async fetchWithRetry(endpoint, options, cacheKey, retryCount = 0) {
        try {
            const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
            console.log('🌐 Fetching:', url);
            
            const response = await fetch(url, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            
            // Sanitize data to prevent XSS
            const sanitizedData = this.sanitizeData(data);
            
            // Cache the response in memory
            this.memoryCache.set(cacheKey, {
                data: sanitizedData,
                timestamp: Date.now()
            });

            // Save to localStorage (async, non-blocking)
            setTimeout(() => this.saveToLocalStorage(), 0);

            return sanitizedData;
        } catch (error) {
            console.error('❌ API Error:', error);
            
            // Retry logic
            if (retryCount < this.maxRetries) {
                console.log(`🔄 Retrying... (${retryCount + 1}/${this.maxRetries})`);
                await this.delay(this.retryDelay * (retryCount + 1));
                return this.fetchWithRetry(endpoint, options, cacheKey, retryCount + 1);
            }
            
            throw error;
        }
    }

    // Sanitize data to prevent XSS
    sanitizeData(data) {
        if (typeof data === 'string') {
            return this.sanitizeHTML(data);
        } else if (Array.isArray(data)) {
            return data.map(item => this.sanitizeData(item));
        } else if (typeof data === 'object' && data !== null) {
            const sanitized = {};
            Object.keys(data).forEach(key => {
                sanitized[key] = this.sanitizeData(data[key]);
            });
            return sanitized;
        }
        return data;
    }

    sanitizeHTML(str) {
        if (typeof str !== 'string') return str;
        const temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    }

    // Delay helper for retry
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Clear all caches
    clearCache() {
        this.memoryCache.clear();
        this.pendingRequests.clear();
        localStorage.removeItem(this.localStorageCacheKey);
        console.log('🗑️ All caches cleared');
    }

    // Clear expired cache entries
    clearExpiredCache() {
        const now = Date.now();
        let cleared = 0;
        this.memoryCache.forEach((value, key) => {
            if (now - value.timestamp >= this.cacheExpiry) {
                this.memoryCache.delete(key);
                cleared++;
            }
        });
        if (cleared > 0) {
            console.log(`🗑️ Cleared ${cleared} expired cache entries`);
            this.saveToLocalStorage();
        }
    }

    // Specific API methods
    async getRadio() {
        return this.fetch('/radio');
    }

    async getPrayerTimes() {
        return this.fetch('/getPrayerTimes');
    }

    async getSurahs() {
        return this.fetch('/surahs');
    }

    async getAyah(number) {
        return this.fetch(`/ayah?number=${number}`);
    }

    async getSurahAudio(reciterId, surahId) {
        return this.fetch(`/surahAudio?reciter=${reciterId}&id=${surahId}`);
    }

    async getReciters() {
        return this.fetch('/reciters');
    }

    async getReciterAudio(reciterId) {
        return this.fetch(`/reciterAudio?reciter_id=${reciterId}`);
    }

    async getQuranPagesImage() {
        return this.fetch('/quranPagesImage');
    }

    async getQuranPagesText(page) {
        return this.fetch(`/quranPagesText?page=${page}`);
    }

    async getAzkar() {
        return this.fetch('/azkar');
    }

    async getDuas() {
        return this.fetch('/duas');
    }

    async getLaylatAlQadr() {
        return this.fetch('/laylatAlQadr');
    }
}

// Create global API instance
window.api = new APIClient();

// Utility: Sanitize HTML to prevent XSS
function sanitizeHTML(str) {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
}

// Utility: Format time (seconds to MM:SS)
function formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Utility: Get Surah name in Arabic
function getSurahName(id) {
    const names = {
        1: 'الفاتحة', 2: 'البقرة', 3: 'آل عمران', 4: 'النساء', 5: 'المائدة',
        6: 'الأنعام', 7: 'الأعراف', 8: 'الأنفال', 9: 'التوبة', 10: 'يونس',
        11: 'هود', 12: 'يوسف', 13: 'الرعد', 14: 'إبراهيم', 15: 'الحجر',
        16: 'النحل', 17: 'الإسراء', 18: 'الكهف', 19: 'مريم', 20: 'طه',
        21: 'الأنبياء', 22: 'الحج', 23: 'المؤمنون', 24: 'النور', 25: 'الفرقان',
        26: 'الشعراء', 27: 'النمل', 28: 'القصص', 29: 'العنكبوت', 30: 'الروم',
        31: 'لقمان', 32: 'السجدة', 33: 'الأحزاب', 34: 'سبأ', 35: 'فاطر',
        36: 'يس', 37: 'الصافات', 38: 'ص', 39: 'الزمر', 40: 'غافر',
        41: 'فصلت', 42: 'الشورى', 43: 'الزخرف', 44: 'الدخان', 45: 'الجاثية',
        46: 'الأحقاف', 47: 'محمد', 48: 'الفتح', 49: 'الحجرات', 50: 'ق',
        51: 'الذاريات', 52: 'الطور', 53: 'النجم', 54: 'القمر', 55: 'الرحمن',
        56: 'الواقعة', 57: 'الحديد', 58: 'المجادلة', 59: 'الحشر', 60: 'الممتحنة',
        61: 'الصف', 62: 'الجمعة', 63: 'المنافقون', 64: 'التغابن', 65: 'الطلاق',
        66: 'التحريم', 67: 'الملك', 68: 'القلم', 69: 'الحاقة', 70: 'المعارج',
        71: 'نوح', 72: 'الجن', 73: 'المزمل', 74: 'المدثر', 75: 'القيامة',
        76: 'الإنسان', 77: 'المرسلات', 78: 'النبأ', 79: 'النازعات', 80: 'عبس',
        81: 'التكوير', 82: 'الإنفطار', 83: 'المطففين', 84: 'الإنشقاق', 85: 'البروج',
        86: 'الطارق', 87: 'الأعلى', 88: 'الغاشية', 89: 'الفجر', 90: 'البلد',
        91: 'الشمس', 92: 'الليل', 93: 'الضحى', 94: 'الشرح', 95: 'التين',
        96: 'العلق', 97: 'القدر', 98: 'البينة', 99: 'الزلزلة', 100: 'العاديات',
        101: 'القارعة', 102: 'التكاثر', 103: 'العصر', 104: 'الهمزة', 105: 'الفيل',
        106: 'قريش', 107: 'الماعون', 108: 'الكوثر', 109: 'الكافرون', 110: 'النصر',
        111: 'المسد', 112: 'الإخلاص', 113: 'الفلق', 114: 'الناس'
    };
    return names[id] || `سورة ${id}`;
}

// Utility: Loading skeleton
function createSkeleton(type = 'card', count = 3) {
    let html = '';
    for (let i = 0; i < count; i++) {
        if (type === 'card') {
            html += `
                <div class="bg-white dark:bg-gray-800 rounded-xl p-6 mb-4">
                    <div class="skeleton h-6 w-3/4 mb-4 rounded"></div>
                    <div class="skeleton h-4 w-full mb-2 rounded"></div>
                    <div class="skeleton h-4 w-5/6 rounded"></div>
                </div>
            `;
        } else if (type === 'list') {
            html += `
                <div class="flex items-center gap-4 p-4 mb-2">
                    <div class="skeleton h-12 w-12 rounded-full"></div>
                    <div class="flex-1">
                        <div class="skeleton h-4 w-1/2 mb-2 rounded"></div>
                        <div class="skeleton h-3 w-1/3 rounded"></div>
                    </div>
                </div>
            `;
        }
    }
    return html;
}

// Utility: Error message
function showError(message) {
    return `
        <div class="empty-state">
            <i class="fas fa-exclamation-circle text-red-500"></i>
            <h3 class="text-xl font-bold mb-2">حدث خطأ</h3>
            <p>${sanitizeHTML(message)}</p>
        </div>
    `;
}

// Utility: Empty state
function showEmpty(message, icon = 'inbox') {
    return `
        <div class="empty-state">
            <i class="fas fa-${icon}"></i>
            <h3 class="text-xl font-bold mb-2">لا توجد نتائج</h3>
            <p>${sanitizeHTML(message)}</p>
        </div>
    `;
}

// Export utilities
window.utils = {
    sanitizeHTML,
    formatTime,
    getSurahName,
    createSkeleton,
    showError,
    showEmpty
};
