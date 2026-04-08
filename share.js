// Advanced Share System with Web Share API and Social Media fallbacks
class ShareManager {
    constructor() {
        this.modal = document.getElementById('share-modal');
        this.closeBtn = document.getElementById('close-share');
        this.shareText = document.getElementById('share-text');
        this.whatsappBtn = document.getElementById('share-whatsapp');
        this.facebookBtn = document.getElementById('share-facebook');
        this.twitterBtn = document.getElementById('share-twitter');
        this.copyLinkBtn = document.getElementById('copy-link');
        
        this.currentShareData = null;
        
        this.init();
    }

    init() {
        this.closeBtn?.addEventListener('click', () => this.closeModal());
        this.whatsappBtn?.addEventListener('click', () => this.shareToWhatsApp());
        this.facebookBtn?.addEventListener('click', () => this.shareToFacebook());
        this.twitterBtn?.addEventListener('click', () => this.shareToTwitter());
        this.copyLinkBtn?.addEventListener('click', () => this.copyLink());
        
        // Close on outside click
        this.modal?.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });
    }

    // Main share method
    async share(data) {
        this.currentShareData = data;
        
        // Try Web Share API first (mobile native sharing)
        if (navigator.share && data.useNativeShare !== false) {
            try {
                await navigator.share({
                    title: data.title,
                    text: data.text,
                    url: data.url
                });
                console.log('✅ Shared via Web Share API');
                return;
            } catch (error) {
                // User cancelled or not available, fall back to modal
                console.log('📱 Web Share API not available, showing modal');
            }
        }
        
        // Show custom share modal
        this.showModal();
    }

    showModal() {
        if (!this.currentShareData) return;
        
        const { text, url } = this.currentShareData;
        
        // Display share text
        this.shareText.textContent = text;
        
        // Show modal
        this.modal.classList.remove('hidden');
        this.modal.classList.add('flex');
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        this.modal.classList.add('hidden');
        this.modal.classList.remove('flex');
        document.body.style.overflow = '';
    }

    shareToWhatsApp() {
        if (!this.currentShareData) return;
        
        const { text, url } = this.currentShareData;
        const message = `${text}\n\n${url}`;
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
        
        window.open(whatsappUrl, '_blank');
        this.closeModal();
    }

    shareToFacebook() {
        if (!this.currentShareData) return;
        
        const { url } = this.currentShareData;
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        
        window.open(facebookUrl, '_blank', 'width=600,height=400');
        this.closeModal();
    }

    shareToTwitter() {
        if (!this.currentShareData) return;
        
        const { text, url } = this.currentShareData;
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        
        window.open(twitterUrl, '_blank', 'width=600,height=400');
        this.closeModal();
    }

    async copyLink() {
        if (!this.currentShareData) return;
        
        const { url, text } = this.currentShareData;
        const fullText = `${text}\n\n${url}`;
        
        try {
            await navigator.clipboard.writeText(fullText);
            
            // Show success feedback
            const originalText = this.copyLinkBtn.innerHTML;
            this.copyLinkBtn.innerHTML = '<i class="fas fa-check ml-2"></i>تم النسخ';
            this.copyLinkBtn.classList.add('bg-green-500', 'text-white');
            
            setTimeout(() => {
                this.copyLinkBtn.innerHTML = originalText;
                this.copyLinkBtn.classList.remove('bg-green-500', 'text-white');
            }, 2000);
            
            console.log('✅ Link copied to clipboard');
        } catch (error) {
            console.error('❌ Failed to copy:', error);
            alert('فشل النسخ، يرجى المحاولة مرة أخرى');
        }
    }

    // Helper methods for different content types with deep linking
    shareSurah(surah) {
        const url = `${window.location.origin}${window.location.pathname}#surah/${surah.id}`;
        const text = `📖 سورة ${surah.name}\n${surah.verses_count} آية • ${surah.type === 'Meccan' ? 'مكية' : 'مدنية'}\n\nاقرأ واستمع لسورة ${surah.name} من القرآن الكريم`;
        
        this.share({
            title: `سورة ${surah.name}`,
            text,
            url
        });
    }

    shareAyah(ayah, surahName) {
        const url = `${window.location.origin}${window.location.pathname}#ayah/${ayah.number}`;
        const text = `﴿ ${ayah.text} ﴾\n\n📖 سورة ${surahName} - الآية ${ayah.numberInSurah}\n\nتأمل في آيات القرآن الكريم`;
        
        this.share({
            title: `آية من سورة ${surahName}`,
            text,
            url
        });
    }

    shareReciter(reciter) {
        const url = `${window.location.origin}${window.location.pathname}#reciter/${reciter.id}`;
        const text = `🎧 استمع للقرآن الكريم بصوت القارئ:\n${reciter.name}\n\nتلاوة خاشعة ومؤثرة للقرآن الكريم`;
        
        this.share({
            title: `القارئ ${reciter.name}`,
            text,
            url
        });
    }

    shareZikr(zikr, categoryName) {
        const url = `${window.location.origin}${window.location.pathname}#azkar`;
        const repetition = zikr.count ? `\n🔢 يُكرر ${zikr.count} مرة` : '';
        const text = `🤲 ${categoryName || 'ذكر'}\n\n"${zikr.text}"${repetition}\n\nأذكار من السنة النبوية`;
        
        this.share({
            title: categoryName || 'ذكر',
            text,
            url
        });
    }

    shareDua(dua, categoryName) {
        const url = `${window.location.origin}${window.location.pathname}#duas`;
        const text = `🤲 ${categoryName || 'دعاء'}\n\n"${dua.text}"\n\nأدعية من القرآن والسنة`;
        
        this.share({
            title: categoryName || 'دعاء',
            text,
            url
        });
    }

    shareAudio(title, subtitle, type = 'audio', id = null) {
        let url = window.location.href;
        
        // Create specific deep link if possible
        if (type && id) {
            url = `${window.location.origin}${window.location.pathname}#${type}/${id}`;
        }
        
        const text = `🎧 ${title}\n${subtitle || ''}\n\nاستمع الآن من منصة القرآن الكريم`;
        
        this.share({
            title,
            text,
            url
        });
    }

    sharePage(pageInfo) {
        const url = `${window.location.origin}${window.location.pathname}#page/${pageInfo.page}`;
        const text = `📖 صفحة ${pageInfo.page} من المصحف الشريف\n\nاقرأ المصحف الشريف بجودة عالية`;
        
        this.share({
            title: `صفحة ${pageInfo.page}`,
            text,
            url
        });
    }

    shareGeneric(title, text, customUrl = null) {
        const url = customUrl || window.location.href;
        
        this.share({
            title,
            text,
            url
        });
    }
}

// Create global share manager instance
window.shareManager = null;

// Initialize after DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.shareManager = new ShareManager();
});
