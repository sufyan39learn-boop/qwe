// Duas Page
async function renderDuasPage() {
    const content = document.getElementById('page-content');
    
    content.innerHTML = `
        <div class="max-w-4xl mx-auto">
            <h1 class="text-4xl font-bold mb-8">الأدعية</h1>
            ${utils.createSkeleton('card', 3)}
        </div>
    `;

    try {
        const data = await api.getDuas();
        const duasCategories = data.data || [];

        content.innerHTML = `
            <div class="max-w-4xl mx-auto">
                
                <!-- Header -->
                <div class="mb-8 fade-in">
                    <h1 class="text-4xl font-bold mb-4">الأدعية المأثورة</h1>
                    <p class="text-gray-600 dark:text-gray-400">أدعية من القرآن والسنة</p>
                </div>

                <!-- Search -->
                <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 mb-8 fade-in" style="animation-delay: 0.1s">
                    <input 
                        type="text" 
                        id="search-duas" 
                        class="search-input" 
                        placeholder="ابحث في الأدعية..."
                    >
                </div>

                <!-- Duas List -->
                <div id="duas-list" class="space-y-6">
                    ${renderDuasList(duasCategories)}
                </div>

            </div>
        `;

        setupDuasSearch(duasCategories);

    } catch (error) {
        console.error('Duas page error:', error);
        content.innerHTML = utils.showError('حدث خطأ في تحميل الأدعية');
    }
}

function renderDuasList(categories, searchTerm = '') {
    let filtered = categories;

    if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filtered = categories.map(cat => ({
            ...cat,
            array: (cat.array || []).filter(dua => 
                dua.text.toLowerCase().includes(term) ||
                (dua.description && dua.description.toLowerCase().includes(term))
            )
        })).filter(cat => cat.array.length > 0);
    }

    if (filtered.length === 0) {
        return utils.showEmpty('لم يتم العثور على أدعية');
    }

    return filtered.map((category, catIndex) => `
        <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 fade-in" style="animation-delay: ${catIndex * 0.05}s">
            <h2 class="text-2xl font-bold mb-6 text-primary-950 dark:text-primary-400 flex items-center gap-3">
                <i class="fas fa-hand-holding-heart"></i>
                ${category.category}
            </h2>
            <div class="space-y-4">
                ${(category.array || []).map((dua, index) => `
                    <div class="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                        <p class="text-xl leading-relaxed mb-4 text-gray-900 dark:text-gray-100">${dua.text}</p>
                        
                        ${dua.description ? `
                            <p class="text-sm text-gray-600 dark:text-gray-400 mb-4 bg-white dark:bg-gray-600 p-3 rounded-lg">
                                <i class="fas fa-info-circle ml-2"></i>
                                ${dua.description}
                            </p>
                        ` : ''}
                        
                        <div class="flex gap-2">
                            <button 
                                class="btn-secondary py-2 px-4"
                                onclick="copyDua('${dua.text.replace(/'/g, "\\'")}')"
                            >
                                <i class="fas fa-copy ml-2"></i>
                                نسخ
                            </button>
                            <button 
                                class="share-btn p-3"
                                onclick="shareDua('${dua.text.replace(/'/g, "\\'")}', '${category.category}')"
                            >
                                <i class="fas fa-share-alt"></i>
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
}

function setupDuasSearch(categories) {
    const searchInput = document.getElementById('search-duas');
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        const term = e.target.value;
        const list = document.getElementById('duas-list');
        list.innerHTML = renderDuasList(categories, term);
    });
}

async function copyDua(text) {
    try {
        await navigator.clipboard.writeText(text);
        alert('تم النسخ ✓');
    } catch (error) {
        console.error('Copy error:', error);
    }
}

function shareDua(text, category) {
    shareManager.shareDua({ text, category });
}

router.register('duas', renderDuasPage);
