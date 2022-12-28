const ytdl = require('ytdl-core');

function stream(url) {//----------YouTube 開始----------//
    return new Promise((resolve) => {
        const data = ytdl(url, {
            filter: "audioonly",
            quality: 'highestaudio',
            highWaterMark: 1 << 25,
            requestOptions: { timeout: 500 }
        });
        resolve(data);
    });
}

function isAllow(url) {
    return new Promise(async (resolve) => {
        try {
            await ytdl.getBasicInfo(url);
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