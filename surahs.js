// Surahs List Page
async function renderSurahsPage() {
    const content = document.getElementById('page-content');
    
    // Show loading
    content.innerHTML = `
        <div class="max-w-6xl mx-auto">
            <h1 class="text-4xl font-bold mb-8">السور</h1>
            ${utils.createSkeleton('card', 6)}
        </div>
    `;

    try {
        const data = await api.getSurahs();
        const surahs = data.data || [];

        content.innerHTML = `
            <div class="max-w-6xl mx-auto">
                <div class="mb-8 fade-in">
                    <h1 class="text-4xl font-bold mb-4">سور القرآن الكريم</h1>
                    <p class="text-gray-600 dark:text-gray-400">114 سورة</p>
                </div>

                <!-- Search and Filter -->
                <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 mb-8 fade-in" style="animation-delay: 0.1s">
                    <div class="grid md:grid-cols-2 gap-4">
                        <div>
                            <input 
                                type="text" 
                                id="search-surahs" 
                                class="search-input" 
                                placeholder="ابحث عن سورة..."
                            >
                        </div>
                        <div class="flex gap-2">
                            <button class="filter-btn active" data-filter="all">الكل</button>
                            <button class="filter-btn" data-filter="Meccan">مكية</button>
                            <button class="filter-btn" data-filter="Medinan">مدنية</button>
                        </div>
                    </div>
                </div>

                <!-- Surahs List -->
                <div id="surahs-list" class="space-y-4">
                    ${renderSurahsList(surahs)}
                </div>
            </div>
        `;

        // Add event listeners
        setupSurahsSearch(surahs);
        setupSurahsFilter(surahs);

    } catch (error) {
        console.error('Surahs page error:', error);
        content.innerHTML = `
            <div class="max-w-6xl mx-auto">
                <h1 class="text-4xl font-bold mb-8">السور</h1>
                ${utils.showError('حدث خطأ في تحميل السور')}
            </div>
        `;
    }
}

function renderSurahsList(surahs, filter = 'all', searchTerm = '') {
    let filtered = surahs;

    // Apply type filter
    if (filter !== 'all') {
        filtered = filtered.filter(s => s.type === filter);
    }

    // Apply search
    if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(s => 
            s.name.toLowerCase().includes(term) ||
            s.englishName?.toLowerCase().includes(term) ||
            s.id.toString() === term
        );
    }

    if (filtered.length === 0) {
        return utils.showEmpty('لم يتم العثور على سور');
    }

    return filtered.map((surah, index) => `
        <div class="surah-card fade-in" style="animation-delay: ${index * 0.05}s" onclick="navigate('surah/${surah.id}')">
            <div class="flex items-center gap-6">
                <!-- Number Badge -->
                <div class="w-16 h-16 bg-primary-950 dark:bg-primary-800 text-white rounded-full flex items-center justify-center flex-shrink-0">
                    <span class="text-2xl font-bold">${surah.id}</span>
                </div>

                <!-- Surah Info -->
                <div class="flex-1 min-w-0">
                    <h3 class="text-2xl font-bold mb-1">${surah.name}</h3>
                    <p class="text-gray-600 dark:text-gray-400">
                        ${surah.englishName || ''} • ${surah.verses_count} آية • ${surah.type === 'Meccan' ? 'مكية' : 'مدنية'}
                    </p>
                </div>

                <!-- Actions -->
                <div class="flex gap-2 flex-shrink-0">
                    <button 
                        class="p-3 bg-primary-100 dark:bg-primary-900 text-primary-950 dark:text-primary-400 rounded-lg hover:bg-primary-200 dark:hover:bg-primary-800 transition-colors"
                        onclick="event.stopPropagation(); playSurah(${surah.id}, '${surah.name}')"
                        title="تشغيل السورة"
                    >
                        <i class="fas fa-play"></i>
                    </button>
                    <button 
                        class="share-btn p-3"
                        onclick="event.stopPropagation(); shareSurah(${surah.id}, '${surah.name}', ${surah.verses_count}, '${surah.type}')"
                        title="مشاركة"
                    >
                        <i class="fas fa-share-alt"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function setupSurahsSearch(surahs) {
    const searchInput = document.getElementById('search-surahs');
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        const term = e.target.value;
        const filter = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
        const list = document.getElementById('surahs-list');
        list.innerHTML = renderSurahsList(surahs, filter, term);
    });
}

function setupSurahsFilter(surahs) {
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active state
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Filter list
            const filter = btn.dataset.filter;
            const searchTerm = document.getElementById('search-surahs')?.value || '';
            const list = document.getElementById('surahs-list');
            list.innerHTML = renderSurahsList(surahs, filter, searchTerm);
        });
    });
}

async function playSurah(surahId, surahName) {
    console.log('Playing surah:', surahId, surahName);
    
    try {
        // Use default reciter (you can make this configurable)
        const defaultReciter = 'ar.abdulbasitmurattal'; // Abdul Basit
        const audioData = await api.getSurahAudio(defaultReciter, surahId);
        
        if (audioData && audioData.url) {
            audioPlayer.loadTrack({
                title: `سورة ${surahName}`,
                subtitle: `القارئ: عبد الباسط عبد الصمد`,
                url: audioData.url,
                type: 'surah',
                id: surahId
            });
        } else {
            alert('لم يتم العثور على التسجيل الصوتي');
        }
    } catch (error) {
        console.error('Play surah error:', error);
        alert('حدث خطأ في تحميل الصوت');
    }
}

function shareSurah(id, name, versesCount, type) {
    shareManager.shareSurah({
        id,
        name,
        verses_count: versesCount,
        type
    });
}

// Register route
router.register('surahs', renderSurahsPage);
