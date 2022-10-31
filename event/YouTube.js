const ytdl = require('ytdl-core');

exports.stream = (url) => {//----------YouTube 開始----------//
    return new Promise((resolve) => {
        const stream = ytdl(url, {
            filter: "audioonly",
            quality: 'highestaudio',
            highWaterMark: 1 << 25,
            requestOptions: { timeout: 500 }
        });
        resolve(stream)
    });
}