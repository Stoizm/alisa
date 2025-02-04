const { SlashCommandBuilder, ChatInputCommandInteraction, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
    name: "prefix",
    data: new SlashCommandBuilder()
        .setName("prefix")
        .setDescription("Botun sunucudaki prefixini değiştirirsiniz")
        .addStringOption(option => option.setName("prefix").setDescription("yeni prefixim").setRequired(true).setMaxLength(5)),
    /**
     * @param {import("../../typedef").exportsRunSlash} param0 
     */
    async run({ int, guildDatabase, alisa, hata, guildId, guild }) {
        try {

            // Kontroller
            if (!int.member.permissions.has('Administrator')) return hata("Yönetici", "yetki")
            
            let yazı = int.options.getString("prefix")
                , prefix = guildDatabase.prefix || ayarlar.prefix
            if (yazı == ayarlar.prefix) {
                delete guildDatabase.prefix
                const em = new EmbedBuilder()
                    .setTitle(`Prefixiniz başarıyla "${ayarlar.prefix}" olarak değiştirildi`)
                    .setDescription('• Yeni prefixiniz **.** oldu')
                    .addFields(
                        {
                            name: 'Örnek',
                            value: `\`\`\`css\n${ayarlar.prefix}yardım\n${ayarlar.prefix}prefix\n${ayarlar.prefix}destek\n@${int.client.user.tag}yardım\n\`\`\``
                        }
                    )
                    .setTimestamp()
                    .setColor('Blue')
                int.reply({ embeds: [em] }).catch(err => { })
                db.yazdosya(guildDatabase, guildId)
                return;
            }
            if (prefix === yazı) return hata('Yazdığınız prefix zaten benim prefixim')
            guildDatabase.prefix = yazı
            const e = new EmbedBuilder()
                .setTitle('Prefixiniz başarıyla "' + yazı + '" olarak değiştirildi')
                .setDescription('• Yeni prefixiniz **' + yazı + '** oldu')
                .addFields(
                    {
                        name: 'Örnek',
                        value: "```css\n" + yazı + "yardım\n" + yazı + "prefix\n" + yazı + "destek\n@" + int.client.user.tag + " yardım\n```"
                    }
                )
                .setTimestamp()
                .setColor('Blue')
            int.reply({ embeds: [e] }).catch(err => { })
            db.yazdosya(guildDatabase, guildId)
            return;
        } catch (e) {
            hata(`**‼️ <@${int.user.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`, true).catch(err => { })
            int.client.error(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }
    }
}