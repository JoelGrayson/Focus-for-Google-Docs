/// <reference types="chrome"/>

type tabStatusT='on' | 'off';
type tabId=number;

const VERSION='VERSION_INSERTED_HERE_BY_BUILD_SH';

chrome.runtime.onInstalled.addListener(()=>{ //installed, so set default settings
    chrome.storage.sync.set({
        version: VERSION, //for debugging and backwards compatibility perhaps in the future
        settings: {
            fullScreen: true,
            printLayout: false,
            pomodoroEnabled: true,
            showPageSeparators: false,
            enterFocusModeOnTimerStart: false,
            exitFocusModeOnTimerEnd: false,
            darkMode: false,
            darkModeAmount: 0.92,
            zoom: '1.15' //'0.85' - small, '1' - normal, '1.15' - large, '1.3' - extra large
        }
    });
});

chrome.commands.onCommand.addListener((command)=>{
    console.log('command', command);
    chrome.tabs.query({active: true, currentWindow: true}, (tabs)=>{
        console.log('tabs', tabs);
        if (tabs.length>0 && tabs[0].id) { //will work for all pages, not just the docs
            chrome.tabs.sendMessage(tabs[0].id, {command}, (response)=>{
                console.log('response', response);
            });
        }
    });
});
