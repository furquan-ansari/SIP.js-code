// import { Inviter, Registerer, SessionState, UserAgent } from "sip.js";
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
const videoRemoteBob = getVideo("videoRemoteBob");

/* 
const alice= buildUser(
  connectAlice,
  disconnectAlice,
  registerAlice,
  unregisterAlice,
  beginAlice,
  endAlice,
  videoRemoteAlice
)

const bob= buildUser(
  connectBob,
  disconnectBob,
  registerBob,
  unregisterBob,
  beginBob,
  endBob,
  videoRemoteBob
)

if(!alice || ! bob){
  console.log('Something went wrong');
} 
*/

/* function buildUser(
connectButton,
disconnectButton,
registerButton,
unregisterButton,
beginButton,
endButton,
videoRemoteElement
) */

//   Create Server
const transportOptions = {
  server: "wss://edge.sip.onsip.com",
};
console.log("server", transportOptions.server);

/*
 * Create a user agent
*/



const uri = SIP.UserAgent.makeURI("sip:alice@example.com");

if (!uri) {
  throw new Error("Failed to create URI");
}
const userAgentOptions = {
  uri,
  /* ... */
};
const userAgent = new SIP.UserAgent({transportOptions},userAgentOptions);

/*
 * Setup handling for incoming INVITE requests
 */

userAgent.delegate = {
  onConnect(){
    console.log('user connect');
  },
  onInvite(invitation) {
    // An Invitation is a Session
    const incomingSession = invitation;
    // Setup incoming session delegate
    incomingSession.delegate = {
      // Handle incoming REFER request.
      onRefer(referral) {
        // ...
      },
    };
    // Handle incoming session state changes.
    incomingSession.stateChange.addListener((newState) => {
      switch (newState) {
        case SessionState.Establishing:
          // Session is establishing.
          break;
        case SessionState.Established:
          // Session has been established.
          break;
        case SessionState.Terminated:
          // Session has terminated.
          break;
        default:
          break;
      }
    });
    // Handle incoming INVITE request.
    let constrainsDefault = {
      audio: true,
      video: false,
    };
    const options = {
      sessionDescriptionHandlerOptions: {
        constraints: constrainsDefault,
      },
    };
    incomingSession.accept(options);
  },
};
/*
 * Create a Registerer to register user agent
 */
const registererOptions = {
  /* ... */
};
const registerer = new SIP.Registerer(userAgent, registererOptions);
/*
 * Start the user agent
 */
userAgent.start()
.then(() => {
  // Register the user agent
  registerer.register();
  // Send an outgoing INVITE request
  const target = SIP.UserAgent.makeURI("sip:bob@example.com");
  if (!target) {
    throw new Error("Failed to create target URI.");
  }
  // Create a new Inviter
  const inviterOptions = {
    /* ... */
  };
  const inviter = new SIP.Inviter(userAgent, target, inviterOptions);
  // An Inviter is a Session
  const outgoingSession = inviter;
  // Setup outgoing session delegate
 /*  outgoingSession.delegate = {
    // Handle incoming REFER request.
    onRefer(referral) {
      // ...
    },
  }; */
  // Handle outgoing session state changes.
  outgoingSession.stateChange.addListener((newState) => {
    switch (newState) {
      case SessionState.Establishing:
        // Session is establishing.
        break;
      case SessionState.Established:
        // Session has been established.
        break;
      case SessionState.Terminated:
        // Session has terminated.
        break;
      default:
        break;
    }
  });
  // Send the INVITE request
  inviter
    .invite()
    .then(() => {
      // INVITE sent
    })
    .catch((error) => {
      // INVITE did not send
    });
  // Send an outgoing REFER request
  const transferTarget = SIP.UserAgent.makeURI("sip:transfer@example.com");
  if (!transferTarget) {
    throw new Error("Failed to create transfer target URI.");
  }
  outgoingSession.refer(transferTarget, {
    // Example of extra headers in REFER request
    requestOptions: {
      extraHeaders: ["X-Referred-By-Someone: Username"],
    },
    requestDelegate: {
      onAccept() {
        // ...
      },
    },
  });
});


// Setuping all button click listeners

connectAlice.addEventListener(
  "click",
  makeConnectAliceClickListener(
    userAgent,
    connectAlice,
    disconnectAlice,
    registerAlice,
    beginAlice
  )
)

function makeConnectAliceClickListener(
  userAgent,
  connectAlice,
  disconnectAlice,
  registerAlice,
  beginAlice
){
  return()=>{
    userAgent.start()
    .then(()=>{
      alert('connected')
      connectAlice.disabled = true;
      disconnectAlice.disabled = false;
      registerAlice.disabled = false;
      beginAlice.disabled = false;      
    })
    .catch((error)=>{
      console.error(`[${userAgent.id}] failed to connect Alice`);
      console.error(error);
      alert(`[${userAgent.id}] Failed to connect Alice.\n`+ error)
    })
  }
}