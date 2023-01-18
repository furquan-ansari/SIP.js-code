// Initiate Alice side video session

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
}

// Initiate Bob side video session

function setupRemoteMedia1(session) {
  session.sessionDescriptionHandler.peerConnection
    .getReceivers()
    .forEach((receiver) => {
      if (receiver.track) {
        remoteStream.addTrack(receiver.track);
      }
    });
  videoRemoteBob.srcObject = remoteStream;
  videoRemoteBob.play();
}




//  Below code having separate functionality for initiating both beginAlice and beginBob video session:

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
  
  beginAlice.addEventListener("click", function () {
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
    
      
    });
    
    userAgent.delegate = {
            onConnect(){
              alert('On Connect Alice')
              // console.log('Alice video session starts');
            },
            
            onInvite(invitation){
              invitation.accept()
              
              .then(()=>{
               alert('Invitation send to Alice')
               
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
                      setupRemoteMedia1(invitation);
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
    
       beginBob.addEventListener("click", function () {
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
            setupRemoteMedia1(inviter);
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
          alert("Invitation send to Alice");
        })
    
        .catch((error) => {
          console.error(error);
        });
    });