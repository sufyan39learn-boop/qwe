// Global State Management System
class StateManager {
    constructor() {
        this.state = {
            // Audio state
            currentSurah: null,
            currentReciter: null,
            currentAudio: null,
            isPlaying: false,
            currentTime: 0,
            duration: 0,
            volume: 0.8,
            playlist: [],
            currentIndex: 0,
            
            // UI state
            isLoading: false,
            currentPage: 'home',
            searchQuery: '',
            filters: {},
            
            // User state
            favorites: [],
            recents: [],
            dailyCompleted: false,
            streak: 0
        };
        
        this.listeners = new Map();
        this.loadState();
    }

    // Load state from storage
    loadState() {
        const savedState = storage.get('app_state');
        if (savedState) {
            this.state = { ...this.state, ...savedState };
        }
    }

    // Save state to storage
    saveState() {
        storage.set('app_state', this.state);
    }

    // Get current state
    getState() {
        return { ...this.state };
    }

    // Get specific state value
    get(key) {
        return this.state[key];
    }

    // Set state and notify listeners
    setState(updates) {
        const prevState = { ...this.state };
        this.state = { ...this.state, ...updates };
        
        // Notify listeners of changed keys
        Object.keys(updates).forEach(key => {
            if (prevState[key] !== this.state[key]) {
                this.notify(key, this.state[key], prevState[key]);
            }
        });
        
        // Save to storage (debounced)
        this.debouncedSave();
    }

    // Subscribe to state changes
    subscribe(key, callback) {
        if (!this.listeners.has(key)) {
            this.listeners.set(key, new Set());
        }
        this.listeners.get(key).add(callback);
        
        // Return unsubscribe function
        return () => {
            const callbacks = this.listeners.get(key);
            if (callbacks) {
                callbacks.delete(callback);
            }
        };
    }

    // Notify listeners
    notify(key, newValue, oldValue) {
        const callbacks = this.listeners.get(key);
        if (callbacks) {
            callbacks.forEach(callback => {
                try {
                    callback(newValue, oldValue);
                } catch (error) {
                    console.error('State listener error:', error);
                }
            });
        }
    }

    // Debounced save
    debouncedSave() {
        if (this.saveTimeout) {
            clearTimeout(this.saveTimeout);
        }
        this.saveTimeout = setTimeout(() => {
            this.saveState();
        }, 500);
    }

    // Audio-specific methods
    setAudioState(updates) {
        const audioKeys = ['currentSurah', 'currentReciter', 'currentAudio', 'isPlaying', 'currentTime', 'duration', 'volume'];
        const audioUpdates = {};
        audioKeys.forEach(key => {
            if (updates[key] !== undefined) {
                audioUpdates[key] = updates[key];
            }
        });
        this.setState(audioUpdates);
    }

    // Playlist methods
    setPlaylist(playlist, currentIndex = 0) {
        this.setState({
            playlist,
            currentIndex
        });
    }

    nextTrack() {
        const { playlist, currentIndex } = this.state;
        if (playlist.length > 0) {
            const newIndex = (currentIndex + 1) % playlist.length;
            this.setState({ currentIndex: newIndex });
            return playlist[newIndex];
        }
        return null;
    }

    prevTrack() {
        const { playlist, currentIndex } = this.state;
        if (playlist.length > 0) {
            const newIndex = (currentIndex - 1 + playlist.length) % playlist.length;
            this.setState({ currentIndex: newIndex });
            return playlist[newIndex];
        }
        return null;
    }

    // Favorites
    addFavorite(item) {
        const favorites = [...this.state.favorites];
        const existingIndex = favorites.findIndex(f => f.id === item.id && f.type === item.type);
        if (existingIndex === -1) {
            favorites.push({ ...item, addedAt: Date.now() });
            this.setState({ favorites });
            storage.addFavorite(item.type, item.id, item);
        }
    }

    removeFavorite(type, id) {
        const favorites = this.state.favorites.filter(f => !(f.id === id && f.type === type));
        this.setState({ favorites });
        storage.removeFavorite(type, id);
    }

    isFavorite(type, id) {
        return this.state.favorites.some(f => f.id === id && f.type === type);
    }

    // Recents
    addRecent(item) {
        const recents = [...this.state.recents];
        // Remove if already exists
        const filtered = recents.filter(r => !(r.id === item.id && r.type === item.type));
        // Add to beginning
        filtered.unshift({ ...item, viewedAt: Date.now() });
        // Keep only last 20
        const limited = filtered.slice(0, 20);
        this.setState({ recents: limited });
        storage.addRecent(item.type, item.id, item);
    }

    // Reset state
    reset() {
        this.state = {
            currentSurah: null,
            currentReciter: null,
            currentAudio: null,
            isPlaying: false,
            currentTime: 0,
            duration: 0,
            volume: 0.8,
            playlist: [],
            currentIndex: 0,
            isLoading: false,
            currentPage: 'home',
            searchQuery: '',
            filters: {},
            favorites: [],
            recents: [],
            dailyCompleted: false,
            streak: 0
        };
        this.saveState();
    }
}

// Create global state instance
window.appState = new StateManager();

// Example usage:
// appState.setState({ isPlaying: true });
// appState.subscribe('isPlaying', (newVal, oldVal) => {
//     console.log('Playing state changed:', oldVal, '->', newVal);
// });
