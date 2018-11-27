
// We need this to be a var so we can have a global settings object
// eslint-disable-next-line no-var
var galliumGlobals = {};

// Set up global settings here
let currentSettings;
const settingsChangedObservers = [];

// Adds an observer for when settings are updated.
// The listener should be a function that takes one argument, the new settings.
function addSettingsChangedObserver(listener) {
    settingsChangedObservers.push(listener);
}

// Called when any setting is updated. Updates the global settings and notifies all observers.
function settingsChanged(newSettings) {
    // Validate the updated settings
    if (newSettings === null) return;

    const oldSettings = currentSettings;

    // Update settings
    currentSettings = newSettings;

    // Notify observers
    for (let i = 0; i < settingsChangedObservers.length; i += 1) {
        settingsChangedObservers[i](currentSettings, oldSettings);
    }
}

// Actually assign here so we can use settingsChanged
currentSettings = new Settings(settingsChanged);

// Set globals
galliumGlobals = {
    currentSettings,
    addSettingsChangedObserver,
};
