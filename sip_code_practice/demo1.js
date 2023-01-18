import {SimpleUser} from "./node_modules/sip.js/lib/platform/web/index.js";
import { getButton, getInput, getVideo } from "./demo_func.js";
import {
  nameAlice,
  nameBob,
  uriAlice,
  uriBob,
  webSocketServerAlice,
  webSocketServerBob,
} from "./demo_users.js";

// debugger;
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
const holdAlice = getInput("holdAlice");
const holdBob = getInput("holdBob");
const muteAlice = getInput("muteAlice");
const muteBob = getInput("muteBob");
const videoLocalAlice = getVideo("videoLocalAlice");
const videoLocalBob = getVideo("videoLocalBob");
const videoRemoteAlice = getVideo("videoRemoteAlice");
const videoRemoteBob = getVideo("videoRemoteBob");

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
  holdAlice,
  muteAlice,
  videoLocalAlice,
  videoRemoteAlice
);

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
   holdBob,
   muteBob,
   videoLocalBob,
   videoRemoteBob
 );

if (!alice || !bob) {
  console.log("Something went wrong");
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
  holdCheckbox,
  muteCheckbox,
  videoLocalElement,
  videoRemoteElement
 ) {
  console.log(`Creating "${name}" <${aor}>...`);

  // SimplerUser Options
  const options = {
    aor,
    media: {
      constraints: {
        audio: true,
        video: true,
      },
      local: {
        video: videoLocalElement,
      },
      remote: {
        video: videoRemoteElement,
      },
    },
    userAgentOptions: {
      displayName,
    },
  };

  // Create SimpleUser
  const user = new SimpleUser(webSocketServer, options);

  // SimpleUser delegate
  const delegate = {
    onCallAnswered: makeCallAnsweredCallBack(user, holdCheckbox, muteCheckbox),
    onCallCreated: makeCallCreatedCallback(
      user,
      beginButton,
      endButton,
      holdCheckbox,
      muteCheckbox
    ),
    onCallReceived: makeCallReceivedCallback(user),
    onCallHangup: makeCallHangupCallback(
      user,
      beginButton,
      endButton,
      holdCheckbox,
      muteCheckbox
    ),
    onCallHold: makeCallHoldCallback(user, holdCheckbox),
    onRegistered: makeRegisteredCallback(
      user,
      registerButton,
      unregisterButton
    ),
    onUnregistered: makeUnregisteredCallback(
      user,
      registerButton,
      unregisterButton
    ),
    onServerConnect: makeServerConnectCallback(
      user,
      connectButton,
      disconnectButton,
      registerButton,
      beginButton
    ),
    onServerDisconnect: makeServerDisconnectCallback(
      user,
      connectButton,
      disconnectButton,
      registerButton,
      beginButton
    ),
  };
  user.delegate = delegate;

  // Setuping all button click listeners
  connectButton.addEventListener(
    "click",
    makeConnectButtonClickListener(
      user,
      connectButton,
      disconnectButton,
      registerButton,
      beginButton
    )
  );

  disconnectButton.addEventListener(
    "click",
    makeDisconnectButtonClickListener(
      user,
      connectButton,
      disconnectButton,
      registerButton,
      beginButton
    )
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
    makeBeginButonClickListener(user, targetAOR, targetName)
  );

  endButton.addEventListener("click", makeEndButtonClickListener(user));

  holdCheckbox.addEventListener(
    "change",
    makeHoldCheckboxClickListener(user, holdCheckbox)
  );

  muteCheckbox.addEventListener(
    "change",
    makeMuteCheckboxClickListener(user, muteCheckbox)
  );

  connectButton.disabled = false;
  return user;
}

// Helper functions for all callbacks
const holdCheckboxDisabled = (disabled, holdCheckbox)=>{
   holdCheckbox.checked = false;
   holdCheckbox.disabled = disabled;
}

const muteCheckboxDisabled = (disabled, muteCheckbox)=>{
muteCheckbox.checked = false;
muteCheckbox.disabled = disabled;
}

function makeCallAnsweredCallBack(
   user,
   holdCheckbox,
   muteCheckbox
){return ()=>{
   console.log(`[${user.id}] call answered`);
   holdCheckboxDisabled(false, holdCheckbox);
   muteCheckboxDisabled(false, muteCheckbox);
 }
};
 

 function makeCallReceivedCallback(
   user
){
   return()=>{
      console.log(`[${user.id}] call received`);
      user.answer().catch((error)=>{
         console.error(`[${user.id}] failed to answer call`);
         console.error(error);
         alert(`[${user.id}] Failed to answer call .\n` + error);
      })
   }
}

function makeCallCreatedCallback(
   user,
   beginButton,
   endButton,
   holdCheckbox,
   muteCheckbox
){
   return()=>{
      console.log(`[${user.id}] call created`);
      beginButton.disabled= true;
      endButton.disabled = false;
      holdCheckboxDisabled(true, holdCheckbox);
      muteCheckboxDisabled(true, muteCheckbox)
   }
}

function makeCallHangupCallback(
   user,
   beginButton,
   endButton,
   holdCheckbox,
   muteCheckbox
){
   return ()=>{
      console.log(`[${user.id}] call hangup`);
      beginButton.disabled = !user.isConnected();
      endButton.disabled = true;
      holdCheckboxDisabled(true, holdCheckbox);
      muteCheckboxDisabled(true, muteCheckbox);
   }}


function makeCallHoldCallback(
   user, holdCheckbox
){
   return(held)=>{
      console.log(`[${user.id}] call hold ${held}`);
      holdCheckbox.checked = held;
   }
}

function makeRegisteredCallback(
   user,
   registeredButton,
   unregisterButton
)
   {return()=>{
      console.log(`[${user.id}] registered`);
      registeredButton.disabled = true;
      unregisterButton.disabled = false;
   }}


function makeUnregisteredCallback(
   user,
   registeredButton,
   unregisterButton
)
  { return()=>{
      console.log(`[${user.id}] unregistered`);
      registeredButton.disabled = !user.isConnected();
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
   }
 }
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
      if(error){
         alert(`[${user.id}] Server disconnected.\n` + error.message)
      }
   }
}

function makeConnectButtonClickListener(
   user,
   connectButton,
   disconnectButton,
   registerButton,
   beginButton
){
   return()=>{
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
   alert(`[${user.id}] Failed to connect.\n`+ error)
})
   }
}

function makeDisconnectButtonClickListener(
   user,
   connectButton,
   disconnectButton,
   registerButton,
   beginButton
){
   return()=>{
      user.disconnect()
      .then(()=>{
         connectButton.disabled = false;
         disconnectButton.disabled = true;
         registerButton.disabled = true;
         beginButton.disabled = true;
      })
      .catch ((error)=>{
         console.error(`[${user.id}] failed to disconnect`);
         console.error(error);
         alert(`{${user.id}} Failed to disconnect.\n`+ error)
      })
   }
}

// Heper function to setup click handler for all functionality

function makeRegisterButtonClickListener(
   user, registerButton
){
   return()=>{
      user.register({
         requestDelegate:{
            onReject:(response)=>{
               console.warn(`[${user.id}] REGISTER rejected`);
               let message = `Registration of "${user.id}" rejected.\n`;
               message += `Reason: ${response.message.reasonPhrase}\n`;
               alert(message);
            }
         }
      }).then(()=>{
         registerButton.disabled = true;
      }).catch((error)=>{
         console.error(`[${user.id}] failed to register`);
         console.error(error);
         alert(`[${user.id}] Failed to register.\n`+ error)
      })
   }
}

function makeUnregisterButtonClickListener(user, unregisterButton){
   return ()=>{
      user.unregister()
      .then(()=>{
         unregisterButton.disabled = true;
      })
      .catch((error)=>{
         console.error(`[${user.id}] failed to unregister`);
         console.error(error);
         alert(`[${user.id}] Failed to unregister.\n`+ error)
      })
   }
}

function makeBeginButonClickListener(user, target, targetDisplay){
return()=>{
   user.call(target,undefined,{
      requestDelegate:{
         onReject:(response)=>{
            console.warn(`[${user.id}] INVITE rejected`);
            let message = `Session invitation to "${targetDisplay}" rejected.\n`;
            message += `Reason: ${response.message.reasonPhrase}\n`;
            message += `Perhaps "${targetDisplay}" is not connect to registered?\n`;
            message += `Or Perhaps "${targetDisplay}" did not grant access to video?\n`;
            alert(message);
         }
      },
      withoutSdp: false
   }).catch((error)=>{
      console.error(`[${user.id}] failed to begin session`);
      console.error(error);
      alert(`[${user.id}] Failed to begin session.\n`+ error);
   })
}
}

function makeEndButtonClickListener(user){
   return()=>{
user.hangup().catch((error)=>{
   console.error(`[${user.id}] failed to end session`);
   console.error(error);
   alert(`[${user.id}] Failed to end session.\n`+ error);
})
   }
}

function makeHoldCheckboxClickListener(user, holdCheckbox){
   return()=>{
      if(holdCheckbox.checked){
         user.hold().catch((error)=>{
            holdCheckbox.checked = false;
            console.error(`[${user.id}] failed to hold call`);
            console.error(error);
            alert("Failed to hold call.\n"+ error);
         })
      }
      else{
         user.unhold().catch((error)=>{
            holdCheckbox.checked = true;
            console.error(`[${user.id}] failed to unhold call`);
            console.error(error);
            alert("Failed to unhold call.\n" + error);
         })
      }
   }
}

function makeMuteCheckboxClickListener(user,muteCheckbox){
   return()=>{
      if(muteCheckbox.checked){
         user.mute();
         if(user.isMuted()===false){
            muteCheckbox.checked = false;
            console.error(`[${user.id}] failed to mute call`);
            alert("Failed to mute call.\n")
         }
      } 
      else{
         user.unmute();
         if(user.isMuted()=== true){
            muteCheckbox.checked = true;
            console.error(`[${user.id}] failed to unmute call`);
            alert("Failed to unmute call .\n")
         }
      }
   }
}

