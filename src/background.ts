/// <reference types="chrome"/>

type tabStatusT='on' | 'off';
type tabId=number;

const VERSION='VERSION_INSERTED_HERE_BY_BUILD_SH';

chrome.runtime.onInstalled.addListener(()=>{ //installed, so set default settings
    chrome.storage.sync.get('settings')
        .then(obj=>{
            let settings=obj.settings;

            const defaultSettings={
                fullScreen: true,
                printLayout: false,
                pomodoroEnabled: true,
                showPageSeparators: false,
                enterFocusModeOnTimerStart: false,
                exitFocusModeOnTimerEnd: false,
                darkMode: false,
                darkModeAmount: 0.92,
                zoom: '1.15', //'0.85' - small, '1' - normal, '1.15' - large, '1.3' - extra large
                breakDuration: 5, //in minutes
                breaksEnabled: true,
                showDocumentTabs: false,
                brightness: '0.9',
            };

            if (settings) { //update settings with keys it doesn't have
                for (const key in defaultSettings) //set 
                    if (settings[key]===undefined)
                        settings[key]=defaultSettings[key];
                
                settings['brightness']='0.9'; //force to 0.9 in this update
                    
                chrome.storage.sync.set({
                    version: VERSION, //for debugging and backwards compatibility perhaps in the future
                    settings
                });
            } else {
                chrome.storage.sync.set({
                    version: VERSION,
                    settings: defaultSettings
                });
            }            
        });
});

chrome.commands.onCommand.addListener((command)=>{
    chrome.tabs.query({active: true, currentWindow: true}, (tabs)=>{
        if (tabs.length>0 && tabs[0].id) { //will work for all pages, not just the docs
            chrome.tabs.sendMessage(tabs[0].id, {command});
        }
    });
});
