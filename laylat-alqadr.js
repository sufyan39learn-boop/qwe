// Laylat Al-Qadr Page
async function renderLaylatAlQadrPage() {
    const content = document.getElementById('page-content');
    
    content.innerHTML = `
        <div class="max-w-4xl mx-auto">
            <h1 class="text-4xl font-bold mb-8">ليلة القدر</h1>
            ${utils.createSkeleton('card', 2)}
        </div>
    `;

    try {
        const data = await api.getLaylatAlQadr();
        const article = data.data || {};

        content.innerHTML = `
            <div class="max-w-4xl mx-auto">
                
                <!-- Header -->
                <div class="bg-gradient-to-br from-primary-950 to-primary-800 rounded-3xl p-12 text-white text-center mb-8 fade-in">
                    <i class="fas fa-star-and-crescent text-6xl mb-6 opacity-90"></i>
                    <h1 class="text-5xl font-bold mb-4">ليلة القدر</h1>
                    <p class="text-2xl opacity-90">﴿ لَيْلَةُ الْقَدْرِ خَيْرٌ مِّنْ أَلْفِ شَهْرٍ ﴾</p>
                </div>

                <!-- Content -->
                <div class="space-y-8">
                    
                    <!-- Introduction -->
                    ${article.introduction ? `
                    <div class="bg-white dark:bg-gray-800 rounded-2xl p-8 fade-in" style="animation-delay: 0.1s">
                        <h2 class="text-3xl font-bold mb-4 text-primary-950 dark:text-primary-400">
                            <i class="fas fa-book-open ml-3"></i>
                            مقدمة
                        </h2>
                        <p class="text-xl leading-relaxed text-gray-800 dark:text-gray-200">${article.introduction}</p>
                    </div>
                    ` : ''}

                    <!-- Virtues -->
                    ${article.virtues ? `
                    <div class="bg-white dark:bg-gray-800 rounded-2xl p-8 fade-in" style="animation-delay: 0.2s">
                        <h2 class="text-3xl font-bold mb-6 text-primary-950 dark:text-primary-400">
                            <i class="fas fa-star ml-3"></i>
                            فضائل ليلة القدر
                        </h2>
                        <div class="space-y-4">
                            ${Array.isArray(article.virtues) ? 
                                article.virtues.map((virtue, i) => `
                                    <div class="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                                        <div class="flex gap-4">
                                            <div class="w-10 h-10 bg-primary-950 dark:bg-primary-800 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                                                ${i + 1}
                                            </div>
                                            <p class="text-lg leading-relaxed text-gray-800 dark:text-gray-200 flex-1">${virtue}</p>
                                        </div>
                                    </div>
                                `).join('') 
                                : `<p class="text-xl leading-relaxed">${article.virtues}</p>`
                            }
                        </div>
                    </div>
                    ` : ''}

                    <!-- Signs -->
                    ${article.signs ? `
                    <div class="bg-white dark:bg-gray-800 rounded-2xl p-8 fade-in" style="animation-delay: 0.3s">
                        <h2 class="text-3xl font-bold mb-6 text-primary-950 dark:text-primary-400">
                            <i class="fas fa-list-check ml-3"></i>
                            علامات ليلة القدر
                        </h2>
                        <div class="space-y-3">
                            ${Array.isArray(article.signs) ? 
                                article.signs.map(sign => `
                                    <div class="flex gap-3 items-start">
                                        <i class="fas fa-check-circle text-2xl text-primary-950 dark:text-primary-400 mt-1"></i>
                                        <p class="text-lg leading-relaxed text-gray-800 dark:text-gray-200 flex-1">${sign}</p>
                                    </div>
                                `).join('') 
                                : `<p class="text-xl leading-relaxed">${article.signs}</p>`
                            }
                        </div>
                    </div>
                    ` : ''}

                    <!-- Best Practices -->
                    ${article.practices ? `
                    <div class="bg-white dark:bg-gray-800 rounded-2xl p-8 fade-in" style="animation-delay: 0.4s">
                        <h2 class="text-3xl font-bold mb-6 text-primary-950 dark:text-primary-400">
                            <i class="fas fa-heart ml-3"></i>
                            أعمال ليلة القدر
                        </h2>
                        <div class="grid md:grid-cols-2 gap-4">
                            ${Array.isArray(article.practices) ? 
                                article.practices.map(practice => `
                                    <div class="bg-primary-50 dark:bg-primary-900 rounded-xl p-6">
                                        <p class="text-lg font-medium text-gray-800 dark:text-gray-200">${practice}</p>
                                    </div>
                                `).join('') 
                                : `<p class="text-xl leading-relaxed col-span-2">${article.practices}</p>`
                            }
                        </div>
                    </div>
                    ` : ''}

                    <!-- Special Dua -->
                    ${article.dua ? `
                    <div class="bg-gradient-to-br from-primary-950 to-primary-800 rounded-2xl p-8 text-white text-center fade-in" style="animation-delay: 0.5s">
                        <h2 class="text-2xl font-bold mb-6">
                            <i class="fas fa-hands-praying ml-3"></i>
                            دعاء ليلة القدر
                        </h2>
                        <p class="text-3xl leading-relaxed font-bold mb-4">${article.dua}</p>
                        <button 
                            class="btn-primary bg-white text-primary-950 mt-4"
                            onclick="copyDuaLayla('${article.dua.replace(/'/g, "\\'")}')"
                        >
                            <i class="fas fa-copy ml-2"></i>
                            نسخ الدعاء
                        </button>
                    </div>
                    ` : ''}

                    <!-- Conclusion -->
                    ${article.conclusion ? `
                    <div class="bg-white dark:bg-gray-800 rounded-2xl p-8 fade-in" style="animation-delay: 0.6s">
                        <p class="text-xl leading-relaxed text-center text-gray-800 dark:text-gray-200">${article.conclusion}</p>
                    </div>
                    ` : ''}

                </div>

            </div>
        `;

    } catch (error) {
        console.error('Laylat Al-Qadr page error:', error);
        content.innerHTML = utils.showError('حدث خطأ في تحميل المحتوى');
    }
}

async function copyDuaLayla(text) {
    try {
        await navigator.clipboard.writeText(text);
        alert('تم نسخ الدعاء ✓');
    } catch (error) {
        console.error('Copy error:', error);
    }
}

router.register('laylat-alqadr', renderLaylatAlQadrPage);
