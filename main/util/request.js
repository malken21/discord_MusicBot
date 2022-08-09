const request = require('request');
const Config = require('../Config.json');

exports.getGAS = (type, text) => {
    return new Promise((resolve) => {
        request(`${Config.GAS}?${type}=${encodeURIComponent(text)}`, (error, response, body) => {
            resolve(JSON.parse(body));
        });
    });
}
exports.getNicoVideo = async (id) => {
    return new Promise((resolve) => {

        const options = {
            url: 'https://secure.nicovideo.jp/secure/login?site=niconico',
            method: 'POST',
            form: { "mail": Config.NicoVideo.mail, "pass": Config.NicoVideo.pass }
        }
        request(options, (error, response, body) => {
            resolve(body);
        });


        /*request(`http://www.nicovideo.jp/watch/sm#${id}`, (error, response, body) => {
            resolve(body);
        });*/
    });
}
exports.stream = (url) => {
    return request(url)
}

function test1() {
    return new Promise((resolve) => {
        const options = {
            url: 'https://secure.nicovideo.jp/secure/login?site=niconico',
            method: 'POST',
            form: { "mail": Config.NicoVideo.mail, "pass": Config.NicoVideo.pass }
        }
        request(options, (error, response, body) => {
            resolve(body);
        });
    });
}

function test2(id) {
    return new Promise((resolve) => {
        request(`http://www.nicovideo.jp/watch/${id}`, (error, response, body) => {
            resolve(body);
        });
    });
}

function test3(id) {
    return new Promise((resolve) => {
        request(` http://flapi.nicovideo.jp/api/getflv?v=${id}`, (error, response, body) => {
            resolve(body);
        });
    });
}