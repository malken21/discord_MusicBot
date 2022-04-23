const { Client, Intents, MessageEmbed } = require("discord.js");
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, 'GUILD_VOICE_STATES'] });
const ytdl = require('ytdl-core');
const { entersState, AudioPlayerStatus, createAudioPlayer, createAudioResource, joinVoiceChannel, StreamType } = require('@discordjs/voice');
const yts = require('yt-search');


const player = createAudioPlayer();

let playlist = {};

const Config = require("./Config.json");

client.login(Config.TOKEN);





client.on('ready', () => {//コマンド生成
  const data = [{
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
    name: "stop",
    description: "音楽の再生をすべて終了"
  }];
  client.application.commands.set(data, Config.ServerID);
  console.log(`login!!(${client.user.tag})`);
});



client.on("interactionCreate", async interaction => {
  if (!interaction.isCommand()) {
    return;
  }

  const channel = interaction.member.voice.channel;
  if (!channel) {
    const embed = new MessageEmbed()
      .setColor('ffa500')
      .setTitle(`音楽bot`)
      .setDescription(`ボイスチャンネルに入ってから入力してください`)
    interaction.reply({ embeds: [embed] });
    return;
  }
  const connection = joinVoiceChannel({
    adapterCreator: channel.guild.voiceAdapterCreator,
    channelId: channel.id,
    guildId: channel.guild.id,
    selfDeaf: false,
    selfMute: false
  });
  const id = channel.guild.id;

  if (interaction.commandName === `play`) {
    await interaction.deferReply();
    let text = interaction.options.getString(`name`);
    if (interaction.options.getString(`name`).indexOf(`https://`) != 0) {
      text += " Music";
    }
    let video = await yts(text);
    video = video.videos[0];
    if (!video) {
      const embed = new MessageEmbed()
        .setColor('ffa500')
        .setTitle(`音楽bot`)
        .setDescription(`音楽が見つかりませんでした`)
      interaction.editReply({ embeds: [embed] });
      return;
    }
    const embed = new MessageEmbed()
      .setColor('ffa500')
      .setTitle(`音楽bot`)
      .setThumbnail(video.thumbnail)
      .setDescription(`[${video.title}](${video.url})`)
      .addFields(
        { name: `再生時間`, value: `${video.timestamp}`, inline: true }
      )
    interaction.editReply({ embeds: [embed] });
    if (!playlist[id]) {
      playlist[id] = [];
      playlist[id].push(video);
      connection.subscribe(player);
      play(id, connection);
    } else {
      playlist[id].push(video);
    }
  }


  if (interaction.commandName === `playlist`) {
    await interaction.deferReply();
    let text = interaction.options.getString(`name`);
    if (interaction.options.getString(`name`).indexOf(`https://`) != 0) {
      result = await yts(text + " Music");
      result = result.playlists[0].listId;
    } else {
      result = text.split(/&list=|\?list=/)[1].slice(0, 34);
    }
    if (!result) {
      const embed = new MessageEmbed()
        .setColor('ffa500')
        .setTitle(`音楽bot`)
        .setDescription(`プレイリストが見つかりませんでした`)
      interaction.editReply({ embeds: [embed] });
      return;
    }

    yts({ listId: result }, async function (err, list) {
      if (err) {
        const embed = new MessageEmbed()
          .setColor('ffa500')
          .setTitle(`音楽bot`)
          .setDescription(`プレイリストが見つかりませんでした`)
        interaction.editReply({ embeds: [embed] });
        return;
      }
      const embed = new MessageEmbed()
        .setColor('ffa500')
        .setTitle(`音楽bot`)
        .setThumbnail(list.thumbnail)
        .setDescription(`プレイリスト再生\n[${list.title}](${list.url})`)
      interaction.editReply({ embeds: [embed] });
      if (!playlist[id]) {
        playlist[id] = [];
        let firstvideo = await yts({ videoId: list.videos[0].videoId });
        playlist[id].push(firstvideo);
        connection.subscribe(player);
        play(id, connection);
      } else {
        let firstvideo = await yts({ videoId: list.videos[0].videoId });
        playlist[id].push(firstvideo);
      }
      for (let loop = 1; loop < list.videos.length; loop++) {
        let video = await yts({ videoId: list.videos[loop].videoId });
        if (!playlist[id] || playlist[id].length == 0) { return; }
        playlist[id].push(video);
      }
      console.log(playlist[id]);
      return;
    });
  }

  if (interaction.commandName === `skip`) {
    if (!playlist[id]) {
      const embed = new MessageEmbed()
        .setColor('ffa500')
        .setTitle(`音楽bot`)
        .setDescription(`音楽が再生されていません`)
      interaction.reply({ embeds: [embed] });
    } else {
      const embed = new MessageEmbed()
        .setColor('ffa500')
        .setTitle(`音楽bot`)
        .setDescription(`スキップしました`)
      interaction.reply({ embeds: [embed] });
      player.stop();
    }
  }

  if (interaction.commandName === `stop`) {
    if (!playlist[id]) {
      const embed = new MessageEmbed()
        .setColor('ffa500')
        .setTitle(`音楽bot`)
        .setDescription(`音楽が再生されていません`)
      interaction.reply({ embeds: [embed] });
    } else {
      const embed = new MessageEmbed()
        .setColor('ffa500')
        .setTitle(`音楽bot`)
        .setDescription(`ストップしました`)
      interaction.reply({ embeds: [embed] });
      playlist[id] = [];
      player.stop();
    }
  }
});



async function play(id, connection) {
  const stream = ytdl(playlist[id][0].videoId, {
    filter: format => format.audioCodec === 'opus' && format.container === 'webm',
    quality: 'highest',
    highWaterMark: 1 << 62
  });
  const resource = createAudioResource(stream, {
    inputType: StreamType.WebmOpus
  });

  client.user.setActivity(playlist[id][0].title, { type: "LISTENING" });

  player.play(resource);
  await entersState(player, AudioPlayerStatus.Playing, 10 * 1000);
  await entersState(player, AudioPlayerStatus.Idle, 24 * 60 * 60 * 1000);

  playlist[id].shift();
  if (playlist[id].length == 0) {
    client.user.setActivity();
    connection.destroy();
    delete playlist[id];
  } else {
    play(id, connection);
  }
}