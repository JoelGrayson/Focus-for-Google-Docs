chrome.runtime.onInstalled.addListener(()=>{
    chrome.action.onClicked.addListener(tab=>{ //when icon clicked
        chrome.action.setIcon({
            path: '/icons/on-128.png'
        });
    });
});
