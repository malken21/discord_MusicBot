console.log("load");
const { Client, GatewayIntentBits, Partials, Events } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds], partials: [Partials.Channel] });

const Config = require("../config.json");


const { onContextMenu, onCommand, ready } = require('./event/main');
const { commands, isDenyChannel } = require('./util/command');
const send = require('./util/send');

console.log("start");


client.on(Events.ClientReady, () => {
  client.application.commands.set(commands, Config.GUILD);//コマンド生成
  client.application.commands.set([]);
  ready(client)
  console.log(`login: (${client.user.tag})`);
});

client.on(Events.InteractionCreate, interaction => {
  if (isDenyChannel(interaction.channelId, Config)) {
    send.private("このチャンネルでは実行できません", interaction)
    return;
  }
  try {
    if (interaction.isCommand()) {
      onCommand(interaction);
    }
    if (interaction.isContextMenuCommand()) {
      onContextMenu(interaction);
    }
  } catch (error) {
    console.log(error);
  }
});

client.login(Config.TOKEN);