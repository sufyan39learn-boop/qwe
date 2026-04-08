// Reciter Detail Page
async function renderReciterDetailPage(params) {
    const reciterId = params[0];
    if (!reciterId) {
        navigate('reciters');
        return;
    }

    const content = document.getElementById('page-content');
    
    content.innerHTML = `
        <div class="max-w-6xl mx-auto">
            ${utils.createSkeleton('card', 4)}
        </div>
    `;

    try {
        const [recitersData, audioData] = await Promise.all([
            api.getReciters(),
            api.getReciterAudio(reciterId)
        ]);

        const reciter = recitersData.data?.find(r => r.id == reciterId);
        if (!reciter) {
            content.innerHTML = utils.showError('القارئ غير موجود');
            return;
        }

        const surahs = audioData.data || [];

        content.innerHTML = `
            <div class="max-w-6xl mx-auto">
                
                <!-- Reciter Header -->
                <div class="bg-gradient-to-br from-primary-950 to-primary-800 rounded-3xl p-12 text-white text-center mb-8 fade-in">
                    <div class="w-32 h-32 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <i class="fas fa-microphone text-6xl"></i>
                    </div>
                    <h1 class="text-5xl font-bold mb-4">${reciter.name}</h1>
                    <p class="text-xl opacity-90 mb-6">${reciter.style || 'القرآن الكريم'}</p>
                    
                    <div class="flex justify-center gap-4">
                        <button id="play-all-btn" class="bg-white text-primary-950 px-8 py-3 rounded-xl font-bold hover:bg-stone-100 transition-all">
                            <i class="fas fa-play ml-2"></i>
                            تشغيل الكل
                        </button>
                        <button id="shuffle-btn" class="bg-white bg-opacity-20 text-white px-8 py-3 rounded-xl font-bold hover:bg-opacity-30 transition-all">
                            <i class="fas fa-random ml-2"></i>
                            عشوائي
                        </button>
                    </div>
                </div>

                <!-- Surahs List -->
                <div class="space-y-3">
                    <h2 class="text-2xl font-bold mb-4">السور (${surahs.length})</h2>
                    ${renderReciterSurahs(surahs, reciter.name, reciterId)}
                </div>

            </div>
        `;

        // Event listeners
        document.getElementById('play-all-btn')?.addEventListener('click', () => {
            playReciterPlaylist(surahs, reciter.name, 0);
        });

        document.getElementById('shuffle-btn')?.addEventListener('click', () => {
            const shuffled = [...surahs].sort(() => Math.random() - 0.5);
            playReciterPlaylist(shuffled, reciter.name, 0);
        });

    } catch (error) {
        console.error('Reciter detail error:', error);
        content.innerHTML = utils.showError('حدث خطأ في تحميل القارئ');
    }
}

function renderReciterSurahs(surahs, reciterName, reciterId) {
    return surahs.map((surah, index) => `
        <div class="bg-white dark:bg-gray-800 rounded-xl p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer fade-in" 
             style="animation-delay: ${index * 0.02}s"
             onclick="playReciterSurah(${index}, ${reciterId}, '${reciterName}', ${JSON.stringify(surahs).replace(/"/g, '&quot;')})">
            <div class="flex items-center gap-4">
                <div class="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span class="text-xl font-bold text-primary-950 dark:text-primary-400">${surah.id}</span>
                </div>
                <div class="flex-1">
                    <h3 class="text-xl font-bold">${surah.name}</h3>
                    <p class="text-sm text-gray-600 dark:text-gray-400">${surah.verses_count} آية</p>
                </div>
                <button class="p-3 bg-primary-100 dark:bg-primary-900 rounded-lg hover:bg-primary-200 dark:hover:bg-primary-800 transition-colors">
                    <i class="fas fa-play text-primary-950 dark:text-primary-400"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function playReciterSurah(index, reciterId, reciterName, surahsArray) {
    playReciterPlaylist(surahsArray, reciterName, index);
}

function playReciterPlaylist(surahs, reciterName, startIndex = 0) {
    const playlist = surahs.map(surah => ({
        title: `سورة ${surah.name}`,
        subtitle: `القارئ: ${reciterName}`,
        url: surah.url,
        type: 'reciter',
        id: surah.id
    }));

    audioPlayer.loadPlaylist(playlist, startIndex);
}

router.register('reciter', renderReciterDetailPage);
