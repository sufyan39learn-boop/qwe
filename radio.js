// Radio Page - Live Quran Radio
async function renderRadioPage() {
    const content = document.getElementById('page-content');
    
    // Show loading
    content.innerHTML = `
        <div class="max-w-4xl mx-auto">
            ${utils.createSkeleton('card', 1)}
        </div>
    `;

    try {
        const radioData = await api.getRadio();
        
        // Support both single radio and array of radios
        const radios = radioData.radios || [{ 
            name: 'راديو القرآن الكريم', 
            url: radioData.url 
        }];

        content.innerHTML = `
            <div class="max-w-4xl mx-auto">
                
                <!-- Header -->
                <div class="bg-gradient-to-br from-primary-950 to-primary-800 rounded-3xl p-12 text-white text-center mb-8 fade-in">
                    <i class="fas fa-radio text-6xl mb-6 opacity-90"></i>
                    <h1 class="text-5xl font-bold mb-4">راديو القرآن الكريم</h1>
                    <p class="text-2xl opacity-90">بث مباشر على مدار الساعة</p>
                </div>

                <!-- Radio Stations -->
                <div class="space-y-6">
                    ${radios.map((radio, index) => `
                        <div class="bg-white dark:bg-gray-800 rounded-2xl p-8 fade-in card-hover cursor-pointer" 
                             style="animation-delay: ${0.1 * (index + 1)}s"
                             onclick="playRadio('${radio.url}', '${radio.name || 'راديو القرآن'}', ${index})">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center gap-6">
                                    <div class="w-20 h-20 bg-gradient-to-br from-primary-600 to-primary-800 rounded-full flex items-center justify-center text-white">
                                        <i class="fas fa-broadcast-tower text-3xl"></i>
                                    </div>
                                    <div>
                                        <h3 class="text-2xl font-bold mb-2">${radio.name || 'راديو القرآن الكريم'}</h3>
                                        <p class="text-gray-600 dark:text-gray-400">
                                            <i class="fas fa-signal ml-2"></i>
                                            بث مباشر
                                        </p>
                                    </div>
                                </div>
                                <button class="btn-primary">
                                    <i class="fas fa-play"></i>
                                    استمع الآن
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <!-- Features -->
                <div class="grid md:grid-cols-3 gap-6 mt-8">
                    <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 text-center fade-in" style="animation-delay: 0.4s">
                        <i class="fas fa-infinity text-4xl text-primary-950 dark:text-primary-400 mb-4"></i>
                        <h3 class="text-xl font-bold mb-2">بث متواصل</h3>
                        <p class="text-gray-600 dark:text-gray-400">على مدار 24 ساعة</p>
                    </div>
                    <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 text-center fade-in" style="animation-delay: 0.5s">
                        <i class="fas fa-volume-up text-4xl text-primary-950 dark:text-primary-400 mb-4"></i>
                        <h3 class="text-xl font-bold mb-2">جودة عالية</h3>
                        <p class="text-gray-600 dark:text-gray-400">صوت نقي وواضح</p>
                    </div>
                    <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 text-center fade-in" style="animation-delay: 0.6s">
                        <i class="fas fa-users text-4xl text-primary-950 dark:text-primary-400 mb-4"></i>
                        <h3 class="text-xl font-bold mb-2">قراء متنوعون</h3>
                        <p class="text-gray-600 dark:text-gray-400">أفضل الأصوات</p>
                    </div>
                </div>

                <!-- Share Section -->
                <div class="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900 dark:to-primary-800 rounded-2xl p-8 mt-8 text-center fade-in" style="animation-delay: 0.7s">
                    <h3 class="text-2xl font-bold mb-4">شارك راديو القرآن</h3>
                    <p class="text-gray-700 dark:text-gray-300 mb-6">شارك الخير مع الآخرين</p>
                    <button onclick="shareRadio(); return false;" class="btn-primary">
                        <i class="fas fa-share-alt"></i>
                        مشاركة
                    </button>
                </div>

            </div>
        `;

    } catch (error) {
        console.error('Radio page error:', error);
        content.innerHTML = utils.showError('حدث خطأ في تحميل الراديو');
    }
}

// Play radio function
function playRadio(url, name, index = 0) {
    if (!url) {
        console.error('No radio URL provided');
        return;
    }

    audioPlayer.loadTrack({
        title: name || 'راديو القرآن الكريم',
        subtitle: 'بث مباشر',
        url: url,
        type: 'radio',
        id: `radio_${index}`
    });

    // Show success notification
    if (typeof showSuccessNotification === 'function') {
        showSuccessNotification(
            '🎧 بدأ البث',
            'استمع الآن لراديو القرآن الكريم'
        );
    }
}

// Share radio function
function shareRadio() {
    if (shareManager) {
        shareManager.shareGeneric(
            'راديو القرآن الكريم',
            '🎧 استمع لراديو القرآن الكريم - بث مباشر على مدار الساعة',
            `${window.location.origin}${window.location.pathname}#radio`
        );
    }
}

// Register route
router.register('radio', renderRadioPage);
