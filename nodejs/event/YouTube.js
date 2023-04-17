
function stream(url) {//----------YouTube 開始----------//
    return new Promise((resolve) => {
        resolve(data);
    });
}

function isAllow(url) {
    return new Promise(async (resolve) => {
        try {
            resolve(true);
        } catch (error) {
            resolve(false);
        }
    });
}

module.exports = {
    stream: stream,
    isAllow: isAllow
}