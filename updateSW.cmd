@rem Run this before every commit after updating version number
@echo =================================
@findstr "SW_VERSION" .\sw-input.js | findstr const
npx workbox-cli injectManifest