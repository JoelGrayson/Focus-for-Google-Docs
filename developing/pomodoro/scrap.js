const circumference=Math.PI*2*40; //251.4
const topEl=document.getElementById('top-arc');
const bottomEl=document.getElementById('bottom-arc');

function setCompletePercent(percent) {
    const scaledAmount=percent/100*circumference;
    topEl.style.strokeDashoffset=-scaledAmount;
    bottomEl.style.strokeDashoffset=scaledAmount;
}

let percent=0;
setInterval(()=>{
    setCompletePercent(percent);
    percent=(percent+1) % 100;
}, 20);