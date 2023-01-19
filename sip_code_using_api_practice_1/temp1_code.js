
const remoteStream = new MediaStream();

function setupRemoteMedia(session, videoElement) {
  session.sessionDescriptionHandler.peerConnection
    .getReceivers()
    .forEach((receiver) => {
      if (receiver.track) {
        remoteStream.addTrack(receiver.track);
      }
    });
  videoElement.srcObject = remoteStream;
  videoElement.play();
}

userAgent1.delegate = {
  onInvite(invitation) {
    invitation
    .accept()
    .then(() => {
      alert("Invitation sent.");
    })
    .catch((error) => {
      console.error(`[${userAgent.id}] Failed to begin session.\n` + error);
    });
    invitation.stateChange.addListener((state) => {
      console.log(`Session state changed to ${state}`);
      switch (state) {
        case "Established":
          setupRemoteMedia(invitation, videoRemoteBob);
          break;
        case "Terminating":
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
  };
  const inviter = new SIP.Inviter(userAgent, uri2, options);
  inviter.stateChange.addListener((state) => {
    console.log(`Session state changed to ${state}`);
    switch (state) {
      case "Established":
        setupRemoteMedia(inviter, videoRemoteAlice);
        break;
      case "Terminating":
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
    alert("Invitation sent.");
  })
  .catch((error) => {
    console.error(error);
  });
});


userAgent.delegate = {
    onInvite(invitation) {
      invitation
      .accept()
      .then(() => {
        alert("Invitation sent.");
      })
      .catch((error) => {
        console.error(`[${userAgent1.id}] Failed to begin session.\n` + error);
      });
      invitation.stateChange.addListener((state) => {
        console.log(`Session state changed to ${state}`);
        switch (state) {
          case "Established":
            setupRemoteMedia(invitation, videoRemoteBob);
            break;
          case "Terminating":
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
    };
    const inviter = new SIP.Inviter(userAgent1, uri2, options);
    inviter.stateChange.addListener((state) => {
      console.log(`Session state changed to ${state}`);
      switch (state) {
        case "Established":
          setupRemoteMedia(inviter, videoRemoteAlice);
          break;
        case "Terminating":
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
      alert("Invitation sent.");
    })
    .catch((error) => {
      console.error(error);
    });
  });
