import {SimpleUser} from "./node_modules/sip.js/lib/platform/web/index.js";
import {nameAlice, nameBob, uriAlice, uriBob, webSocketServerAlice, webSocketServerBob} from "./demo_users.js";
import {getButton, getDiv, getInput} from "./demo_func.js";


class SimpleUserWithDataChannel extends SimpleUser{
 constructor(messageInput, sendButton, receiveDiv, server, options = {}){
    super(server, options);
    this.messageInput = messageInput;
    this .sendButton = sendButton;
    this.receiveDiv = receiveDiv;
 }
 get dataChannel(){
    return this._dataChannel;
 }
 set dataChannel(dataChannel){
    this._dataChannel = dataChannel;
    if(!dataChannel){
        return;
    }
    dataChannel.onclose = (event)=>{
        console.log(`[${this.id}] data channel onClose`);
        this.messageInput.disabled = true;
        this.receiveDiv.classList.add("disabled");
        this.sendButton.disabled = true;
    }
    dataChannel.onerror=(event)=>{
        console.error(`[${this.id}] data channel onError`);
        console.error((event).error);
        alert(`[${this.id}] Data channel error.\n` + (event).error)
    }
    dataChannel.onmessage =(event)=>{
        console.log(`[${this.id}] data channel onMessage`);
        const el = document.createElement("p");
        el.classList.add("message");
        const node = document.createTextNode(event.data);
        el.appendChild(node);
        this.receiveDiv.appendChild(el);
        this.receiveDiv.scrollTop = this.receiveDiv.scrollHeight;
    }
    dataChannel.onopen = (event)=>{
        console.log(`[${this.id}] data channel onOpen`);
        this.messageInput.disabled= false;
        this.receiveDiv.classList.remove("disabled");
        this.sendButton.disabled= false;

    }
 }
 send(){
    if(!this.dataChannel){
        const error = "No data Channel";
        console.error(`[${this.id}] failed to send message`);
        console.error(error);
        alert(`[${this.id}] failed to send message.\n`+ error);
        return;
    }
    const msg = this.messageInput.value;
    if(!msg){
        console.log(`[${this.id}] no data to send`);
        return;
    }
    this.messageInput.value = "";
    switch (this.dataChannel.readyState){
        case "connecting":
            console.error("Attempted to send message while data channel connecting");
            break;
        case "open":
            try{
                this.dataChannel.send(msg);
            }
            catch(error){
                console.error(`[${this.id}] failed to send message`);
                console.error(error);
                alert(`[${this.id}] failed to send message.\n`+error)
            }
            break;
        case "closing":
            console.error("Attempted to send message while data channel closing");
            break;
        case "closed":
            console.error("Attempted to send while data channel connection closed");
            break;    
        }
    }

}

const connectAlice = getButton("connectAlice");
const connectBob = getButton("connectBob");
const disconnectAlice = getButton("disconnectAlice");
const disconnectBob = getButton("disconnectBob");
const registerAlice = getButton("registerAlice");
const registerBob = getButton("registerBob");
const unregisterAlice = getButton("unregisterAlice");
const unregisterBob = getButton("unregisterBob");
const beginAlice = getButton("beginAlice");
const beginBob = getButton("beginBob");
const endAlice = getButton("endAlice");
const endBob = getButton("endBob");

const messageAlice = getInput("messageAlice");

const sendAlice = getButton("sendAlice");
const receiveAlice = getDiv("receiveAlice");
const messageBob = getInput("messageBob");
const sendBob = getButton("sendBob");
const receiveBob = getDiv("receiveBob");

const alice = buildUser(
    webSocketServerAlice,
    uriAlice,
    nameAlice,
    uriBob,
    nameBob,
    connectAlice,
    disconnectAlice,
    registerAlice,
    unregisterAlice,
    beginAlice,
    endAlice,
    messageAlice,
    sendAlice,
    receiveAlice
)

const bob = buildUser(
    webSocketServerBob,
    uriBob,
    nameBob,
    uriAlice,
    nameAlice,
    connectBob,
    disconnectBob,
    registerBob,
    unregisterBob,
    beginBob,
    endBob,
    messageBob,
    sendBob,
    receiveBob
)

if(!alice || !bob){
    console.error("Something went wrong");
}

function buildUser(
    webSocketServer,
    aor,
    displayName,
    targetAOR,
    targetName,
    connectButton,
    disconnectButton,
    registerButton,
    unregisterButton,
    beginButton,
    endButton,
    messageInput,
    sendButton,
    receiveDiv,
)
{
    console.log(`Creating "${name}" <${aor}>...`);

    //SimpleUser options
    const options ={
        aor,
        media:{
            constraints:{
                audio: false,
                video: false
            }
        },
        userAgentOptions:{
            displayName
        }
    };

    // Create SimpleUser
    const user = new SimpleUserWithDataChannel(messageInput, sendButton, receiveDiv, webSocketServer, options);

    // SimpleUser delegate
    const delegate ={
        onCallCreated: makeCallCreatedCallback(user, beginButton, endButton),
        onCallReceived: makeCallReceivedCallback(user),
        onCallHangup: makeCallHangupCallback(user,beginButton, endButton),
        onRegistered: makeRegisteredCallback(user, registerButton, unregisterButton),
        onUnregistered: makeUnregisteredCallback(user, registerButton, unregisterButton),
        onServerConnect: makeServerConnectCallback(user, connectButton, disconnectButton, registerButton, beginButton),
        onServerDisconnect: makeServerDisconnectCallback(user, connectButton, disconnectButton, registerButton, beginButton)
    };
    user.delegate = delegate;

     // Setuping all button click listeners
     connectButton.addEventListener(
        "click",
        makeConnectButtonClickListener(user, connectButton, disconnectButton, registerButton, beginButton)
     );

     disconnectButton.addEventListener(
        "click",
        makeDisconnectButtonClickListener(user,connectButton, disconnectButton, registerButton, beginButton)
        );

    registerButton.addEventListener(
        "click",
        makeRegisterButtonClickListener(user, registerButton)
    ); 

    unregisterButton.addEventListener(
        "click",
        makeUnregisterButtonClickListener(user, unregisterButton)
    );

    beginButton.addEventListener(
        "click",
        makeBeginButtonClickListener(user, targetAOR, targetName)
    );

    endButton.addEventListener(
        "click",
        makeEndButtonClickListener(user)
    );

    sendButton.addEventListener(
        "click",()=>user.send()
    );

    connectButton.disabled = false;

    return user;

}

// Helper functions for all callbacks
function makeCallCreatedCallback(
    user,
    beginButton,
    endButton
){
    return()=>{
        console.log(`[${user.id}] call created`);
        beginButton.disabled = true;
        endButton.disabled = false;
}}

function makeCallReceivedCallback(
    user,
){
    return()=>{
        console.log(`[${user.id}] call received`);

        const sessionDescriptionHandlerOptions={
            onDataChannel:(dataChannel)=>{
                console.log(`[${user.id}] data channel created`);
                user.dataChannel = dataChannel;
            }
        }
        user.answer({sessionDescriptionHandlerOptions})
        .catch((error)=>{
            console.error(`[${user.id}] failed to answer call`);
            console.error(error);
            alert(`[${user.id}] Failed to answer call.\n`+ error)
        })
}}

function makeCallHangupCallback(
    user,
    beginButton,
    endButton
){
    return()=>{
        console.log(`[${user.id}] call hangup`);
        beginButton.disabled = !user.isConnected();
        endButton.disabled = true;
}}

function makeRegisteredCallback(
    user, 
    registerButton, 
    unregisterButton
){
    return()=>{
        console.log(`[${user.id}] registered`);
        registerButton.disabled = true;
        unregisterButton.disabled = false;
}}

function makeUnregisteredCallback(
    user, 
    registerButton, 
    unregisterButton 
){
    return()=>{
        console.log(`[${user.id}] unregistered`);
        registerButton.disabled = !user.isConnected();
        unregisterButton.disabled = true;
    
}}

function makeServerConnectCallback(
    user, 
    connectButton, 
    disconnectButton, 
    registerButton, 
    beginButton
){
    return()=>{
    console.log(`[${user.id}] connected`);
    connectButton.disabled = true;
    disconnectButton.disabled = false;
    registerButton.disabled = false;
    beginButton.disabled = false;
    
}}

function makeServerDisconnectCallback(
    user, 
    connectButton, 
    disconnectButton, 
    registerButton, 
    beginButton
){
    return(error)=>{
        console.log(`[${user.id}] disconnected`);
        connectButton.disabled = false;
        disconnectButton.disabled = true;
        registerButton.disabled = true;
        beginButton.disabled = true;
        if (error) {
          alert(`[${user.id}] Server disconnected.\n` + error.message);
        }
    }
}

// Helper functions for all Click Listener
function makeConnectButtonClickListener(
    user,
    connectButton,
    disconnectButton,
    registerButton,
    beginButton
){return ()=>{
    user.connect()
    .then(()=>{
        connectButton.disabled = true;
        disconnectButton.disabled = false;
        registerButton.disabled = false;
        beginButton.disabled = false;
    })
    .catch((error)=>{
        console.error(`[${user.id}] failed to connect`);
        console.error(error);
        alert(`[${user.id}] Failed to connect.|n`+ error);
    })
}
}

function makeDisconnectButtonClickListener(
    user,
    connectButton,
    disconnectButton,
    registerButton,
    beginButton
){return ()=>{
    user.disconnect()
    .then(()=>{
        connectButton.disabled = false;
        disconnectButton.disabled = true;
        registerButton.disabled = true;
        beginButton.disabled = true;
    })
    .catch((error)=>{
        console.error(`[${user.id}] failed to disconnect`);
        console.error(error);
        alert(`[${user.id}] Failed to disconnect.|n`+ error);
    })
}

}

function makeRegisterButtonClickListener(
    user,
    registerButton
){
    return()=>{
        user.register({
            requestDelegate:{
                onReject:(response)=>{
                    console.warn(`[${user.id}] REGISTER rejected`);
                    let message = `Registration of "${user.id}" rejected.\n`;
                    message += `Reason ${response.message.reasonPhrase}\n`;
                    alert(message);
                }
            }
        })
        .then(()=>{
            registerButton.disabled = true;
        })
        .catch((error)=>{
            console.error(`[${user.id}] failed to register`);
            console.error(error);
            alert(`[${user.id}] Failed to register.\n` + error);
        })
    }
}

function makeUnregisterButtonClickListener(
    user, 
    unregisterButton
){
    return()=>{
        user.unregister()
        .then(()=>{
            unregisterButton.disabled = true;
        })
        .catch((error)=>{
            console.error(`[${user.id}] failed to unregister`);
            console.error(error);
            alert(`[${user.id}] Failed to unregister.\n`+ error);
        })
    }
}

function makeBeginButtonClickListener(
    user,
    target,
    targetDisplay
){
    return()=>{
        const sessionDescriptionHandlerOptions = {
            dataChannel: true,
            onDataChannel:(dataChannel)=>{
                console.log(`[${user.id}] data channel created`);
                user.dataChannel = dataChannel;
            }

        }
        user.call(target,{sessionDescriptionHandlerOptions},{
            requestDelegate:{
                onReject:(response)=>{
                    console.warn(`[${user.id}] INVITE rejected`);
                    let message = `Session invitation to "${targetDisplay}" rejected.\n`;
                    message += `Reason: ${response.message.reasonPhrase}\n`;
                    message += `Perhaps "${targetDisplay}" is not connected or registered?\n`;
                    alert(message);
                }
            }
        })
        .catch((error)=>{
            console.error(`[${user.id}] failed to begin session`);
            console.error(error);
            alert(`[${user.id}] Failed to begin session.\n`+error)
        })
    }
}

function makeEndButtonClickListener(
    user
){
    return()=>{
        user.hangup()
        .catch((error)=>{
            console.error(`[${user.id}] failed to end session`);
            console.error(error);
            alert(`[${user.id}] Failed to end session.\n`+ error)
        })
    }
}

