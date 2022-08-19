const { PythonShell } = require('python-shell');//Python実行ライブラリ

const Config = require('../Config.json');

const options = {
    mode: 'json',
    pythonOptions: ['-u'],
    pythonPath: Config.pythonPath
}

let pyshell;

exports.start = (url) => {//----------ニコニコ動画 開始----------//
    return new Promise((resolve) => {
        pyshell = new PythonShell('./py/getNicoVideo.py', options);
        pyshell.on('message', function (data) {
            resolve(data);
        });
        pyshell.send({
            url: url
        });
    });
}

exports.end = () => {//----------ニコニコ動画 終了----------//
    return new Promise((resolve) => {
        pyshell.on('message', function (data) {
            resolve(data);
            pyshell = undefined;
        });
        pyshell.send({});
    });
}