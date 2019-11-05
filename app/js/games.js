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

// Process and update the display with the game server's status update
function processUpdate(update) {
    document.getElementById('lastUpdated').textContent = new Date();
    document.getElementById('serverStatus').textContent = update.status || '-';
    document.getElementById('clients').textContent = update.clients || '-';
    document.getElementById('currentGame').textContent = update.game || '-';
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
        setClients('-');
        setCurrentGame('-');
        setServerStatus('-');
    });

    // Game server connection error handling
    client.on('connect_error', (error) => {
        setStatus(`Unable to connect to ${serverHostname}. ${error}`);
    });
    client.on('connect_timeout', (error) => {
        setStatus('Connection timed out');
    });
    client.on('connect_timeout', (error) => {
        setStatus('Reconnected!');
    });

    // Listen for status updates (current game, number of clients)
    client.on('statusUpdate', processUpdate);

    // Byron level bad code, but its the best I can do right now
    client.on('frame', parent.universe.update);
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

    document.getElementById('reconnect').onclick = refresh;
    setStatus('Ready to connect');
}

// Set up the page for display
setup();
