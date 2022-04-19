const { Client, Intents, MessageEmbed } = require("discord.js");
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, 'GUILD_VOICE_STATES'] });
const ytdl = require('ytdl-core');
const { entersState, AudioPlayerStatus, createAudioPlayer, createAudioResource, joinVoiceChannel, StreamType } = require('@discordjs/voice');
const yts = require('yt-search');

const fs = require('fs');


const Config = require("./Config.json");

client.login(Config.TOKEN);

client.on('ready', () => {
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


client.on("interactionCreate", interaction => {
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
      let search = interaction.options.getString(`name`);
      if (interaction.options.getString(`name`).indexOf(`https://`) != 0) {
        search += " Music";
      }

      yts(search, function (err, result) {

        if (!result.videos[0]) {
          const embed = new MessageEmbed()
            .setColor('ffa500')
            .setTitle(`音楽bot`)
            .setDescription(`検索結果が見つかりませんでした`)
          interaction.editReply({ embeds: [embed] });
          return;
        } else {

          const url = result.videos[0].url
          console.log(result.videos[0]);

          const embed = new MessageEmbed()
            .setColor('ffa500')
            .setTitle(`音楽bot`)
            .setThumbnail(result.videos[0].thumbnail)
            .setDescription(`[${result.videos[0].title}](${result.videos[0].url})`)
            .addFields(
              { name: `再生時間`, value: `${result.videos[0].timestamp}`, inline: true }
            )
          interaction.editReply({ embeds: [embed] });

          const connection = joinVoiceChannel({
            adapterCreator: channel.guild.voiceAdapterCreator,
            channelId: channel.id,
            guildId: channel.guild.id,
            selfDeaf: false,
            selfMute: false
          });
          const player = createAudioPlayer();
          connection.subscribe(player);

          play(url, player, connection);

        }
      });
      interaction.deferReply();
    }
  }
});



async function play(url, player, connection) {
  const stream = ytdl(ytdl.getURLVideoID(url), {
    filter: format => format.audioCodec === 'opus' && format.container === 'webm',
    quality: 'highest',
    highWaterMark: 1 << 62
  });
  const resource = createAudioResource(stream, {
    inputType: StreamType.WebmOpus
  });
  // 再生
  player.play(resource);
  await entersState(player,AudioPlayerStatus.Playing, 10 * 1000);
  await entersState(player,AudioPlayerStatus.Idle, 24 * 60 * 60 * 1000);
  // 再生が終了したら抜ける
  connection.destroy();
}