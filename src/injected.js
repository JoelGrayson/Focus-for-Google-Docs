(()=>{ //IIFE for not polluting global namespace with const variables
    const sleep=seconds=>new Promise(resolve=>setTimeout(resolve, seconds));

    //* Hide stuff    
    //** Fullscreen
    // Hide header by navigating menu: View > Fullscreen
    function clickElement(element) { //google docs elements are triggered by mousedown and mouseup
        element.dispatchEvent(new MouseEvent('mousedown', {bubbles: true}));
        element.dispatchEvent(new MouseEvent('mouseup', {bubbles: true}));
    }
    clickElement(document.getElementById('docs-view-menu'));
    
    setTimeout(async ()=>{
        clickElement(document.querySelector('span[aria-label*="Full screen"]').parentNode.parentNode);
        await sleep(200);
        clickElement(document.querySelector('span[aria-label*="Full screen"]').parentNode.parentNode);
    }, 200);

    document.getElementById('kix-horizontal-ruler-container').style.display='none'; //horizontal ruler
    document.getElementById('kix-vertical-ruler-container').style.display='none'; //horizontal ruler
    document.querySelector('.left-sidebar-container-content').style.display='none'; //TOC widget

    const explorerWidget=document.querySelector('.docs-explore-widget');
    if (explorerWidget) explorerWidget.style.display='none'; //hide explore icon


    //* Editor
    const editor=document.querySelector('.kix-appview-editor');
        editor.style.height='100vh'; //make app fullscreen
        editor.style.backgroundColor='#fff'; //whatever background color
        editor.style.filter='brightness(0.9)';


    //* Make pages look seamless
    function formatCanvases() {
        const canvasEls=document.querySelectorAll('.kix-canvas-tile-content');
        for (let canvasEl of canvasEls)
            canvasEl.style.outline='4px solid #fff'; //cover up black border of canvas to make it look like the doc is seamless
    }
    formatCanvases();
    setInterval(formatCanvases, 1000);
    
    // Optional: enter full screen on computer
    // document.body.requestFullscreen();
    
    //* Pomodoro Widget
    // TODO: Add a pomodoro timer widget in the top right
})();
