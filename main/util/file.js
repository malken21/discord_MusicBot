const fs = require("fs");

function stream(file_name) {
    return fs.createReadStream(file_name);
}

function pipe(file_name, stream) {
    return new Promise((resolve) => {
        stream.pipe(fs.createWriteStream(file_name));
        stream.on("end", () => {
            resolve(true)
        });
    });
}

module.exports = {
    stream: stream,
    pipe: pipe
};