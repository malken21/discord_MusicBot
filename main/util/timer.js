let count = undefined;

function start() {
    count = new Date();
}

function look() {
    if (count == undefined) return undefined;
    let result = new Date() - count;
    return result
}
function end() {
    count = undefined;
}

module.exports = {
    start: start,
    look: look,
    end: end
}