const defaultSettings={ //copied from background.ts:10 //for restoring default settings
    fullScreen: false,
    printLayout: false,
    pomodoroEnabled: true
};
const $i=query=>document.getElementById(query);

document.addEventListener('DOMContentLoaded', ()=>{ //fills in storage options
    chrome.storage.sync.get('settings', ({ settings })=>{
        $i('fullScreen').checked=settings.fullScreen;
        $i('printLayout').checked=settings.printLayout;
        $i('pomodoroEnabled').checked=settings.pomodoroEnabled;
    });
});

function saveSettings() { //update storage with DOM
    chrome.storage.sync.set({settings: {
        fullScreen: $i('fullScreen').checked,
        printLayout: $i('printLayout').checked,
        pomodoroEnabled: $i('pomodoroEnabled').checked
    }}, ()=>{
        setStatus('Settings saved', 'green');
    });
}

function setStatus(msg, color='black') {
    $i('status').style.color=color;
    $i('status').innerHTML=msg;
    setTimeout(()=>{
        setStatus('');
    }, 3000);
}

$i('restoreDefaults').addEventListener('click', ()=>{ //restore defaults button clickedd. update storage and DOM
    chrome.storage.sync.set({settings: defaultSettings}, ()=>{
        setStatus('Settings restored to defaults', 'green');
    });
    $i('fullScreen').checked=defaultSettings.fullScreen;
    $i('printLayout').checked=defaultSettings.printLayout;
    $i('pomodoroEnabled').checked=defaultSettings.pomodoroEnabled;
});


// Autosave when checks clicked
$i('fullScreen').addEventListener('click', saveSettings);
$i('printLayout').addEventListener('click', saveSettings);
$i('pomodoroEnabled').addEventListener('click', saveSettings);
