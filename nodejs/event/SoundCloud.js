const scdl = require('soundcloud-downloader').default
const text = require('../util/text');

const CLIENT_ID = require('../Config.json').SoundCloud_CLIENT_ID;

exports.stream = (url) => {//----------SoundCloud 開始----------//
    return new Promise((resolve) => {
        scdl.download(url, CLIENT_ID).then(stream => resolve(stream))
    });
}

exports.info = async (url) => {//----------SoundCloud 開始----------//
    return new Promise((resolve) => {
        try {
            scdl.getInfo(url, CLIENT_ID).then((data) => {
                if (data.artwork_url != null) {
                    resolve({ url: data.permalink_url, title: data.title, thumbnail: data.artwork_url, duration: text.ms(data.full_duration) });
                } else {
                    resolve({ url: data.permalink_url, title: data.title, thumbnail: data.user.avatar_url, duration: text.ms(data.full_duration) });
                }
            });
        } catch {
            resolve(false);
        }
    });
}