const { MessageEmbed } = require("discord.js");

const Config = require("../Config.json");

const eaw = require("eastasianwidth");

exports.reply = (text, interaction) => {
    const embed = new MessageEmbed()
        .setColor('ffa500')
        .setTitle(`音楽bot`)
        .setDescription(text)
    interaction.reply({ embeds: [embed] });
}
exports.editReply = (text, interaction) => {
    const embed = new MessageEmbed()
        .setColor('ffa500')
        .setTitle(`音楽bot`)
        .setDescription(text)
    interaction.editReply({ embeds: [embed] });
}
exports.list = (name, time, interaction) => {
    const embed = new MessageEmbed()
        .setColor('ffa500')
        .setTitle(`音楽bot`)
        .setDescription(`再生リストを表示しました`)
        .addFields(
            { name: `音楽名`, value: name.slice(0, 1024), inline: true },
            { name: `再生時間`, value: time.slice(0, 1024), inline: true }
        )
    interaction.editReply({ embeds: [embed] });
}
exports.play = (title, id, thumbnail, duration, interaction) => {
    const embed = new MessageEmbed()
        .setColor('ffa500')
        .setTitle(`音楽bot`)
        .setThumbnail(thumbnail)
        .setDescription(`[${title}](https://youtube.com/watch?v=${id})`)
        .addFields(
            { name: `再生時間`, value: `${PT(duration)}`, inline: true }
        )
    interaction.editReply({ embeds: [embed] });
}
exports.playlist = (title, id, thumbnail, interaction) => {
    const embed = new MessageEmbed()
        .setColor('ffa500')
        .setTitle(`音楽bot`)
        .setThumbnail(thumbnail)
        .setDescription(`プレイリスト再生\n[${title}](https://www.youtube.com/playlist?list=${id})`)
    interaction.editReply({ embeds: [embed] });
}
exports.PT = PT;
function PT(duration) {
    let H, M, S;
    H = Number(duration.split(/PT|H/g)[1]);
    if (isNaN(H)) {
        M = Number(duration.split(/PT|M/g)[1]);
        H = "";
    } else {
        M = Number(duration.split(/H|M/g)[1]);
        H = H + ":";
    }
    if (isNaN(M)) {
        S = Number(duration.split(/PT|S/g)[1]);
        M = "0:";
    } else {
        S = Number(duration.split(/M|S/g)[1]);
        M = M + ":";
    }
    if (isNaN(S)) {
        S = "00";
    } else {
        S = `${S}`.padStart(2, "0");
    }
    return `${H}${M}${S}`;
}

exports.playfile = (text, interaction) => {
    if (Config.VisionchannelId.includes("all")) {
        const embed = new MessageEmbed()
            .setColor('ffa500')
            .setTitle(`音楽bot`)
            .setDescription(text)
        interaction.reply({ embeds: [embed], ephemeral: false });
    } else {
        const embed = new MessageEmbed()
            .setColor('ffa500')
            .setTitle(`音楽bot`)
            .setDescription(text)
        interaction.reply({ embeds: [embed], ephemeral: !Config.VisionchannelId.includes(interaction.channelId) });
    }
}
exports.embedTitle = (before) => {
    let after = before;
    if (eaw.length(before) > 48) {
        after = eaw.slice(before, 0, 45) + "..."
    }
    return after;
}