/**
 * SmartVideo - @art_is_code
 * GDPR-compliant & High-performance video lazy-loader.
 */
export class SmartVideo {
    constructor(options = {}) {
        const defaults = {
            selector: '[data-aic-video]',
            lang: 'en',
            consent: {
                youtube: false,
                vimeo: false,
                tiktok: false,
                instagram: false,
                dailymotion: false,
                local: true
            },
            translations: {
                en: { msg: "Accept {vendor} cookies to watch the video", btn: "Accept" },
                it: { msg: "Accetta i cookie di {vendor} per guardare il video", btn: "Accetta" }
            },
            providers: {
                youtube: {
                    pattern: /youtube\.com|youtu\.be/,
                    getEmbed: (url, auto) => {
                        const isAuto = auto == 1 ? 1 : 0;
                        const mute = isAuto ? '&mute=1' : '';
                        const urlObj = new URL(url);
                        const listId = urlObj.searchParams.get('list');
                        if (listId) return `https://www.youtube-nocookie.com/embed/videoseries?list=${listId}&autoplay=${isAuto}${mute}`;
                        const videoId = url.includes('youtu.be/') ? urlObj.pathname.substring(1) : urlObj.searchParams.get('v');
                        return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=${isAuto}${mute}&rel=0&enablejsapi=1`;
                    }
                },
                vimeo: {
                    pattern: /vimeo\.com/,
                    getEmbed: (url, auto) => {
                        const id = url.split('?')[0].split('/').filter(s => s.length > 0).pop();
                        return `https://player.vimeo.com/video/${id}?dnt=1&autoplay=${auto == 1 ? 1 : 0}`;
                    }
                },
                instagram: {
                    pattern: /instagram\.com/,
                    getEmbed: (url) => {
                        const id = url.split('?')[0].split('/').filter(s => s.length > 0).pop();
                        return `https://www.instagram.com/p/${id}/embed/`;
                    }
                },
                tiktok: {
                    pattern: /tiktok\.com/,
                    getEmbed: (url) => {
                        const cleanUrl = url.split('?')[0].split('#')[0];
                        const match = cleanUrl.match(/\/video\/(\d+)/);
                        const id = match ? match[1] : cleanUrl.split('/').filter(s => s.length > 0).pop();
                        return `https://www.tiktok.com/embed/${id}`;
                    }
                },
                dailymotion: {
                    pattern: /dailymotion\.com|dai\.ly/,
                    getEmbed: (url, auto) => {
                        const isAuto = auto == 1 ? 1 : 0;
                        if (url.includes('/playlist/')) {
                            const listId = url.split('/playlist/')[1].split('?')[0];
                            return `https://www.dailymotion.com/embed/playlist/${listId}?autoplay=${isAuto}`;
                        }
                        const videoId = url.split('/').filter(s => s.length > 0).pop().split('_')[0];
                        return `https://www.dailymotion.com/embed/video/${videoId}?autoplay=${isAuto}`;
                    }
                }
            }
        };

        this.settings = { ...defaults, ...options };
        this.init();
    }

    /**
     * Initialize listeners and observer
     */
    init() {
        this.scan();
        this.setupObserver();
        window.addEventListener('aicVideoUpdate', (e) => {
            if (e.detail) this.settings.consent = { ...this.settings.consent, ...e.detail };
            this.scan();
        });
    }

    /**
     * Watch for DOM changes to handle Ajax-loaded content
     */
    setupObserver() {
        const observer = new MutationObserver(() => this.scan());
        observer.observe(document.body, { childList: true, subtree: true });
    }

    /**
     * Find all video containers in the page
     */
    scan() {
        document.querySelectorAll(this.settings.selector).forEach(el => this.process(el));
    }

    /**
     * Decide whether to render the media or the placeholder
     */
    process(el) {
        const url = el.getAttribute('data-aic-video');
        if (!url) return;

        const info = this.detect(url);
        const isAllowed = info.platform === 'local' || this.settings.consent[info.platform];

        if (isAllowed) {
            this.renderMedia(el, info);
        } else {
            this.renderPlaceholder(el, info.platform);
        }
    }

    /**
     * Detect provider based on URL pattern
     */
    detect(url) {
        if (!url.startsWith('http')) return { platform: 'local', url };
        for (let [key, p] of Object.entries(this.settings.providers)) {
            if (p.pattern.test(url)) return { platform: key, url };
        }
        return { platform: 'local', url };
    }

    /**
     * Inject the iframe or video tag
     */
    renderMedia(el, info) {
        if (el.getAttribute('data-aic-loaded') === 'true') return;
        const autoplay = el.getAttribute('data-autoplay') || 0;
        let html = '';

        if (info.platform === 'local') {
            html = `<video controls ${autoplay == 1 ? 'autoplay muted' : ''} style="width:100%;height:100%;object-fit:cover;"><source src="${info.url}" type="video/mp4"></video>`;
        } else {
            const src = this.settings.providers[info.platform].getEmbed(info.url, autoplay);
            html = `<iframe src="${src}" width="100%" height="100%" frameborder="0" allowfullscreen allow="autoplay; encrypted-media"></iframe>`;
        }

        el.innerHTML = html;
        el.setAttribute('data-aic-loaded', 'true');
    }

    /**
     * Inject the privacy consent placeholder
     */
    renderPlaceholder(el, vendor) {
        if (el.querySelector('.aic-placeholder')) return;
        el.setAttribute('data-aic-loaded', 'false');
        
        const t = this.settings.translations[this.settings.lang] || this.settings.translations['en'];
        
        el.innerHTML = `
            <div class="aic-placeholder" style="width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#1a1a1a;color:#fff;text-align:center;">
                <p style="margin:0 0 15px;font-size:0.9rem;">${t.msg.replace('{vendor}', vendor.toUpperCase())}</p>
                <button class="aic-btn" style="padding:10px 20px;background:#e62117;color:#fff;border:none;cursor:pointer;font-weight:bold;">${t.btn}</button>
            </div>`;

        // Gestione Click
        el.querySelector('button').onclick = (e) => {
            e.preventDefault(); 
            
            // Notifichiamo all'esterno che serve il consenso
            window.dispatchEvent(new CustomEvent('aicRequestConsent', { 
                detail: { 
                    vendor: vendor,
                    element: el 
                },
                bubbles: true 
            }));
        };
    }
}