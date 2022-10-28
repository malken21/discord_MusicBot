const eaw = require("eastasianwidth");

exports.PT = (duration) => {
    let H, M, S;
    H = Number(duration.split(/PT|H/g)[1]);
    if (isNaN(H)) {
        M = Number(duration.split(/PT|M/g)[1]);
        H = "";
    } else {
        M = Number(duration.split(/H|M/g)[1]);
        H = H + ":";
    }
    if (isNaN(M)) {
        S = Number(duration.split(/PT|S/g)[1]);
        M = "0:";
    } else {
        S = Number(duration.split(/M|S/g)[1]);
        M = M + ":";
    }
    if (isNaN(S)) {
        S = "00";
    } else {
        S = `${S}`.padStart(2, "0");
    }
    return `${H}${M}${S}`;
}

exports.embedTitle = (before) => {
    let after = before;
    if (eaw.length(before) > 48) {
        after = eaw.slice(before, 0, 45) + "..."
    }
    return after;
}

exports.ListURL = (item) => {
    switch (item.type) {
        case "YouTube":
            return `https://youtube.com/watch?v=${item.id}`
        case "File":
        case "NicoVideo":
            return item.url
    }
}

exports.ms = (ms) => {
    const m = Math.floor(ms / 60000);
    const s = Math.floor(ms / 1000) % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
}