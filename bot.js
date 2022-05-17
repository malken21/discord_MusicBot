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
  }];
  client.application.commands.set(data, Config.ServerID);
  console.log(`login!!(${client.user.tag})`);
});

client.on("interactionCreate", async interaction => {
  try {
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
    const id = channel.guild.id;




    if (interaction.commandName === `loop`) {
      if (!playlist[id]) {
        const embed = new MessageEmbed()
          .setColor('ffa500')
          .setTitle(`音楽bot`)
          .setDescription(`音楽が再生されていません`)
        interaction.reply({ embeds: [embed] });
        return;
      } else {
        if (playlist[id].loop) {
          playlist[id].loop = false;
          const embed = new MessageEmbed()
            .setColor('ffa500')
            .setTitle(`音楽bot`)
            .setDescription(`ループ再生OFF`)
          interaction.reply({ embeds: [embed] });
          return;
        } else {
          playlist[id].loop = true;
          const embed = new MessageEmbed()
            .setColor('ffa500')
            .setTitle(`音楽bot`)
            .setDescription(`ループ再生ON`)
          interaction.reply({ embeds: [embed] });
          return;
        }
      }
    }
    if (interaction.commandName === `skip`) {
      if (!playlist[id]) {
        const embed = new MessageEmbed()
          .setColor('ffa500')
          .setTitle(`音楽bot`)
          .setDescription(`音楽が再生されていません`)
        interaction.reply({ embeds: [embed] });
        return;
      } else {
        const embed = new MessageEmbed()
          .setColor('ffa500')
          .setTitle(`音楽bot`)
          .setDescription(`スキップしました`)
        interaction.reply({ embeds: [embed] });
        player.stop();
        return;
      }
    }
    if (interaction.commandName === `stop`) {
      if (!playlist[id]) {
        const embed = new MessageEmbed()
          .setColor('ffa500')
          .setTitle(`音楽bot`)
          .setDescription(`音楽が再生されていません`)
        interaction.reply({ embeds: [embed] });
        return;
      } else {
        const embed = new MessageEmbed()
          .setColor('ffa500')
          .setTitle(`音楽bot`)
          .setDescription(`ストップしました`)
        interaction.reply({ embeds: [embed] });
        playlist[id].list = [];
        player.stop();
        return;
      }
    }
    if (interaction.commandName === `list`) {
      if (!playlist[id]) {
        const embed = new MessageEmbed()
          .setColor('ffa500')
          .setTitle(`音楽bot`)
          .setDescription(`音楽が再生されていません`)
        interaction.reply({ embeds: [embed] });
        return;
      } else {
        await interaction.deferReply();
        let name = "";
        let time = "";
        for (let loop = 0; loop < playlist[id].list.length && loop < 5; loop++) {
          result = await yts({ videoId: playlist[id].list[loop].videoId });
          name = `${name}\n[${result.title.slice(0, 60)}...](${result.url})`
          time = `${time}\n${result.timestamp}`
        }
        const embed = new MessageEmbed()
          .setColor('ffa500')
          .setTitle(`音楽bot`)
          .setDescription(`再生リストを表示しました`)
          .addFields(
            { name: `音楽名`, value: name.slice(0, 1024), inline: true },
            { name: `再生時間`, value: time.slice(0, 1024), inline: true }
          )
        interaction.editReply({ embeds: [embed] });
        return;
      }
    }




    if (interaction.commandName === `join`) {
      const embed = new MessageEmbed()
        .setColor('ffa500')
        .setTitle(`音楽bot`)
        .setDescription(`ボイスチャンネルに入りました`)
      interaction.reply({ embeds: [embed] });
      const connection = joinVoiceChannel({
        adapterCreator: channel.guild.voiceAdapterCreator,
        channelId: channel.id,
        guildId: channel.guild.id,
        selfDeaf: false,
        selfMute: false
      });
      if (playlist[id]) {
        playlist[id].channelId = `${channel.id}`;
      }
      return;
    }
    if (interaction.commandName === `delete`) {
      const embed = new MessageEmbed()
        .setColor('ffa500')
        .setTitle(`音楽bot`)
        .setDescription(`ボイスチャンネルから退出しました`)
      interaction.reply({ embeds: [embed] });

      if (playlist[id]) {
        playlist[id].list = [];
        player.stop();
      } else {
        const connection = joinVoiceChannel({
          adapterCreator: channel.guild.voiceAdapterCreator,
          channelId: channel.id,
          guildId: channel.guild.id,
          selfDeaf: false,
          selfMute: false
        });
        connection.destroy();
      }
      return;
    }

    if (interaction.commandName === `play`) {
      await interaction.deferReply();
      let text = interaction.options.getString(`name`);
      if (interaction.options.getString(`name`).indexOf(`https://`) != 0) {
        result = await yts(text + " Music");
        if (!result.videos[0]) {
          const embed = new MessageEmbed()
            .setColor('ffa500')
            .setTitle(`音楽bot`)
            .setDescription(`プレイリストが見つかりませんでした`)
          interaction.editReply({ embeds: [embed] });
          return;
        }
        result = result.videos[0].videoId;
      } else {
        result = text.split(/watch\?v=|youtu.be\//)
        if (result[1]) { result = result[1].slice(0, 11); }
      }
      if (!result) {
        const embed = new MessageEmbed()
          .setColor('ffa500')
          .setTitle(`音楽bot`)
          .setDescription(`音楽が見つかりませんでした`)
        interaction.editReply({ embeds: [embed] });
        return;
      }
      const connection = joinVoiceChannel({
        adapterCreator: channel.guild.voiceAdapterCreator,
        channelId: channel.id,
        guildId: channel.guild.id,
        selfDeaf: false,
        selfMute: false
      });
      yts({ videoId: result }, async function (err, video) {
        if (err) {
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
          playlist[id] = {};
          playlist[id].list = [];
          playlist[id].loop = false;
          playlist[id].channelId = `${channel.id}`;
          playlist[id].list.push({ "videoId": video.videoId });
          connection.subscribe(player);
          play(id, connection, interaction);
        } else {
          playlist[id].list.push({ "videoId": video.videoId });
        }
        return;
      });
    }

    if (interaction.commandName === `playlist`) {
      await interaction.deferReply();
      let text = interaction.options.getString(`name`);
      if (interaction.options.getString(`name`).indexOf(`https://`) != 0) {
        result = await yts(text + " Music");
        if (!result.playlists[0]) {
          const embed = new MessageEmbed()
            .setColor('ffa500')
            .setTitle(`音楽bot`)
            .setDescription(`プレイリストが見つかりませんでした`)
          interaction.editReply({ embeds: [embed] });
          return;
        }
        result = result.playlists[0].listId;
      } else {
        result = text.split(/&list=|\?list=/)
        if (result[1]) { result = result[1].slice(0, 34); }
      }
      if (!result) {
        const embed = new MessageEmbed()
          .setColor('ffa500')
          .setTitle(`音楽bot`)
          .setDescription(`プレイリストが見つかりませんでした`)
        interaction.editReply({ embeds: [embed] });
        return;
      }
      const connection = joinVoiceChannel({
        adapterCreator: channel.guild.voiceAdapterCreator,
        channelId: channel.id,
        guildId: channel.guild.id,
        selfDeaf: false,
        selfMute: false
      });
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
          playlist[id] = {};
          playlist[id].list = [];
          playlist[id].loop = false;
          playlist[id].channelId = `${channel.id}`;
          for (let loop = 0; loop < list.videos.length; loop++) {
            playlist[id].list.push({ "videoId": list.videos[loop].videoId });
          }
          connection.subscribe(player);
          play(id, connection, interaction);
        } else {
          for (let loop = 0; loop < list.videos.length; loop++) {
            playlist[id].list.push({ "videoId": list.videos[loop].videoId });
          }
        }
        return;
      });
    }
  } catch (error) {
    console.log(error);
  }
});



async function play(id, connection, interaction) {
  console.log(playlist[id]);
  try {
    const stream = ytdl(playlist[id].list[0].videoId, {
      filter: format => format.audioCodec === 'opus' && format.container === 'webm',
      quality: 'highest',
      highWaterMark: 1 << 62
    });
    Activity(id);
    const resource = createAudioResource(stream, {
      inputType: StreamType.WebmOpus
    });
    player.play(resource);

    await entersState(player, AudioPlayerStatus.Playing, 10 * 1000);
    await entersState(player, AudioPlayerStatus.Idle, 24 * 60 * 60 * 1000);

    if (playlist[id].loop) {
      if (interaction.guild.channels.cache.get(playlist[id].channelId).members.size == 1) {
        playlist[id].list = [];
      }
    } else {
      playlist[id].list.shift();
    }
    if (playlist[id].list.length == 0) {
      playlist_delete(id, connection);
    } else {
      play(id, connection, interaction);
    }
  } catch (error) {
    console.log(error);
    client.channels.cache.get(interaction.channelId).send(`エラーが発生しました https://youtube.com/watch?v=${playlist[id].list[0].videoId}`)
    playlist[id].list.shift();
    if (playlist[id].list.length == 0) {
      playlist_delete(id, connection);
    } else {
      play(id, connection, interaction);
    }
  }
}

async function Activity(id) {
  const Activity = await yts({ videoId: playlist[id].list[0].videoId });
  client.user.setActivity(Activity.title, { type: "LISTENING" });
}

async function playlist_delete(id, connection) {
  client.user.setActivity();
  connection.destroy();
  delete playlist[id];
}