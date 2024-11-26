const defaultSettings={ //copied from background.ts:10 //for restoring default settings
    fullScreen: false,
    printLayout: false,
    pomodoroEnabled: true,
    showPageSeparators: false,
    zoom: '1' //'0.85' - small, '1' - normal, '1.15' - large, '1.3' - extra large
};

const $i=query=>document.getElementById(query);

document.addEventListener('DOMContentLoaded', ()=>{ //fills in storage options
    chrome.storage.sync.get('settings', ({ settings })=>{
        $i('fullScreen').checked=settings.fullScreen;
        $i('printLayout').checked=settings.printLayout;
        $i('pomodoroEnabled').checked=settings.pomodoroEnabled;
        $i('showPageSeparators').checked=settings.showPageSeparators;
        $i('zoom').value=settings.zoom;
    });
});

function saveSettings() { //update storage with DOM
    chrome.storage.sync.set({settings: {
        fullScreen: $i('fullScreen').checked,
        printLayout: $i('printLayout').checked,
        pomodoroEnabled: $i('pomodoroEnabled').checked,
        showPageSeparators: $i('showPageSeparators').checked,
        zoom: $i('zoom').value
    }}, ()=>{
        setStatus('Settings saved', 'green');
    });
}

function setStatus(msg, color='black') {
    document.querySelectorAll('.status-text').forEach(el=>{
        el.style.color=color;
        el.innerHTML=msg;
    });
    setTimeout(()=>{
        setStatus('');
    }, 3000);
}

console.log($i('restoreDefaults'));
$i('restoreDefaults').addEventListener('click', ()=>{ //restore defaults button clickedd. update storage and DOM
    chrome.storage.sync.set({settings: defaultSettings}, ()=>{
        setStatus('Settings restored to defaults', 'green');
    });
    $i('fullScreen').checked=defaultSettings.fullScreen;
    $i('printLayout').checked=defaultSettings.printLayout;
    $i('pomodoroEnabled').checked=defaultSettings.pomodoroEnabled;
    $i('showPageSeparators').checked=defaultSettings.showPageSeparators;
    $i('zoom').value=defaultSettings.zoom;
});


// Autosave when checks clicked
$i('fullScreen').addEventListener('click', saveSettings);
$i('printLayout').addEventListener('click', saveSettings);
$i('pomodoroEnabled').addEventListener('click', saveSettings);
$i('zoom').addEventListener('change', saveSettings);
$i('showPageSeparators').addEventListener('click', saveSettings);



// Advanced Options Toggle
const advancedOptionsBtn=$i('advancedOptionsBtn');
const normalSettings=$i('normalSettings');
const advancedSettings=$i('advancedSettings');
advancedOptionsBtn.addEventListener('click', ()=>{
    normalSettings.style.display='none';
    advancedSettings.style.display='block';
});
$i('backBtn').addEventListener('click', ()=>{
    advancedSettings.style.display='none';
    normalSettings.style.display='block';
});

