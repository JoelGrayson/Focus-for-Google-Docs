/// <reference types="chrome"/>
(async () => {
    let status = 'off'; // 'on' | 'off'
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        // toggle status
        status = status === 'on' ? 'off' : 'on';
        console.log(`Turning ${status} Focus`);
        // change DOM based on status
        if (status === 'on') {
            //* Hide stuff
            toggleGoogleDocsFullScreen()
                .then(() => {
                setTimeout(() => {
                    const messageEl = document.querySelector('.jfk-butterBar');
                    if (messageEl)
                        messageEl.style.display = 'none';
                }, 300);
            });
            document.getElementById('kix-horizontal-ruler-container').style.display = 'none'; //horizontal ruler
            document.getElementById('kix-vertical-ruler-container').style.display = 'none'; //horizontal ruler
            document.querySelector('.left-sidebar-container-content').style.display = 'none'; //TOC widget
            const explorerWidget = document.querySelector('.docs-explore-widget');
            if (explorerWidget)
                explorerWidget.style.display = 'none'; //hide explore icon
            //* Editor
            const editor = document.querySelector('.kix-appview-editor');
            editor.style.height = '100vh'; //make app fullscreen
            editor.style.backgroundColor = '#fff'; //whatever background color
            editor.style.filter = 'brightness(0.9)';
            //* Make pages look seamless
            function formatCanvases() {
                const canvasEls = document.querySelectorAll('.kix-canvas-tile-content');
                for (let canvasEl of canvasEls)
                    canvasEl.style.outline = '4px solid #fff'; //cover up black border of canvas to make it look like the doc is seamless
            }
            formatCanvases();
            setInterval(formatCanvases, 1000);
            // Optional: enter full screen on computer
            // document.body.requestFullscreen();
            //* Pomodoro Widget
            // TODO: Add a pomodoro timer widget in the top right
        }
        if (status === 'off') { //turn off full screen and reload page
            toggleGoogleDocsFullScreen()
                .then(() => {
                window.location.reload();
            });
        }
        sendResponse(status || 'on'); //default to on if code is not fully injected yet (loading page)
    });
    function toggleGoogleDocsFullScreen() {
        return new Promise((resolve) => {
            function clickElement(element) {
                element.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
                element.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
            }
            clickElement(document.getElementById('docs-view-menu'));
            setTimeout(async () => {
                const sleep = seconds => new Promise(resolve => setTimeout(resolve, seconds));
                clickElement(document.querySelector('span[aria-label*="Full screen"]').parentNode.parentNode);
                await sleep(100);
                clickElement(document.querySelector('span[aria-label*="Full screen"]').parentNode.parentNode);
                await sleep(100);
                resolve();
            }, 200);
        });
    }
})();
