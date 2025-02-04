const { SlashCommandBuilder, ChatInputCommandInteraction, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
    name: "jail yetkili",
    data: new SlashCommandBuilder()
        .setName("jail-yetkili")
        .setDescription("Jail yetkili rolünü ayarlarsınız")
        .addSubcommand(subcommand => subcommand.setName("ayarla").setDescription("Jail yetkili rolünü ayarla").addRoleOption(a => a.setName("rol").setDescription("Rolü etiketle").setRequired(true)))
        .addSubcommand(a => a.setName("sıfırla").setDescription("Jail yetkili rolünü sıfırlarsınız")),
    /**
     * @param {import("../../typedef").exportsRunSlash} param0 
     */
    async run({ int, guildDatabase, alisa, hata, guildId, guild }) {
        try {

            // Kontroller
            if (!int.member.permissions.has('Administrator')) return hata("Yönetici", "yetki")    

            if (int.options.getSubcommand(false) == "rol") {
                let rol = int.options.getRole("rol", true)
                const rolid = rol.id
                if (guildDatabase.jail.yetkili === rolid) return hata('Jail yetkili rolü zaten etiketlediğiniz rolle aynı')
                if (rol.managed) return hata(`Botların oluşturduğu rolleri başkalarına veremem`)
                if (rolid == guildDatabase.jail.rol) return hata(`Etiketlediğiniz rol bu sunucudaki jail rolü. Lütfen başka bir rol etiketleyiniz`)
              
                guildDatabase.jail.yetkili = rolid
                hata('Bundan sonra jail\'e <@&' + rolid + '> adlı role sahip olanlar atabilecek', "b")
                db.yazdosya(guildDatabase, guildId)
                return;
            }
            if (!guildDatabase.jail.yetkili) return hata('Jail yetkili rolü zaten sıfırlanmış durumda')
        
            delete guildDatabase.jail.yetkili
            hata('Jail yetkili rolü başarıyla sıfırlandı', "b")
            db.yazdosya(guildDatabase, guildId)
            return;
        } catch (e) {
            hata(`**‼️ <@${int.user.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`, true).catch(err => { })
            int.client.error(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }
    }
}