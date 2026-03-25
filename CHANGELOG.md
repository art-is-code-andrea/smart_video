# Changelog
## [1.2.0] - 2026-03-24
### Added
- **Attribute Reactivity**: The library now monitors changes to the `data-aic-video` attribute via `MutationObserver`. This allows seamless integration with reactive frameworks like Alpine.js.
- **State Tracking**: Added `data-last-url` internal attribute to optimize performance and prevent redundant re-renders during scans.

### Changed
- **Improved Cleanup**: When the `data-aic-video` attribute is cleared or empty, the player now correctly empties the container and resets the loading state.
- **Refactored `process()` logic**: Enhanced state management to force a re-render only when the URL actually changes.

## [1.1.0] - 2026-02-25
### Changed
- Refactored `aicRequestConsent` event. It now returns an object `{ vendor, element }` instead of a string.
- This is a **breaking change** for standalone users. Please check the README for the new syntax.

### Added
- New "Standalone" section in documentation.
- New "Events" table for better integration.