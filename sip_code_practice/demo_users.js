function getCookie(key) {
    const re = new RegExp("(?:(?:^|.*;\\s*) ?" + key + "\\s*=\\s*([^;]*).*$)|^.*$");
    return document.cookie.replace(re,"$1");
}

function randomString(length,chars){
    let result = "";
    for(let i = length; i> 0; --i){
        result += chars[Math.round(Math.random()* (chars.length - 1))]
    };
    return result;
}

let token = getCookie("onsipToken");
if(token === ""){
    token = randomString(32,["0123456789", "abcdefghijklmnopqrstuvwxyz", "ABCDEFGHIJKLMNOPQRSTUVWXYZ"].join(""));
    const d = new Date();
    d.setTime(d.getTime()+ 1000*60*60*24);
    document.cookie = "onsipToken=" + token + ";" + "expires=" + d.toUTCString() + ";";
}

const domain = "sipjs.onsip.com";

export const nameAlice ="Alice";
export const uriAlice = "sip:alice" + token + "@" + domain;
export const webSocketServerAlice ="wss://edge.sip.onsip.com";

export const nameBob ="Bob";
export const uriBob = "Sip:bob" + token + "@" + domain;
export const webSocketServerBob = "wss://edge.sip.onsip.com";
