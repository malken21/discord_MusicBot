let client;

let list = [];//再生する曲一覧
let loop = false;//ループ再生trueかfalseかどうか
let ChannelID = undefined;

const reboot = require('../util/reboot');
const timer = require('../util/timer');
const req = require('../util/request');
const cmd = require('../util/command');
const send = require('../util/send');
const text = require('../util/text');
const sc = require('./SoundCloud');
const tw = require('./Twitter');
const Config = require("../../config.json");

const { ActivityType } = require('discord.js');


function ready(data) {
    client = data;
}

const url = require('url');

function onCommand(interaction) {
    const channel = interaction.member.voice.channel;
    if (!channel) {
        send.reply("ボイスチャンネルに入ってから入力してください", interaction);
        return;
    }
    switch (interaction.commandName) {
        case "loop"://-----loop-----//
            LoopCMD(interaction);
            break;
        case "skip"://-----skip-----//
            SkipCMD(interaction);
            break;
        case "stop"://-----stop-----//
            StopCMD(interaction);
            break;
        case "list"://-----list-----//
            ListCMD(interaction);
            break;
        case "timer"://-----timer-----//
            TimerCMD(interaction);
            break;
        case "reboot"://-----reboot-----//
            RebootCMD(interaction);
            break;

        case "join"://-----join-----//
            JoinCMD(channel, interaction);
            break;
        case "delete"://-----delete-----//
            DeleteCMD(channel, interaction);
            break;
        case "play"://-----play-----//
            PlayCMD(channel, interaction);
            break;
        case "playlist"://-----playlist-----//
            PlaylistCMD(channel, interaction);
            break;
    }
}
function onContextMenu(interaction) {
    const channel = interaction.member.voice.channel;
    if (!channel) {
        send.reply("ボイスチャンネルに入ってから入力してください", interaction);
        return;
    }
    switch (interaction.commandName) {
        case "PlayFile":
            PlayFileCTM(channel, interaction);
            break;
    }

}

async function PlayFileCTM(channel, interaction) {
    const message = interaction.targetMessage;

    let name = "";

    if (message.attachments.length !== 0) {
        let data = [];
        message.attachments.forEach((value) => {
            if (["audio/mpeg", "audio/ogg", "audio/x-wav", "video/mp4"].includes(value.contentType)) {
                const message = `https://discord.com/channels/${interaction.guildId}/${interaction.channelId}/${interaction.targetId}`
                data.push({ url: value.url, title: value.name, message: message, type: "File" });
                name = `${name}\n[${value.name}](${message})を再生します`
            }
        });
        if (data.length === 0) {
            send.playfile("そのファイルは再生できません", interaction);
            return;
        }
        list = list.concat(data);//リストに追加
        if (ChannelID === undefined) {
            join(channel);
            play(interaction);
        }
        send.playfile(name, interaction);
    }
}

//----------メイン稼働部----------//

let isPlaying = false;
let isError = false;

async function play(interaction) {//----------メイン関数----------//
    console.log(list[0])
    if (list[0] == undefined) return;
    try {
        switch (list[0].type) {
            case "YouTube":
                if (!YouTube()) return;
                break;
            case "File":
                if (!File()) return;
                break;
            case "NicoVideo":
                if (!NicoVideo()) return;
                break;
            case "SoundCloud":
                if (!SoundCloud()) return;
                break;
            case "Twitter":
                if (!File()) return;
                break;
        }
        client.user.setActivity(list[0].title, {
            type: ActivityType.Streaming,
            url: "https://www.youtube.com/watch?v="
        });
        isPlaying = true;
        timer.start();

        do {
            await delay(1000);
            if (isError) {
                console.log(error);

                client.channels.cache.get(interaction.channelId).send(`エラーが発生しました ${text.ListURL(list[0])}`)
                list.shift();
                if (list.length === 0) {
                    req.stop()
                    reset();
                } else {
                    play(interaction);
                }
                return
            }
        }
        while (isPlaying == true)

        if (loop) {
            if (interaction.guild.channels.cache.get(ChannelID).members.size === 1) {
                list = [];
            }
        } else {
            list.shift();
        }
        if (list.length === 0) {
            req.stop()
            reset();
        } else {
            await delay(1000);
            play(interaction);
        }
    } catch (error) {
        console.log(error);

        client.channels.cache.get(interaction.channelId).send(`エラーが発生しました ${text.ListURL(list[0])}`)
        list.shift();
        if (list.length === 0) {
            reset();
        } else {
            play(interaction);
        }
    }
}

function reset() {
    client.user.setActivity();
    remove();
    loop = false;
}
function join(channel) {
    ChannelID = channel.id;
}
function remove() {
    ChannelID = undefined;
    timer.end();
}
function delay(ms) {//-----待機-----//
    return new Promise(function (resolve) {
        setTimeout(resolve, ms);
    });
}



async function YouTube() {//----------YouTube----------//
    console.log(list[0])
    console.log("Play!!", "YouTube", `https://youtu.be/${list[0].id}`);
    return await req.play(`https://youtu.be/${list[0].id}`, ChannelID);
}
async function File() {//----------ファイル----------//
    console.log("Play!!", "File", list[0].url);
    return await req.play(list[0].url, ChannelID);
}
async function NicoVideo() {//----------ニコニコ----------//
    console.log("Play!!", "NicoVideo", list[0].url);
    return await req.play(list[0].url, ChannelID);
}
async function SoundCloud() {
    console.log("Play!!", "SoundCloud", list[0].url);
    return await req.play(list[0].url, ChannelID);
}
//----------スラッシュコマンド----------//

function LoopCMD(interaction) {//-----loop-----コマンド//
    if (list.length === 0) {
        send.reply("音楽が再生されていません", interaction);
    } else {
        loop = !loop;
        if (loop) {
            send.reply("ループ再生ON", interaction);
        } else {
            send.reply("ループ再生OFF", interaction);
        }
        console.log("loop: " + loop)
    }
}
function SkipCMD(interaction) {//-----skip-----コマンド//
    if (list.length === 0) {
        send.reply("音楽が再生されていません", interaction);
    } else {
        send.reply("スキップしました", interaction);
        if (loop === true) list.shift()
        req.skip();
    }
}
function StopCMD(interaction) {//-----stop-----コマンド//
    if (list.length === 0) {
        send.reply("音楽が再生されていません", interaction);
    } else {
        send.reply("ストップしました", interaction);
        list = [];
        req.skip();
    }
}

async function ListCMD(interaction) {//-----list-----コマンド//
    console.log(list);
    if (list.length === 0) {
        send.reply("音楽が再生されていません", interaction);
    } else {
        await interaction.deferReply();
        let name = "";
        let time = "";
        for (let i = 0; i < list.length && i < 5; i++) {
            const item = list[i];
            switch (item.type) {
                case "YouTube":
                    const result_GV = await req.getGAS("getVideo", item.id);
                    if (result_GV.error) {
                        break;//エラー(修正予定)
                    }
                    name = `${name}\n[${text.embedTitle(item.title)}](https://youtube.com/watch?v=${item.id})`;
                    time = `${time}\n${text.PT(result_GV.getVideo.data.duration)}`;
                    break;
                case "File":
                    name = `${name}\n[${text.embedTitle(item.title)}](${item.message})`;
                    time = `${time}\n\u200B`;
                    break;
                case "NicoVideo":
                    name = `${name}\n[${text.embedTitle(item.title)}](${item.url})`;
                    time = `${time}\n${item.duration}`;
                    break;
                case "SoundCloud":
                    name = `${name}\n[${text.embedTitle(item.title)}](${item.url})`;
                    time = `${time}\n${item.duration}`;
                    break;
                case "Twitter":
                    name = `${name}\n[${text.embedTitle(item.title)}](${item.message})`;
                    time = `${time}\n${item.duration}`;
                    break;
            }
        }
        send.list(name, time, interaction)
    }
}
function JoinCMD(channel, interaction) {//-----join-----コマンド//
    send.reply("ボイスチャンネルに入りました", interaction);
    join(channel)
}
function DeleteCMD(channel, interaction) {//-----delete-----コマンド//
    send.reply("ボイスチャンネルから退出しました", interaction);
    if (list.length === 0) {
        join(channel)
        remove();
    } else {
        list = [];
        req.skip();
    }
}
async function PlayCMD(channel, interaction) {//-----play-----コマンド//
    await interaction.deferReply();
    const name = interaction.options.getString(`name`);
    if (name.indexOf(`https://`) != 0) {
        const result_SV = await req.getGAS("searchVideo", name);
        if (result_SV.error) {
            send.editReply("音楽が見つかりませんでした", interaction);
            return;
        }
        let result_GV = await req.getGAS("getVideo", result_SV.searchVideo.main.id);
        if (result_GV.error) {
            send.editReply("音楽が見つかりませんでした", interaction);
            return;
        }
        result_GV.getVideo.main.type = "YouTube";
        list.push(result_GV.getVideo.main);//リストに追加
        if (ChannelID === undefined) {
            join(channel);
            play(interaction);
        }
        cmd.play(result_GV.getVideo, interaction);
    } else {
        const URLdata = url.parse(name);
        switch (URLdata.host) {
            case "youtube.com"://----------YouTube----------//
            case "www.youtube.com":
            case "youtu.be":
            case "music.youtube.com":
                const split = name.split(/watch\?v=|youtu.be\//)
                if (!split[1]) {
                    send.editReply("そのURLは再生できません", interaction);
                } else {
                    const slice = split[1].slice(0, 11);
                    let result_GV = await req.getGAS("getVideo", slice);
                    if (result_GV.error) {
                        send.editReply("そのURLは再生できません", interaction);
                        return;
                    }
                    result_GV.getVideo.main.type = "YouTube";
                    list.push(result_GV.getVideo.main);//リストに追加
                    if (ChannelID === undefined) {
                        join(channel);
                        play(interaction);
                    }
                    cmd.play(result_GV.getVideo, interaction);
                }
                return;
            case "www.nicovideo.jp"://----------ニコニコ----------//
            case "nicovideo.jp":
            case "nico.ms":

                let result;
                if (URLdata.host === "nico.ms") {
                    result = await req.NVInfo(URLdata.pathname.split("/")[1]);
                } else {
                    result = await req.NVInfo(URLdata.pathname.split("/")[2]);
                }


                if (result['$'].status != "ok") {
                    send.editReply("そのURLは再生できません", interaction);
                    return;
                }
                const thumb = result.thumb;

                list.push({ url: thumb.watch_url, title: thumb.title, duration: thumb.length, type: "NicoVideo" });//リストに追加
                if (ChannelID === undefined) {
                    join(channel);
                    play(interaction);
                }
                send.play(thumb.title, thumb.watch_url, thumb.thumbnail_url, thumb.length, interaction);
                return;


            case "soundcloud.com":
                const info = await sc.info(name);
                if (info) {
                    list.push({ url: info.url, title: info.title, duration: info.duration, type: "SoundCloud" });
                    if (ChannelID === undefined) {
                        join(channel);
                        play(interaction);
                    }
                    send.play(info.title, info.url, info.thumbnail, info.duration, interaction);
                } else {
                    send.editReply("そのURLは再生できません", interaction);
                }
                return;


            case "twitter.com":
                const VideoDeta = await tw.getVideoURL(URLdata);
                if (!VideoDeta) {
                    send.editReply("再生できるものがありません", interaction);
                    return;
                }
                list.push({ url: VideoDeta.url, title: VideoDeta.title, message: name, duration: VideoDeta.duration, type: "Twitter" });//リストに追加
                if (ChannelID === undefined) {
                    join(channel);
                    play(interaction);
                }
                send.play(VideoDeta.title, VideoDeta.title, VideoDeta.image, VideoDeta.duration, interaction);
                return
            default:
                list.push({ url: name, title: name, message: name, type: "File" });//リストに追加
                if (ChannelID === undefined) {
                    join(channel);
                    play(interaction);
                }
                send.editReply(`[${name}](${name})を再生します`, interaction);
        }
    }
}
async function PlaylistCMD(channel, interaction) {//-----playlist-----コマンド//
    await interaction.deferReply();
    let name = interaction.options.getString(`name`);
    if (name.indexOf(`https://`) != 0) {
        let result_SL = await req.getGAS("searchList", name);
        if (result_SL.error) {
            send.editReply("プレイリストが見つかりませんでした", interaction);
            return;
        }
        for (let i = 0; i < result_SL.searchList.main.length; i++) {
            result_SL.searchList.main[i].type = "YouTube";
        }
        list = list.concat(result_SL.searchList.main);//リストに追加
        if (ChannelID === undefined) {
            join(channel);
            play(interaction);
        }
        cmd.playlist(result_SL, interaction);
    } else {
        let data = name.split(/&list=|\?list=/);
        if (data[1]) data = data[1].slice(0, 34);
        if (!data) {
            send.editReply("プレイリストが見つかりませんでした", interaction);
            return;
        }
        let result_GL = await req.getGAS("getList", data);
        if (result_GL.error) {
            send.editReply("プレイリストが見つかりませんでした", interaction);
            return;
        }
        for (let i = 0; i < result_GL.getList.main.length; i++) {
            result_GL.getList.main[i].type = "YouTube";
        }
        list = list.concat(result_GL.getList.main);//リストに追加
        if (ChannelID === undefined) {
            join(channel);
            play(interaction);
        }
        cmd.playlist(result_GL, interaction);
    }
}

async function TimerCMD(interaction) {//-----timer-----コマンド//
    const data = timer.look()
    if (data == undefined) {
        send.reply("音楽は再生されていません", interaction);
    } else {
        send.reply(`現在の曲 再生からの経過時間\n${text.ms(data)}`, interaction);
    }
}

async function RebootCMD(interaction) {//-----reboot-----コマンド//
    send.reply("再起動します..", interaction);
    reboot.start();
}

module.exports = {
    ready: ready,
    onCommand: onCommand,
    onContextMenu: onContextMenu
}


//----------Server----------//
const hostname = Config.ip.Nodejs;
const port = Config.port.Nodejs;

// httpモジュールを読み込む
const http = require('http');

// サーバーを作成する
const server = http.createServer((req, res) => {
    // レスポンスヘッダーにContent-Typeを設定する
    res.setHeader('Content-Type', 'text/plain');
    // リクエストのパスによってレスポンスボディを変える
    if (req.url === '/end') {
        // /endパスの場合
        isPlaying = false;
        console.log("end!!")
        res.write('end');
    } else if (req.url === '/error') {
        // /errorパスの場合
        res.write('error');
        isError = true;
        console.log("error!!")
    } else {
        // それ以外のパスの場合
        res.write('404');
    }
    // レスポンスを終了する
    res.end();
});

server.listen(port, hostname, () => {
    console.log(`Server Start!!`);
});
//----------Server----------//