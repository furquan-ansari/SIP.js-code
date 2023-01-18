export function getButton(id){
    let el = document.getElementById(id);
    if(!(el instanceof HTMLButtonElement)){
        throw new Error(`element "${id}" not found or not a button element `)
    }
    return el;
}


export function getVideo(id){
    let el = document.getElementById(id);
    if(!(el instanceof HTMLVideoElement)){
        throw new Error(`Element "${id}" not found or not a video element`)
    }
    return el;
}

export function getInput(id){
    let el = document.getElementById(id);
    if(!(el instanceof HTMLInputElement)){
        throw new Error(`Element "${id}" not found or not a input element`)
    }
    return el;
}