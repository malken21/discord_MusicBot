
const { entersState, AudioPlayerStatus, createAudioResource, createAudioPlayer, joinVoiceChannel, StreamType } = require('@discordjs/voice');

const ytdl = require("ytdl-core");

let client;

let list = [];//再生する曲一覧
let loop = false;//ループ再生trueかfalseかどうか
let VoiceChannel = undefined;//joinVoiceChannel
let ChannelID = undefined;

const req = require('../util/request');
const command = require('../util/command');
const send = require('../util/send');

const player = createAudioPlayer();

exports.ready = (data) => {
    client = data;
}

const url = require('url');


exports.onCommand = (interaction) => {
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
exports.onContextMenu = (interaction) => {
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

    let text = "";

    if (message.attachments.length !== 0) {
        let data = [];
        message.attachments.forEach((value) => {
            if (["audio/mpeg", "audio/ogg", "audio/x-wav", "video/mp4"].includes(value.contentType)) {
                const message = `https://discord.com/channels/${interaction.guildId}/${interaction.channelId}/${interaction.targetId}`
                data.push({ title: value.name, url: value.url, message: message, type: "File" });
                text = `${text}\n[${value.name}](${message})を再生します`
            }
        });
        if (data.length === 0) {
            send.playfile("そのファイルは再生できません", interaction);
            return;
        }
        list = list.concat(data);//リストに追加
        if (VoiceChannel === undefined) {
            join(channel);
            play(interaction);
        }
        send.playfile(text, interaction);
    }
}

//----------メイン稼働部----------//

async function play(interaction) {//----------メイン関数----------//
    try {
        switch (list[0].type) {
            case "YouTube":
                YouTube();
                break;
            case "File":
                File();
                break;
        }
        client.user.setActivity(list[0].title, { type: "LISTENING" });

        await entersState(player, AudioPlayerStatus.Playing, 10 * 1000);
        await entersState(player, AudioPlayerStatus.Idle, 24 * 60 * 60 * 1000);

        if (loop) {
            if (interaction.guild.channels.cache.get(ChannelID).members.size === 1) {
                list = [];
            }
        } else {
            list.shift();
        }
        if (list.length === 0) {
            reset();
        } else {
            play(interaction);
        }
    } catch (error) {
        console.log(error);
        client.channels.cache.get(interaction.channelId).send(`エラーが発生しました ${list[0].title}`)
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
    VoiceChannel = joinVoiceChannel({
        adapterCreator: channel.guild.voiceAdapterCreator,
        channelId: channel.id,
        guildId: channel.guild.id,
        selfDeaf: false,
        selfMute: false
    });
    ChannelID = channel.id;
}
function remove() {
    VoiceChannel.destroy();
    VoiceChannel = undefined;
    ChannelID = undefined;
}
async function YouTube() {
    const stream = ytdl(list[0].id, { filter: "audioonly", highWaterMark: 1 << 62 });
    const resource = createAudioResource(stream);
    VoiceChannel.subscribe(player);
    player.play(resource);
}
async function File() {
    const stream = req.stream(list[0].url)
    const resource = createAudioResource(stream);
    VoiceChannel.subscribe(player);
    player.play(resource);
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
        player.stop();
    }
}
function StopCMD(interaction) {//-----stop-----コマンド//
    if (list.length === 0) {
        send.reply("音楽が再生されていません", interaction);
    } else {
        send.reply("ストップしました", interaction);
        list = [];
        player.stop();
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
                    name = `${name}\n[${send.embedTitle(result_GV.getVideo.main.title)}](https://youtube.com/watch?v=${result_GV.getVideo.main.id})`;
                    time = `${time}\n${send.PT(result_GV.getVideo.data.duration)}`;
                    break;
                case "File":
                    name = `${name}\n[${send.embedTitle(item.title)}](${item.message})`;
                    time = `${time}\n\u200B`;
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
        player.stop();
    }
}
async function PlayCMD(channel, interaction) {//-----play-----コマンド//
    await interaction.deferReply();
    const text = interaction.options.getString(`name`);
    if (text.indexOf(`https://`) != 0) {
        const result_SV = await req.getGAS("searchVideo", text);
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
        if (VoiceChannel === undefined) {
            join(channel);
            play(interaction);
        }
        command.play(result_GV, interaction);
    } else {
        const URLdata = url.parse(text);
        switch (URLdata.host) {
            case "youtube.com":
            case "youtu.be":
                const split = text.split(/watch\?v=|youtu.be\//)
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
                    if (VoiceChannel === undefined) {
                        join(channel);
                        play(interaction);
                    }
                    command.play(result_GV, interaction);
                }
                break;
            default:
                const data = { title: text, url: text, message: text, type: "File" };
                list.push(data);//リストに追加
                if (VoiceChannel === undefined) {
                    join(channel);
                    play(interaction);
                }
                send.editReply(`[${text}](${text})を再生します`, interaction);

        }
    }
}
async function PlaylistCMD(channel, interaction) {//-----playlist-----コマンド//
    await interaction.deferReply();
    let text = interaction.options.getString(`name`);
    if (text.indexOf(`https://`) != 0) {
        let result_SL = await req.getGAS("searchList", text);
        if (result_SL.error) {
            send.editReply("プレイリストが見つかりませんでした", interaction);
            return;
        }
        for (let i = 0; i < result_SL.searchList.main.length; i++) {
            result_SL.searchList.main[i].type = "YouTube";
        }
        list = list.concat(result_SL.searchList.main);//リストに追加
        if (VoiceChannel === undefined) {
            join(channel);
            play(interaction);
        }
        command.playlist(result_SL, interaction);
    } else {
        let data = text.split(/&list=|\?list=/);
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
        if (VoiceChannel === undefined) {
            join(channel);
            play(interaction);
        }
        command.playlist(result_GL, interaction);
    }
}