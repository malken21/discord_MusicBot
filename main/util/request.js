const https = require("https");
const http = require("http");
const xmljson = require('xmljson');

const Config = require('../Config.json');

exports.getGAS = (type, text) => {//----------Google Apps Script に接続----------//
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

exports.stream = (url) => {//----------ストリーム----------//
    return new Promise((resolve) => {
        https.get(url, {
            highWaterMark: 53
        }, (res) => {
            resolve(res);
        })
    })
}

exports.NVInfo = async (id) => {//----------ニコニコ動画の詳細情報を取得----------//
    return new Promise((resolve) => {
        http.get(`http://ext.nicovideo.jp/api/getthumbinfo/${id}`, (res) => {
            let data = "";
            res.setEncoding("utf8");
            res.on("data", (chunk) => {
                data += chunk;
            });
            res.on("end", () => {
                xmljson.to_json(data, function (err, json) {
                    if (err) {
                        return err;
                    }
                    resolve(json.nicovideo_thumb_response);
                });
            });
        });
    });
}