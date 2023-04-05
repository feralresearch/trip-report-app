# Trip Report App

Electron app version of Trip Report based on https://github.com/cawa-93/vite-electron-builder

### OSX M1

Use node 18.13.0>

npm rebuild sharp --platform=darwin --arch=arm64 sharp
npm rebuild sqlite3 --build-from-source --target_arch=arm64 --fallback-to-build

## Bulk

node ./packages/main/src/modules/bulkImport.js "/Users/andrew/Library/Application Support/TripReport/config.json" "/Volumes/Tentacle/Andrew/Screenshots/VRCLogs" "/Volumes/Tentacle/Andrew/Screenshots"

C:\Users\An\AppData\LocalLow\VRChat\VRChat
C:\Users\An\Pictures\VRChat

\\vampyroteuthis.local\Tentacle\Andrew\Screenshots\VRCLogs
\\vampyroteuthis.local\Tentacle\Andrew\Screenshots\UNSORTED

## Known Issues

Need to keep node version to 16.15 because of a problem with ffmapi and the watcher code
https://github.com/node-ffi-napi/node-ffi-napi

## Troubleshooting Actions

act -W ./.github/workflows/release.yml
DEBUG=electron-builder npx --no-install electron-builder --config .electron-builder.config.cjs

npm exec --package=electron-builder -- electron-builder --config .electron-builder.config.cjs

V2

http://book.mixu.net/node/
