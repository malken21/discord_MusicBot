console.log("load");

const { Client, Intents } = require("discord.js");
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, 'GUILD_VOICE_STATES'] });

const Config = require("./Config.json");


const { onContextMenu, onCommand, ready } = require('./event/main');
const { commands, isDenyChannel } = require('./util/command');
const send = require('./util/send');

console.log("start");


client.on('ready', () => {
  client.application.commands.set(commands, Config.ServerID);//コマンド生成
  ready(client)
  console.log(`login: (${client.user.tag})`);
});

client.on("interactionCreate", interaction => {
  if (isDenyChannel(interaction.channelId, Config)) {
    send.private("このチャンネルでは実行できません", interaction)
    return;
  }
  try {
    if (interaction.isCommand()) {
      onCommand(interaction);
    }
    if (interaction.isContextMenu()) {
      onContextMenu(interaction);
    }
  } catch (error) {
    console.log(error);
  }
});

client.login(Config.TOKEN);