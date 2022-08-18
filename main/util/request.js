const https = require("https");
const http = require("http");
const Config = require('../Config.json');

const { PythonShell } = require('python-shell');//Python実行ライブラリ
const xmljson = require('xmljson');

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
        https.get(url, (res) => resolve(res))
    })
}

exports.getNicoVideo = async (url) => {//----------ニコニコ動画のダウンロードリンク取得----------//
    return new Promise((resolve) => {
        const pyshell = new PythonShell('./py/getNicoVideo.py', {
            mode: 'text',
            args: [url],
            pythonPath: Config.pythonPath
        });
        pyshell.on('message', function (data) {
            resolve(data);
        });
    })
}

exports.getNicoInfo = async (id) => {//----------ニコニコ動画の詳細情報を取得----------//
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