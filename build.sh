#!/bin/bash

# # TypeScript Files
# Compile Source
cd src
tsc --target ES2020 background.ts injected.ts

# Replace VERSION_INSERTED_HERE_BY_BUILD_SH
version="$(jq '.version' --monochrome-output < ../manifest.json)"
sed "s/'VERSION_INSERTED_HERE_BY_BUILD_SH'/$version/g" < background.js > background.js.tmp
sed "s/'VERSION_INSERTED_HERE_BY_BUILD_SH'/$version/g" < injected.js > injected.js.tmp
cat background.js.tmp > background.js
cat injected.js.tmp > injected.js
rm background.js.tmp injected.js.tmp

# Move to dist
mv injected.js ../dist
mv background.js ../dist

# # Pomodoro
cp -R pomodoro ../dist
