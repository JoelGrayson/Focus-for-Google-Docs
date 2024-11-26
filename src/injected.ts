/// <reference types="chrome"/>

type settingsT={
    fullScreen: boolean;
    printLayout: boolean;
    pomodoroEnabled: boolean;
    showPageSeparators: boolean;
    zoom: string;
    enterFocusModeOnTimerStart: boolean;
    darkMode: boolean;
};

(async ()=>{ //IIFE to not pollute global namespace with variables
    let focusStatus: 'on' | 'off'='off'; // 'on' | 'off'
    const version='VERSION_INSERTED_HERE_BY_BUILD_SH';

    const sleep=seconds=>new Promise(resolve=>setTimeout(resolve, seconds*1000));
    const $=(querySelector: string)=>document.querySelector(querySelector) as HTMLElement;
    const $$=(querySelectorAll: string)=>document.querySelectorAll(querySelectorAll) as NodeListOf<HTMLElement>;

    //# Toggle Fullscreen
    (async ()=>{
        chrome.runtime.onMessage.addListener((message, sender, sendResponse)=>{ //toggle viewer status and send back status ('on' | 'off') for extension to change its icon
            const settings=message.settings;

            setFocusStatus(focusStatus==='on' ? 'off' : 'on', settings); //toggle status
            console.log(`Turning ${focusStatus} Focus`);
    
            sendResponse({
                focusStatus: focusStatus || 'on',
                version: version || 'unknown'
            }); //default to on if code is not fully injected yet (loading page)
        });
    })();
    
    
    //# Get Settings
    const settings: settingsT=await new Promise((resolve, reject)=>
        chrome.storage.sync.get('settings', ({settings})=>resolve(settings))
    );

    if (settings.darkMode) {
        console.log("Enabling dark mode");
        let attemptNumber=1;
        const id=setInterval(()=>{
            const el=$('.kix-appview-editor') as HTMLElement;
            attemptNumber++;
            if (attemptNumber>10) {
                console.log('Failed to enable dark mode after 10 attempts');
                clearInterval(id);
                return;
            }
            if (el) {
                el.classList.add('focus__dark-mode');
                clearInterval(id);
            }
        }, 100);
    }


    //# Update Browser if Chrome version is too old
    if (settings==undefined) { //need to update browser to make this work
        const updateBrowserEl=document.createElement('div');
        updateBrowserEl.style.position='absolute';
        updateBrowserEl.style.bottom='25px';
        updateBrowserEl.style.right='25px';
        updateBrowserEl.style.width='290px';
        updateBrowserEl.style.height='60px';
        updateBrowserEl.style.backgroundColor='#fff6d8';
        updateBrowserEl.style.border='2px solid black';
        updateBrowserEl.style.borderRadius='12px';
        updateBrowserEl.style.cursor='pointer';
        updateBrowserEl.style.display='flex';
        updateBrowserEl.style.justifyContent='center';
        updateBrowserEl.style.alignItems='center';
        updateBrowserEl.style.fontSize='20px';
        updateBrowserEl.style.boxShadow='0px 2px 12px -1px';
        updateBrowserEl.style.padding='5px 20px';
        updateBrowserEl.style.zIndex='99999';
        updateBrowserEl.innerText='Please update Chrome beyond version 102 to make Focus work';
        updateBrowserEl.addEventListener('click', ()=>updateBrowserEl.parentNode?.removeChild(updateBrowserEl)); //hide el on click
        document.body.appendChild(updateBrowserEl);
    }


    //# Pomodoro Timer
    if (settings.pomodoroEnabled) {
        (()=>{
            const focusEl=document.createElement('focus-extension');
            focusEl.innerHTML=`${''/* copied from developing/pomodoro/index.html */}
                POMODORO_HTML_INSERTED_HERE_BY_BUILD_SH
            `;
            $('.kix-appview-editor-container')!.appendChild(focusEl);

            // BEGIN pomodoro.js
            /* POMODORO_JS_INSERTED_HERE_BY_BUILD_SH */
            // END pomodoro.js

            // Enhancements to pomodoro linked with the extension (side effects)
            $('#focus__pomodoro')!.addEventListener('click', (e: MouseEvent)=>{ //toggle focus status when pomodoro clicked
                if (e.altKey) { //pressing alt/option makes enter full screen or not
                    if (document.fullscreenElement==null) //if not full screen
                        document.body.requestFullscreen();
                    else
                        document.exitFullscreen();
                    return;
                }

                if (status!=='start') return; //status is defined in pomodoro.js, which is inserted above

                if (focusStatus==='off' && settings.fullScreen)
                    document.body.requestFullscreen();

                if (focusStatus==='on' && settings.fullScreen) {
                    if (document.fullscreenElement) {
                        setTimeout(()=>document.exitFullscreen(), 100);
                    } else {
                        console.log('Failed to exit full screen so defaulting to reloading page');
                        window.location.reload();
                    }
                }
                
                console.log('focusStatus', focusStatus, 'settings.fullScreen', settings.fullScreen);
                
                setFocusStatus(focusStatus==='on' ? 'off' : 'on', settings); //toggle focus status
            });
            // set pomodoro size
            ($('#focus__app')!.style as any).zoom=settings.zoom;


            $('#focus__start-btn').addEventListener('mouseup', ()=>{
                // console.log('mouseup on start button', settings.enterFocusModeOnTimerStart, settings);
                if (settings.enterFocusModeOnTimerStart) {
                    setFocusStatus('on', settings);
                    if (settings.fullScreen)
                        document.body.requestFullscreen();    
                }
            });
        })();
    }


    // # Focus Status Helper
    function setFocusStatus(newFocusStatus: 'on' | 'off', settings) { //change DOM based on status
        // focus__hidden

        const hideItemsQuerySelectors=[ //query selectors
            // horizontal ruler
            '#kix-horizontal-ruler-container',
            '#kix-vertical-ruler-container',
            
            // explorer widget
            '.docs-explore-widget',

            // TOC widget
            '.left-sidebar-container-content'
        ];
        const makeGrayItemsQuerySelectors=[
            // TOC widget
            '.left-sidebar-container',
            '.kix-appview-editor'
        ];

        const hideItem=querySelector=>{
            const el=$(querySelector);
            if (el) el.classList.add('focus__hidden');
        };
        const undoHideItem=querySelector=>{
            const el=$(querySelector);
            if (el) el.classList.remove('focus__hidden');
        };
        const makeGray=querySelector=>{
            const el=$(querySelector) as HTMLElement;
            if (el) el.classList.add('focus__gray');
        };
        const undoMakeGray=querySelector=>{
            const el=$(querySelector) as HTMLElement;
            if (el) el.classList.remove('focus__gray');
        };
        const hideItems=()=>hideItemsQuerySelectors.forEach(hideItem);
        const undoHideItems=()=>hideItemsQuerySelectors.forEach(undoHideItem);
        const makeGrayItems=()=>makeGrayItemsQuerySelectors.forEach(makeGray);
        const undoMakeGrayItems=()=>makeGrayItemsQuerySelectors.forEach(undoMakeGray);
        
        //* Make pages look seamless
        function formatCanvases() {
            // Old Way: Add White Outline Around Pages to Cover the Gray Marks
            // const canvasEls=$$('.kix-canvas-tile-content') as NodeListOf<HTMLCanvasElement>;
            // for (let canvasEl of canvasEls)
                // canvasEl.style.outline='4px solid #fff'; //cover up black border of canvas to make it look like the doc is seamless
            
            for (let pageEl of <NodeListOf<HTMLCanvasElement>>$$('.kix-page-paginated'))
                pageEl.classList.add('focus__hide_outline');

            if (settings!==undefined && !settings.showPageSeparators) {
                for (let pageEl of <NodeListOf<HTMLCanvasElement>>$$('.kix-page-canvas-compact-mode'))
                    pageEl.classList.add('focus__hide_border_top');
            }
        }
        function undoFormatCanvases() {
            for (let pageEl of <NodeListOf<HTMLCanvasElement>>$$('.kix-page-paginated'))
                pageEl.classList.remove('focus__hide_outline');

            if (settings!==undefined && !settings.showPageSeparators) {
                for (let pageEl of <NodeListOf<HTMLCanvasElement>>$$('.kix-page-canvas-compact-mode'))
                    pageEl.classList.remove('focus__hide_border_top');
            }
        }
        function doNowAndAfterASecond(fn) {
            fn();
            setTimeout(fn, 1000);
        }
        
        focusStatus=newFocusStatus;
        if (focusStatus==='on') { //turning on focus mode
            //* Hide stuff
            setFullScreenStatus('on', settings)
                .then(()=>{ //hide `Controls hidden. Press ESC to show controls.` Google Docs message
                    setTimeout(()=>{
                        hideItem('.jfk-butterBar');
                    }, 300);
                });
            
            hideItems();
            makeGrayItems();
            
            //* Editor
            const editor=$('.kix-appview-editor') as HTMLElement;
                editor.style.height='100vh'; //make app full screen

            doNowAndAfterASecond(formatCanvases);
        }

        

        if (focusStatus==='off') { //turn off full screen and reload page
            undoHideItems();
            undoMakeGrayItems();
            doNowAndAfterASecond(undoFormatCanvases);

            setFullScreenStatus('off', settings)
                .then(()=>{
                    // Old method: window.location.reload();
                });
        }

        async function setFullScreenStatus(focusStatus, settings) { //Hide/show header by navigating menu: View > Full screen
            async function clickElement(element) { //google docs elements are triggered by mousedown and mouseup
                element.dispatchEvent(new MouseEvent('mousedown', {bubbles: true}));
                await sleep(0.005);
                element.dispatchEvent(new MouseEvent('mouseup', {bubbles: true}));
            }
    
            // Full Screen
            const fullScreenEl=$('span[aria-label*="Full screen"]') as HTMLSpanElement;
            const isInFullScreen=(()=>{
                const display=($('#docs-header') as HTMLDivElement).style.display;
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
                const printLayoutEl=$('span[aria-label*="Show print layout"]')!.parentNode!.parentNode as HTMLElement;
    
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
                    await sleep(0.05);
                    await clickElement(printLayoutEl);
                }
            }
    
            await sleep(1); //give time for changes
            return;
        }
    }
})();
