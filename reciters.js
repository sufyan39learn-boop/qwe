// Reciters Page
async function renderRecitersPage() {
    const content = document.getElementById('page-content');
    
    content.innerHTML = `
        <div class="max-w-6xl mx-auto">
            <h1 class="text-4xl font-bold mb-8">القراء</h1>
            ${utils.createSkeleton('card', 6)}
        </div>
    `;

    try {
        const data = await api.getReciters();
        const reciters = data.data || [];

        content.innerHTML = `
            <div class="max-w-6xl mx-auto">
                <div class="mb-8 fade-in">
                    <h1 class="text-4xl font-bold mb-4">قراء القرآن الكريم</h1>
                    <p class="text-gray-600 dark:text-gray-400">استمع للقرآن بأصوات أفضل القراء</p>
                </div>

                <!-- Search -->
                <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 mb-8 fade-in" style="animation-delay: 0.1s">
                    <input 
                        type="text" 
                        id="search-reciters" 
                        class="search-input" 
                        placeholder="ابحث عن قارئ..."
                    >
                </div>

                <!-- Reciters Grid -->
                <div id="reciters-grid" class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    ${renderRecitersGrid(reciters)}
                </div>
            </div>
        `;

        setupRecitersSearch(reciters);

    } catch (error) {
        console.error('Reciters page error:', error);
        content.innerHTML = `<div class="max-w-6xl mx-auto">${utils.showError('حدث خطأ في تحميل القراء')}</div>`;
    }
}

function renderRecitersGrid(reciters, searchTerm = '') {
    let filtered = reciters;

    if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(r => r.name.toLowerCase().includes(term));
    }

    if (filtered.length === 0) {
        return utils.showEmpty('لم يتم العثور على قراء');
    }

    return filtered.map((reciter, index) => `
        <div class="reciter-card fade-in" style="animation-delay: ${index * 0.05}s" onclick="navigate('reciter/${reciter.id}')">
            <div class="w-24 h-24 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <i class="fas fa-user text-5xl text-primary-950 dark:text-primary-400"></i>
            </div>
            <h3 class="text-2xl font-bold mb-2">${reciter.name}</h3>
            <p class="text-gray-600 dark:text-gray-400">${reciter.style || 'القرآن الكريم'}</p>
            <button class="mt-4 btn-secondary w-full">
                <i class="fas fa-play ml-2"></i>
                استمع
            </button>
        </div>
    `).join('');
}

function setupRecitersSearch(reciters) {
    const searchInput = document.getElementById('search-reciters');
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        const term = e.target.value;
        const grid = document.getElementById('reciters-grid');
        grid.innerHTML = renderRecitersGrid(reciters, term);
    });
}

router.register('reciters', renderRecitersPage);
