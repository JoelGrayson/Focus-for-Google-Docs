/// <reference types="chrome"/>

(async ()=>{ //IIFE to not pollute global namespace with variables
    let status: 'on' | 'off'='off'; // 'on' | 'off'
    const version='VERSION_INSERTED_HERE_BY_BUILD_SH';
    const sleep=seconds=>new Promise(resolve=>setTimeout(resolve, seconds));

    //# Toggle Fullscreen
    (async ()=>{
        chrome.runtime.onMessage.addListener((message, sender, sendResponse)=>{ //toggle viewer status and send back status ('on' | 'off') for extension to change its icon
            const settings=message.settings;
    
            // toggle status
            status=status==='on' ? 'off' : 'on';
            console.log(`Turning ${status} Focus`);
            
            // change DOM based on status
            if (status==='on') {
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
    
                if (settings.fullScreen) {
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
                    fullScreenBtn.addEventListener('click', ()=>{ //hide
                        document.body.requestFullscreen();
                        fullScreenBtn.parentNode?.removeChild(fullScreenBtn);
                    });
                    document.body.appendChild(fullScreenBtn);
                }
    
                //* Pomodoro Widget
                // TODO: Add a pomodoro timer widget in the top right
            }
            if (status==='off') { //turn off full screen and reload page
                setFullScreenStatus('off', settings)
                    .then(()=>{
                        window.location.reload();
                    });
            }
    
            sendResponse({
                status: status || 'on',
                version: version || 'unknown'
            }); //default to on if code is not fully injected yet (loading page)
        });

        async function setFullScreenStatus(status, settings) { //Hide/show header by navigating menu: View > Full screen
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
                (status==='on'  && !isInFullScreen)
                    ||
                (status==='off' && isInFullScreen)
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
                    (status==='on'  &&  isInPrintLayout)
                        ||
                    (status==='off' && !isInPrintLayout)
                ) {
                    //turn off print layout, meaning there is a seamless page transition
                    await sleep(50);
                    await clickElement(printLayoutEl);
                }
            }
    
            await sleep(1000); //give time for changes
            return;
        }
    })();
    
    //# Pomodoro Timer
    (async ()=>{
        document.body.innerHTML+= //copied from developing/pomodoro/index.html
            `   <div id="focus-app">
                    <!-- pomo timer -->
                    <div id="pomodoro-container">
                        <svg id="pomodoro" viewbox="0 0 100 100"> <!-- rotate so time starts upright -->
                            <g id="background"> <!-- light color (always full) -->
                                <!-- border (slightly larger and underneath) -->
                                <path id="background-border-top" d="M 10 50 A 40 40 0 0 1 90 50" stroke="#5e73ab" stroke-width='11px' fill="#fafafa" stroke-dashoffset="251.4" stroke-dasharray="0 251.4 0"/>
                                <path id="background-border-bottom" d="M 10 50 A 40 40 0 0 0 90 50" stroke="#5e73ab" stroke-width='11px' fill="#fafafa" stroke-dashoffset="251.4" stroke-dasharray="0 251.4 0"/>
                                
                                <!-- background light color -->
                                <path id="background-top" d="M 10 50 A 40 40 0 0 1 90 50" stroke="#d4daeb" stroke-width='10px' fill="transparent" stroke-dashoffset="251.4" stroke-dasharray="0 251.4 0"/>
                                <path id="background-bottom" d="M 10 50 A 40 40 0 0 0 90 50" stroke="#d4daeb" stroke-width='10px' fill="transparent" stroke-dashoffset="251.4" stroke-dasharray="0 251.4 0"/>
                            </g>
                            <g id="foreground"> <!-- darker color overlay (starts at zero) -->
                                <path id="top-arc"    d="M 10 50 A 40 40 0 0 1 90 50" stroke="royalblue" stroke-width='10px' fill="transparent" stroke-dashoffset="0" stroke-dasharray="0 251.4 0"/>
                                <path id="bottom-arc" d="M 10 50 A 40 40 0 0 0 90 50" stroke="royalblue" stroke-width='10px' fill="transparent" stroke-dashoffset="0" stroke-dasharray="0 251.4 0"/>
                            </g>
                    
                            <g id="status-dependent">
                                <!-- start -->
                                <g id='focus-text' class="hidden">
                                    <text x="50" y="56" text-anchor="middle" font-size="23px" font-family="helvetica">Focus</text>
                                </g>
                
                                <!-- end -->
                                <g id="smiley-face" class="hidden">
                                    <circle cx="40" cy="40" r='4' fill="#00943c" stroke="none "/>
                                    <circle cx="60" cy="40" r='4' fill="#00943c" stroke="none" />
                                    <path d="M 30 60 A 20 10 0 0 0 70 60" stroke="#00943c" stroke-width="3" fill="none" />
                                </g>
                            </g>
                    
                            <text id='time-left-text' x="50" y="61" text-anchor="middle" font-size="40px" font-family="helvetica"/> <!-- time left innerText value inserted by JS -->
                        </svg>
                    </div>
                
                    <!-- hover overlays -->
                    <div id="start-hover">
                        <div id="start-hover-children">
                            <div>
                                <input type="number" id='minutes' value="15" style='width: 6ch' />
                                <label for="minutes">minutes</label>
                            </div>
                            <button id="start-btn" class="btn">Start</button>
                        </div>
                        <svg id="start-hover-triangle" width="50px" height="25px" viewbox="0 0 50 10">
                            <path d="M 18 0 L 25 10, 32 0" stroke="#ccc" stroke-width="2" fill="#fafafa" />
                        </svg>
                    </div>
                
                    <div id="middle-hover" class="hidden"> <!-- 'running' or 'paused' -->
                        <svg id="middle-hover-status" class="btn" viewbox="10 10 80 80" width="20px" height="20px">
                            <g id="running-icon" class="hidden">
                                <rect x="33" y="30" width="12" height="40" rx="2" fill="#111" />
                                <rect x="53" y="30" width="12" height="40" rx="2" fill="#111" />
                            </g>
                            <g id="paused-icon" class="hidden">
                                <polygon points="36 30, 36 70, 73 50" fill='#111' />
                            </g>
                        </svg>
                        <div id="middle-hover-end-btn" class="btn">
                            <span>End</span>
                        </div>
                    </div>
                
                    <!-- ending message -->
                    <svg id="done-message" viewBox="0 0 120 75" width="120px" height="75px" class="hidden">
                        <polygon points="
                            2 2, 118 2, 118 55,
                            85 55, 75 65, 65 55,
                            2 55" stroke="#ccc" stroke-width="2px" fill="#fafafa"></polygon>
                        <text x="36" y="22" font-size="13px">Nice job!</text>
                        <text x="12.1" y="42" font-size="13px">Time for a break.</text>
                    </svg>
                </div>
            `;
    })();
})();
