const https = require("https");
const http = require("http");


const Config = require('../../config.json');

exports.play = (url, voice_channel) => {//----------音楽再生----------//
    return new Promise((resolve) => {
        // オプションを設定
        const options = {
            hostname: Config.ip.Python,
            port: Config.port.Python,
            path: `/play?voice_channel=${voice_channel}&url=${Buffer.from(url).toString('base64')}`,
            method: 'GET'
        };
        console.log(options)

        // リクエストを作成
        const req = http.request(options, res => {
            console.log(`statusCode: ${res.statusCode}`);
            // レスポンスを受け取る
            res.on('data', d => {
                process.stdout.write(d);
                resolve(true);
            });
        });
        // エラー処理
        req.on('error', error => {
            console.error(error);
            resolve(false);
        });
        // リクエストを終了
        req.end();
    });
}
exports.skip = () => {//----------音楽スキップ----------//
    return new Promise((resolve) => {
        // オプションを設定
        const options = {
            hostname: Config.ip.Python,
            port: Config.port.Python,
            path: "/skip",
            method: 'GET'
        };
        console.log(options)

        // リクエストを作成
        const req = http.request(options, res => {
            console.log(`statusCode: ${res.statusCode}`);
            // レスポンスを受け取る
            res.on('data', d => {
                process.stdout.write(d);
                resolve(true);
            });
        });
        // エラー処理
        req.on('error', error => {
            console.error(error);
            resolve(false);
        });
        // リクエストを終了
        req.end();
    });
}
exports.stop = () => {//----------音楽停止----------//
    return new Promise((resolve) => {
        // オプションを設定
        const options = {
            hostname: Config.ip.Python,
            port: Config.port.Python,
            path: "/stop",
            method: 'GET'
        };
        console.log(options)

        // リクエストを作成
        const req = http.request(options, res => {
            console.log(`statusCode: ${res.statusCode}`);
            // レスポンスを受け取る
            res.on('data', d => {
                process.stdout.write(d);
                resolve(true);
            });
        });
        // エラー処理
        req.on('error', error => {
            console.error(error);
            resolve(false);
        });
        // リクエストを終了
        req.end();
    });
}

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