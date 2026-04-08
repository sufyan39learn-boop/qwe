# 🛠️ Developer Quick Reference

## 🎯 Quick Start

### Adding a New Page

1. **Create page file**: `js/pages/my-page.js`

```javascript
async function renderMyPage() {
    const content = document.getElementById('page-content');
    
    // Show loading
    content.innerHTML = utils.createSkeleton('card', 3);
    
    try {
        // Fetch data
        const data = await api.getMyData();
        
        // Render content
        content.innerHTML = `
            <div class="max-w-6xl mx-auto">
                <h1 class="text-4xl font-bold mb-8">My Page</h1>
                <!-- Your content here -->
            </div>
        `;
    } catch (error) {
        content.innerHTML = utils.showError('Error message');
    }
}

// Register route
router.register('mypage', renderMyPage);
```

2. **Add to index.html**:
```html
<script src="js/pages/my-page.js"></script>
```

3. **Add navigation link**:
```html
<a href="#mypage" class="nav-link">
    <i class="fas fa-icon"></i>
    <span>My Page</span>
</a>
```

---

## 🎵 Audio Player Usage

### Load and Play Track
```javascript
audioPlayer.loadTrack({
    title: 'Track Title',
    subtitle: 'Optional subtitle',
    url: 'https://audio-url.mp3',
    type: 'surah', // or 'reciter', 'radio', 'audio'
    id: 1,
    reciterId: 1 // optional
});
```

### Control Playback
```javascript
audioPlayer.play();
audioPlayer.pause();
audioPlayer.togglePlay();
audioPlayer.playNext();
audioPlayer.playPrevious();
```

### Load Playlist
```javascript
const playlist = [
    { title: 'Track 1', url: '...', type: 'surah', id: 1 },
    { title: 'Track 2', url: '...', type: 'surah', id: 2 }
];
audioPlayer.loadPlaylist(playlist, 0); // 0 = start index
```

### Sleep Timer
```javascript
audioPlayer.setSleepTimer(20); // minutes
audioPlayer.cancelSleepTimer();
```

---

## 🗄️ State Management

### Get State
```javascript
const currentState = appState.getState();
const isPlaying = appState.get('isPlaying');
```

### Update State
```javascript
appState.setState({
    isPlaying: true,
    currentSurah: 1
});
```

### Subscribe to Changes
```javascript
const unsubscribe = appState.subscribe('isPlaying', (newValue, oldValue) => {
    console.log('Playing changed:', oldValue, '->', newValue);
});

// Later: unsubscribe()
```

### Audio State
```javascript
appState.setAudioState({
    isPlaying: true,
    currentTime: 10,
    duration: 300
});
```

---

## 💾 Storage

### Basic Storage
```javascript
storage.set('key', value);
const value = storage.get('key', defaultValue);
storage.remove('key');
storage.clear();
```

### Last Played
```javascript
storage.saveLastPlayed({
    type: 'surah',
    id: 1,
    title: 'Al-Fatihah',
    subtitle: 'القارئ',
    url: 'https://...',
    timestamp: 10
});

const lastPlayed = storage.getLastPlayed();
```

### Favorites
```javascript
storage.addFavorite('surah', 1, { name: 'Al-Fatihah' });
storage.removeFavorite('surah', 1);
const isFav = storage.isFavorite('surah', 1);
const favorites = storage.getFavorites();
```

### Recents
```javascript
storage.addRecent('surah', 1, { name: 'Al-Fatihah' });
const recents = storage.getRecentsList(); // sorted by time
storage.clearRecents();
```

### Settings
```javascript
storage.saveSetting('volume', 0.8);
const volume = storage.getSetting('volume', 0.8);
const allSettings = storage.getSettings();
```

### Daily Tracking
```javascript
storage.markDailyCompleted();
const isCompleted = storage.isDailyCompleted();
const streak = storage.getDailyStreak();
```

---

## 🌐 API Usage

### Fetch Data
```javascript
// Automatically cached for 1 hour
const data = await api.getSurahs();
const ayah = await api.getAyah(255);
const reciters = await api.getReciters();
```

### Clear Cache
```javascript
api.clearCache(); // Clear all cache
api.clearExpiredCache(); // Clear only expired
```

### All API Methods
```javascript
api.getRadio()
api.getPrayerTimes()
api.getSurahs()
api.getAyah(number)
api.getSurahAudio(reciterId, surahId)
api.getReciters()
api.getReciterAudio(reciterId)
api.getQuranPagesImage()
api.getQuranPagesText(page)
api.getAzkar()
api.getDuas()
api.getLaylatAlQadr()
```

---

## 🔗 Sharing

### Share Content
```javascript
// Surah
shareManager.shareSurah({
    id: 1,
    name: 'الفاتحة',
    verses_count: 7,
    type: 'Meccan'
});

// Ayah
shareManager.shareAyah({
    number: 255,
    text: 'آية الكرسي',
    numberInSurah: 255
}, 'البقرة');

// Reciter
shareManager.shareReciter({
    id: 1,
    name: 'عبد الباسط'
});

// Zikr
shareManager.shareZikr({ text: '...' }, 'أذكار الصباح');

// Dua
shareManager.shareDua({ text: '...' }, 'دعاء النوم');

// Audio
shareManager.shareAudio('Title', 'Subtitle', 'surah', 1);

// Page
shareManager.sharePage({ page: 1 });

// Generic
shareManager.shareGeneric('Title', 'Text', 'https://url.com');
```

---

## 🧭 Router

### Navigate
```javascript
navigate('home');
navigate('surah/1');
navigate('reciter/1');
```

### Register Route
```javascript
router.register('myroute', (params) => {
    const id = params[0]; // From #myroute/123
    // Render page
});
```

### Get Current Route
```javascript
const currentRoute = router.getCurrentRoute();
const params = router.getParams();
```

---

## 🎨 UI Utilities

### Loading Skeleton
```javascript
content.innerHTML = utils.createSkeleton('card', 3);
content.innerHTML = utils.createSkeleton('list', 5);
```

### Error/Empty States
```javascript
content.innerHTML = utils.showError('Error message');
content.innerHTML = utils.showEmpty('No results', 'inbox');
```

### Format Time
```javascript
const formatted = utils.formatTime(125); // "2:05"
```

### Sanitize HTML
```javascript
const safe = utils.sanitizeHTML(userInput);
```

### Get Surah Name
```javascript
const name = utils.getSurahName(1); // "الفاتحة"
```

---

## 🎯 Performance

### Debounce Function
```javascript
const debouncedSearch = performanceUtils.debounce((query) => {
    // Search logic
}, 300);
```

### Throttle Function
```javascript
const throttledScroll = performanceUtils.throttle(() => {
    // Scroll logic
}, 100);
```

### Lazy Load Images
```javascript
// In HTML:
<img data-src="image.jpg" alt="...">

// Setup lazy loading:
performanceUtils.setupLazyLoading();
```

### Performance Report
```javascript
const report = performanceUtils.performanceMonitor.getReport();
performanceUtils.performanceMonitor.logReport();
```

---

## 🎨 CSS Classes

### Animations
```html
<div class="fade-in" style="animation-delay: 0.1s">
    Content
</div>
```

### Cards
```html
<div class="card-hover">Hoverable card</div>
<div class="surah-card">Surah card</div>
<div class="prayer-card">Prayer card</div>
```

### Buttons
```html
<button class="btn-primary">Primary</button>
<button class="btn-secondary">Secondary</button>
```

### Loading
```html
<div class="skeleton h-12 w-full rounded"></div>
```

---

## 🔧 Common Patterns

### Async Page Render
```javascript
async function renderPage() {
    const content = document.getElementById('page-content');
    
    // 1. Show loading
    content.innerHTML = utils.createSkeleton('card', 3);
    
    try {
        // 2. Fetch data
        const data = await api.getData();
        
        // 3. Render
        content.innerHTML = `<!-- HTML -->`;
        
        // 4. Setup events
        setupEventListeners();
        
    } catch (error) {
        console.error('Error:', error);
        content.innerHTML = utils.showError('Error message');
    }
}
```

### Error Handling
```javascript
try {
    const data = await api.getData();
} catch (error) {
    console.error('Fetch error:', error);
    // Show user-friendly message
    showErrorNotification('Title', 'Message');
}
```

### Notification
```javascript
// Success
showSuccessNotification('Title', 'Message');

// Error
showErrorNotification('Title', 'Message');
```

---

## 📝 Code Style

### Naming Conventions
- Functions: `camelCase` (e.g., `renderHomePage`)
- Classes: `PascalCase` (e.g., `AudioPlayer`)
- Constants: `UPPER_SNAKE_CASE` (e.g., `API_BASE`)
- Private: Prefix with `_` (e.g., `_privateMethod`)

### File Organization
- One page per file
- Register route at bottom
- Group related functions
- Clear section comments

### Comments
```javascript
// Single line comment

/**
 * Multi-line description
 * @param {string} param - Description
 * @returns {Object} - Return description
 */
```

---

## 🐛 Debugging

### Console Commands
```javascript
// Check state
console.log(appState.getState());

// Check storage
console.log(storage.get('key'));

// Check cache
console.log(api.cache);

// Performance report
performanceUtils.performanceMonitor.logReport();

// Audio state
console.log(audioPlayer.getState());
```

### Common Issues

**Audio won't play**:
- Check URL is valid
- Check CORS headers
- Check audio format support

**Cache not working**:
- Check localStorage quota
- Clear old cache: `api.clearCache()`

**State not updating**:
- Use `setState()`, not direct assignment
- Check subscription is active

---

## 📚 Resources

- **Tailwind Docs**: https://tailwindcss.com/docs
- **Font Awesome Icons**: https://fontawesome.com/icons
- **API Docs**: See README.md
- **Project Structure**: See PROJECT_SUMMARY.md

---

**Happy Coding! 🚀**

*May your code be bug-free and your cache always fresh!*
