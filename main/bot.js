const { Client, Intents } = require("discord.js");
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, 'GUILD_VOICE_STATES'] });

const Config = require("./Config.json");


const main = require('./event/main');
const command = require('./util/command');
const send = require('./util/send');


client.login(Config.TOKEN);

client.on('ready', () => {
  client.application.commands.set(command.data, Config.ServerID);//コマンド生成
  main.ready(client)
  console.log(`login!!(${client.user.tag})`);
});

client.on("interactionCreate", interaction => {
  if (Config.Deny_ChannelId.includes(interaction.channelId)) {
    send.private("このチャンネルでは実行できません", interaction)
    return;
  }
  try {
    if (interaction.isCommand()) {
      main.onCommand(interaction);
    }
    if (interaction.isContextMenu()) {
      main.onContextMenu(interaction);
    }
  } catch (error) {
    console.log(error);
  }
});
