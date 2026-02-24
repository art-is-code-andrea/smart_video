# @art_is_code/smart_video

Smart, GDPR-compliant video embedder. It blocks 3rd-party iframes (YouTube, TikTok, Instagram, etc.) until consent is given and provides lazy loading.


## 🚀 Key Features

- **Privacy-First**: Uses `youtube-nocookie.com` and Vimeo `dnt=1` by default.
- **Lazy Loading**: High performance. Scripts load only when needed.
- **Universal Logic**: Works via raw URLs. No messy iframe code required.
- **Future-Proof**: Easily update regex patterns if platforms change their URL structure.

---

## 🎨 CSS & Layout (Container-First)

> **"SmartVideo uses a Container-First approach. The module will fill 100% of its parent. We recommend using `aspect-ratio` to prevent Layout Shifts (CLS) during activation."**

```css
[data-aic-video] {
    position: relative;
    width: 100%;
    aspect-ratio: 16 / 9; /* Default for YouTube/Vimeo */
    background: #000;
}

[data-aic-video].vertical {
    aspect-ratio: 9 / 16; /* For TikTok/Reels */
    max-width: 350px;
}
```
## ⚙️ Configuration Options
| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| selector | string | '[data-aic-video]' | CSS selector used to identify video containers. |
| lang | string | 'en' | Active language code for placeholder messages. |
| consent | object | {youtube:false, ...} | Initial consent state for each supported provider. |
| translations | object | {en:{...}} | Dictionary containing translation strings for each language. |
| providers | object | {youtube:{...}, ...} | Definitions of regex patterns and embed logic for vendors. |

## 🛠 Usage
#### With [@art_is_code/privacy_js](https://github.com/art-is-code-andrea/privacy_js) (GDPR Mode)
Ideal for full compliance. It synchronizes with the global privacy banner.
``` javascript
const myVideo = new SmartVideo({
    consent: { youtube: myPrivacy.hasConsent('youtube') }
});

// Re-sync when privacy settings change
window.addEventListener('artIsPrivacyUpdated', () => {
    window.dispatchEvent(new CustomEvent('aicVideoUpdate', { 
        detail: { youtube: myPrivacy.hasConsent('youtube') }
    }));
});
```
#### Standalone
``` javascript
window.addEventListener('aicRequestConsent', (e) => {
    const consentUpdate = {};
    consentUpdate[e.detail] = true;
    window.dispatchEvent(new CustomEvent('aicVideoUpdate', { detail: consentUpdate }));
});
```
## 🔌 Custom Providers
The library is agnostic. If a new platform emerges, just add a regex and an extraction rule:
``` javascript
const myVideo = new SmartVideo({
    providers: {
        newplatform: {
            pattern: /new-service\.com/,
            getEmbed: (url) => {
                const id = url.split('/').pop(); // Extract ID
                return `https://www.new-service.com/embed/${id}`;
            }
        }
    }
});
```
##  👁️ Live Demo
* **[GDPR Mode](https://art-is-code-andrea.github.io/smart_video/demo_with_privacy_js.html)**
* **[Standalone](https://art-is-code-andrea.github.io/smart_video/demo_no_privacy_js.html)**

## 📜 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
MIT © Andrea D'Agostino (art is code)