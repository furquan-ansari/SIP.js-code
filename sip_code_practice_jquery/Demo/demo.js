import { getButton, getButtons, getSpan, getAudio, getInput } from "./demo_func.js"; 

const connectBtn = getButton('connect');
const serverSpan = getSpan('server');
const callBtn = getButton('call');
const targetSpan = getSpan('target');
const hangupBtn = getButton('hangup');
const disconnectBtn = getButton('disconnect');
const remoteAudio = getAudio('remoteAudio');
const dtmfSpan = getSpan('dtmf');
const keypad = getButtons('keypad');
const holdCheck = getInput('hold');
const muteCheck = getInput('mute');


//WebSocket server url
const Wss = "wss://edge.sip.onsip.com";
serverSpan.innerHTML = Wss;

//Destination uri
const target = "sip:echo@sipjs.onsip.com";
targetSpan.innerHTML = target;

//Name for demo user
const displayName = "SIP.js Demo"

//SimpleUser delegate

 const simpleUserDelegate = {
    onCallCreated: function () {
        console.log(`${displayName} Call created`);
        callBtn.disabled = true;
        hangupBtn.disabled = false;
        keypadDisabled(true);
        holdCheckboxDisabled(true);
        muteCheckboxDisabled(true);
    },
    onCallAnswered: function () {
        console.log(`${displayName} Call answered`);
        keypadDisabled(false);
        holdCheckboxDisabled(false);
        muteCheckboxDisabled(false);
    },
    onCallHangup: function () {
        console.log(`${displayName} Call hangup`);
        callBtn.disabled = false;
        hangupBtn.disabled = true;
        keypadDisabled(true);
        holdCheckboxDisabled(true);
        muteCheckboxDisabled(true);
    },
    onCallHold: function (held) {
        console.log(`${displayName} Call hold ${held}`);
        holdCheck.checked = held;
}
};

// SimpleUser options
const simpleUserOptions = {
    delegate: simpleUserDelegate,
    media: {
        remote: {
            audio: remoteAudio
        }
    },
    userAgentOptions: {
        // logLevel: "debug",
        displayName: displayName
    }
};

// SimpleUser Construction
var simpleUser = new SIP.Web.SimpleUser(Wss, simpleUserOptions)


// Add click listener to connect button
connectBtn.addEventListener("click", function () {
    connectBtn.disabled = true;
    disconnectBtn.disabled = true;
    callBtn.disabled = true;
    hangupBtn.disabled = true;
    simpleUser
        .connect()
        .then(function () {
        connectBtn.disabled = true;
        disconnectBtn.disabled = false;
        callBtn.disabled = false;
        hangupBtn.disabled = true;
    })
    .catch(function (error) {
        connectBtn.disabled = false;
        console.error(`${simpleUser.id} failed to connect`);
        console.error(error);
        alert("Failed to connect.\n" + error);
    });
});

// Add click listener to call button
callBtn.addEventListener("click", function () {
    callBtn.disabled = true;
    hangupBtn.disabled = true;
    simpleUser
        .call(target, {
        inviteWithoutSdp: false
    }).catch(function (error) {
        console.error(`${simpleUser.id} failed to place call`);
        console.error(error);
        alert("Failed to place call.\n" + error);
    });
});

// Add click listener to hangup button
hangupBtn.addEventListener("click", function () {
    callBtn.disabled = true;
    hangupBtn.disabled = true;
    simpleUser.hangup().catch(function (error) {
        console.error(`${simpleUser.id} failed to hangup call`);
        console.error(error);
        alert("Failed to hangup call.\n" + error);
    });
});

// Add click listener to disconnect button
disconnectBtn.addEventListener("click", function () {
    connectBtn.disabled = true;
    disconnectBtn.disabled = true;
    callBtn.disabled = true;
    hangupBtn.disabled = true;
    simpleUser
        .disconnect()
        .then(function () {
        connectBtn.disabled = false;
        disconnectBtn.disabled = true;
        callBtn.disabled = true;
        hangupBtn.disabled = true;
    }).catch(function (error) {
        console.error(`${simpleUser.id} failed to disconnect `);
        console.error(error);
        alert("Failed to disconnect.\n" + error);
    });
});


// Keypad helper function
const keypadDisabled = function (disabled) {
    keypad.forEach(function (button) { return (button.disabled = disabled); });
    dtmfSpan.innerHTML = "";
};

// Add change listener to hold checkbox
holdCheck.addEventListener("change", function () {
    if (holdCheck.checked) {
        // Checkbox is checked..
        simpleUser.hold().catch(function (error) {
            holdCheck.checked = false;
            console.error(`${simpleUser.id} failed to hold call `);
            console.error(error);
            alert("Failed to hold call.\n" + error);
        });
    }
    else {
        // Checkbox is not checked..
        simpleUser.unhold()["catch"](function (error) {
            holdCheck.checked = true;
         console.error(`${simpleUser.id} failed to unhold `);
            console.error(error);
            alert("Failed to unhold call.\n" + error);
        });
    }
});

// Hold helper function
var holdCheckboxDisabled = function (disabled) {
    holdCheck.checked = false;
    holdCheck.disabled = disabled;
};

// Add change listener to mute checkbox
muteCheck.addEventListener("change", function () {
    if (muteCheck.checked) {
        // Checkbox is checked..
        simpleUser.mute();
        if (simpleUser.isMuted() === false) {
            muteCheck.checked = false;
            console.error(`${simpleUser.id} failed to mute call `);
            alert("Failed to mute call.\n");
        }
    }
    else {
        // Checkbox is not checked..
        simpleUser.unmute();
        if (simpleUser.isMuted() === true) {
            muteCheck.checked = true;
            console.error(`${simpleUser.id} failed to unmute call `);
            alert("Failed to unmute call.\n");
        }
    }
});

// Mute helper function
const muteCheckboxDisabled = function (disabled) {
    muteCheck.checked = false;
    muteCheck.disabled = disabled;
};

// Enable the connect button
// Add click listeners to keypad buttons
connectBtn.disabled = false;
keypad.forEach(function (button) {
    button.addEventListener("click", function () {
        var tone = button.textContent;
        if (tone) {
            simpleUser.sendDTMF(tone).then(function () {
                dtmfSpan.innerHTML += tone;
            });
        }
    });
});