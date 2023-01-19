// Initiate video session for both end

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

// delegate

userAgent.delegate = {
    onConnect() {
    alert("On Connect for both Alice and Bob");
    },

    onInvite(invitation) {
        invitation
           .accept()
           .then(() => {
             alert("Invitation sent to both Alice and Bob.");
             
             invitation.stateChange.addListener((state) => {
               console.log(`Session state changed to ${state}`);
               switch (state) {
                 case "Initial":
                   break;
                 case "Establishing":
                   break;
                 case "Established":
                   setupRemoteMedia(invitation);
                   console.log("Established for both Alice and Bob");
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
           })
           .catch((error) => {
             console.error(`[${userAgent.id}] failed to begin session for both Alice and Bob`);
             console.error(error);
             alert(`[${userAgent.id}] Failed to begin session for both Alice and Bob.\n` + error);
           });
       },
    }

// Begin alice

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
      
        inviter
          .invite()
          .then(() => {
            alert("Invitation sent to both Alice and Bob.");
            console.log("Inviter.invite");
          })
          .catch((error) => {
            console.error(error);
          });
          beginBob.click;
        });

//  Begin Bob
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
                  video: videoRemoteAlice,
                },
                /*   local:{
                    video: videoLocalAlice
                  } */
                };
              
                const inviter = new SIP.Inviter(userAgent1, uri1, options);
              
                inviter
                  .invite()
                  .then(() => {
                    alert("Invitation sent to both Alice and Bob.");
                    console.log("Inviter.invite");
                  })
                  .catch((error) => {
                    console.error(error);
                  });
                  beginAlice.click;
        });
