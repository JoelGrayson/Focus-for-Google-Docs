const defaultSettings={ //copied from background.ts:10 //for restoring default settings
    fullScreen: true,
    printLayout: false,
    pomodoroEnabled: true,
    showPageSeparators: false,
    enterFocusModeOnTimerStart: true,
    exitFocusModeOnTimerEnd: false,
    darkMode: false,
    darkModeAmount: 0.92,
    zoom: '1.15', //'0.85' - small, '1' - normal, '1.15' - large, '1.3' - extra large
    breakDuration: 5,
    breaksEnabled: true,
    showDocumentTabs: false
};

const $i=query=>document.getElementById(query);

document.addEventListener('DOMContentLoaded', ()=>{ //fills in storage options
    chrome.storage.sync.get('settings', ({ settings })=>{
        $i('fullScreen').checked=settings.fullScreen;
        $i('printLayout').checked=settings.printLayout;
        $i('pomodoroEnabled').checked=settings.pomodoroEnabled;
        $i('showPageSeparators').checked=settings.showPageSeparators;
        $i('zoom').value=settings.zoom;
        $i('enterFocusModeOnTimerStart').checked=settings.enterFocusModeOnTimerStart;
        $i('exitFocusModeOnTimerEnd').checked=settings.exitFocusModeOnTimerEnd;
        $i('darkMode').checked=settings.darkMode;
        $i('darkModeAmount').value=settings.darkModeAmount;
        $i('darkModeAmountValue').innerText=settings.darkModeAmount;
        $i('breakDuration').value=settings.breakDuration;
        $i('breaksEnabled').checked=settings.breaksEnabled;
        $i('showDocumentTabs').checked=settings.showDocumentTabs;
        showDarkModeAmount(settings.darkMode);
    });

    document.getElementById('keyboardShortcutBtn').addEventListener('click', ()=>{
        chrome.tabs.create({
            url: 'chrome://extensions/shortcuts'
        });
    });
});

function showDarkModeAmount(bool) {
    if (bool) {
        $i('darkModeAmountContainer').style.visibility='visible';
        $i('darkModeAmountLabel').style.visibility='visible';
    } else {
        $i('darkModeAmountContainer').style.visibility='hidden';
        $i('darkModeAmountLabel').style.visibility='hidden';
    }
}

function saveSettings() { //update storage with DOM
    chrome.storage.sync.set({settings: {
        fullScreen: $i('fullScreen').checked,
        printLayout: $i('printLayout').checked,
        pomodoroEnabled: $i('pomodoroEnabled').checked,
        showPageSeparators: $i('showPageSeparators').checked,
        zoom: $i('zoom').value,
        enterFocusModeOnTimerStart: $i('enterFocusModeOnTimerStart').checked,
        exitFocusModeOnTimerEnd: $i('exitFocusModeOnTimerEnd').checked,
        darkMode: $i('darkMode').checked,
        darkModeAmount: $i('darkModeAmount').value,
        breakDuration: $i('breakDuration').value,
        breaksEnabled: $i('breaksEnabled').checked,
        showDocumentTabs: $i('showDocumentTabs').checked
    }}, ()=>{
        setStatus('Settings saved. Reload page to see changes.', 'green');
    });
    showDarkModeAmount($i('darkMode').checked);
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

$i('restoreDefaults').addEventListener('click', ()=>{ //restore defaults button clickedd. update storage and DOM
    chrome.storage.sync.set({settings: defaultSettings}, ()=>{
        setStatus('Settings restored to defaults', 'green');
    });
    $i('fullScreen').checked=defaultSettings.fullScreen;
    $i('printLayout').checked=defaultSettings.printLayout;
    $i('pomodoroEnabled').checked=defaultSettings.pomodoroEnabled;
    $i('showPageSeparators').checked=defaultSettings.showPageSeparators;
    $i('zoom').value=defaultSettings.zoom;
    $i('enterFocusModeOnTimerStart').checked=defaultSettings.enterFocusModeOnTimerStart;
    $i('exitFocusModeOnTimerEnd').checked=defaultSettings.exitFocusModeOnTimerEnd;
    $i('darkMode').checked=defaultSettings.darkMode;
    $i('darkModeAmount').value=defaultSettings.darkModeAmount;
    $i('darkModeAmountValue').innerText=defaultSettings.darkModeAmount;
    $i('breakDuration').value=defaultSettings.breakDuration;
    $i('breaksEnabled').checked=defaultSettings.breaksEnabled;
    $i('showDocumentTabs').checked=defaultSettings.showDocumentTabs;
});


// Autosave when checks clicked
$i('fullScreen').addEventListener('click', saveSettings);
$i('printLayout').addEventListener('click', saveSettings);
$i('pomodoroEnabled').addEventListener('click', saveSettings);
$i('zoom').addEventListener('change', saveSettings);
$i('showPageSeparators').addEventListener('click', saveSettings);
$i('enterFocusModeOnTimerStart').addEventListener('click', saveSettings);
$i('exitFocusModeOnTimerEnd').addEventListener('click', saveSettings);
$i('darkMode').addEventListener('click', saveSettings);
$i('darkModeAmount').addEventListener('change', ()=>{
    $i('darkModeAmountValue').innerText=$i('darkModeAmount').value; //display the value of the range to the user
    saveSettings();
});
$i('breakDuration').addEventListener('change', saveSettings);
$i('breaksEnabled').addEventListener('click', saveSettings);
$i('showDocumentTabs').addEventListener('click', saveSettings);

// Advanced Settings Toggle
const advancedSettingsBtn=$i('advancedSettingsBtn');
const normalSettings=$i('normalSettings');
const advancedSettings=$i('advancedSettings');
advancedSettingsBtn.addEventListener('click', ()=>{
    normalSettings.style.display='none';
    advancedSettings.style.display='block';
});
$i('backBtn').addEventListener('click', ()=>{
    advancedSettings.style.display='none';
    normalSettings.style.display='block';
});

