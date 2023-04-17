const childProcess = require('child_process');
const { Reboot_Command } = require(`../Config.json`)

function start() {
    childProcess.exec(Reboot_Command, (error, stdout, stderr) => {
        console.log(`Reboot\n${error}\n${stdout}\n${stderr}`)
    });
}

module.exports = { start: start }