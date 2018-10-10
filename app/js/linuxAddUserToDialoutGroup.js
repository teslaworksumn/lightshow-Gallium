const sudo = require('sudo-prompt');

/* Linux users need to have appropriate permissions to be able to write
 * to the serial port that our USB DMX PRO device is connected to.
 * This function adds the current user to the dialout group which gives write
 * access to the correct serial ports (usually /dev/ttyUSBx).
 */

exports.addUserToGroup = function addUserToGroup() {
    if (process.platform === 'linux') {
        const options = {
            name: 'now this is podracing',
        };
        const command = `adduser ${process.env.USER} dialout`;
        sudo.exec(command, options,
            (error, stdout, stderr) => {
                if (error) {
                    // An error will usually occur here if the password prompt
                    // is canceled without inputting a password.  Throwing an
                    // error here brings up an OS error dialog which is not
                    // wanted.
                }
                // potentially add std output to to log file?
                // console.log(`stdout: ${stdout}`);
            });
    }
};
