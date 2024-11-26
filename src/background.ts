/// <reference types="chrome"/>

type tabStatusT='on' | 'off';
type tabId=number;

const VERSION='VERSION_INSERTED_HERE_BY_BUILD_SH';

chrome.runtime.onInstalled.addListener(()=>{ //installed, so set default settings
    chrome.storage.sync.set({
        settings: {
            fullScreen: true,
            printLayout: false,
            pomodoroEnabled: true,
            showPageSeparators: false,
            enterFocusModeOnTimerStart: false,
            zoom: '1.15' //'0.85' - small, '1' - normal, '1.15' - large, '1.3' - extra large
        }
    });
});
