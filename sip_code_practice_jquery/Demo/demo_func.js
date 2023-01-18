'use strict'

// Below functionality works for connectBtn, callBtn, hangupBtn, disconnectBtn
export function getButton(id){
    let el = document.getElementById(id);
    if(!(el instanceof HTMLButtonElement)){
        throw new Error(`element "${id}" not found or not a button element`)
    }
    return el;
}

// Below functinality  works for keypad
export function getButtons(id){
    let els = document.getElementsByClassName(id);
    if(!els.length){
        throw new Error(`element "${id}" not found`)
    }
    let buttons =[]
    for(let i=0; i<els.length; i++ ){
        let el = els[i];
        if(!(el instanceof HTMLButtonElement)){
            throw new Error(`Element ${id} of "${id}" not a button elment`)
        }
        buttons.push(el)
    }
    return buttons;
    }

// Below code for serverSpan, targetSpan, dtmfSpan
export function getSpan(id){
    let el = document.getElementById(id);
    if(!(el instanceof HTMLSpanElement)){
        throw new Error(`Element "${id}" not found or not a span element`)
    }
    return el;
}

// Below code for remoteAudio
export function getAudio(id){
    let el = document.getElementById(id)
    if(!(el instanceof HTMLAudioElement)){
        throw new Error(`Element "${id}" not found or not an audio element`)
    }
    return el;
}


// Below code for holdCheck, muteCheck
export function getInput(id){
    let el = document.getElementById(id)
    if(!(el instanceof HTMLInputElement)){
        throw new Error(`Element "${id}" not found or not an input element`)
    }
    return el;
}