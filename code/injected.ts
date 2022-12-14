/// <reference types="chrome"/>

(async ()=>{ //IIFE to not pollute global namespace with variables
    let status: 'on' | 'off'='off'; // 'on' | 'off'
    const version='VERSION_INSERTED_HERE_BY_BUILD_SH';

    chrome.runtime.onMessage.addListener((message, sender, sendResponse)=>{ //toggle viewer status and send back status ('on' | 'off') for extension to change its icon
        console.log(`Message `, message);

        // toggle status
        status=status==='on' ? 'off' : 'on';
        console.log(`Turning ${status} Focus`);
        
        // change DOM based on status
        if (status==='on') {
            //* Hide stuff
            toggleGoogleDocsFullScreen()
                .then(()=>{ //hide `Controls hidden. Press ESC to show controls.` Google Docs message
                    setTimeout(()=>{
                        const messageEl=document.querySelector('.jfk-butterBar') as HTMLElement;
                        if (messageEl)
                            messageEl.style.display='none';
                    }, 300);
                });

            document.getElementById('kix-horizontal-ruler-container')!.style.display='none'; //horizontal ruler
            document.getElementById('kix-vertical-ruler-container')!.style.display='none'; //horizontal ruler
            (document.querySelector('.left-sidebar-container-content') as HTMLElement).style.display='none'; //TOC widget

            const explorerWidget=document.querySelector('.docs-explore-widget') as HTMLElement;
            if (explorerWidget) explorerWidget.style.display='none'; //hide explore icon
        
            //* Editor
            const editor=document.querySelector('.kix-appview-editor') as HTMLElement;
                editor.style.height='100vh'; //make app fullscreen
                editor.style.backgroundColor='#fff'; //whatever background color
                editor.style.filter='brightness(0.9)';

            //* Make pages look seamless
            function formatCanvases() {
                const canvasEls=document.querySelectorAll('.kix-canvas-tile-content') as NodeListOf<HTMLCanvasElement>;
                for (let canvasEl of canvasEls)
                    canvasEl.style.outline='4px solid #fff'; //cover up black border of canvas to make it look like the doc is seamless
            }
            formatCanvases();
            setInterval(formatCanvases, 1000);

            if (message.settings.fullscreen) {
                // Enter full screen only if requested to do so
                const fullscreenBtn=document.createElement('div');
                fullscreenBtn.style.position='absolute';
                fullscreenBtn.style.top='25%';
                fullscreenBtn.style.left='calc(50% - 125px)';
                fullscreenBtn.style.width='250px';
                fullscreenBtn.style.height='60px';
                fullscreenBtn.style.backgroundColor='#fff6d8';
                fullscreenBtn.style.border='2px solid black';
                fullscreenBtn.style.borderRadius='12px';
                fullscreenBtn.style.cursor='pointer';
                fullscreenBtn.style.display='flex';
                fullscreenBtn.style.justifyContent='center';
                fullscreenBtn.style.alignItems='center';
                fullscreenBtn.style.fontSize='20px';
                fullscreenBtn.style.boxShadow='0px 2px 12px -1px';

                fullscreenBtn.innerText='Click to go fullscreen';
                fullscreenBtn.addEventListener('click', ()=>{ //hide
                    document.body.requestFullscreen();
                    fullscreenBtn.parentNode?.removeChild(fullscreenBtn);
                });
                document.body.appendChild(fullscreenBtn);
                
                // document.addEventListener('mousemove', fullscreenListener); //request for fullscreen needs to come from user.
                
                // function fullscreenListener() {
                //     document.body.requestFullscreen();
                //     document.removeEventListener('mousemove', fullscreenListener);
                // }
            }

            //* Pomodoro Widget
            // TODO: Add a pomodoro timer widget in the top right
        }
        if (status==='off') { //turn off full screen and reload page
            toggleGoogleDocsFullScreen()
                .then(()=>{
                    window.location.reload();
                });
        }

        sendResponse({
            status: status || 'on',
            version: version || 'unknown'
        }); //default to on if code is not fully injected yet (loading page)
    })

    function toggleGoogleDocsFullScreen() { //Hide/show header by navigating menu: View > Fullscreen
        return new Promise<void>((resolve)=>{
            function clickElement(element) { //google docs elements are triggered by mousedown and mouseup
                element.dispatchEvent(new MouseEvent('mousedown', {bubbles: true}));
                element.dispatchEvent(new MouseEvent('mouseup', {bubbles: true}));
            }
            clickElement(document.getElementById('docs-view-menu'));
            
            setTimeout(async ()=>{
                const sleep=seconds=>new Promise(resolve=>setTimeout(resolve, seconds));
    
                clickElement(document.querySelector('span[aria-label*="Full screen"]')!.parentNode!.parentNode);
                await sleep(100);
                clickElement(document.querySelector('span[aria-label*="Full screen"]')!.parentNode!.parentNode);
                await sleep(100);
                resolve();
            }, 200);
        });
    }
})();
