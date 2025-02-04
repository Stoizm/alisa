const { Message, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
  cooldown: 5,
  name: "bot oto kayıt",
  aliases: ["bototo", "bot-otokayıt", "b-otokayıt", "bot-oto", "boto", "botokayıt", "b-oto"],
  /**
   * @param {import("../../typedef").exportsRunCommands} param0 
   */
  async run({ guildDatabase, pre, alisa, msg, args, guildId, prefix, hata, guild, msgMember, guildMe }) {
    try {
      // Kontroller
      if (!msgMember.permissions.has('Administrator')) return hata("Yönetici", "yetki")
      
      switch (args[0]) {
        case "aç":
        case "açık":
        case "aktif":
          if (guildDatabase.kayıt.bototo) return hata('Bot oto kayıt ayarım zaten __**açık**__ durumda')
          guildDatabase.kayıt.bototo = true
          hata('Bot oto kayıt ayarım başarıyla açıldı bundan sonra botları otomatik olarak kayıt edeceğim', "b")
          db.yazdosya(guildDatabase, guildId)
          return;
        case "kapat":
        case "kapalı":
        case "deaktif":
          if (!guildDatabase.kayıt.bototo) return hata('Bot oto kayıt ayarım zaten __**kapalı**__ durumda')
          delete guildDatabase.kayıt.bototo
          hata('Bot oto kayıt ayarım başarıyla kapatıldı bundan sonra botları otomatik olarak kayıt etmeyeceğim', "b")
          db.yazdosya(guildDatabase, guildId)
          return;
        default:
          return hata(`Botları otomatik olarak kayıt etmek için **${prefix}bototo aç**\n\n• Kapatmak için ise **${prefix}bototo kapat** yazabilirsiniz`, "ne")
      }
    } catch (e) {
      msg.reply(`**‼️ <@${msg.author.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`).catch(err => { })
      msg.client.error(module.id.split("\\").slice(5).join("\\"), e)
      console.log(e)
    }
  }
}

