// Home Page - Main Daily Entry Point
async function renderHomePage() {
    const content = document.getElementById('page-content');
    
    // Show loading
    content.innerHTML = `
        <div class="max-w-6xl mx-auto">
            ${utils.createSkeleton('card', 4)}
        </div>
    `;

    try {
        // Fetch data
        const [prayerTimes, surahs] = await Promise.all([
            api.getPrayerTimes().catch(() => null),
            api.getSurahs().catch(() => null)
        ]);

        // Get streak
        const streak = storage.getDailyStreak();
        const lastPlayed = storage.getLastPlayed();

        // Render page
        content.innerHTML = `
            <div class="max-w-6xl mx-auto space-y-8">
                
                <!-- Header -->
                <div class="text-center mb-12 fade-in">
                    <h1 class="text-5xl font-bold gradient-text mb-4">بسم الله الرحمن الرحيم</h1>
                    <p class="text-xl text-gray-600 dark:text-gray-400">ابدأ يومك بالقرآن والذكر</p>
                </div>

                <!-- Daily Streak -->
                ${streak > 0 ? `
                <div class="glass rounded-2xl p-6 text-center fade-in" style="animation-delay: 0.1s">
                    <div class="flex items-center justify-center gap-4">
                        <i class="fas fa-fire text-4xl text-orange-500"></i>
                        <div>
                            <div class="text-4xl font-bold text-primary-950 dark:text-primary-400">${streak}</div>
                            <div class="text-sm text-gray-600 dark:text-gray-400">يوم متتالي</div>
                        </div>
                    </div>
                </div>
                ` : ''}

                <!-- Main Action: Start Your Day -->
                <div class="bg-gradient-to-br from-primary-950 to-primary-800 rounded-3xl p-12 text-center text-white shadow-2xl fade-in" style="animation-delay: 0.2s">
                    <i class="fas fa-sun text-6xl mb-6 opacity-90"></i>
                    <h2 class="text-4xl font-bold mb-4">ابدأ يومك</h2>
                    <p class="text-xl mb-8 opacity-90">راديو القرآن • أذكار الصباح • أوقات الصلاة</p>
                    <button id="start-day-btn" class="bg-white text-primary-950 px-12 py-5 rounded-2xl text-2xl font-bold hover:bg-stone-100 transition-all transform hover:scale-105 shadow-xl">
                        <i class="fas fa-play ml-3"></i>
                        ابدأ الآن
                    </button>
                </div>

                <!-- Resume Last Session -->
                ${lastPlayed ? `
                <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 fade-in" style="animation-delay: 0.3s">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-4">
                            <div class="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                                <i class="fas fa-history text-2xl text-primary-950 dark:text-primary-400"></i>
                            </div>
                            <div>
                                <h3 class="text-xl font-bold mb-1">كمل من حيث توقفت</h3>
                                <p class="text-gray-600 dark:text-gray-400">${lastPlayed.title}</p>
                                <p class="text-sm text-gray-500 dark:text-gray-500">${lastPlayed.subtitle || ''}</p>
                            </div>
                        </div>
                        <button id="resume-btn" class="btn-primary">
                            <i class="fas fa-play"></i>
                            متابعة
                        </button>
                    </div>
                </div>
                ` : ''}

                <!-- Prayer Times -->
                ${prayerTimes ? renderPrayerTimes(prayerTimes) : ''}

                <!-- Quick Access -->
                <div class="grid md:grid-cols-3 gap-6 fade-in" style="animation-delay: 0.4s">
                    <div class="card-hover bg-white dark:bg-gray-800 rounded-2xl p-8 text-center cursor-pointer" onclick="navigate('surahs')">
                        <i class="fas fa-book-quran text-5xl text-primary-950 dark:text-primary-400 mb-4"></i>
                        <h3 class="text-2xl font-bold mb-2">السور</h3>
                        <p class="text-gray-600 dark:text-gray-400">تصفح جميع سور القرآن</p>
                    </div>
                    <div class="card-hover bg-white dark:bg-gray-800 rounded-2xl p-8 text-center cursor-pointer" onclick="navigate('reciters')">
                        <i class="fas fa-microphone text-5xl text-primary-950 dark:text-primary-400 mb-4"></i>
                        <h3 class="text-2xl font-bold mb-2">القراء</h3>
                        <p class="text-gray-600 dark:text-gray-400">استمع لأفضل القراء</p>
                    </div>
                    <div class="card-hover bg-white dark:bg-gray-800 rounded-2xl p-8 text-center cursor-pointer" onclick="navigate('azkar')">
                        <i class="fas fa-hands-praying text-5xl text-primary-950 dark:text-primary-400 mb-4"></i>
                        <h3 class="text-2xl font-bold mb-2">الأذكار</h3>
                        <p class="text-gray-600 dark:text-gray-400">أذكار الصباح والمساء</p>
                    </div>
                </div>

                <!-- Suggested Short Surahs -->
                ${surahs ? renderSuggestedSurahs(surahs) : ''}

            </div>
        `;

        // Event listeners
        const startDayBtn = document.getElementById('start-day-btn');
        if (startDayBtn) {
            startDayBtn.addEventListener('click', startDailyRoutine);
        }

        const resumeBtn = document.getElementById('resume-btn');
        if (resumeBtn && lastPlayed) {
            resumeBtn.addEventListener('click', () => {
                audioPlayer.play();
            });
        }

    } catch (error) {
        console.error('Home page error:', error);
        content.innerHTML = utils.showError('حدث خطأ في تحميل الصفحة');
    }
}

function renderPrayerTimes(data) {
    if (!data || !data.data) return '';
    
    const times = data.data.timings;
    const prayers = [
        { name: 'الفجر', time: times.Fajr, icon: 'cloud-sun' },
        { name: 'الشروق', time: times.Sunrise, icon: 'sun' },
        { name: 'الظهر', time: times.Dhuhr, icon: 'sun' },
        { name: 'العصر', time: times.Asr, icon: 'cloud-sun' },
        { name: 'المغرب', time: times.Maghrib, icon: 'moon' },
        { name: 'العشاء', time: times.Isha, icon: 'star' }
    ];

    // Find next prayer
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    let nextPrayerIndex = prayers.findIndex(prayer => {
        const [hours, minutes] = prayer.time.split(':').map(Number);
        const prayerTime = hours * 60 + minutes;
        return prayerTime > currentTime;
    });
    
    if (nextPrayerIndex === -1) nextPrayerIndex = 0; // Next day's Fajr

    return `
        <div class="fade-in" style="animation-delay: 0.35s">
            <h2 class="text-3xl font-bold mb-6 text-center">مواقيت الصلاة</h2>
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                ${prayers.map((prayer, index) => `
                    <div class="prayer-card ${index === nextPrayerIndex ? 'next' : ''}">
                        <i class="fas fa-${prayer.icon} text-3xl mb-3"></i>
                        <div class="text-xl font-bold mb-1">${prayer.name}</div>
                        <div class="text-2xl font-bold">${prayer.time}</div>
                        ${index === nextPrayerIndex ? '<div class="text-sm mt-2 opacity-90">الصلاة القادمة</div>' : ''}
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function renderSuggestedSurahs(data) {
    if (!data || !data.data) return '';
    
    // Get short surahs (last 10)
    const shortSurahs = data.data.slice(-10).reverse();
    
    return `
        <div class="fade-in" style="animation-delay: 0.5s">
            <h2 class="text-3xl font-bold mb-6">سور قصيرة مقترحة</h2>
            <div class="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
                ${shortSurahs.slice(0, 5).map(surah => `
                    <div class="surah-card" onclick="navigate('surah/${surah.id}')">
                        <div class="text-4xl font-bold text-primary-950 dark:text-primary-400 mb-2">${surah.id}</div>
                        <h3 class="text-xl font-bold mb-2">${surah.name}</h3>
                        <div class="text-sm text-gray-600 dark:text-gray-400">${surah.verses_count} آية</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

async function startDailyRoutine() {
    console.log('🌅 Starting daily routine');
    
    // Show loading indicator
    const startBtn = document.getElementById('start-day-btn');
    if (startBtn) {
        startBtn.innerHTML = '<i class="fas fa-spinner fa-spin ml-3"></i> جاري التحميل...';
        startBtn.disabled = true;
    }
    
    try {
        // 1. Fetch radio and azkar data in parallel
        const [radioData, azkarData] = await Promise.all([
            api.getRadio().catch(err => {
                console.error('Radio fetch error:', err);
                return null;
            }),
            api.getAzkar().catch(err => {
                console.error('Azkar fetch error:', err);
                return null;
            })
        ]);

        // 2. Start Quran Radio
        if (radioData && (radioData.url || (radioData.radios && radioData.radios[0]))) {
            const radioUrl = radioData.url || radioData.radios[0]?.url;
            if (radioUrl) {
                audioPlayer.loadTrack({
                    title: 'راديو القرآن الكريم',
                    subtitle: 'بث مباشر - ابدأ يومك بالقرآن',
                    url: radioUrl,
                    type: 'radio',
                    id: 'radio_daily'
                });
                
                // Show success message
                showSuccessNotification(
                    '🎧 تم بدء راديو القرآن الكريم',
                    'استمع وأنت تتصفح الأذكار'
                );
            }
        } else {
            console.warn('No radio URL available');
        }

        // 3. Mark daily as completed and update streak
        storage.markDailyCompleted();
        const newStreak = storage.getDailyStreak();
        appState.setState({ 
            dailyCompleted: true, 
            streak: newStreak 
        });

        // 4. Navigate to Azkar page with slight delay for better UX
        setTimeout(() => {
            navigate('azkar');
            
            // Show welcome message on azkar page
            setTimeout(() => {
                showSuccessNotification(
                    '✨ أذكار الصباح',
                    'ابدأ يومك بذكر الله'
                );
            }, 500);
        }, 1000);

    } catch (error) {
        console.error('Daily routine error:', error);
        showErrorNotification(
            'حدث خطأ',
            'يرجى التحقق من الاتصال بالإنترنت والمحاولة مرة أخرى'
        );
        
        // Reset button
        if (startBtn) {
            startBtn.innerHTML = '<i class="fas fa-play ml-3"></i> ابدأ الآن';
            startBtn.disabled = false;
        }
    }
}

// Success notification helper
function showSuccessNotification(title, message) {
    const notification = document.createElement('div');
    notification.className = 'fixed top-20 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-4 rounded-lg shadow-xl z-50 animate-fade-in';
    notification.innerHTML = `
        <div class="flex items-center gap-3">
            <i class="fas fa-check-circle text-2xl"></i>
            <div>
                <div class="font-bold">${title}</div>
                <div class="text-sm opacity-90">${message}</div>
            </div>
        </div>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// Error notification helper
function showErrorNotification(title, message) {
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
    
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// Register route
router.register('home', renderHomePage);
