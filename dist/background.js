/// <reference types="chrome"/>
const sleep = seconds => new Promise(resolve => setTimeout(resolve, seconds));
const VERSION = "1.0";
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.set({
        settings: {
            fullscreen: false,
            autoOn: false
        }
    });
});
chrome.action.onClicked.addListener(tab => {
    const tabId = tab.id || chrome.tabs.TAB_ID_NONE;
    chrome.storage.sync.get('settings', ({ settings }) => {
        chrome.tabs.sendMessage(tabId, { settings }, setStorage);
        async function setStorage(response) {
            if (response === undefined) { //script not injected into tab, so reload and try again.
                chrome.tabs.reload(tabId);
                await sleep(2000);
                chrome.tabs.sendMessage(tabId, { settings }, setStorage);
            }
            if (response.version !== VERSION) { //version mismatch, so reload and try again.
                chrome.tabs.reload(tabId);
                await sleep(2000);
                chrome.tabs.sendMessage(tabId, { settings }, setStorage);
            }
            const setTo = {};
            setTo[`tabId-${tabId}`] = response.status;
            chrome.storage.sync.set(setTo); //store tab's status
            setExtensionIcon(response.status);
        }
    });
});
chrome.tabs.onActivated.addListener(({ tabId, windowId }) => {
    chrome.storage.sync.get(`tabId-${tabId}`, kvStatus => {
        const status = kvStatus[`tabId-${tabId}`] || 'off';
        console.log('status of', status);
        setExtensionIcon(status);
    });
});
function setExtensionIcon(status) {
    console.log(`Setting icon to ^${status}$`);
    if (status === 'on') {
        chrome.action.setIcon({
            path: '/icons/on-128.png'
        });
    }
    else if (status === 'off') {
        chrome.action.setIcon({
            path: '/icons/off-128.png'
        });
    }
    else {
        throw new Error(`Unknown status: ^${JSON.stringify(status)}$`);
    }
}
