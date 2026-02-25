# @art_is_code/smart_video
[![npm version](https://img.shields.io/npm/v/@art_is_code/smart_video.svg)](https://www.npmjs.com/package/@art_is_code/smart_video)

Smart, GDPR-compliant video embedder. It blocks 3rd-party iframes (YouTube, TikTok, Instagram, etc.) until consent is given and provides lazy loading.


## 🚀 Key Features

- **Privacy-First**: Uses `youtube-nocookie.com` and Vimeo `dnt=1` by default.
- **Lazy Loading**: High performance. Scripts load only when needed.
- **Universal Logic**: Works via raw URLs. No messy iframe code required.
- **Future-Proof**: Easily update regex patterns if platforms change their URL structure.

---
## 📦 Installation
Via npm
```bash
npm install @art_is_code/smart_video
```
Then import it in your JavaScript module:
```javascript
import { SmartVideo } from '@art_is_code/smart_video';
```
Via CDN (Direct Browser Usage)
```html
<script type="module">
    import { SmartVideo } from 'https://unpkg.com/@art_is_code/smart_video/dist/smart_video.min.js';
    
    const myVideo = new SmartVideo();
</script>
```
## 🧱 HTML Structure
Simply place a div with the data-aic-video attribute. The library will handle the rest based on the URL provided.
```html
<div data-aic-video="[https://www.youtube.com/watch?v=dQw4w9WgXcQ](https://www.youtube.com/watch?v=dQw4w9WgXcQ)"></div>
```

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
// Use this if you don't have a global privacy manager. 
// It captures the click on the "Accept" button and unlocks the video instantly.
window.addEventListener('aicRequestConsent', (e) => {
    const { vendor } = e.detail;
    const consentUpdate = {};
    consentUpdate[vendor] = true;

    window.dispatchEvent(new CustomEvent('aicVideoUpdate', { 
        detail: consentUpdate 
    }));
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
## 📡 Events
SmartVideo communicates via standard DOM Events. You can trigger or listen to them from anywhere in your app.

| Event | Direction | Description |
| :--- | :--- | :--- |
| `aicRequestConsent` | **OUT** | Fired when a user clicks the "Accept" button. Payload: `{ detail: { vendor, element } }`. |
| `aicVideoUpdate` | **IN** | Send this to update consent states and refresh videos. Payload: `{ detail: { youtube: true, ... } }`. |
##  👁️ Live Demo
* **[GDPR Mode](https://art-is-code-andrea.github.io/smart_video/demo_with_privacy_js.html)**
* **[Standalone](https://art-is-code-andrea.github.io/smart_video/demo_no_privacy_js.html)**

## 📜 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
MIT © Andrea D'Agostino (art is code)