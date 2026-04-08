// Surah Detail Page - Full Ayat Display
async function renderSurahDetailPage(params) {
    const surahId = params[0];
    if (!surahId) {
        navigate('surahs');
        return;
    }

    const content = document.getElementById('page-content');
    
    // Show loading
    content.innerHTML = `
        <div class="max-w-4xl mx-auto">
            <div class="skeleton h-12 w-1/2 mb-8 rounded"></div>
            ${utils.createSkeleton('card', 5)}
        </div>
    `;

    try {
        // Fetch surah data
        const surahData = await api.getSurahs();
        const surah = surahData.data.find(s => s.id == surahId);
        
        if (!surah) {
            content.innerHTML = utils.showError('السورة غير موجودة');
            return;
        }

        // Fetch ayat - get all ayat for this surah
        const firstAyah = surah.start;
        const lastAyah = surah.end;
        const ayatPromises = [];
        
        for (let i = firstAyah; i <= lastAyah; i++) {
            ayatPromises.push(api.getAyah(i));
        }
        
        const ayatData = await Promise.all(ayatPromises);
        const ayat = ayatData.map(d => d.data);

        // Render page
        content.innerHTML = `
            <div class="max-w-4xl mx-auto">
                
                <!-- Surah Header -->
                <div class="bg-gradient-to-br from-primary-950 to-primary-800 rounded-3xl p-8 text-white text-center mb-8 fade-in">
                    <div class="text-6xl font-bold mb-4">${surah.id}</div>
                    <h1 class="text-5xl font-bold mb-4">${surah.name}</h1>
                    <p class="text-xl opacity-90 mb-6">
                        ${surah.englishName || ''} • ${surah.verses_count} آية • ${surah.type === 'Meccan' ? 'مكية' : 'مدنية'}
                    </p>
                    
                    <!-- Action Buttons -->
                    <div class="flex justify-center gap-4 flex-wrap">
                        <button id="play-surah-btn" class="bg-white text-primary-950 px-8 py-3 rounded-xl font-bold hover:bg-stone-100 transition-all">
                            <i class="fas fa-play ml-2"></i>
                            تشغيل السورة
                        </button>
                        <button id="share-surah-btn" class="bg-white bg-opacity-20 text-white px-8 py-3 rounded-xl font-bold hover:bg-opacity-30 transition-all">
                            <i class="fas fa-share-alt ml-2"></i>
                            مشاركة
                        </button>
                    </div>
                </div>

                <!-- Bismillah (except Surah 9) -->
                ${surahId != 9 && surahId != 1 ? `
                <div class="text-center text-4xl font-bold mb-8 fade-in" style="animation-delay: 0.1s">
                    بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                </div>
                ` : ''}

                <!-- Reading Mode Toggle -->
                <div class="flex justify-end mb-6 fade-in" style="animation-delay: 0.15s">
                    <div class="bg-white dark:bg-gray-800 rounded-xl p-2 flex gap-2">
                        <button class="mode-btn active px-4 py-2 rounded-lg" data-mode="separate">
                            <i class="fas fa-list ml-2"></i>
                            آية آية
                        </button>
                        <button class="mode-btn px-4 py-2 rounded-lg" data-mode="continuous">
                            <i class="fas fa-align-right ml-2"></i>
                            متصل
                        </button>
                    </div>
                </div>

                <!-- Ayat Display -->
                <div id="ayat-container">
                    ${renderAyatSeparate(ayat, surah.name)}
                </div>

            </div>
        `;

        // Event listeners
        document.getElementById('play-surah-btn')?.addEventListener('click', () => {
            playSurahAudio(surahId, surah.name);
        });

        document.getElementById('share-surah-btn')?.addEventListener('click', () => {
            shareManager.shareSurah(surah);
        });

        // Reading mode toggle
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const mode = btn.dataset.mode;
                const container = document.getElementById('ayat-container');
                
                if (mode === 'continuous') {
                    container.innerHTML = renderAyatContinuous(ayat);
                } else {
                    container.innerHTML = renderAyatSeparate(ayat, surah.name);
                }
            });
        });

        // Add to recents
        storage.addRecent('surah', surahId, {
            title: surah.name,
            subtitle: `${surah.verses_count} آية`
        });

    } catch (error) {
        console.error('Surah detail error:', error);
        content.innerHTML = utils.showError('حدث خطأ في تحميل السورة');
    }
}

function renderAyatSeparate(ayat, surahName) {
    return ayat.map((ayah, index) => `
        <div class="ayah-card fade-in" style="animation-delay: ${index * 0.05}s">
            <div class="flex justify-between items-start mb-4">
                <div class="badge badge-primary">${ayah.numberInSurah}</div>
                <button 
                    class="share-btn"
                    onclick="shareAyah(${ayah.number}, ${ayah.numberInSurah}, '${surahName}', \`${ayah.text.replace(/`/g, '')}\`)"
                    title="مشاركة الآية"
                >
                    <i class="fas fa-share-alt"></i>
                </button>
            </div>
            
            <p class="ayah-text">${ayah.text} ﴿${ayah.numberInSurah}﴾</p>
            
            <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400">
                <div class="flex flex-wrap gap-4">
                    <span><i class="fas fa-book ml-1"></i> صفحة ${ayah.page || '-'}</span>
                    <span><i class="fas fa-bookmark ml-1"></i> جزء ${ayah.juz || '-'}</span>
                    <span><i class="fas fa-layer-group ml-1"></i> حزب ${ayah.hizb || '-'}</span>
                </div>
            </div>
        </div>
    `).join('');
}

function renderAyatContinuous(ayat) {
    const text = ayat.map(a => `${a.text} ﴿${a.numberInSurah}﴾`).join(' ');
    
    return `
        <div class="ayah-card">
            <p class="ayah-text leading-loose">${text}</p>
        </div>
    `;
}

async function playSurahAudio(surahId, surahName) {
    try {
        // Default reciter
        const defaultReciter = 'ar.abdulbasitmurattal';
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
        console.error('Play error:', error);
        alert('حدث خطأ في تحميل الصوت');
    }
}

function shareAyah(ayahNumber, ayahInSurah, surahName, ayahText) {
    shareManager.shareAyah({
        number: ayahNumber,
        numberInSurah: ayahInSurah,
        text: ayahText
    }, surahName);
}

// Register route
router.register('surah', renderSurahDetailPage);
