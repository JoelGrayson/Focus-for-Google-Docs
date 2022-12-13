chrome.action.onClicked.addListener(tab=>{ //when icon clicked
    chrome.tabs.sendMessage(tab.id, null, response=>{
        if (response==='on') {
            chrome.action.setIcon({
                path: '/icons/on-128.png'
            });
        }
        if (response==='off') {
            chrome.action.setIcon({
                path: '/icons/off-128.png'
            });
        }
    });
});

// chrome.runtime.onInstalled.addListener(()=>{
// });
