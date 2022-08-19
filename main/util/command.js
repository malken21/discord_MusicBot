const send = require('./send');
const text = require('../util/text');

exports.data = [{
    name: "play",
    description: "YouTubeの音楽を再生",
    options: [{
        type: "STRING",
        name: "name",
        description: "動画のURLまたは検索したい音楽",
        required: true
    }]
},
{
    name: "playlist",
    description: "YouTubeのプレイリストを再生",
    options: [{
        type: "STRING",
        name: "name",
        description: "プレイリストのURLまたは検索したいプレイリスト",
        required: true
    }]
},
{
    name: "skip",
    description: "今再生している音楽をスキップ"
},
{
    name: "loop",
    description: "ループ再生の切り替え"
},
{
    name: "join",
    description: "ボットをボイスチャンネルに強制的に入れる"
},
{
    name: "stop",
    description: "音楽の再生をすべて終了"
},
{
    name: "delete",
    description: "ボットをボイスチャンネルから強制的に退出させる"
},
{
    name: "list",
    description: "音楽をすべて表示"
},
{
    name: "PlayFile",
    type: "MESSAGE"
}];

exports.play = (Video, interaction) => {
    const title = Video.main.title;
    const id = Video.main.id;
    const thumbnail = Video.data.thumbnail;
    const duration = Video.data.duration;
    send.play(title, `https://youtube.com/watch?v=${id}`, thumbnail, `${text.PT(duration)}`, interaction);
}
exports.playlist = (result, interaction) => {
    if (result.getList) {
        const title = result.getList.main[0].title;
        const id = result.getList.data.id;
        const thumbnail = result.getList.data.thumbnail;
        send.playlist(title, id, thumbnail, interaction);
    } else {
        const title = result.searchList.main[0].title;
        const id = result.searchList.data.id;
        const thumbnail = result.searchList.data.thumbnail;
        send.playlist(title, id, thumbnail, interaction);
    }
}