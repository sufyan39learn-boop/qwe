// Azkar Page with Counter
async function renderAzkarPage() {
    const content = document.getElementById('page-content');
    
    content.innerHTML = `
        <div class="max-w-4xl mx-auto">
            <h1 class="text-4xl font-bold mb-8">الأذكار</h1>
            ${utils.createSkeleton('card', 3)}
        </div>
    `;

    try {
        const data = await api.getAzkar();
        const azkarCategories = data.data || [];

        content.innerHTML = `
            <div class="max-w-4xl mx-auto">
                
                <!-- Header -->
                <div class="mb-8 fade-in">
                    <h1 class="text-4xl font-bold mb-4">الأذكار</h1>
                    <p class="text-gray-600 dark:text-gray-400">أذكار الصباح والمساء والنوم</p>
                </div>

                <!-- Categories -->
                <div class="space-y-6">
                    ${renderAzkarCategories(azkarCategories)}
                </div>

            </div>
        `;

    } catch (error) {
        console.error('Azkar page error:', error);
        content.innerHTML = utils.showError('حدث خطأ في تحميل الأذكار');
    }
}

function renderAzkarCategories(categories) {
    return categories.map((category, catIndex) => `
        <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 fade-in" style="animation-delay: ${catIndex * 0.1}s">
            <h2 class="text-3xl font-bold mb-6 text-primary-950 dark:text-primary-400">${category.category}</h2>
            <div class="space-y-4">
                ${(category.array || []).map((zikr, index) => renderZikrCard(zikr, index, catIndex)).join('')}
            </div>
        </div>
    `).join('');
}

function renderZikrCard(zikr, index, catIndex) {
    const zikrId = `zikr_${catIndex}_${index}`;
    const currentCount = storage.getZikrCount(zikrId);
    const targetCount = zikr.count || 1;
    const isCompleted = currentCount >= targetCount;

    return `
        <div class="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 ${isCompleted ? 'opacity-60' : ''}">
            <p class="text-xl leading-relaxed mb-4 text-gray-900 dark:text-gray-100">${zikr.text}</p>
            
            ${zikr.description ? `<p class="text-sm text-gray-600 dark:text-gray-400 mb-4">${zikr.description}</p>` : ''}
            
            <div class="flex items-center justify-between gap-4 flex-wrap">
                <div class="flex items-center gap-4">
                    <button 
                        class="zikr-counter ${isCompleted ? 'opacity-50' : ''}"
                        onclick="incrementZikr('${zikrId}', ${targetCount})"
                        ${isCompleted ? 'disabled' : ''}
                    >
                        <span id="count-${zikrId}">${currentCount}</span>
                    </button>
                    <div>
                        <div class="text-2xl font-bold text-primary-950 dark:text-primary-400">
                            ${currentCount} / ${targetCount}
                        </div>
                        <div class="text-sm text-gray-600 dark:text-gray-400">
                            ${isCompleted ? 'مكتمل ✓' : 'اضغط للعد'}
                        </div>
                    </div>
                </div>
                
                <div class="flex gap-2">
                    <button 
                        class="btn-secondary py-2 px-4"
                        onclick="resetZikr('${zikrId}')"
                    >
                        <i class="fas fa-redo"></i>
                        إعادة
                    </button>
                    <button 
                        class="share-btn p-3"
                        onclick="shareZikr('${zikr.text}', '${zikr.category}')"
                    >
                        <i class="fas fa-share-alt"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}

function incrementZikr(zikrId, targetCount) {
    const currentCount = storage.getZikrCount(zikrId);
    if (currentCount >= targetCount) return;
    
    const newCount = currentCount + 1;
    storage.saveZikrCount(zikrId, newCount);
    
    // Update UI
    const countEl = document.getElementById(`count-${zikrId}`);
    if (countEl) {
        countEl.textContent = newCount;
        
        // Animate
        countEl.parentElement.style.transform = 'scale(1.2)';
        setTimeout(() => {
            countEl.parentElement.style.transform = 'scale(1)';
        }, 200);
    }
    
    // Re-render if completed
    if (newCount >= targetCount) {
        setTimeout(() => {
            router.handleRoute();
        }, 500);
    }
}

function resetZikr(zikrId) {
    storage.resetZikrCount(zikrId);
    router.handleRoute();
}

function shareZikr(text, category) {
    shareManager.shareZikr({ text, category });
}

router.register('azkar', renderAzkarPage);
