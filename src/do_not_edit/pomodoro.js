//! Copied from developing/pomodoro/index.html's <script> tags


    'use strict';

    // Configuration
    const ENV='dev';
    // const ENV='prod';
    
    const THEME={ //color theme
        DARKGRAY: '#444',
        GRAY: '#ccc',
        WHITE: '#fafafa',
        BLUE: 'royalblue',
        GREEN: '#00943c'
    };
    
    let isBreak=false;
    
    //# SVG API
    const $i=query=>document.getElementById(query);
    const $i_show=query=>$i(query).classList.remove('focus__hidden');
    const $i_hide=query=>$i(query).classList.add('focus__hidden');
    const devPrint=(...args)=>{ if (ENV==='dev') console.log('', ...args) }; //avoid printing during production
    const prodPrint=(...args)=>console.log('<Focus>', ...args); //prints during development and production showing watermark

    const circumference=Math.PI*2*40; //251.4
    const pomodoroEl=$i('focus__pomodoro');
    const topEl=$i('focus__top-arc'); //foreground
    const bottomEl=$i('focus__bottom-arc');
    const textEl=$i('focus__time-left-text');
    const editableTextEl=$i('focus__time-left-editable');
    const uMinutesEl=$i('focus__minutes'); //user's input for minutes
    const checkmarkEl=$i('focus__finish-editing-time-left');

    function setCompletePercent(percent /** out of 100 */) {
        const scaledAmount=percent/100*circumference;
        topEl.style.strokeDashoffset=(-scaledAmount).toString();
        bottomEl.style.strokeDashoffset=scaledAmount.toString();
    }

    //# Timer Utils
    let pausedStartedAt=-1; //-1 (not paused) or unix time (paused)
    let startTime;
    let endTime;
    let clockInterval;

    function runTimer(durationMinutes) {
        startTime=Date.now(); //in millis (unix time)
        endTime=Date.now()+durationMinutes*60*1000; //in millis
        const millisDuration=endTime-startTime;

        function updateClock() { //compute logic & render DOM
            const millisPassed=Date.now()-startTime;
            const percentComplete=millisPassed/millisDuration*100;
            const minutesLeft=(endTime-Date.now())/1000/60;

            if (minutesLeft<0)
                return setTimerComplete();

            if (minutesLeft>=1) //display minutes left
                textEl.innerHTML=Math.floor(minutesLeft).toString();

            if (minutesLeft<1 && minutesLeft>0) { //display seconds left
                let secondsLeft=Math.floor(minutesLeft*60).toString();
                while (secondsLeft.length<2) //make sure at least two digits
                    secondsLeft='0'+secondsLeft;
                
                textEl.style.fontSize='30px';
                textEl.innerHTML='0:'+secondsLeft;
            }

            setCompletePercent(percentComplete);
        }
        
        updateClock();
        clockInterval=setInterval(()=>{
            if (pausedStartedAt===-1)
                updateClock();
        }, 100);
    }

    function killClock() { //resets clock like starting state
        clearInterval(clockInterval);
        clockInterval=-1;
        pausedStartedAt=-1;
        setCompletePercent(0);
        textEl.innerHTML='';
    }

    function resetClockStyling() {
        // // Color
        // topEl.style.stroke=THEME.BLUE;
        // bottomEl.style.stroke=THEME.BLUE;

        $i('focus__background-border-top').style.stroke='#5e73ab';
        $i('focus__background-border-bottom').style.stroke='#5e73ab';

        $i('focus__background-top').style.stroke='#d4daeb';
        $i('focus__background-bottom').style.stroke='#d4daeb';
        
        // Width
        uMinutesEl.style.width='6ch';
    }

    function setTimerComplete() { //sets timer complete (green)
        killClock();
        setCompletePercent(100);
        textEl.innerHTML='';
        // topEl.style.stroke=THEME.GREEN;
        // bottomEl.style.stroke=THEME.GREEN;
        if (isBreak) {
            setStatus('done-with-break');
            setIsBreak(false);
        } else {
            setStatus('done');
        }
        if (settings.exitFocusModeOnTimerEnd)
            setFocusStatus('off');
    }

    function hideAll() { //hides all status-dependent elements
        [
            'focus__start-hover',
            'focus__middle-hover',
            'focus__focus-text',
            'focus__time-left-editable',
            'focus__running-icon',
            'focus__paused-icon',
            'focus__smiley-face',
            'focus__finish-editing-time-left',
            'focus__done-message',
            'focus__done-with-break-message'
        ].forEach($i_hide);
    }
    
    function setText(text) {
        ['focus__focus-text', 'focus__click-to-focus-text', 'focus__click-to-unfocus-text', 'focus__exit-fullscreen-logo', 'focus__fullscreen-logo']
            .forEach($i_hide);
        if (status==='start' || status==='done')
            $i_show(text);
    }
    
    function setIsBreak(newIsBreak) {
        isBreak=newIsBreak;
        if (newIsBreak)
            pomodoroEl.classList.add('focus__break-mode');
        else
            pomodoroEl.classList.remove('focus__break-mode');
    }
    
    function addEventListeners() { // adds event listeners to elements
        //# Mouseup
        // For start
        $i('focus__start-btn').addEventListener('mouseup', startTimer);
        function startTimer() {
            setIsBreak(false);
            resetClockStyling();
            runTimer(uMinutesEl.value);
            setStatus('running');
        }
        uMinutesEl.addEventListener('input', e=>{
            const inputNumChars=uMinutesEl.value.length || 1; //change width to match input size
            uMinutesEl.style.width=`${inputNumChars+5}ch`;
            document.querySelector('label[for="focus__minutes"]').innerHTML=e.target.value==='1' ? 'minute' : 'minutes'; //minute or minutes reflects u_input
        });
        uMinutesEl.addEventListener('keypress', e=>{
            if (e.key==='Enter') //finished because hit enter key
                startTimer();
        });

        // Option key changes the logo to fullscreen or exit fullscreen button
        const showFullScreenOrNot=showFocusUnfocus=>e=>{
            if (e.altKey)
                if (document.fullscreenElement==null)
                    setText('focus__fullscreen-logo');
                else
                    setText('focus__exit-fullscreen-logo');
            else
                if (showFocusUnfocus)
                    if (focusStatus==='on')
                        setText('focus__click-to-unfocus-text');
                    else if (focusStatus==='off')
                        setText('focus__click-to-focus-text');
                else
                    setText('focus__focus-text');
        };
        document.addEventListener('keydown', showFullScreenOrNot(false));
        document.addEventListener('keyup', e=>e.key==='Alt' && setText('focus__focus-text'));
        pomodoroEl.addEventListener('keydown', showFullScreenOrNot(true));
        pomodoroEl.addEventListener('keyup', e=>e.key==='Alt' && setText('focus__focus-text'));
        

        // For middle
        // Editing time left (click on time)
        let isEditingTimeLeft=false;
        function setIsEditingTimeLeft(newIsEditingTimeLeft) {
            isEditingTimeLeft=newIsEditingTimeLeft;
            hideAll();
            if (isEditingTimeLeft) { //start editing time left. pause for now
                textEl.classList.add('focus__hidden');
                // start with current timer value
                const currValue=textEl.innerHTML;
                if (currValue.includes(':'))
                    editableTextEl.value=currValue.split(':')[0]+1; //just minutes
                else
                    editableTextEl.value=currValue;
                
                editableTextEl.classList.remove('focus__hidden');
                pausedStartedAt=Date.now(); //start pausing
                editableTextEl.focus();
                $i_show('focus__finish-editing-time-left');
            } else { //done editing time left
                const newValue=editableTextEl.value;
                textEl.classList.remove('focus__hidden');
                editableTextEl.classList.add('focus__hidden');

                const ogDuration=(endTime-startTime)/60/1000; //minutes left
                const newMinutesLeft=+editableTextEl.value;
                $i_hide('focus__finish-editing-time-left');

                if (newMinutesLeft>ogDuration) { //increased time left beyond original
                    startTime=Date.now(); //start from now
                    endTime=Date.now()+newValue*60*1000; //user's input minutes ahead of now
                    pausedStartedAt=-1;
                } else { //modified time left below original duration. need to shift time over to change amount of time until endTime
                    // Account for paused time
                    startTime+=Date.now()-pausedStartedAt;
                    endTime+=Date.now()-pausedStartedAt;
                    pausedStartedAt=-1;

                    // Shift time over
                    const ogTimeLeft=endTime-Date.now(); //in millis
                    const newTimeLeft=newMinutesLeft*60*1000; //in millis
                    const shiftOverAmount=newTimeLeft-ogTimeLeft;
                    startTime+=shiftOverAmount;
                    endTime+=shiftOverAmount;
                    setStatus('running');
                }
            }
        }
        
        textEl.addEventListener('mouseup',e=>{
            if (e.altKey) { //don't edit time left if alt key is pressed. Instead, toggle fullscreen
                // Toggle fullscreen
                if (document.fullscreenElement==null) //if not full screen
                    document.body.requestFullscreen();
                else
                    document.exitFullscreen();
            } else {
                setIsEditingTimeLeft(true);
            }
        });
        editableTextEl.addEventListener('keypress', e=>{
            if (e.key==='Enter') //finished because hit enter key
                setIsEditingTimeLeft(false);
        });
        $i('focus__finish-editing-time-left').addEventListener('click', ()=>{ //clicking checkmark causes to be finished editing time
            setIsEditingTimeLeft(false);
        });

        //     running
        $i('focus__middle-hover-status').addEventListener('mouseup', ()=>{
            if (status==='running')
                setStatus('paused');
            else if (status==='paused') {
                const pausedForMillis=Date.now()-pausedStartedAt;
                startTime+=pausedForMillis;
                endTime+=pausedForMillis;
                pausedStartedAt=-1; //resume
                setStatus('running');
            }
        });

        //     selected from more options drop down
        $i('focus-enter-fullscreen-btn').addEventListener('mouseup', ()=>{
            document.body.requestFullscreen();
            setTimeout(updateMoreOptionsDropdownItems, 500);
        });
        $i('focus-exit-fullscreen-btn').addEventListener('mouseup', ()=>{
            document.exitFullscreen();
            setTimeout(updateMoreOptionsDropdownItems, 500);
        });
        $i('focus-stop-timer-btn').addEventListener('mouseup', ()=>{
            killClock();
            setStatus('start');
        });

        $i('focus-restart-timer-btn').addEventListener('mouseup', ()=>{
            killClock();
            runTimer(uMinutesEl.value);
            setStatus('running');
        });
        $i('focus-enter-focus-mode-btn').addEventListener('mouseup', ()=>{
            setFocusStatus('on');
            setTimeout(updateMoreOptionsDropdownItems, 100);
        });
        $i('focus-exit-focus-mode-btn').addEventListener('mouseup', ()=>{
            setFocusStatus('off');
            setTimeout(updateMoreOptionsDropdownItems, 500);
        });
        $i('focus__skip-break-button').addEventListener('mouseup', ()=>{
            setStatus('start');
            $i_show('focus__start-hover');
        });


        
        // end (done)
        $i('focus__start-break-button').addEventListener('mouseup', ()=>{
            runTimer(5);
            setIsBreak(true);
            setStatus('running');
        });

        
        //# Hover
        pomodoroEl.addEventListener('mouseenter', e=>{
            showFullScreenOrNot(true)(e);

            if (!isEditingTimeLeft && (status==='running' || status==='paused'))
                $i_show('focus__middle-hover');
            
            if (status==='start' || status==='done-with-break') { //ready to start
                $i_show('focus__start-hover');
            } else if (status==='running') { //in the middle
                $i_show('focus__running-icon');
            } else if (status==='paused') { //in the middle
                $i_show('focus__paused-icon');
            } else if (status==='done') { //finished a session
                $i_show('focus__done-message');
            } else if (status==='done-with-break') {
                
            } else {
                throw new Error(`Invalid timer status: ^${status}$`);
            }
        });
        $i('focus__middle-hover-more-btn').addEventListener('mouseenter', ()=>{
            $i_show('focus__more-dropdown-container');
            $i_show('focus__more-dropdown-container-helpers');

            // Make sure correct items shown
            updateMoreOptionsDropdownItems();
        });

        //# Mouse Leave
        $i('focus__app').addEventListener('mouseleave', mouseLeaveHandler);

        function mouseLeaveHandler() {
            setText('focus__focus-text');
            // Hide all hover overlays
            [
                'focus__start-hover',
                'focus__middle-hover',
                'focus__done-message',
                'focus__done-with-break-message',
                'focus__smiley-face',
                'focus__more-dropdown-container',
                'focus__more-dropdown-container-helpers',
            ].forEach($i_hide);
            
            // if (status==='done-with-break')
            //     setStatus('start');
        }
    }
    
    function updateMoreOptionsDropdownItems() {
        if (focusStatus==='on') {
            $i_hide('focus-enter-focus-mode-btn');
            $i_show('focus-exit-focus-mode-btn');
        } else {
            $i_show('focus-enter-focus-mode-btn');
            $i_hide('focus-exit-focus-mode-btn');
        }
        if (document.fullscreenElement==null) {
            $i_show('focus-enter-fullscreen-btn');
            $i_hide('focus-exit-fullscreen-btn');
        } else {
            $i_hide('focus-enter-fullscreen-btn');
            $i_show('focus-exit-fullscreen-btn');
        }
    }
    
    //# Timer Main
    let status='start';
    
    function setStatus(newStatus) { //update DOM to match status
        status=newStatus;
        devPrint('Setting status to', status);
        hideAll();
        
        if (status==='start') {
            resetClockStyling();
            setCompletePercent(0);
            $i_show('focus__focus-text');
        } else if (status==='running') { //in the middle
            pausedStartedAt=-1; //not paused
        } else if (status==='paused') { //in the middle
            pausedStartedAt=Date.now();
        } else if (status==='done') { //finished a session
            $i_show('focus__smiley-face');
            $i_show('focus__done-message');
        } else if (status==='done-with-break') { //finished a session
            $i_show('focus__focus-text');
            $i_show('focus__start-hover');
            $i_show('focus__done-with-break-message');
        } else {
            throw new Error(`Invalid timer status: ^${status}$`);
        }
    }

    function main() {
        addEventListeners();
        $i_hide('focus__more-dropdown-container');
        $i_hide('focus__more-dropdown-container-helpers');
        setStatus('start');
    }

    main();
