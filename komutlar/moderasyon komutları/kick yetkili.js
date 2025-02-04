const { Message, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
  cooldown: 5,
  name: "kick yetkili",
  aliases: ["kick-yetkili", "kick-rol", "kicky"],
  /**
   * @param {import("../../typedef").exportsRunCommands} param0 
   */
  async run({ guildDatabase, pre, alisa, msg, args, guildId, prefix, hata, guild, msgMember, guildMe }) {
    try {

      // Kontroller
      if (!msgMember.permissions.has('Administrator')) return hata("Yönetici", "yetki")      

      if (args[0] === "sıfırla") {
        if (!guildDatabase.kayıt.kicky) return hata('Üyeleri atabilecek yetkili rolü zaten sıfırlanmış durumda')
        delete guildDatabase.kayıt.kicky
        hata('Üyeleri atabilecek yetkili rolü başarıyla sıfırlandı', "b")
        db.yazdosya(guildDatabase, guildId)
        return;
      }
      const rol = msg.client.fetchRole(args.join(" "), msg)
      if (!rol) return hata(`Üyeleri atabilecek yetkili rolü ayarlamak için **${prefix}kicky @rol**\n\n• Sfırlamak için ise **${prefix}kicky sıfırla** yazabilirsiniz`, "ne")
      const rolid = rol.id
      if (rol.managed) return hata(`Botların oluşturduğu rolleri botlardan başka kimse sahip olamadığı için bu rolü seçemezsiniz`)
      
      guildDatabase.kayıt.kicky = rolid
      hata(`Bundan sonra üyeleri <@&${rolid}> adlı role sahip kişiler atabilecek`, "b")
      db.yazdosya(guildDatabase, guildId)
      return;
    } catch (e) {
      msg.reply(`**‼️ <@${msg.author.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`).catch(err => { })
      msg.client.error(module.id.split("\\").slice(5).join("\\"), e)
      console.log(e)
    }
  }
}


