import { getButton, getVideo } from "./code_func.js";


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
const videoRemoteAlice = getVideo("videoRemoteAlice");
// const videoLocalAlice = getVideo("videoLocalBob")
const videoRemoteBob = getVideo("videoRemoteBob");
// const videoLocalBob = getVideo("videoLocalBob")

let token = getCookie("onsipToken");
if (token === "") {
  token = randomString(
    32,
    [
      "0123456789",
      "abcdefghijklmnopqrstuvwxyz",
      "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    ].join("")
  );
  const d = new Date();
  d.setTime(d.getTime() + 1000 * 60 * 60 * 24); // expires in 1 day
  document.cookie =
    "onsipToken=" + token + ";" + "expires=" + d.toUTCString() + ";";
}

function getCookie(key) {
  const re = new RegExp(
    "(?:(?:^|.*;\\s*) ?" + key + "\\s*=\\s*([^;]*).*$)|^.*$"
  );
  return document.cookie.replace(re, "$1");
}

function randomString(length, chars) {
  let result = "";
  for (let i = length; i > 0; --i) {
    result += chars[Math.round(Math.random() * (chars.length - 1))];
  }
  return result;
}

const domain = "sipjs.onsip.com";

const nameAlice = "Alice";
const uriAlice = "sip:alice." + token + "@" + domain;
const webSocketServerAlice = "wss://edge.sip.onsip.com";

const nameBob = "Bob";
const uriBob = "sip:bob." + token + "@" + domain;
const webSocketServerBob = "wss://edge.sip.onsip.com";

const uri1 = SIP.UserAgent.makeURI(uriAlice);
const uri2 = SIP.UserAgent.makeURI(uriBob);

const transportOptions = {
  server: "wss://edge.sip.onsip.com",
  traceSip: true,
};

const userAgentOptions = {
  transportOptions,
  uri: uri1,
  /* ... */
};
const userAgentOptions1 = {
  transportOptions,
  uri: uri2,
  /* ... */
};

// Initiate Alice and Bob side video session


const remoteStream = new MediaStream();

function setupRemoteMedia(session) {
session.sessionDescriptionHandler.peerConnection
.getReceivers()
.forEach((receiver) => {
if (receiver.track) {
remoteStream.addTrack(receiver.track);
}
});
videoRemoteAlice.srcObject = remoteStream;
videoRemoteAlice.play();
videoRemoteBob.srcObject = remoteStream;
videoRemoteBob.play();
}

// Below code for connect user

const userAgent = new SIP.UserAgent(userAgentOptions);
const userAgent1 = new SIP.UserAgent(userAgentOptions1);

console.log(userAgent);
console.log(userAgent1);

connectAlice.addEventListener(
  "click",
  makeConnectAliceClickListener(userAgent, connectAlice)
);

function makeConnectAliceClickListener(userAgent, connectAlice) {
  return () => {
    userAgent
      .start()
      .then(() => {
        alert("Alice connected");
        connectAlice;
      })
      .catch((error) => {
        console.error(`[${userAgent.id}] failed to connect Alice`);
        console.error(error);
        alert(`[${userAgent.id}] Failed to connect Alice.\n` + error);
      });
  };
}

userAgent.delegate = {
  onConnect() {
    console.log("Alice connect");
  },
  onInvite(invitation) {
    invitation
      .accept()

      .then(() => {
        alert("Invitation send to Bob");
        
      });
  },
};

connectBob.addEventListener(
  "click",
  makeConnectBobClickListener(userAgent1, connectBob)
);

function makeConnectBobClickListener(userAgent1, connectBob) {
  return () => {
    userAgent1
      .start()
      .then(() => {
        alert("Bob connected");
        connectBob;
      })
      .catch((error) => {
        console.error(`[${userAgent1.id}] failed to connect Alice`);
        console.error(error);
        alert(`[${userAgent1.id}] Failed to connect Alice.\n` + error);
      });
  };
}


const registerer = new SIP.Registerer(userAgent);
const registerer1 = new SIP.Registerer(userAgent1);

registerAlice.addEventListener(
  "click",
  makeRegisterAliceClickListener(userAgent, registerAlice)
);

function makeRegisterAliceClickListener(userAgent, registerAlice) {
  return () => {
    registerer
      .register()
      .then(() => {
        alert("Alice registered");
        registerAlice;
      })
      .catch((error) => {
        console.error(`[${userAgent.id}] failed to connect Alice`);
        console.error(error);
        alert(`[${userAgent.id}] Failed to connect Alice.\n` + error);
      });
  };
}

registerBob.addEventListener(
  "click",
  makeRegisterBobClickListener(userAgent1, registerBob)
);

function makeRegisterBobClickListener(userAgent1, registerBob) {
  return () => {
    registerer1
      .register()
      .then(() => {
        alert("Bob registered");
        registerBob;
      })
      .catch((error) => {
        console.error(`[${userAgent1.id}] failed to connect Alice`);
        console.error(error);
        alert(`[${userAgent1.id}] Failed to connect Alice.\n` + error);
      });
  };
}


// Below code for Begin Alice and Bob Video session on same time:

userAgent1.delegate = {
  
    onConnect() {
      alert("On Connect Bob");
      // console.log('Alice video session starts');
    },
    
    onInvite(invitation) {
     invitation
        .accept()
  
        .then(() => {
          alert("Invitation send to Bob.");
          
        })
  
        .catch((error) => {
          console.error(`[${userAgent.id}] failed to begin session Alice`);
          console.error(error);
          alert(`[${userAgent.id}] Failed to begin session Alice.\n` + error);
        });
  
      invitation.stateChange.addListener((state) => {
        console.log(`Session state changed to ${state}`);
        switch (state) {
          case "Initial":
            break;
          case "Establishing":
            break;
          case "Established":
            setupRemoteMedia(invitation);
            console.log("Established at Bob side");
            break;
          case "Terminating":
          // fall through
          case "Terminated":
            cleanupMedia();
            break;
          default:
            throw new Error("Unknown session state.");
        }
      });
    },
  };

  beginAlice.addEventListener("click", function (){
    let constrainsDefault = {
      audio: false,
      video: true,
    };
  
    const options = {
      sessionDescriptionHandlerOptions: {
        constraints: constrainsDefault,
      },
      remote: {
        video: videoRemoteAlice,
      },
      /*   local:{
          video: videoLocalAlice
        } */
      };
  
      const inviter = new SIP.Inviter(userAgent, uri2, options);
    
      inviter.stateChange.addListener((state) => {
        console.log(`Session state changed to ${state}`);
        switch (state) {
          case "Initial":
            break;
          case "Establishing":
            break;
          case "Established":
            setupRemoteMedia(inviter);
            console.log("Established at Bob side");
            break;
          case "Terminating":
          // fall through
          case "Terminated":
            cleanupMedia();
            break;
          default:
            throw new Error("Unknown session state.");
        }
      });
    
      inviter
        .invite()
    
        .then(() => {
          alert("Invitation send to Bob..");
          console.log(alert, "Inviter.invite");
        })
    
        .catch((error) => {
          console.error(error);
        });

    beginBob.click
  });

userAgent.delegate = {
    onConnect(){
      alert('On Connect Alice')
      // console.log('Alice video session starts');
    },
    
    onInvite(invitation){
      invitation.accept()
      
      .then(()=>{
       alert('Invitation send to Alice.')
       
     })
   
     .catch((error)=>{
       console.error(`[${userAgent1.id}] failed to begin session Bob`);
       console.error(error);
       alert(`[${userAgent1.id}] Failed to begin session Bob.\n`+ error)
     })
    
        invitation.stateChange.addListener((state) => {
          console.log(`Session state changed to ${state}`);
          switch (state) {
            case "Initial":
              break;
            case "Establishing":
              break;
            case "Established":
              setupRemoteMedia(invitation);
             console.log('Established at Alice side');
              break;
            case "Terminating":
              // fall through
            case "Terminated":
              // cleanupMedia();
              break;
            default:
              throw new Error("Unknown session state.");
          }
            });
      
      
      }
  };
  
  beginBob.addEventListener("click", function (){
      let constrainsDefault = {
        audio: false,
        video: true,
      };
    
      const options = {
        sessionDescriptionHandlerOptions: {
          constraints: constrainsDefault,
        },
        remote: {
          video: videoRemoteBob,
        },
        /*   local:{
                    video: videoLocalBob
                  } */
      };
    
      const inviter = new SIP.Inviter(userAgent1, uri1, options);
    
      inviter.stateChange.addListener((state) => {
        console.log(`Session state changed to ${state}`);
        switch (state) {
          case "Initial":
            break;
          case "Establishing":
            break;
          case "Established":
            setupRemoteMedia(inviter);
            console.log("Established at Alice side");
            break;
          case "Terminating":
          // fall through
          case "Terminated":
            cleanupMedia();
            break;
          default:
            throw new Error("Unknown session state.");
        }
      });
    
      inviter
        .invite()
    
        .then(() => {
          alert("Invitation send to Alice..");
        })
    
        .catch((error) => {
          console.error(error);
        });
      
      beginAlice.click
  });
  


    

 // Below code for End Alice Video session:

function cleanupMedia() {
  videoRemoteAlice.srcObject = null;
  videoRemoteAlice.pause();
  videoRemoteBob.srcObject = null;
  videoRemoteBob.pause();
}

endAlice.addEventListener("click", function() {
  cleanupMedia();
  endBob.click();
});

endBob.addEventListener("click", function() {
  cleanupMedia();
  endAlice.click();
});




// Below code for unregistered users
unregisterAlice.addEventListener(
  "click",
  makeUnRegisterAliceClickListener(userAgent, unregisterAlice)
);

function makeUnRegisterAliceClickListener(userAgent, unregisterAlice) {
  return () => {
    registerer
      .unregister()
      .then(() => {
        alert("Alice unregistered");

        unregisterAlice;
      })
      .catch((error) => {
        console.error(`[${userAgent.id}] failed to connect Alice`);
        console.error(error);
        alert(`[${userAgent.id}] Failed to connect Alice.\n` + error);
      });
  };
}

unregisterBob.addEventListener(
  "click",
  makeUnRegisterBobClickListener(userAgent1, unregisterBob)
);

function makeUnRegisterBobClickListener(userAgent1, unregisterBob) {
  return () => {
    registerer1
      .unregister()
      .then(() => {
        alert("Bob unregistered");
        unregisterBob;
      })
      .catch((error) => {
        console.error(`[${userAgent1.id}] failed to connect Alice`);
        console.error(error);
        alert(`[${userAgent1.id}] Failed to connect Alice.\n` + error);
      });
  };
}

// Below code for disconnect users
disconnectAlice.addEventListener(
  "click",
  makeDisconnectAliceClickListener(userAgent, disconnectAlice)
);

function makeDisconnectAliceClickListener(userAgent, disconnectAlice) {
  return () => {
    userAgent
      .stop()
      .then(() => {
        alert("Alice disconnect");
        disconnectAlice;
      })
      .catch((error) => {
        console.error(`[${userAgent.id}] failed to disconnect`);
        console.error(error);
        alert(`{${userAgent.id}} Failed to disconnect.\n` + error);
      });
  };
}

disconnectBob.addEventListener(
  "click",
  makeDisconnectBobClickListener(userAgent1, disconnectBob)
);

function makeDisconnectBobClickListener(userAgent1, disconnectBob) {
  return () => {
    userAgent1
      .stop()
      .then(() => {
        alert("Bob disconnect");
        disconnectBob;
      })
      .catch((error) => {
        console.error(`[${userAgent1.id}] failed to disconnect`);
        console.error(error);
        alert(`{${userAgent1.id}} Failed to disconnect.\n` + error);
      });
  };
}



