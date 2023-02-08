# Trip Report App

Electron app version of Trip Report

### OSX M1

Use node 18.13.0>

npm rebuild sharp --platform=darwin --arch=arm64 sharp
npm rebuild sqlite3 --build-from-source --target_arch=arm64 --fallback-to-build

## Bulk

node ./packages/main/src/modules/bulkImport.js "/Users/andrew/Library/Application Support/TripReport/config.json" "/Volumes/Tentacle/Andrew/Screenshots/VRCLogs" "/Volumes/Tentacle/Andrew/Screenshots"
