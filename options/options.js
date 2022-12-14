const defaultSettings={ //for restore defaults
    fullscreen: false,
    autoOn: false
};

document.addEventListener('DOMContentLoaded', ()=>{ //fills in storage options
    chrome.storage.sync.get('settings', ({ settings })=>{
        document.getElementById('fullscreen').checked=settings.fullscreen;
        document.getElementById('autoOn').checked=settings.autoOn;
    });
});

document.getElementById('save').addEventListener('click', saveSettings);

function saveSettings() { //update storage with DOM
    chrome.storage.sync.set({settings: {
        fullscreen: document.getElementById('fullscreen').checked,
        autoOn: document.getElementById('autoOn').checked
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
    document.getElementById('fullscreen').checked=defaultSettings.fullscreen;
    document.getElementById('autoOn').checked=defaultSettings.autoOn;
});


// Autosave when checks clicked
document.getElementById('fullscreen').addEventListener('click', saveSettings);
document.getElementById('autoOn').addEventListener('click', saveSettings);
