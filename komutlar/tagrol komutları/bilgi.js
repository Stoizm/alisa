const { Message, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
    cooldown: 30,
    name: "tagrol bilgi",
    kod: "tagrol-bilgi",
    /**
   * @param {import("../../typedef").exportsRunCommands} param0 
   */
  async run({ sunucudb, pre, alisa, msg, args, sunucuid, prefix, hata, guild, msgMember, guildMe }) {
        try {
            if (!msgMember.permissions.has("Administrator")) return hata("Yönetici", "yetki")
            let tagrol = msg.client.t(sunucuid, sunucudb.kayıt.tag)
            , ayar = tagrol.ayar ? `Kapalı ${ayarlar.emoji.kapali}` : `Açık ${ayarlar.emoji.acik}`
            , dme = tagrol.dmesaje ? `Açık ${ayarlar.emoji.acik}` : `Kapalı ${ayarlar.emoji.kapali}`
            , dmk = tagrol.dmesajk ? `Açık ${ayarlar.emoji.acik}` : `Kapalı ${ayarlar.emoji.kapali}`
            , mesaje = tagrol.mesaje ? `Ayarlanmış ${ayarlar.emoji.p}` : "Ayarlanmamış ❗"
            , mesajk = tagrol.mesajk ? `Ayarlanmış ${ayarlar.emoji.p}` : "Ayarlanmamış ❗"
            , tagRol = tagrol.rol ? `<@&${tagrol.rol}>` : "Rol ayarlanmamış ❗"
            , kanal = tagrol.kanal ? "<#" + tagrol.kanal + '>' : "Kanal ayarlanmamış ❗"
            , log = tagrol.log ? "<#" + tagrol.log + '>' : "Kanal ayarlanmamış ❗"
            , tag = tagrol.tag || "Tag ayarlanmamış ❗"
            , dis = tagrol.dis ? `#${tagrol.dis}` : "Discriminator ayarlanmamış ❗"
            , discordlogo = guild.iconURL()
            , embed = new EmbedBuilder()
                .setAuthor({ name: guild.name, iconURL: discordlogo })
                .setThumbnail(discordlogo)
                .setDescription([
                    `🎚️**Tagrol ayarım:**  ${ayar}`,
                    `🏷️**Sunucunun tag(ları):**  ${tag} | ${dis}`,
                    `\n${ayarlar.emoji.rol} **Tag alan kişilere verilecek rol:**  ${tagRol}`,
                    `${ayarlar.emoji.kanal} **Tag mesajlarının atılacağı kanal:**  ${kanal}`,
                    `📁 **Tag log'ların atılacağı kanal:**  ${log}`,
                    `\n📥 **Birisi tag aldıktan sonra atılacak mesaj:**  ${mesaje}`,
                    `📤 **Birisi tag'ı bıraktıktan sonra atılacak mesaj:**  ${mesajk}`,
                    `\n👤📥 **Birisi tag aldıktan sonra dm'den atılacak mesaj:**  ${dme}`,
                    `👤📤 **Birisi tag'ı bıraktıktan sonra dm'den atılacak mesaj:**  ${dmk}`
                ].join("\n"))
                .setColor("DarkPurple")
                .setFooter({ text: `${msg.client.user.username} Tagrol sistemi`, iconURL: msg.client.user.displayAvatarURL() })
                .setTimestamp()
            msg.reply({ embeds: [embed] }).catch(err => { })
        } catch (e) {
            msg.reply(`**‼️ <@${msg.author.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`).catch(err => { })
            msg.client.hata(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }
    }
}
