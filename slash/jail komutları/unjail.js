const { SlashCommandBuilder, ChatInputCommandInteraction, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
    name: "unjail",
    data: new SlashCommandBuilder()
        .setName("unjail")
        .setDescription("Etiketlediğiniz üyeyi jailden çıkarırsınız")
        .addUserOption(option => option.setName("üye").setDescription("Üyeyi etiketle").setRequired(true)),
    /**
     * @param {import("../../typedef").exportsRunSlash} param0 
     */
    async run({ int, guildDatabase, alisa, hata, guildId, guild }) {
        try {

            // Kontroller
            let yetkili = guildDatabase.jail.yetkili
                , intMember = int.member
            if (yetkili) {
                if (!intMember.roles.cache.has(yetkili) && !intMember.permissions.has('Administrator')) return hata(`<@&${yetkili}> rolüne **veya** Yönetici`, "yetki")
            } else if (!intMember.permissions.has('Administrator')) return hata("Yönetici", "yetki")
            let rol = guildDatabase.jail.rol
            if (!rol) return hata(`Bu sunucuda herhangi bir jail rolü __ayarlanmamış__${intMember.permissions.has('Administrator') ? `\n\n• Ayarlamak için **${guildDatabase.prefix || ayarlar.prefix}jail-rol @rol** yazabilirsiniz` : ""}`)
            let guildMe = int.guild.members.me
            if (!guildMe.permissions.has('ManageRoles')) return hata("Kullanıcı Adlarını Yönet", "yetkibot")
            if (guild.roles.cache.get(rol).position >= guildMe.roles.highest.position) return hata(`<@&${rol}> adlı rolün sırası benim rolümün sırasından yüksek! Lütfen ${guildMe.roles.botRole?.toString() || guildMe.roles.highest?.toString()} adlı rolü üste çekiniz ve tekrar deneyiniz`)
            const member = int.options.getMember("üye", true)
            if (member.user.bot) return hata(`Botları jailden çıkaramazsın`)
            if (member.id == int.user.id) return hata(`Kendini jailden çıkaramazsın şapşik şey seni :)`)
            if (!member.roles.cache.has(rol)) return hata(`Etiketlediğiniz kişi zaten jailde değil`)

            let sunucuJail = db.bul(guildId, "jail", "diğerleri") || {}

            // Üyeyi jailden çıkarma
            await member.edit({ roles: (sunucuJail[member.id] ? sunucuJail[member.id].filter(a => guild.roles.cache.has(a)) : member.roles.cache.filter(a => a.id != rol).map(a => a.id)) }).then(() => {
                const date = Date.now()
                let tempjaildosya = db.bul(guildId, "tempjail", "diğerleri") || {}
                    , jailDosya = db.bul(guildId, "jail", "diğerleri") || {}
                    , kl = guildDatabase.kl[member.id] || []
                kl.unshift({ type: "uj", author: int.user.id, timestamp: date })
                guildDatabase.kl[member.id] = kl
                delete jailDosya[member.id]
                if (tempjaildosya[member.id]) delete tempjaildosya[member.id]
                let kisi = guildDatabase.jail.kisi[member.id] || []
                kisi.unshift({ y: int.user.id, z: date, bool: false })
                guildDatabase.jail.kisi[member.id] = kisi
                guildDatabase.jail.son.unshift({ s: int.user.id, k: member.id, z: date, bool: false })
                int.reply({ content: `• <@${member.id}> adlı kişi <@${int.user.id}> tarafından jail'den çıkarıldı!`, allowedMentions: { users: [member.id], repliedUser: true } }).catch(err => { })
                let log = guildDatabase.jail.log
                if (log) {
                    const zaman = `<t:${(date / 1000).toFixed(0)}:F> - <t:${(date / 1000).toFixed(0)}:R>`
                    const clientPp = int.client.user.displayAvatarURL()
                    const pp = member.displayAvatarURL()
                    const yapılanSeyler = [
                        `🧰 **JAIL'DEN ÇIKARAN YETKİLİ**`,
                        `**• Adı:**  <@${int.user.id}> - ${int.user.tag}`,
                        `**• Jail'den çıkarılma zamanı:**  ${zaman}`,
                        `\n👤 **JAIL'DEN ÇIKARILAN KİŞİ**`,
                        `**• Adı:**  <@${member.id}> - ${member.user.tag}`,
                        `**• Alınan rol:**  <@&${rol}>`,
                        `**• Kaç kere jaile atıldı:**  ${kisi.filter(a => a.bool == true).length} kere`,
                    ]
                    const embed = new EmbedBuilder()
                        .setAuthor({ name: member.user.tag, iconURL: pp })
                        .setDescription(yapılanSeyler.join("\n"))
                        .setThumbnail(pp)
                        .setColor("#af0003")
                        .setFooter({ text: `${int.client.user.username} Log sistemi`, iconURL: clientPp })
                        .setTimestamp()
                    guild.channels.cache.get(log)?.send({ embeds: [embed] }).catch(err => { })
                }
                db.yaz(guildId, jailDosya, "jail", "diğerleri")
                db.yaz(guildId, tempjaildosya, "tempjail", "diğerleri")
                db.yazdosya(guildDatabase, guildId)
            }).catch(err => {
                hata(`**• <@${member.id}> adlı kişiden jail rolünü alamadım! Lütfen bana yönetici yetkisi verdiğinizden ve rolümün üstte olduğundan emin olunuz**\n\n` + "```js\n" + err + "```")
            })
        } catch (e) {
            hata(`**‼️ <@${int.user.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`, true).catch(err => { })
            int.client.error(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }
    }
}