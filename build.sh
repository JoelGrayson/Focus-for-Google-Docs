#!/bin/bash

# # TypeScript Files
# Compile Source
cd src
tsc --target ES2020 background.ts injected.ts

# Version is only stored once. Replace VERSION_INSERTED_HERE_BY_BUILD_SH with the version from manifest.json
version="$(jq '.version' --monochrome-output < ../manifest.json)"
sed "s/'VERSION_INSERTED_HERE_BY_BUILD_SH'/$version/g" < background.js > background.js.tmp
sed "s/'VERSION_INSERTED_HERE_BY_BUILD_SH'/$version/g" < injected.js > injected.js.tmp
cat background.js.tmp > background.js
cat injected.js.tmp > injected.js
rm background.js.tmp injected.js.tmp
( #Make sure that the version in popup/index.html is as up-to-date as possible
    cd ../popup
    sed -E "s;<p>Version .+</p>;<p>Version $(echo $version | cut -d '"' -f 2)</p>;g" < index.html > index.html.tmp
    mv ./index.html.tmp ./index.html
)

# ## Push changes from `developing/pomodoro`
( cd ../developing/pomodoro && ./push\ changes.pl )

# ## Insert pomodoro.html and pomodoro.js at POMODORO_{JS,HTML}_INSERTED_HERE_BY_BUILD_SH
echo '''
open(FH, "<", "injected.js") or die "No file injected.js found";
while (my $line = <FH>) {
    if ($line=~"POMODORO_HTML_INSERTED_HERE_BY_BUILD_SH") {
        system("cat do_not_edit/pomodoro.html");
    } elsif ($line=~"POMODORO_JS_INSERTED_HERE_BY_BUILD_SH") {
        system("cat do_not_edit/pomodoro.js");
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
cp 'do_not_edit/pomodoro.css' ../dist

cd ..

# Zip
( cd .. && zip -rq 'Focus for Google Docs.zip' './Focus for Google Docs' )
open -R ../'Focus for Google Docs.zip'
