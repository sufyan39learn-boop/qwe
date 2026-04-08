// LocalStorage Manager for persistent state
class StorageManager {
    constructor() {
        this.prefix = 'quran_app_';
    }

    // Generic get/set
    set(key, value) {
        try {
            const fullKey = this.prefix + key;
            localStorage.setItem(fullKey, JSON.stringify({
                value,
                timestamp: Date.now()
            }));
            return true;
        } catch (error) {
            console.error('Storage Error:', error);
            return false;
        }
    }

    get(key, defaultValue = null) {
        try {
            const fullKey = this.prefix + key;
            const item = localStorage.getItem(fullKey);
            if (!item) return defaultValue;
            const parsed = JSON.parse(item);
            return parsed.value;
        } catch (error) {
            console.error('Storage Error:', error);
            return defaultValue;
        }
    }

    remove(key) {
        try {
            const fullKey = this.prefix + key;
            localStorage.removeItem(fullKey);
            return true;
        } catch (error) {
            console.error('Storage Error:', error);
            return false;
        }
    }

    clear() {
        try {
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith(this.prefix)) {
                    localStorage.removeItem(key);
                }
            });
            return true;
        } catch (error) {
            console.error('Storage Error:', error);
            return false;
        }
    }

    // Last played track
    saveLastPlayed(data) {
        this.set('last_played', {
            type: data.type, // 'surah', 'radio', 'reciter'
            id: data.id,
            title: data.title,
            subtitle: data.subtitle,
            url: data.url,
            timestamp: data.timestamp || 0,
            date: Date.now()
        });
    }

    getLastPlayed() {
        return this.get('last_played', null);
    }

    // Playback position for current track
    savePlaybackPosition(trackId, position) {
        this.set(`position_${trackId}`, position);
    }

    getPlaybackPosition(trackId) {
        return this.get(`position_${trackId}`, 0);
    }

    // Playlist
    savePlaylist(playlist) {
        this.set('playlist', playlist);
    }

    getPlaylist() {
        return this.get('playlist', []);
    }

    clearPlaylist() {
        this.remove('playlist');
    }

    // Current track index in playlist
    saveCurrentIndex(index) {
        this.set('current_index', index);
    }

    getCurrentIndex() {
        return this.get('current_index', 0);
    }

    // Favorites
    addFavorite(type, id, data) {
        const favorites = this.getFavorites();
        const key = `${type}_${id}`;
        favorites[key] = {
            type,
            id,
            ...data,
            addedAt: Date.now()
        };
        this.set('favorites', favorites);
    }

    removeFavorite(type, id) {
        const favorites = this.getFavorites();
        const key = `${type}_${id}`;
        delete favorites[key];
        this.set('favorites', favorites);
    }

    isFavorite(type, id) {
        const favorites = this.getFavorites();
        const key = `${type}_${id}`;
        return !!favorites[key];
    }

    getFavorites() {
        return this.get('favorites', {});
    }

    // Recent items
    addRecent(type, id, data) {
        const recents = this.getRecents();
        const key = `${type}_${id}`;
        
        // Remove if exists to re-add at top
        delete recents[key];
        
        recents[key] = {
            type,
            id,
            ...data,
            viewedAt: Date.now()
        };

        // Keep only last 20 items
        const entries = Object.entries(recents);
        if (entries.length > 20) {
            entries.sort((a, b) => b[1].viewedAt - a[1].viewedAt);
            const limited = Object.fromEntries(entries.slice(0, 20));
            this.set('recents', limited);
        } else {
            this.set('recents', recents);
        }
    }

    getRecents() {
        return this.get('recents', {});
    }

    getRecentsList() {
        const recents = this.getRecents();
        return Object.values(recents).sort((a, b) => b.viewedAt - a.viewedAt);
    }

    clearRecents() {
        this.remove('recents');
    }

    // Azkar counters
    saveZikrCount(zikrId, count) {
        this.set(`zikr_${zikrId}`, count);
    }

    getZikrCount(zikrId) {
        return this.get(`zikr_${zikrId}`, 0);
    }

    resetZikrCount(zikrId) {
        this.remove(`zikr_${zikrId}`);
    }

    // Daily completion tracking
    markDailyCompleted(date = null) {
        const today = date || new Date().toISOString().split('T')[0];
        const completed = this.getDailyCompleted();
        completed[today] = Date.now();
        this.set('daily_completed', completed);
    }

    isDailyCompleted(date = null) {
        const today = date || new Date().toISOString().split('T')[0];
        const completed = this.getDailyCompleted();
        return !!completed[today];
    }

    getDailyCompleted() {
        return this.get('daily_completed', {});
    }

    getDailyStreak() {
        const completed = this.getDailyCompleted();
        const dates = Object.keys(completed).sort().reverse();
        
        if (dates.length === 0) return 0;

        let streak = 0;
        let currentDate = new Date();
        
        for (const dateStr of dates) {
            const date = new Date(dateStr);
            const diffDays = Math.floor((currentDate - date) / (1000 * 60 * 60 * 24));
            
            if (diffDays === streak) {
                streak++;
            } else {
                break;
            }
        }

        return streak;
    }

    // Theme preference
    saveTheme(theme) {
        this.set('theme', theme);
        document.documentElement.classList.toggle('dark', theme === 'dark');
    }

    getTheme() {
        const saved = this.get('theme');
        if (saved) return saved;
        
        // Auto-detect from system
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    }

    // Sleep timer
    saveSleepTimer(endTime) {
        this.set('sleep_timer', endTime);
    }

    getSleepTimer() {
        return this.get('sleep_timer', null);
    }

    clearSleepTimer() {
        this.remove('sleep_timer');
    }

    // Settings
    saveSetting(key, value) {
        const settings = this.getSettings();
        settings[key] = value;
        this.set('settings', settings);
    }

    getSetting(key, defaultValue = null) {
        const settings = this.getSettings();
        return settings[key] !== undefined ? settings[key] : defaultValue;
    }

    getSettings() {
        return this.get('settings', {
            autoplay: true,
            volume: 0.8,
            repeatMode: 'none', // 'none', 'one', 'all'
            showTranslation: false,
            fontSize: 'medium'
        });
    }

    // Export/Import data
    exportData() {
        const data = {};
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith(this.prefix)) {
                data[key] = localStorage.getItem(key);
            }
        });
        return JSON.stringify(data);
    }

    importData(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            Object.entries(data).forEach(([key, value]) => {
                if (key.startsWith(this.prefix)) {
                    localStorage.setItem(key, value);
                }
            });
            return true;
        } catch (error) {
            console.error('Import Error:', error);
            return false;
        }
    }
}

// Create global storage instance
window.storage = new StorageManager();
