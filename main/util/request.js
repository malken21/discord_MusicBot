const https = require("https");
const Config = require('../Config.json');


exports.getGAS = (type, text) => {
    return new Promise((resolve) => {
        https.get(`${Config.GAS}?${type}=${encodeURIComponent(text)}`, (res) => {
            https.get(res.headers.location, (res) => {
                let data = "";
                res.setEncoding("utf8");
                res.on("data", (chunk) => {
                    data += chunk;
                });
                res.on("end", () => {
                    resolve(JSON.parse(data));
                });
            });

        });
    });
}

exports.stream = (url) => {
    return new Promise((resolve) => {
        https.get(url, (res) => resolve(res))
    })
}