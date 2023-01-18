import {
  Inviter,
  Registerer,
  SessionState,
  UserAgent,
} from "./node_modules/sip.js/lib/api/index.js";
import { getInput, getButton, getVideo } from "./code_func.js";
import {nameAlice, nameBob, uriAlice, uriBob, transportOptions } from "./code_users.js";

// from "./sip-0.21.2.js"
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
  transportOptions,
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
  transportOptions,
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
};

// const connectAlice = document.getElementById('connectAlice')
// function connectAlice(){
//     // e.preventDefault()
//     alert('clicked connect')
// }
// connectAlice.addEventListener("click", connectAlice)

function buildUser(
  transportOptions,
  onInvite,
  invitation,
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
  const userAgentOptions = {
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

  //   Create Server
/*   const transportOptions = {
    server: "wss://example.com:8443",
  };
  console.log("server",transportOptions.server); 
*/

  // Create a user Agent;
/*   const uri = UserAgent.makeURI("sip:alice@example.com");
  if (!uri) {
    throw new Error("Failed to create URI");
  }
console.log("uri",uri); 
*/

  const userAgent = new UserAgent({ transportOptions }, userAgentOptions);
  // Setup handling for incoming INVITE requests

  const delegate = {
    onCallAnswered: makeCallAnsweredCallBack(
      userAgent,
      holdCheckbox,
      muteCheckbox
    ),
    onCallCreated: makeCallCreatedCallback(
      userAgent,
      beginButton,
      endButton,
      holdCheckbox,
      muteCheckbox
    ),
    onCallReceived: makeCallReceivedCallback(userAgent),
    onCallHangup: makeCallHangupCallback(
      userAgent,
      beginButton,
      endButton,
      holdCheckbox,
      muteCheckbox
    ),
    onCallHold: makeCallHoldCallback(userAgent, holdCheckbox),
    onRegistered: makeRegisteredCallback(
      userAgent,
      registerButton,
      unregisterButton
    ),
    onUnregistered: makeUnregisteredCallback(
      userAgent,
      registerButton,
      unregisterButton
    ),
    onServerConnect: makeServerConnectCallback(
      userAgent,
      connectButton,
      disconnectButton,
      registerButton,
      beginButton
    ),
    onServerDisconnect: makeServerDisconnectCallback(
      userAgent,
      connectButton,
      disconnectButton,
      registerButton,
      beginButton
    ),
  };
  userAgent.delegate = delegate;

  // Setuping all button click listeners
  connectButton.addEventListener(
    "click",
    makeConnectButtonClickListener(
      userAgent,
      connectButton,
      disconnectButton,
      registerButton,
      beginButton
    )
  );

  disconnectButton.addEventListener(
    "click",
    makeDisconnectButtonClickListener(
      userAgent,
      connectButton,
      disconnectButton,
      registerButton,
      beginButton
    )
  );

  registerButton.addEventListener(
    "click",
    makeRegisterButtonClickListener(userAgent, registerButton)
  );

  unregisterButton.addEventListener(
    "click",
    makeUnregisterButtonClickListener(userAgent, unregisterButton)
  );

  beginButton.addEventListener(
    "click",
    makeBeginButonClickListener(userAgent, targetAOR, targetName)
  );

  endButton.addEventListener("click", makeEndButtonClickListener(userAgent));

  holdCheckbox.addEventListener(
    "change",
    makeHoldCheckboxClickListener(userAgent, holdCheckbox)
  );

  muteCheckbox.addEventListener(
    "change",
    makeMuteCheckboxClickListener(userAgent, muteCheckbox)
  );
  connectButton.disabled = false;
  return userAgent;
}


function makeCallAnsweredCallBack(userAgent, holdCheckbox, muteCheckbox) {
  return () => {
    console.log(`[${userAgent.id}] call answered`);
    holdCheckboxDisabled(false, holdCheckbox);
    muteCheckboxDisabled(false, muteCheckbox);
  };
}

function makeCallReceivedCallback(userAgent) {
  return () => {
    console.log(`[${userAgent.id}] call received`);
    userAgent.answer().catch((error) => {
      console.error(`[${userAgent.id}] failed to answer call`);
      console.error(error);
      alert(`[${userAgent.id}] Failed to answer call .\n` + error);
    });
  };
}

function makeCallCreatedCallback(
  userAgent,
  beginButton,
  endButton,
  holdCheckbox,
  muteCheckbox
) {
  return () => {
    console.log(`[${userAgent.id}] call created`);
    beginButton.disabled = true;
    endButton.disabled = false;
    holdCheckboxDisabled(true, holdCheckbox);
    muteCheckboxDisabled(true, muteCheckbox);
  };
}

function makeCallHangupCallback(
  userAgent,
  beginButton,
  endButton,
  holdCheckbox,
  muteCheckbox
) {
  return () => {
    console.log(`[${userAgent.id}] call hangup`);
    beginButton.disabled = !userAgent.isConnected();
    endButton.disabled = true;
    holdCheckboxDisabled(true, holdCheckbox);
    muteCheckboxDisabled(true, muteCheckbox);
  };
}

function makeCallHoldCallback(userAgent, holdCheckbox) {
  return (held) => {
    console.log(`[${userAgent.id}] call hold ${held}`);
    holdCheckbox.checked = held;
  };
}

function makeRegisteredCallback(userAgent, registeredButton, unregisterButton) {
  return () => {
    console.log(`[${userAgent.id}] registered`);
    registeredButton.disabled = true;
    unregisterButton.disabled = false;
  };
}

function makeUnregisteredCallback(
  userAgent,
  registeredButton,
  unregisterButton
) {
  return () => {
    console.log(`[${userAgent.id}] unregistered`);
    registeredButton.disabled = !userAgent.isConnected();
    unregisterButton.disabled = true;
  };
}

function makeServerConnectCallback(
  userAgent,
  connectButton,
  disconnectButton,
  registerButton,
  beginButton
) {
  return () => {
    console.log(`[${userAgent.id}] connected`);
    connectButton.disabled = true;
    disconnectButton.disabled = false;
    registerButton.disabled = false;
    beginButton.disabled = false;
  };
}
function makeServerDisconnectCallback(
  userAgent,
  connectButton,
  disconnectButton,
  registerButton,
  beginButton
) {
  return (error) => {
    console.log(`[${userAgent.id}] disconnected`);
    connectButton.disabled = false;
    disconnectButton.disabled = true;
    registerButton.disabled = true;
    beginButton.disabled = true;
    if (error) {
      alert(`[${userAgent.id}] Server disconnected.\n` + error.message);
    }
  };
}

function makeConnectButtonClickListener(
  userAgent,
  connectButton,
  disconnectButton,
  registerButton,
  beginButton
) {
  return () => {
    userAgent
      .connect()
      .then(() => {
        connectButton.disabled = true;
        disconnectButton.disabled = false;
        registerButton.disabled = false;
        beginButton.disabled = false;
      })
      .catch((error) => {
        console.error(`[${userAgent.id}] failed to connect`);
        console.error(error);
        alert(`[${userAgent.id}] Failed to connect.\n` + error);
      });
  };
}

function makeDisconnectButtonClickListener(
  userAgent,
  connectButton,
  disconnectButton,
  registerButton,
  beginButton
) {
  return () => {
    userAgent
      .disconnect()
      .then(() => {
        connectButton.disabled = false;
        disconnectButton.disabled = true;
        registerButton.disabled = true;
        beginButton.disabled = true;
      })
      .catch((error) => {
        console.error(`[${userAgent.id}] failed to disconnect`);
        console.error(error);
        alert(`{${userAgent.id}} Failed to disconnect.\n` + error);
      });
  };
}

// Heper function to setup click handler for all functionality

function makeRegisterButtonClickListener(userAgent, registerButton) {
  return () => {
    userAgent
      .register({
        requestDelegate: {
          onReject: (response) => {
            console.warn(`[${userAgent.id}] REGISTER rejected`);
            let message = `Registration of "${userAgent.id}" rejected.\n`;
            message += `Reason: ${response.message.reasonPhrase}\n`;
            alert(message);
          },
        },
      })
      .then(() => {
        registerButton.disabled = true;
      })
      .catch((error) => {
        console.error(`[${userAgent.id}] failed to register`);
        console.error(error);
        alert(`[${userAgent.id}] Failed to register.\n` + error);
      });
  };
}

function makeUnregisterButtonClickListener(userAgent, unregisterButton) {
  return () => {
    userAgent
      .unregister()
      .then(() => {
        unregisterButton.disabled = true;
      })
      .catch((error) => {
        console.error(`[${userAgent.id}] failed to unregister`);
        console.error(error);
        alert(`[${userAgent.id}] Failed to unregister.\n` + error);
      });
  };
}

function makeBeginButonClickListener(userAgent, target, targetDisplay) {
  return () => {
    userAgent
      .call(target, undefined, {
        requestDelegate: {
          onReject: (response) => {
            console.warn(`[${userAgent.id}] INVITE rejected`);
            let message = `Session invitation to "${targetDisplay}" rejected.\n`;
            message += `Reason: ${response.message.reasonPhrase}\n`;
            message += `Perhaps "${targetDisplay}" is not connect to registered?\n`;
            message += `Or Perhaps "${targetDisplay}" did not grant access to video?\n`;
            alert(message);
          },
        },
        withoutSdp: false,
      })
      .catch((error) => {
        console.error(`[${userAgent.id}] failed to begin session`);
        console.error(error);
        alert(`[${userAgent.id}] Failed to begin session.\n` + error);
      });
  };
}

function makeEndButtonClickListener(userAgent) {
  return () => {
    userAgent.hangup().catch((error) => {
      console.error(`[${userAgent.id}] failed to end session`);
      console.error(error);
      alert(`[${userAgent.id}] Failed to end session.\n` + error);
    });
  };
}

function makeHoldCheckboxClickListener(userAgent, holdCheckbox) {
  return () => {
    if (holdCheckbox.checked) {
      userAgent.hold().catch((error) => {
        holdCheckbox.checked = false;
        console.error(`[${userAgent.id}] failed to hold call`);
        console.error(error);
        alert("Failed to hold call.\n" + error);
      });
    } else {
      userAgent.unhold().catch((error) => {
        holdCheckbox.checked = true;
        console.error(`[${userAgent.id}] failed to unhold call`);
        console.error(error);
        alert("Failed to unhold call.\n" + error);
      });
    }
  };
}

function makeMuteCheckboxClickListener(userAgent, muteCheckbox) {
  return () => {
    if (muteCheckbox.checked) {
      userAgent.mute();
      if (userAgent.isMuted() === false) {
        muteCheckbox.checked = false;
        console.error(`[${userAgent.id}] failed to mute call`);
        alert("Failed to mute call.\n");
      }
    } else {
      userAgent.unmute();
      if (userAgent.isMuted() === true) {
        muteCheckbox.checked = true;
        console.error(`[${userAgent.id}] failed to unmute call`);
        alert("Failed to unmute call .\n");
      }
    }
  };
}

 onInvite(invitation)

   //  An Invitation is a Session
  const incomingSession = invitation;
  // Setup incoming session delegate
 /*  incomingSession.delegate = {
    // Handle incoming REFER request
    onRefer(referral) {},
  }; */
  // Handle incoming session state changes
  incomingSession.stateChange.addListener((newState) => {
    switch (newState) {
      case SessionState.Establishing:
        break;
      case SessionState.Established:
        break;
      case SessionState.Terminated:
        break;
      default:
        break;
    }
  });
  // Handle incoming INVITE request;
  let constrainsDefault = {
    audio: true,
    video: true,
  };
  const options = {
    sessionDescriptionHandlerOptions: {
      constraints: constrainsDefault,
    },
  };
  incomingSession.accept(options);




  // Create a Registerer to register user agent
  const registererOptions = {};
  const registerer = new Registerer(userAgent, registererOptions);
  // Start the user agent
  userAgent.start().then(() => {
    // Register the user agent
    registerer.register();
    // Send an outgoing INVITE request
    const target = UserAgent.makeURI("sip:bob@example.com");
    if (!target) {
      throw new Error("Failed to create target URI");
    }
    // Create a new Inviter
    const inviterOptions = {};
    const inviter = new Inviter(userAgent, target, inviterOptions);
    // An Inviter is a Session
    const outgoingSession = inviter;
    // Setup outgoing session delegate
    outgoingSession.delegate = {
      // Handle incoming REFER request
      onRefer(referral) {},
    };
    // Handle outgoing session state changes
    outgoingSession.stateChange.addListener((newState) => {
      switch (newState) {
        case SessionState.Establishing:
          break;
        case SessionState.Established:
          break;
        case SessionState.Terminated:
          break;
        default:
          break;
      }
    });
    // Send the INVITE request
    inviter
      .invite()
      .then(() => {
        // INVITE SENT
      })
      .catch((error) => {
        // INVITE didn't send
      });
    // Send an outgoing REFER request
    const transferTarget = UserAgent.makeURI("sip:transfer@example.com");
    if (!transferTarget) {
      throw new Error("Failed to create transfer target URI");
    }
    outgoingSession.refer(transferTarget, {
      // Example of extra headers in REFER request
      requestOptions: {
        extraHeaders: ["X-Referred-By-Someone: Username"],
      },
      requestDelegate: {
        onAccept() {},
      },
    });
  });

  // Number of times to attempt reconnection before giving up
  const reconnectionAttempts = 3;
  // Number of seconds to wait between reconnection attempts
  const reconnectionDelay = 4;
  // Used to guard against overlapping reconnection attempts
  let attemptingReconnection = false;
  // If false, reconnection attempts will be discontinued or otherwise prevented
  let shouldBeConnected = true;
  // Function which recursively attempts reconnection
  const attemptReconnection = (reconnectionAttempt = 1) => {
    //  If not intentionally connected, don't reconnect
    if (!shouldBeConnected) {
      return;
    }
    // Reconnection attempt already in progress
    if (attemptingReconnection) {
      return;
    }
    // Reconnection maximum attempts reached
    if (reconnectionAttempt > reconnectionAttempts) {
      return;
    }
    // We're attempting a reconnection
    attemptingReconnection = true;
    setTimeout(
      () => {
        // If not intentionally connected, don't reconnect
        if (!shouldBeConnected) {
          attemptingReconnection = false;
          return;
        }
        // Attempt reconnect
        userAgent
          .reconnect()
          .then(() => {
            // Reconnect attempt succeeded
            attemptingReconnection = false;
          })
          .catch((error) => {
            // Reconnect attempt failed
            attemptingReconnection = false;
            attemptReconnection(++reconnectionAttempt);
          });
      },
      reconnectionAttempt === 1 ? 0 : reconnectionDelay * 1000
    );
  };
  // Handle connection with server established
  userAgent.delegate.onConnect = () => {
    // On connecting register the user agent
    registerer.register().catch((e) => {
      // Register failed
    });
  };
  // Handle connection with server lost
  userAgent.delegate.onDisconnect = (error) => {
    // On disconnect, cleanup invalid registrations
    registerer.unregister().catch((e) => {
      // Unregister failed
    });
    // Only attempt to reconnect if network/server dropped the connection if there is an error
    if (error) {
      attemptReconnection();
    }
  };
  // Monitor network connectivity and attempt reconnection when browser goes online
  window.addEventListener("online", () => {
    attemptReconnection();
  });

