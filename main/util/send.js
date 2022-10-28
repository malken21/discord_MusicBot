const { MessageEmbed } = require("discord.js");

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
exports.play = (title, url, thumbnail, duration, interaction) => {
    const embed = new MessageEmbed()
        .setColor('ffa500')
        .setTitle(`音楽bot`)
        .setThumbnail(thumbnail)
        .setDescription(`[${title}](${url})`)
        .addFields(
            { name: `再生時間`, value: duration, inline: true }
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

exports.playfile = (text, interaction) => {
    const embed = new MessageEmbed()
        .setColor('ffa500')
        .setTitle(`音楽bot`)
        .setDescription(text)
    interaction.reply({ embeds: [embed] });
}

exports.private = (text, interaction) => {
    const embed = new MessageEmbed()
        .setColor('ffa500')
        .setTitle(`音楽bot`)
        .setDescription(text)
    interaction.reply({ embeds: [embed], ephemeral: true });
}