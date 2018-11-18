
// Set up global settings here
let currentSettings = new Settings();
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

    // Get old settings so observers can see what changed
    const oldSettings = currentSettings;

    // Update settings
    currentSettings = newSettings;

    // Notify observers
    for (let i = 0; i < settingsChangedObservers.length; i += 1) {
        settingsChangedObservers[i](currentSettings, oldSettings);
    }
}
