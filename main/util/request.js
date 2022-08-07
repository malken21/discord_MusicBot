const request = require('request');
const Config = require('../Config.json');

exports.getGAS = (type, text) => {
    return new Promise((resolve) => {
        request(`${Config.GAS}?${type}=${encodeURIComponent(text)}`, (error, response, body) => {
            resolve(JSON.parse(body));
        });
    });
}