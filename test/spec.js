const Application = require('spectron').Application;
const assert = require('assert');
const electronPath = require('electron'); // Require Electron from the binaries included in node_modules.
const path = require('path');

describe('Application launch', function applicationLaunch() {
    this.timeout(10000);

    beforeEach(function openApplication() {
        this.app = new Application({
            path: electronPath,
            args: [path.join(__dirname, '..')],
        });
        return this.app.start();
    });

    afterEach(function check() {
        if (this.app && this.app.isRunning()) {
            return this.app.stop();
        }
        return this.app.stop();
    });

    it('shows an initial window', function windowCount() {
        return this.app.client.getWindowCount().then((count) => {
            assert.equal(count, 1);
        });
    });
});
// All this file does is ensure that the application opens and closes.
