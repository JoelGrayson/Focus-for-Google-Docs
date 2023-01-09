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

# ## Push changes from `developing/pomodoro`
( cd ../developing/pomodoro && ./push\ changes.pl )

# ## Insert pomodoro.html and pomodoro.js at POMODORO_{JS,HTML}_INSERTED_HERE_BY_BUILD_SH
echo '''
open(FH, "<", "injected.js") or die "No file injected.js found";
while (my $line = <FH>) {
    if ($line=~"POMODORO_HTML_INSERTED_HERE_BY_BUILD_SH") {
        system("cat pomodoro.html");
    } elsif ($line=~"POMODORO_JS_INSERTED_HERE_BY_BUILD_SH") {
        system("cat pomodoro.js");
    } else {
        print $line;
    }
}
close(FH);
''' | perl > injected.js.tmp
mv injected.js.tmp injected.js


# Move to dist
mv injected.js ../dist
mv background.js ../dist

# # Pomodoro
cp pomodoro.css ../dist

cd ..

# Zip
( cd .. && zip -rq 'Focus for Google Docs.zip' './Focus for Google Docs' )
