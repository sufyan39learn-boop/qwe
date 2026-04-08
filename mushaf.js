// Mushaf Page - Quran Pages
async function renderMushafPage() {
    const content = document.getElementById('page-content');
    
    content.innerHTML = `
        <div class="max-w-5xl mx-auto">
            <h1 class="text-4xl font-bold mb-8">المصحف الشريف</h1>
            ${utils.createSkeleton('card', 2)}
        </div>
    `;

    try {
        const currentPage = storage.get('current_mushaf_page', 1);
        const mode = storage.get('mushaf_mode', 'image');

        content.innerHTML = `
            <div class="max-w-5xl mx-auto">
                
                <!-- Header -->
                <div class="mb-8 fade-in">
                    <h1 class="text-4xl font-bold mb-4">المصحف الشريف</h1>
                    <p class="text-gray-600 dark:text-gray-400">604 صفحة</p>
                </div>

                <!-- Mode Toggle -->
                <div class="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-6 flex justify-between items-center fade-in" style="animation-delay: 0.1s">
                    <div class="flex gap-2">
                        <button class="mushaf-mode-btn ${mode === 'image' ? 'active' : ''}" data-mode="image">
                            <i class="fas fa-image ml-2"></i>
                            صورة
                        </button>
                        <button class="mushaf-mode-btn ${mode === 'text' ? 'active' : ''}" data-mode="text">
                            <i class="fas fa-align-right ml-2"></i>
                            نص
                        </button>
                    </div>
                    
                    <div class="flex items-center gap-2">
                        <label class="text-sm font-medium">الصفحة:</label>
                        <input type="number" id="page-input" min="1" max="604" value="${currentPage}" class="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-center">
                        <button id="go-page-btn" class="btn-primary py-2 px-4">
                            <i class="fas fa-arrow-left"></i>
                        </button>
                    </div>
                </div>

                <!-- Page Content -->
                <div id="mushaf-content" class="mb-6">
                    <!-- Content will be loaded here -->
                </div>

                <!-- Navigation -->
                <div class="bg-white dark:bg-gray-800 rounded-2xl p-4 flex justify-between items-center">
                    <button id="prev-page-btn" class="btn-secondary" ${currentPage <= 1 ? 'disabled' : ''}>
                        <i class="fas fa-chevron-right ml-2"></i>
                        السابقة
                    </button>
                    <span class="text-lg font-bold">صفحة ${currentPage} من 604</span>
                    <button id="next-page-btn" class="btn-secondary" ${currentPage >= 604 ? 'disabled' : ''}>
                        التالية
                        <i class="fas fa-chevron-left mr-2"></i>
                    </button>
                </div>

            </div>
        `;

        // Load initial page
        await loadMushafPage(currentPage, mode);

        // Event listeners
        document.querySelectorAll('.mushaf-mode-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const newMode = btn.dataset.mode;
                storage.set('mushaf_mode', newMode);
                document.querySelectorAll('.mushaf-mode-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                await loadMushafPage(currentPage, newMode);
            });
        });

        document.getElementById('go-page-btn')?.addEventListener('click', async () => {
            const pageInput = document.getElementById('page-input');
            const page = parseInt(pageInput.value);
            if (page >= 1 && page <= 604) {
                await loadMushafPage(page, mode);
                storage.set('current_mushaf_page', page);
                updateNavButtons(page);
            }
        });

        document.getElementById('prev-page-btn')?.addEventListener('click', async () => {
            if (currentPage > 1) {
                const newPage = currentPage - 1;
                await loadMushafPage(newPage, mode);
                storage.set('current_mushaf_page', newPage);
                document.getElementById('page-input').value = newPage;
                updateNavButtons(newPage);
            }
        });

        document.getElementById('next-page-btn')?.addEventListener('click', async () => {
            if (currentPage < 604) {
                const newPage = currentPage + 1;
                await loadMushafPage(newPage, mode);
                storage.set('current_mushaf_page', newPage);
                document.getElementById('page-input').value = newPage;
                updateNavButtons(newPage);
            }
        });

    } catch (error) {
        console.error('Mushaf page error:', error);
        content.innerHTML = utils.showError('حدث خطأ في تحميل المصحف');
    }
}

async function loadMushafPage(page, mode) {
    const container = document.getElementById('mushaf-content');
    if (!container) return;

    container.innerHTML = '<div class="text-center py-12"><i class="fas fa-spinner fa-spin text-4xl text-primary-950"></i></div>';

    try {
        if (mode === 'image') {
            const data = await api.getQuranPagesImage();
            const pageData = data.data?.find(p => p.page == page);
            
            if (pageData && pageData.image_url) {
                container.innerHTML = `
                    <div class="mushaf-page fade-in">
                        <img src="${pageData.image_url}" alt="صفحة ${page}" class="mx-auto" loading="lazy">
                    </div>
                `;
            } else {
                container.innerHTML = utils.showEmpty('الصفحة غير متوفرة');
            }
        } else {
            const data = await api.getQuranPagesText(page);
            const ayat = data.data?.ayat || [];
            
            if (ayat.length > 0) {
                const ayatHTML = ayat.map(ayah => `
                    <span class="inline ayah-text">${ayah.text} ﴿${ayah.number}﴾ </span>
                `).join('');
                
                container.innerHTML = `
                    <div class="mushaf-page fade-in">
                        <div class="ayah-text leading-loose text-justify">
                            ${ayatHTML}
                        </div>
                    </div>
                `;
            } else {
                container.innerHTML = utils.showEmpty('الصفحة غير متوفرة');
            }
        }
    } catch (error) {
        console.error('Load page error:', error);
        container.innerHTML = utils.showError('حدث خطأ في تحميل الصفحة');
    }
}

function updateNavButtons(page) {
    const prevBtn = document.getElementById('prev-page-btn');
    const nextBtn = document.getElementById('next-page-btn');
    
    if (prevBtn) prevBtn.disabled = page <= 1;
    if (nextBtn) nextBtn.disabled = page >= 604;
}

router.register('mushaf', renderMushafPage);