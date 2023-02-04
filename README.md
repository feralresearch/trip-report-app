# Trip Report App

Electron app version of Trip Report

### OSX M1

Use node 18.13.0>

npm rebuild sharp --platform=darwin --arch=arm64 sharp
npm rebuild sqlite3 --build-from-source --target_arch=arm64 --fallback-to-build

/_
let debounceTimer;
const debounce = (callback, time) => {
global.clearTimeout(debounceTimer);
debounceTimer = global.setTimeout(callback, time);
};
debounce(async () => {
//thing to debounce
}, 500);
_/
