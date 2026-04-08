// Smart Audio Player with Playlist, Resume, and Sleep Timer
class AudioPlayer {
    constructor() {
        this.audio = document.getElementById('audio-element');
        this.player = document.getElementById('audio-player');
        this.playPauseBtn = document.getElementById('play-pause-btn');
        this.prevBtn = document.getElementById('prev-btn');
        this.nextBtn = document.getElementById('next-btn');
        this.progressBar = document.getElementById('progress-bar');
        this.currentTimeEl = document.getElementById('current-time');
        this.durationEl = document.getElementById('duration');
        this.trackTitle = document.getElementById('track-title');
        this.trackSubtitle = document.getElementById('track-subtitle');
        this.volumeControl = document.getElementById('volume-control');

        this.playlist = [];
        this.currentIndex = 0;
        this.isPlaying = false;
        this.sleepTimer = null;

        this.init();
    }

    init() {
        // Load saved settings
        const settings = storage.getSettings();
        this.audio.volume = settings.volume;
        if (this.volumeControl) {
            this.volumeControl.value = settings.volume * 100;
        }
        
        // Enable smooth fade-in
        this.fadeInDuration = 2000; // 2 seconds
        this.fadeInInterval = null;
        this.targetVolume = settings.volume;

        // Event listeners
        this.playPauseBtn.addEventListener('click', () => this.togglePlay());
        this.prevBtn.addEventListener('click', () => this.playPrevious());
        this.nextBtn.addEventListener('click', () => this.playNext());
        
        this.progressBar.addEventListener('input', (e) => {
            const time = (e.target.value / 100) * this.audio.duration;
            this.audio.currentTime = time;
        });

        if (this.volumeControl) {
            this.volumeControl.addEventListener('input', (e) => {
                const volume = e.target.value / 100;
                this.targetVolume = volume;
                this.audio.volume = volume;
                storage.saveSetting('volume', volume);
                appState.setState({ volume });
            });
        }

        // Audio events
        this.audio.addEventListener('play', () => this.onPlay());
        this.audio.addEventListener('pause', () => this.onPause());
        this.audio.addEventListener('ended', () => this.onEnded());
        this.audio.addEventListener('timeupdate', () => this.onTimeUpdate());
        this.audio.addEventListener('loadedmetadata', () => this.onLoadedMetadata());
        this.audio.addEventListener('error', (e) => this.onError(e));

        // Load last played if exists
        this.loadLastSession();

        // Check sleep timer
        this.checkSleepTimer();
    }

    loadLastSession() {
        const lastPlayed = storage.getLastPlayed();
        if (lastPlayed && lastPlayed.url) {
            console.log('📼 Resuming last session:', lastPlayed.title);
            this.loadTrack({
                title: lastPlayed.title,
                subtitle: lastPlayed.subtitle,
                url: lastPlayed.url,
                id: lastPlayed.id,
                type: lastPlayed.type
            }, false);
            
            // Set position but don't auto-play
            if (lastPlayed.timestamp > 0) {
                this.audio.currentTime = lastPlayed.timestamp;
            }
        }
    }

    loadTrack(track, autoplay = true) {
        console.log('🎵 Loading track:', track.title);
        
        // Update UI
        this.audio.src = track.url;
        this.trackTitle.textContent = track.title;
        this.trackSubtitle.textContent = track.subtitle || '';
        
        this.currentTrack = track;
        this.player.classList.add('show');

        // Update global state
        appState.setAudioState({
            currentAudio: track,
            currentSurah: track.type === 'surah' ? track.id : null,
            currentReciter: track.reciterId || null
        });

        // Save to storage
        storage.saveLastPlayed({
            type: track.type || 'audio',
            id: track.id || '',
            title: track.title,
            subtitle: track.subtitle || '',
            url: track.url,
            timestamp: 0
        });

        if (autoplay) {
            this.play();
        }

        // Add to recents
        if (track.type && track.id) {
            storage.addRecent(track.type, track.id, {
                title: track.title,
                subtitle: track.subtitle
            });
            appState.addRecent(track);
        }
    }

    loadPlaylist(playlist, startIndex = 0) {
        console.log('📻 Loading playlist:', playlist.length, 'tracks');
        this.playlist = playlist;
        this.currentIndex = startIndex;
        storage.savePlaylist(playlist);
        storage.saveCurrentIndex(startIndex);
        
        this.updateNavigationButtons();
        
        if (playlist.length > 0) {
            this.loadTrack(playlist[startIndex]);
        }
    }

    play() {
        // Start with fade-in effect
        this.startFadeIn();
        
        const playPromise = this.audio.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.error('Play error:', error);
                this.showErrorNotification('خطأ في التشغيل', 'يرجى التحقق من الاتصال بالإنترنت');
            });
        }
    }

    // Smooth fade-in effect
    startFadeIn() {
        if (this.fadeInInterval) {
            clearInterval(this.fadeInInterval);
        }
        
        this.audio.volume = 0;
        const steps = 20;
        const stepDuration = this.fadeInDuration / steps;
        const volumeIncrement = this.targetVolume / steps;
        let currentStep = 0;
        
        this.fadeInInterval = setInterval(() => {
            currentStep++;
            if (currentStep >= steps) {
                this.audio.volume = this.targetVolume;
                clearInterval(this.fadeInInterval);
                this.fadeInInterval = null;
            } else {
                this.audio.volume = Math.min(volumeIncrement * currentStep, this.targetVolume);
            }
        }, stepDuration);
    }

    // Show error notification
    showErrorNotification(title, message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'fixed top-20 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-4 rounded-lg shadow-xl z-50 animate-fade-in';
        notification.innerHTML = `
            <div class="flex items-center gap-3">
                <i class="fas fa-exclamation-circle text-2xl"></i>
                <div>
                    <div class="font-bold">${title}</div>
                    <div class="text-sm opacity-90">${message}</div>
                </div>
            </div>
        `;
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    pause() {
        this.audio.pause();
    }

    togglePlay() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }

    playNext() {
        if (this.playlist.length === 0) return;
        
        this.currentIndex = (this.currentIndex + 1) % this.playlist.length;
        storage.saveCurrentIndex(this.currentIndex);
        this.loadTrack(this.playlist[this.currentIndex]);
        this.updateNavigationButtons();
    }

    playPrevious() {
        if (this.playlist.length === 0) return;
        
        this.currentIndex = (this.currentIndex - 1 + this.playlist.length) % this.playlist.length;
        storage.saveCurrentIndex(this.currentIndex);
        this.loadTrack(this.playlist[this.currentIndex]);
        this.updateNavigationButtons();
    }

    updateNavigationButtons() {
        const hasPlaylist = this.playlist.length > 1;
        this.prevBtn.disabled = !hasPlaylist;
        this.nextBtn.disabled = !hasPlaylist;
        
        this.prevBtn.style.opacity = hasPlaylist ? '1' : '0.5';
        this.nextBtn.style.opacity = hasPlaylist ? '1' : '0.5';
    }

    onPlay() {
        this.isPlaying = true;
        const icon = this.playPauseBtn.querySelector('i');
        icon.className = 'fas fa-pause text-xl';
        
        // Update global state
        appState.setState({ isPlaying: true });
    }

    onPause() {
        this.isPlaying = false;
        const icon = this.playPauseBtn.querySelector('i');
        icon.className = 'fas fa-play text-xl';
        
        // Update global state
        appState.setState({ isPlaying: false });
        
        // Clear fade-in interval if exists
        if (this.fadeInInterval) {
            clearInterval(this.fadeInInterval);
            this.fadeInInterval = null;
        }
        
        // Save position
        if (this.currentTrack) {
            storage.saveLastPlayed({
                type: this.currentTrack.type || 'audio',
                id: this.currentTrack.id || '',
                title: this.currentTrack.title,
                subtitle: this.currentTrack.subtitle || '',
                url: this.currentTrack.url,
                timestamp: this.audio.currentTime
            });
        }
    }

    onEnded() {
        console.log('⏹️ Track ended');
        
        const settings = storage.getSettings();
        
        if (settings.repeatMode === 'one') {
            this.audio.currentTime = 0;
            this.play();
        } else if (this.playlist.length > 1) {
            // Auto-play next
            this.playNext();
        } else if (settings.repeatMode === 'all' && this.playlist.length > 0) {
            this.currentIndex = 0;
            this.loadTrack(this.playlist[0]);
        }
    }

    onTimeUpdate() {
        if (this.audio.duration) {
            const percent = (this.audio.currentTime / this.audio.duration) * 100;
            this.progressBar.value = percent;
            this.currentTimeEl.textContent = utils.formatTime(this.audio.currentTime);
            
            // Save position periodically (every 5 seconds)
            if (Math.floor(this.audio.currentTime) % 5 === 0 && this.currentTrack) {
                storage.saveLastPlayed({
                    type: this.currentTrack.type || 'audio',
                    id: this.currentTrack.id || '',
                    title: this.currentTrack.title,
                    subtitle: this.currentTrack.subtitle || '',
                    url: this.currentTrack.url,
                    timestamp: this.audio.currentTime
                });
            }
        }
    }

    onLoadedMetadata() {
        this.durationEl.textContent = utils.formatTime(this.audio.duration);
        console.log('✅ Track loaded, duration:', utils.formatTime(this.audio.duration));
    }

    onError(e) {
        console.error('❌ Audio error:', e);
        this.trackTitle.textContent = 'خطأ في التحميل';
        this.trackSubtitle.textContent = 'يرجى المحاولة مرة أخرى';
        
        // Show error notification
        this.showErrorNotification(
            'خطأ في تحميل الصوت',
            'يرجى التحقق من الاتصال بالإنترنت والمحاولة مرة أخرى'
        );
        
        // Try next track if in playlist
        if (this.playlist.length > 1) {
            setTimeout(() => {
                console.log('🔄 Trying next track...');
                this.playNext();
            }, 3000);
        }
    }

    // Sleep Timer
    setSleepTimer(minutes) {
        const endTime = Date.now() + (minutes * 60 * 1000);
        storage.saveSleepTimer(endTime);
        this.checkSleepTimer();
        console.log(`⏰ Sleep timer set for ${minutes} minutes`);
    }

    checkSleepTimer() {
        const endTime = storage.getSleepTimer();
        
        if (endTime) {
            const remaining = endTime - Date.now();
            
            if (remaining > 0) {
                // Update UI
                this.updateSleepTimerUI(remaining);
                
                // Set timeout
                if (this.sleepTimer) clearTimeout(this.sleepTimer);
                this.sleepTimer = setTimeout(() => {
                    this.pause();
                    storage.clearSleepTimer();
                    this.hideSleepTimerUI();
                    console.log('😴 Sleep timer triggered - stopping playback');
                }, remaining);
                
                // Update every second
                setInterval(() => {
                    const rem = storage.getSleepTimer() - Date.now();
                    if (rem > 0) {
                        this.updateSleepTimerUI(rem);
                    }
                }, 1000);
            } else {
                storage.clearSleepTimer();
            }
        }
    }

    cancelSleepTimer() {
        if (this.sleepTimer) {
            clearTimeout(this.sleepTimer);
            this.sleepTimer = null;
        }
        storage.clearSleepTimer();
        this.hideSleepTimerUI();
        console.log('❌ Sleep timer cancelled');
    }

    updateSleepTimerUI(remaining) {
        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);
        const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        const remainingEl = document.getElementById('remaining-time');
        if (remainingEl) {
            remainingEl.textContent = timeStr;
        }
    }

    hideSleepTimerUI() {
        const statusEl = document.getElementById('sleep-timer-status');
        if (statusEl) {
            statusEl.classList.add('hidden');
        }
    }

    // Get current state
    getState() {
        return {
            isPlaying: this.isPlaying,
            currentTrack: this.currentTrack,
            playlist: this.playlist,
            currentIndex: this.currentIndex,
            currentTime: this.audio.currentTime,
            duration: this.audio.duration
        };
    }
}

// Create global audio player instance
window.audioPlayer = null;

// Initialize after DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.audioPlayer = new AudioPlayer();
});
