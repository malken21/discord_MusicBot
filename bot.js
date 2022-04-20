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
  }];
  client.application.commands.set(data, Config.ServerID);
  console.log(`login!!(${client.user.tag})`);
});




client.on("interactionCreate", async interaction => {
  if (!interaction.isCommand()) {
    return;
  }
  if (interaction.commandName === `play`) {

    const channel = interaction.member.voice.channel;

    if (!channel) {
      const embed = new MessageEmbed()
        .setColor('ffa500')
        .setTitle(`音楽bot`)
        .setDescription(`ボイスチャンネルに入ってから入力してください`)
      interaction.reply({ embeds: [embed] });
    } else {

      let text = interaction.options.getString(`name`);
      if (interaction.options.getString(`name`).indexOf(`https://`) != 0) {
        text += " Music";
      }
      result = await yts(text);
      result = result.videos[0]
      if (!result) {
        const embed = new MessageEmbed()
          .setColor('ffa500')
          .setTitle(`音楽bot`)
          .setDescription(`検索結果が見つかりませんでした`)
        interaction.reply({ embeds: [embed] });
        return;
      }

      const id = channel.guild.id;

      let playing = true;

      if (playlist[id] == undefined) { playlist[id] = []; playing = false; }

      playlist[id].push(result);

      console.log(playlist);


      const embed = new MessageEmbed()
        .setColor('ffa500')
        .setTitle(`音楽bot`)
        .setThumbnail(result.thumbnail)
        .setDescription(`[${result.title}](${result.url})`)
        .addFields(
          { name: `再生時間`, value: `${result.timestamp}`, inline: true }
        )
      interaction.reply({ embeds: [embed] });



      if (!playing) {

        const connection = joinVoiceChannel({
          adapterCreator: channel.guild.voiceAdapterCreator,
          channelId: channel.id,
          guildId: channel.guild.id,
          selfDeaf: false,
          selfMute: false
        });
        connection.subscribe(player);

        play(id, connection);
      }


    }
  }
});



async function play(id, connection) {
  const stream = ytdl(playlist[id][0].url, {
    filter: format => format.audioCodec === 'opus' && format.container === 'webm',
    quality: 'highest',
    highWaterMark: 1 << 62
  });
  const resource = createAudioResource(stream, {
    inputType: StreamType.WebmOpus
  });

  // 再生
  player.play(resource);
  await entersState(player, AudioPlayerStatus.Playing, 10 * 1000);
  await entersState(player, AudioPlayerStatus.Idle, 24 * 60 * 60 * 1000);

  playlist[id].shift();
  if (playlist[id].length == 0) {
    connection.destroy();
    delete playlist[id]
  } else {
    play(id, connection);
  }

}