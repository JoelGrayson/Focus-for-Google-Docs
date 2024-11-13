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
            zoom: '1.15' //'0.85' - small, '1' - normal, '1.15' - large, '1.3' - extra large
        }
    });
});

// chrome.action.onClicked.addListener(tab=>{ //when icon clicked
//     if (!tab.url!.includes('docs.google.com/document/')) return; //only run on valid tab

//     const sleep=seconds=>new Promise(resolve=>setTimeout(resolve, seconds));
//     const tabId=tab.id || chrome.tabs.TAB_ID_NONE;

//     chrome.storage.sync.get('settings', ({settings})=>{ //pass in settings as message
//         chrome.tabs.sendMessage(tabId, {settings}, setStorage);

//         async function setStorage(response) { //tell tab to toggle on/off
//             if (response===undefined) { //script not injected into tab, so reload and try again.
//                 chrome.tabs.reload(tabId);
//                 await sleep(2000);
//                 chrome.tabs.sendMessage(tabId, {settings}, setStorage);
//             }

//             if (response.version!==VERSION) { //version mismatch, so reload and try again.
//                 chrome.tabs.reload(tabId);
//                 await sleep(2000);
//                 chrome.tabs.sendMessage(tabId, {settings}, setStorage);
//             }
    
//             const setTo={};
//             setTo[`tabId-${tabId}`]=response.focusStatus;
//             chrome.storage.sync.set(setTo); //store tab's focusStatus
    
//             setExtensionIcon(response.focusStatus);
//         }
//     });
// });

// chrome.tabs.onActivated.addListener(({tabId, windowId})=>{ //switch tabs (active tab changes)
//     chrome.storage.sync.get(`tabId-${tabId}`, kvStatus=>{
//         const focusStatus=kvStatus[`tabId-${tabId}`] || 'off';
//         setExtensionIcon(focusStatus);
//     });
// });

// function setExtensionIcon(focusStatus: tabStatusT) {
//     if (focusStatus==='on')
//         chrome.action.setIcon({
//             path: '/icons/on-128.png'
//         });
//     else if (focusStatus==='off')
//         chrome.action.setIcon({
//             path: '/icons/off-128.png'
//         });
//     else
//         throw new Error(`Unknown focusStatus: ^${JSON.stringify(focusStatus)}$`);
// }
