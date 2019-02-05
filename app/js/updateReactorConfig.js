const parent = window.parent;
const fse = parent.require('fs-extra');
const path = parent.require('path');

let configPath = '';

function ensureConfigExists() {
    const emptyConfigPath = path.join(path.resolve(), 'app/config/emptyReactorConfig.json');
    const newConfigPath = path.join(path.resolve(), 'app/config/reactorConfig.json');

    if (!fse.existsSync(newConfigPath)) {
        fse.copyFileSync(emptyConfigPath, newConfigPath);
    }
    return newConfigPath;
}

function getConfig() {
    // write JSON file to reactorConfig.json
    return new Promise(((resolve, reject) => {
        const path = ensureConfigExists();
        resolve(path);
    }));
}

function updateConfig() {
    getConfig().then((path) => {
        updateButton.setAttribute('disabled', '');
        label.innerText = 'Fetching Google Sheet...';

        // hardcode
        const gScriptUrl = 'https://script.google.com/macros/s/AKfycbzegfc-iPQfqQ0yL0Mlm4KZLoKK0F2Bki6HySvhna-_vOtK2W_j/exec';
        configPath = path;
        return fetch(gScriptUrl);
    }).then((response) => {
        label.innerText = 'Converting response to JSON...';
        return response.json();
    }).then((configJson) => {
        label.innerText = 'Saving config...';
        return fse.writeFileSync(configPath, JSON.stringify(configJson, null, 2));
    }).then(() => {
        label.innerText = 'Ready!';
        updateButton.removeAttribute('disabled', '');
    }).catch((err) => {
        label.innerText = 'Error occured. Try again';
        updateButton.removeAttribute('disabled', '');
    });
}
