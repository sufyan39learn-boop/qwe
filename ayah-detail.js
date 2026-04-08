// Ayah Detail Page - Single Ayah View (for deep linking)
async function renderAyahDetailPage(params) {
    const ayahNumber = params[0];
    if (!ayahNumber) {
        navigate('home');
        return;
    }

    const content = document.getElementById('page-content');
    
    // Show loading
    content.innerHTML = `
        <div class="max-w-4xl mx-auto">
            ${utils.createSkeleton('card', 1)}
        </div>
    `;

    try {
        // Fetch ayah data
        const ayahData = await api.getAyah(ayahNumber);
        const ayah = ayahData.data;
        
        if (!ayah) {
            content.innerHTML = utils.showError('الآية غير موجودة');
            return;
        }

        content.innerHTML = `
            <div class="max-w-4xl mx-auto">
                
                <!-- Header -->
                <div class="bg-gradient-to-br from-primary-950 to-primary-800 rounded-3xl p-12 text-white text-center mb-8 fade-in">
                    <i class="fas fa-book-quran text-6xl mb-6 opacity-90"></i>
                    <h1 class="text-4xl font-bold mb-4">سورة ${ayah.surah?.name || 'القرآن الكريم'}</h1>
                    <p class="text-2xl opacity-90">الآية ${ayah.numberInSurah}</p>
                </div>

                <!-- Ayah Card -->
                <div class="bg-white dark:bg-gray-800 rounded-3xl p-12 mb-8 fade-in" style="animation-delay: 0.1s">
                    <div class="text-center mb-8">
                        <div class="text-4xl leading-loose mb-6 font-arabic">${ayah.text}</div>
                    </div>
                    
                    ${ayah.translation ? `
                        <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
                            <h3 class="text-xl font-bold mb-4">الترجمة</h3>
                            <p class="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">${ayah.translation}</p>
                        </div>
                    ` : ''}
                    
                    <!-- Actions -->
                    <div class="flex flex-wrap gap-4 justify-center mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <button onclick="shareManager.shareAyah({ number: ${ayah.number}, text: '${ayah.text.replace(/'/g, "\\'")}', numberInSurah: ${ayah.numberInSurah} }, '${(ayah.surah?.name || '').replace(/'/g, "\\'")}'); return false;" class="btn-secondary">
                            <i class="fas fa-share-alt"></i>
                            مشاركة
                        </button>
                        <button onclick="navigate('surah/${ayah.surah?.id || 1}'); return false;" class="btn-primary">
                            <i class="fas fa-book"></i>
                            عرض السورة كاملة
                        </button>
                    </div>
                </div>

                <!-- Surah Info -->
                ${ayah.surah ? `
                    <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 fade-in" style="animation-delay: 0.2s">
                        <h2 class="text-2xl font-bold mb-4">معلومات السورة</h2>
                        <div class="grid md:grid-cols-3 gap-4">
                            <div class="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                                <div class="text-sm text-gray-600 dark:text-gray-400 mb-1">عدد الآيات</div>
                                <div class="text-2xl font-bold text-primary-950 dark:text-primary-400">${ayah.surah.verses_count}</div>
                            </div>
                            <div class="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                                <div class="text-sm text-gray-600 dark:text-gray-400 mb-1">النوع</div>
                                <div class="text-2xl font-bold text-primary-950 dark:text-primary-400">${ayah.surah.type === 'Meccan' ? 'مكية' : 'مدنية'}</div>
                            </div>
                            <div class="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                                <div class="text-sm text-gray-600 dark:text-gray-400 mb-1">رقم السورة</div>
                                <div class="text-2xl font-bold text-primary-950 dark:text-primary-400">${ayah.surah.id}</div>
                            </div>
                        </div>
                    </div>
                ` : ''}

            </div>
        `;

    } catch (error) {
        console.error('Ayah detail error:', error);
        content.innerHTML = utils.showError('حدث خطأ في تحميل الآية');
    }
}

// Register route
router.register('ayah', renderAyahDetailPage);
