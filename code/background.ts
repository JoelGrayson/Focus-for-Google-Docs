/// <reference types="chrome"/>

// chrome.runtime.onInstalled

type tabStatusT='on' | 'off';
type tabId=number;

chrome.action.onClicked.addListener(tab=>{ //when icon clicked
    const theTabId=tab.id || chrome.tabs.TAB_ID_NONE;
    
    chrome.tabs.sendMessage(theTabId, null, setStorage);
    function setStorage(response) { //tell tab to toggle on/off
        if (response===undefined) { //script not injected into tab, so reload and try again.
            chrome.tabs.reload(theTabId);
            setTimeout(()=>{
                chrome.tabs.sendMessage(theTabId, null, setStorage);
            }, 1000);
        }

        const setTo={};
        setTo[`tabId-${theTabId}`]=response;
        chrome.storage.sync.set(setTo); //store tab's status

        setExtensionIcon(response);
    }
});

chrome.tabs.onActivated.addListener(({tabId, windowId})=>{ //switch tabs (active tab changes)
    chrome.storage.sync.get(`tabId-${tabId}`, (kvStatus)=>{
        const status=kvStatus[`tabId-${tabId}`];
        console.log('status of', status);

        setExtensionIcon(status);
    });
});


function setExtensionIcon(status: tabStatusT) {
    console.log(`Setting icon to ^${status}$`);
    if (status==='on') {
        chrome.action.setIcon({
            path: '/icons/on-128.png'
        });
    }
    else if (status==='off') {
        chrome.action.setIcon({
            path: '/icons/off-128.png'
        });
    } else {
        throw new Error(`Unknown status: ^${status}$`);
    }
}
