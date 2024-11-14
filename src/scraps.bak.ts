const hideItem=querySelector=>{
    const el=document.querySelector(querySelector);
    if (el)
        el.classList.add('focus__hidden');
};
const undoHideItem=querySelector=>{
    const el=document.querySelector(querySelector);
    if (el)
        el.classList.remove('focus__hidden');
};
const makeGray=querySelector=>{
    const el=document.querySelector(querySelector) as HTMLElement;
    if (el)
        el.classList.add('focus__gray');
};
const undoMakeGray=querySelector=>{
    const el=document.querySelector(querySelector) as HTMLElement;
    if (el)
        el.classList.remove('focus__gray');
};