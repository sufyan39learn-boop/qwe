// Main Application Script
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Quran App Initialized');
    
    // Initialize theme
    initTheme();
    
    // Setup UI event listeners
    setupSidebar();
    setupSleepTimer();
    setupPlaylist();
    
    // Hide loading screen
    setTimeout(() => {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }
    }, 1000);
});

// Theme Management
function initTheme() {
    const theme = storage.getTheme();
    document.documentElement.classList.toggle('dark', theme === 'dark');
    
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        updateThemeIcon(theme);
        
        themeToggle.addEventListener('click', () => {
            const currentTheme = storage.getTheme();
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            storage.saveTheme(newTheme);
            updateThemeIcon(newTheme);
        });
    }
}

function updateThemeIcon(theme) {
    const icon = document.querySelector('#theme-toggle i');
    if (icon) {
        icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
}

// Sidebar Management
function setupSidebar() {
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('sidebar');
    
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });
        
        // Close on outside click (mobile)
        document.addEventListener('click', (e) => {
            if (window.innerWidth < 1024) {
                if (!sidebar.contains(e.target) && !sidebarToggle.contains(e.target)) {
                    sidebar.classList.remove('open');
                }
            }
        });
    }
}

// Sleep Timer Setup
function setupSleepTimer() {
    const sleepTimerBtn = document.getElementById('sleep-timer-btn');
    const sleepTimerModal = document.getElementById('sleep-timer-modal');
    const closeSleepTimer = document.getElementById('close-sleep-timer');
    const sleepTimerOptions = document.querySelectorAll('.sleep-timer-option');
    const cancelSleepTimer = document.getElementById('cancel-sleep-timer');
    
    if (sleepTimerBtn) {
        sleepTimerBtn.addEventListener('click', () => {
            sleepTimerModal?.classList.remove('hidden');
            sleepTimerModal?.classList.add('flex');
        });
    }
    
    if (closeSleepTimer) {
        closeSleepTimer.addEventListener('click', () => {
            sleepTimerModal?.classList.add('hidden');
            sleepTimerModal?.classList.remove('flex');
        });
    }
    
    sleepTimerOptions.forEach(option => {
        option.addEventListener('click', () => {
            const minutes = parseInt(option.dataset.minutes);
            audioPlayer.setSleepTimer(minutes);
            
            // Show status
            const statusEl = document.getElementById('sleep-timer-status');
            if (statusEl) {
                statusEl.classList.remove('hidden');
            }
            
            // Hide options
            sleepTimerOptions.forEach(opt => opt.style.display = 'none');
        });
    });
    
    if (cancelSleepTimer) {
        cancelSleepTimer.addEventListener('click', () => {
            audioPlayer.cancelSleepTimer();
            sleepTimerModal?.classList.add('hidden');
            sleepTimerModal?.classList.remove('flex');
            
            // Reset UI
            const statusEl = document.getElementById('sleep-timer-status');
            if (statusEl) {
                statusEl.classList.add('hidden');
            }
            sleepTimerOptions.forEach(opt => opt.style.display = '');
        });
    }
    
    // Close on outside click
    sleepTimerModal?.addEventListener('click', (e) => {
        if (e.target === sleepTimerModal) {
            sleepTimerModal.classList.add('hidden');
            sleepTimerModal.classList.remove('flex');
        }
    });
}

// Playlist Modal Setup
function setupPlaylist() {
    const playlistBtn = document.getElementById('playlist-btn');
    const playlistModal = document.getElementById('playlist-modal');
    const closePlaylist = document.getElementById('close-playlist');
    
    if (playlistBtn) {
        playlistBtn.addEventListener('click', () => {
            showPlaylist();
        });
    }
    
    if (closePlaylist) {
        closePlaylist.addEventListener('click', () => {
            playlistModal?.classList.add('hidden');
            playlistModal?.classList.remove('flex');
        });
    }
    
    // Close on outside click
    playlistModal?.addEventListener('click', (e) => {
        if (e.target === playlistModal) {
            playlistModal.classList.add('hidden');
            playlistModal.classList.remove('flex');
        }
    });
}

function showPlaylist() {
    const playlistModal = document.getElementById('playlist-modal');
    const playlistContent = document.getElementById('playlist-content');
    
    if (!playlistModal || !playlistContent) return;
    
    const state = audioPlayer.getState();
    const playlist = state.playlist;
    const currentIndex = state.currentIndex;
    
    if (playlist.length === 0) {
        playlistContent.innerHTML = utils.showEmpty('قائمة التشغيل فارغة', 'music');
    } else {
        playlistContent.innerHTML = playlist.map((track, index) => `
            <div class="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer ${index === currentIndex ? 'bg-primary-50 dark:bg-primary-900' : ''}" onclick="playPlaylistTrack(${index})">
                <div class="w-12 h-12 bg-primary-950 dark:bg-primary-800 text-white rounded-lg flex items-center justify-center flex-shrink-0">
                    ${index === currentIndex ? '<i class="fas fa-play"></i>' : index + 1}
                </div>
                <div class="flex-1 min-w-0">
                    <h4 class="font-bold truncate">${track.title}</h4>
                    <p class="text-sm text-gray-600 dark:text-gray-400 truncate">${track.subtitle || ''}</p>
                </div>
            </div>
        `).join('');
    }
    
    playlistModal.classList.remove('hidden');
    playlistModal.classList.add('flex');
}

function playPlaylistTrack(index) {
    audioPlayer.currentIndex = index;
    audioPlayer.loadTrack(audioPlayer.playlist[index]);
    
    const playlistModal = document.getElementById('playlist-modal');
    playlistModal?.classList.add('hidden');
    playlistModal?.classList.remove('flex');
}

// Global error handler
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
});

// Service Worker (for offline support - optional)
if ('serviceWorker' in navigator) {
    // Uncomment to enable service worker
    /*
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => console.log('SW registered:', registration))
            .catch(error => console.log('SW registration failed:', error));
    });
    */
}

// Performance monitoring
window.addEventListener('load', () => {
    if (performance && performance.timing) {
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        console.log(`⚡ Page loaded in ${loadTime}ms`);
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Space: Play/Pause
    if (e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        audioPlayer.togglePlay();
    }
    
    // Arrow Right: Next track
    if (e.code === 'ArrowRight' && e.ctrlKey) {
        e.preventDefault();
        audioPlayer.playNext();
    }
    
    // Arrow Left: Previous track
    if (e.code === 'ArrowLeft' && e.ctrlKey) {
        e.preventDefault();
        audioPlayer.playPrevious();
    }
});

// Add CSS for filter buttons
const style = document.createElement('style');
style.textContent = `
    .filter-btn {
        padding: 0.5rem 1.5rem;
        border-radius: 0.75rem;
        font-weight: 500;
        transition: all 0.3s ease;
        border: 2px solid transparent;
        background: transparent;
        color: #6b7280;
        cursor: pointer;
    }
    
    .dark .filter-btn {
        color: #9ca3af;
    }
    
    .filter-btn:hover {
        background: #f3f4f6;
    }
    
    .dark .filter-btn:hover {
        background: #374151;
    }
    
    .filter-btn.active {
        background: #065f46;
        color: white;
        border-color: #065f46;
    }
    
    .dark .filter-btn.active {
        background: #16a34a;
        border-color: #16a34a;
    }
    
    .mushaf-mode-btn {
        padding: 0.5rem 1.5rem;
        border-radius: 0.75rem;
        font-weight: 500;
        transition: all 0.3s ease;
        border: 2px solid transparent;
        background: transparent;
        color: #6b7280;
        cursor: pointer;
    }
    
    .dark .mushaf-mode-btn {
        color: #9ca3af;
    }
    
    .mushaf-mode-btn:hover {
        background: #f3f4f6;
    }
    
    .dark .mushaf-mode-btn:hover {
        background: #374151;
    }
    
    .mushaf-mode-btn.active {
        background: #065f46;
        color: white;
        border-color: #065f46;
    }
    
    .dark .mushaf-mode-btn.active {
        background: #16a34a;
        border-color: #16a34a;
    }
    
    .mode-btn {
        padding: 0.5rem 1rem;
        font-weight: 500;
        transition: all 0.3s ease;
        background: transparent;
        color: #6b7280;
        cursor: pointer;
        border: none;
    }
    
    .dark .mode-btn {
        color: #9ca3af;
    }
    
    .mode-btn:hover {
        color: #065f46;
    }
    
    .dark .mode-btn:hover {
        color: #16a34a;
    }
    
    .mode-btn.active {
        background: #065f46;
        color: white;
    }
    
    .dark .mode-btn.active {
        background: #16a34a;
        color: white;
    }
`;
document.head.appendChild(style);

console.log('✨ Quran App Ready');
