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
                resolve(xmlTojson(data).nicovideo_thumb_response);
            });
        });
    });
}

function xmlTojson(xmlArray) {
    let parser = new DOMParser();
    let doc = parser.parseFromString(xmlArray, "application/xml");
    let nl = doc.getElementsByTagName("item");
    let matches = nl.length;

    let jsonData = [];
    for (let i = 0; i < matches; i++) {
        let e = nl.item(i);
        let youso = [];
        for (let j = 0; j < Math.floor(e.childNodes.length / 2); j++) {
            let type = e.getElementsByTagName(e.childNodes[1 + j * 2].nodeName);
            youso.push(type);
        }
        let buf = { type: youso[0].item(0).textContent, japan: youso[1].item(0).textContent, us: youso[2].item(0).textContent };
        jsonData.push(buf);
    }
    return jsonData;
}