const DMX = parent.require('dmx');
const socket = parent.require('socket.io-client');

// set default values
const CONFIG = parent.require('./config/games');

// configuration values
let serverHostname = CONFIG.serverHostname;
let authToken = CONFIG.authToken;

// Provide feedback to the user
function setStatus(status) {
    document.getElementById('status').textContent = status;
}

// Refresh the socket client
function refresh(event) {
    // Gets the hostname entered
    const serverHostnameInput = document.getElementById('serverHostname');
    serverHostname = serverHostnameInput.value;

    // Gets the auth token (password) entered
    const authTokenInput = document.getElementById('authToken');
    authToken = authTokenInput.value;

    // Update the user
    setStatus(`Connecting to ${serverHostname}`);

    // Run the client
    const client = socket(serverHostname, {
        path: '/gallium',
        query: {
            token: authToken,
        },
    });

    // Game server connected
    client.on('connect', () => {
        setStatus('Connected!');
    });

    // Game server disconnected
    client.on('disconnect', () => {
        setStatus('Server disconnected.');
    });

    // Game server connection error handling
    client.on('connect_error', (error) => {
        setStatus(`Unable to connect to ${serverHostname}. ${error}`);
        console.error(error);
    });
    client.on('connect_timeout', (error) => {
        setStatus('Connection timed out');
        console.error(error);
    });

    // Byron level bad code, but its the best I can do right now
    client.on('frame', function(payload) {
        if (parent.parent.universe) {
            parent.parent.universe.update(payload);
        } else {
            console.log("Universe doesn't exist");
        }

        for (const [channel, value] of Object.entries(payload)) {
            const indicator = document.getElementById('channel_' + channel);
            if (value > 0) {
                indicator.classList.add('lit');
            } else {
                indicator.classList.remove('lit');
            }
        }
    });

    client.on('allOn', () => {
        if (parent.parent.universe) {
            parent.parent.universe.updateAll(255);
        } else {
            console.log("Universe doesn't exist");
        }
        
    });

    client.on('allOff', () => {
        if (parent.parent.universe) {
            parent.parent.universe.updateAll(0);
        } else {
            console.log("Universe doesn't exist");
        }
    });
}


// Sets up all of the button hooks for the DMX page
function setup() {
    setStatus('Setting up');
    /* Clicking */
    const serverHostnameInput = document.getElementById('serverHostname');
    serverHostnameInput.value = serverHostname;
    serverHostnameInput.oninput = refresh;

    const authTokenInput = document.getElementById('authToken');
    authTokenInput.value = authToken;
    authTokenInput.oninput = refresh;

    const lastFrame = document.getElementById('lastFrame');
    for (var i = 0; i < 512; i++) {
        var channel = document.createElement("div");
        channel.className = "channel";
        channel.id = "channel_" + i;
        channel.innerHTML = i;
        lastFrame.appendChild(channel)
    }

    document.getElementById('reconnect').onclick = refresh;
    setStatus('Ready to connect');
}

// Set up the page for display
setup();
