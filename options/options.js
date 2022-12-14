const defaultSettings={ //for restore defaults
    fullScreen: false,
    autoOn: false,
    printLayout: false
};

document.addEventListener('DOMContentLoaded', ()=>{ //fills in storage options
    chrome.storage.sync.get('settings', ({ settings })=>{
        document.getElementById('fullScreen').checked=settings.fullScreen;
        document.getElementById('autoOn').checked=settings.autoOn;
    });
});

document.getElementById('save').addEventListener('click', saveSettings);

function saveSettings() { //update storage with DOM
    chrome.storage.sync.set({settings: {
        fullScreen: document.getElementById('fullScreen').checked,
        // autoOn: document.getElementById('autoOn').checked,
        printLayout: document.getElementById('printLayout').checked
    }}, ()=>{
        setStatus('Settings saved', 'green');
    });
}

function setStatus(msg, color='black') {
    document.getElementById('status').style.color=color;
    document.getElementById('status').innerHTML=msg;
    setTimeout(()=>{
        setStatus('');
    }, 3000);
}

document.getElementById('restoreDefaults').addEventListener('click', ()=>{ //restore defaults button clickedd. update storage and DOM
    chrome.storage.sync.set({settings: defaultSettings}, ()=>{
        setStatus('Settings restored to defaults', 'green');
    });
    document.getElementById('fullScreen').checked=defaultSettings.fullScreen;
    document.getElementById('autoOn').checked=defaultSettings.autoOn;
    document.getElementById('printLayout').checked=defaultSettings.printLayout;
});


// Autosave when checks clicked
document.getElementById('fullScreen').addEventListener('click', saveSettings);
document.getElementById('autoOn').addEventListener('click', saveSettings);
document.getElementById('printLayout').addEventListener('click', saveSettings);
