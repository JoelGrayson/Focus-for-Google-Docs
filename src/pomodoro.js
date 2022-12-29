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
        // Color
        topEl.style.stroke=THEME.BLUE;
        bottomEl.style.stroke=THEME.BLUE;

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
        topEl.style.stroke=THEME.GREEN;
        bottomEl.style.stroke=THEME.GREEN;
        setStatus('done');
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
            'focus__finish-editing-time-left'
        ].forEach($i_hide);
    }
    
    function addEventListeners() { // adds event listeners to elements
        //# Mouseup
        // For start
        $i('focus__start-btn').addEventListener('mouseup', ()=>{
            resetClockStyling();
            runTimer(uMinutesEl.value);
            setStatus('running');
        });
        uMinutesEl.addEventListener('keypress', e=>{ //enter key triggers start
            if (e.key==='Enter') //enter key -> simulate mouseup on start button
                $i('focus__start-btn').dispatchEvent(new Event('mouseup'));
        });
        uMinutesEl.addEventListener('input', e=>{
            const inputNumChars=uMinutesEl.value.length || 1; //change width to match input size
            uMinutesEl.style.width=`${inputNumChars+5}ch`;
            document.querySelector('label[for="focus__minutes"]').innerHTML=e.target.value==='1' ? 'minute' : 'minutes'; //minute or minutes reflects u_input
        });

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
                }
            }
        }
        
        textEl.addEventListener('mouseup', _=>setIsEditingTimeLeft(true));
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

        //     paused
        $i('focus__middle-hover-end-btn').addEventListener('mouseup', ()=>{
            killClock();
            setStatus('start');
        });

        
        // end (done)
        ['mouseleave', 'mouseup'].forEach(l=>$i('focus__done-message').addEventListener(l, ()=>{
            $i_hide('focus__done-message');
        }));

        
        //# Hover
        pomodoroEl.addEventListener('mouseenter', ()=>{
            if (!isEditingTimeLeft && (status==='running' || status==='paused'))
                $i_show('focus__middle-hover');
            
            if (status==='start' || status==='done') { //ready to start
                $i_show('focus__start-hover');
            } else if (status==='running') { //in the middle
                $i_show('focus__running-icon');
            } else if (status==='paused') { //in the middle
                $i_show('focus__paused-icon');
            } else if (status==='done') { //finished a session

            } else {
                throw new Error(`Invalid timer status: ^${status}$`);
            }
        });
        //# Mouse Leave
        $i('focus__app').addEventListener('mouseleave', ()=>{
            // Hide all hover overlays
            [
                'focus__start-hover',
                'focus__middle-hover',
                'focus__done-message',
                'focus__smiley-face'
            ].forEach($i_hide);
            
            if (status==='done')
                setStatus('start');
        });
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
        } else {
            throw new Error(`Invalid timer status: ^${status}$`);
        }
    }

    function main() {
        addEventListeners();
        setStatus('start');
    }

    main();
