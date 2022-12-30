/// <reference types="chrome"/>

(async ()=>{ //IIFE to not pollute global namespace with variables
    let focusStatus: 'on' | 'off'='off'; // 'on' | 'off'
    const version='VERSION_INSERTED_HERE_BY_BUILD_SH';
    const sleep=seconds=>new Promise(resolve=>setTimeout(resolve, seconds));

    //# Toggle Fullscreen
    (async ()=>{
        chrome.runtime.onMessage.addListener((message, sender, sendResponse)=>{ //toggle viewer status and send back status ('on' | 'off') for extension to change its icon
            const settings=message.settings;

            setFocusStatus(focusStatus==='on' ? 'off' : 'on', settings, false); //toggle status
            console.log(`Turning ${focusStatus} Focus`);
    
            sendResponse({
                focusStatus: focusStatus || 'on',
                version: version || 'unknown'
            }); //default to on if code is not fully injected yet (loading page)
        });
    })();
    
    //# Pomodoro Timer
    chrome.storage.sync.get('settings', ({settings})=>{
        if (settings.pomodoroEnabled) {
            (()=>{
                const focusEl=document.createElement('focus-extension');
                focusEl.innerHTML=` ${''/* copied from developing/pomodoro/index.html */}
                    POMODORO_HTML_INSERTED_HERE_BY_BUILD_SH
                `;
                document.querySelector('.kix-appview-editor-container')!.appendChild(focusEl);

                // Start pomodoro.js
                /* POMODORO_JS_INSERTED_HERE_BY_BUILD_SH */
                // End pomodoro.js

                // Enhancements to pomodoro linked with the extension (side effects)
                document.getElementById('focus__pomodoro')!.addEventListener('click', ()=>{ //toggle focus status when pomodoro clicked
                    if (status==='start') {
                        if (focusStatus==='off' && settings.fullScreen) {
                            document.body.requestFullscreen();
                        }
                        setFocusStatus(focusStatus==='on' ? 'off' : 'on', settings, true); //toggle focus status without full screen helper
                    }
                });
                // set pomodoro size
                (document.getElementById('focus__app')!.style as any).zoom=settings.zoom;
            })();
        }
    });

    // # Focus Status Helper
    function setFocusStatus(newFocusStatus: 'on' | 'off', settings, alreadyInFullScreen) { //change DOM based on status
        focusStatus=newFocusStatus;
        if (focusStatus==='on') {
            //* Hide stuff
            setFullScreenStatus('on', settings)
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
                editor.style.height='100vh'; //make app full screen
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

            if (settings.fullScreen && !alreadyInFullScreen) {
                // Enter full screen only if requested to do so
                const fullScreenBtn=document.createElement('div');
                fullScreenBtn.style.position='absolute';
                fullScreenBtn.style.top='25%';
                fullScreenBtn.style.left='calc(50% - 125px)';
                fullScreenBtn.style.width='250px';
                fullScreenBtn.style.height='60px';
                fullScreenBtn.style.backgroundColor='#fff6d8';
                fullScreenBtn.style.border='2px solid black';
                fullScreenBtn.style.borderRadius='12px';
                fullScreenBtn.style.cursor='pointer';
                fullScreenBtn.style.display='flex';
                fullScreenBtn.style.justifyContent='center';
                fullScreenBtn.style.alignItems='center';
                fullScreenBtn.style.fontSize='20px';
                fullScreenBtn.style.boxShadow='0px 2px 12px -1px';

                fullScreenBtn.innerText='Click to go full screen';
                fullScreenBtn.addEventListener('click', ()=>{ //go fullscreen and hide el
                    document.body.requestFullscreen();
                    fullScreenBtn.parentNode?.removeChild(fullScreenBtn);
                });
                document.body.appendChild(fullScreenBtn);
            }
        }
        if (focusStatus==='off') { //turn off full screen and reload page
            setFullScreenStatus('off', settings)
                .then(()=>{
                    window.location.reload();
                });
        }

        async function setFullScreenStatus(focusStatus, settings) { //Hide/show header by navigating menu: View > Full screen
            async function clickElement(element) { //google docs elements are triggered by mousedown and mouseup
                element.dispatchEvent(new MouseEvent('mousedown', {bubbles: true}));
                await sleep(5);
                element.dispatchEvent(new MouseEvent('mouseup', {bubbles: true}));
            }
    
            // Full Screen
            const fullScreenEl=document.querySelector('span[aria-label*="Full screen"]') as HTMLSpanElement;
            const isInFullScreen=(()=>{
                const display=(document.getElementById('docs-header') as HTMLDivElement).style.display;
                if (display==='none')
                    return true;
                else if (display==='') {
                    return false;
                } else {
                    console.log('PROBLEM! isInFullScreen.style.display is unknown value:', fullScreenEl.style.display);
                    return true;
                }
            })();
            if ( //need to change full screen status
                (focusStatus==='on'  && !isInFullScreen)
                    ||
                (focusStatus==='off' && isInFullScreen)
            )
                await clickElement(fullScreenEl);
    
            // Print Layout
            if (settings.printLayout===false) { // need to change print layout status
                const printLayoutEl=document.querySelector('span[aria-label*="Show print layout"]')!.parentNode!.parentNode as HTMLElement;
    
                const isInPrintLayout=(()=>{ //ariaChecked means print layout is on. Turn status on means turn off ariaChecked
                    if (printLayoutEl.ariaChecked==='true')
                        return true;
                    if (printLayoutEl.ariaChecked==='false' || !printLayoutEl.ariaChecked)
                        return false;
                    return true;
                })();
    
                if ( //need to change status
                    (focusStatus==='on'  &&  isInPrintLayout)
                        ||
                    (focusStatus==='off' && !isInPrintLayout)
                ) {
                    //turn off print layout, meaning there is a seamless page transition
                    await sleep(50);
                    await clickElement(printLayoutEl);
                }
            }
    
            await sleep(1000); //give time for changes
            return;
        }
    }
})();
