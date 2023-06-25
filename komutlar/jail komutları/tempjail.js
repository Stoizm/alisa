const { Message, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
const Time = require("../../modüller/time")
module.exports = {
    cooldown: 3,
    name: "tempjail",
    aliases: ["tempjail", "temp-jail"],
    /**
   * @param {import("../../typedef").exportsRunCommands} param0 
   */
    async run({ guildDatabase, pre, alisa, msg, args, guildId, prefix, hata, guild, msgMember, guildMe }) {
        try {

            // Kontroller
            let yetkili = guildDatabase.jail.yetkili
            if (yetkili) {
                if (!msgMember.roles.cache.has(yetkili) && !msgMember.permissions.has('Administrator')) return hata(`<@&${yetkili}> rolüne **veya** Yönetici`, "yetki")
            } else if (!msgMember.permissions.has('Administrator')) return hata('Yönetici', "yetki")
            let rol = guildDatabase.jail.rol
            if (!rol) return hata(`Bu sunucuda herhangi bir jail rolü __ayarlanmamış__${msgMember.permissions.has('Administrator') ? `\n\n• Ayarlamak için **${prefix}jail-rol @rol** yazabilirsiniz` : ""}`)
            if (!guildMe.permissions.has('ManageRoles')) return hata("Kullanıcı Adlarını Yönet", "yetkibot")
            if (guild.roles.cache.get(rol).position >= guildMe.roles.highest.position) return hata(`<@&${rol}> adlı rolün sırası benim rolümün sırasından yüksek! Lütfen ${guildMe.roles.botRole?.toString() || guildMe.roles.highest?.toString()} adlı rolü üste çekiniz ve tekrar deneyiniz`)
            let j = args.join(" ")
            let member = msg.mentions.members.first() || await msg.client.fetchMember(j, msg)
            if (!member) return hata(Time.isNull(member) ? "Görünen o ki etiketlediğiniz kişi sunucuda değil ya da başka bir şeyin ID'sini yazdınız :(" : "Lütfen bir kişiyi etiketleyiniz ya da ID\'sini giriniz")
            if (!member) return hata(`Lütfen süreli jail'e atılmasını istediğiniz kişiyi etiketleyiniz`)


            let date = Date.now()
                , sure = date
                , sebep = j
                , saniye = sebep.match(msg.client.regex.getSeconds)
                , dakika = sebep.match(msg.client.regex.getMinutes)
                , saat = sebep.match(msg.client.regex.getHours)
                , gün = sebep.match(msg.client.regex.getDays)
            if (saniye) saniye.forEach(sn => sure += sn * 1000)
            if (dakika) dakika.forEach(sn => sure += sn * 60000)
            if (saat) saat.forEach(sn => sure += sn * 3600000)
            if (gün) gün.forEach(sn => sure += sn * 86400000)
            if (sure == date) return hata(`Lütfen bir süre giriniz\n\n**Örnek**\n• ${prefix}tempjail <@${member.id}> 1 gün 5 saat 6 dakika 30 saniye biraz kafanı dinle sen\n• ${prefix}tempjail <@${member.id}> 30 dakika`, "h", 20000)
            if (member.roles.cache.has(rol)) return hata(`<@${member.id}> adlı kişi zaten jail'e atılmış durumda`)
            let sunucuJail = db.bul(guildId, "jail", "diğerleri") || {}
                , memberRoles = member.roles.cache.map(a => a.id)

            // Üyeyi süreli jaile atma
            await member.edit({ roles: [rol] }).then(async () => {
                msg.react(ayarlar.emoji.p).catch(err => { })
                sunucuJail[member.id] = memberRoles
                db.yaz(guildId, sunucuJail, "jail", "diğerleri")
                sebep = sebep.replace(/(?<!\d)\d{1,3} ?(saniye|d?akika|saat|g[üu]n|sn|s|m|dk|h|d)/gi, "").replace(new RegExp(`<@!?${member.id}>|${member.id}`, "g"), "").replace(/ +/g, " ").trim() || undefined
                let kisi = guildDatabase.jail.kisi[member.id] || []
                    , kl = guildDatabase.kl[member.id] || []
                kl.unshift({ type: "tj", time: sure - date, c: true, author: msg.author.id, timestamp: date, number: guildDatabase.sc.sayı })
                guildDatabase.kl[member.id] = kl
                kisi.unshift({ y: msg.author.id, s: sebep, sure: "⏰", z: date, bool: true })
                guildDatabase.jail.kisi[member.id] = kisi
                guildDatabase.jail.son.unshift({ s: msg.author.id, k: member.id, z: date, se: sebep, sure: "⏰", bool: true })
                const clientPp = msg.client.user.displayAvatarURL()
                db.yazdosya(guildDatabase, guildId)
                Time.setTimeout(async () => {
                    const guildDatabase2 = msg.client.guildDatabase(guildId)
                    if (!guildDatabase2) return;
                    const rolid = guildDatabase2.jail.rol
                    if (!rolid) return;
                    const uye = await msg.client.fetchMember(member.id, msg)
                    if (!uye) return;
                    let sunucuJail = db.bul(guildId, "jail", "diğerleri") || {}
                        , memberRoles = (sunucuJail[member.id] ? sunucuJail[member.id].filter(a => guild.roles.cache.has(a)) : member.roles.cache.filter(a => a.id != rol).map(a => a.id))
                    await member.edit({ roles: memberRoles }).then(async () => {
                        let channel = msg.channel
                            , message = channel.messages.cache.get(obje.idler.m) || await channel.messages.fetch({ message: obje.idler.m })
                        if (message) message.reply({ content: `• <@${member.id}> adlı kişinin jail rolü başarıyla kaldırıldı!`, allowedMentions: { users: [member.id], repliedUser: true } })?.catch(err => { })
                        else channel.send({ content: `• <@${member.id}> adlı kişinin jail rolü başarıyla kaldırıldı!`, allowedMentions: { users: [member.id], repliedUser: true } }).catch(err => { })
                        let dosya = db.bul(guildId, "tempjail", "diğerleri")
                        if (dosya) {
                            if (dosya[uye.id]?.d != date) return;
                            delete dosya[uye.id]
                        } else return;
                        db.yaz(guildId, dosya, "tempjail", "diğerleri")
                        delete sunucuJail[member.id]
                        db.yaz(guildId, sunucuJail, "jail", "diğerleri")
                        let date2 = Date.now()
                            , obje2 = { y: msg.author.id, z: date2, sure: "⏰", bool: false }
                            , kisi = guildDatabase2.jail.kisi[member.id]
                            , kl = guildDatabase2.kl[member.id] || []
                        kl.unshift({ type: "tj", c: false, author: msg.author.id, timestamp: date2 })
                        guildDatabase2.kl[member.id] = kl
                        if (kisi) kisi.unshift(obje2)
                        else kisi = [obje2]
                        guildDatabase2.jail.kisi[member.id] = kisi
                        guildDatabase2.jail.son.unshift({ s: msg.author.id, k: uye.id, z: date2, sure: "⏰", bool: false })
                        db.yazdosya(guildDatabase2, guildId)
                        let log = guildDatabase2.jail.log
                        if (log) {
                            let pp = uye.displayAvatarURL()
                                , date3 = (date2 / 1000).toFixed(0)
                                , yapılanSeyler = [
                                    `🧰 **SÜRELİ JAIL'E ATAN YETKİLİ**`,
                                    `**• Adı:**  <@${msg.author.id}> - ${msg.author.tag}`,
                                    `**• Jail'den çıkarılma zamanı:**  <t:${date3}:F> - <t:${date3}:R>`,
                                    `\n👤 **JAIL'DEN ÇIKARILAN KİŞİ**`,
                                    `**• Adı:**  <@${uye.user.id}> - ${uye.user.tag}`,
                                    `**• Alınan rol:**  <@&${rol}>`,
                                    `**• Sebebi:**  ${sebep || "Sebep belirtilmemiş"}`,
                                    `**• Jail'e atılma zamanı:**  ${zaman}`,
                                    `**• Kaç kere jaile atıldı:**  ${kisi.filter(a => a.bool == true).length} kere`,
                                ]
                                , embed = new EmbedBuilder()
                                    .setAuthor({ name: member.user.tag, iconURL: pp })
                                    .setDescription(yapılanSeyler.join("\n"))
                                    .setThumbnail(pp)
                                    .setColor("#af0003")
                                    .setFooter({ text: `${msg.client.user.username} Log sistemi`, iconURL: clientPp })
                                    .setTimestamp()
                            guild.channels.cache.get(log)?.send({ embeds: [embed] }).catch(err => { })
                        }
                        return;
                    }).catch(err => {
                        const embed = new EmbedBuilder()
                            .setTitle("Hata")
                            .setDescription(`**• <@${uye.id}> adlı kişiden jail rolünü alamadım! Lütfen bana yönetici yetkisi verdiğinizden ve rolümün üstte olduğundan emin olunuz**\n\n• ${err}`)
                            .setColor("Red")
                            .setTimestamp()
                        return msg?.channel?.send({ embeds: [embed] }).catch(err => { })
                    })
                }, sure - date)
                let dosyasunucu = db.bul(guildId, "tempjail", "diğerleri") || {}
                    , obje = { d: date, s: sure - date, se: sebep, idler: { c: msg.channelId, s: msg.author.id } }
                await msg.reply({ content: `• <@${member.id}> adlı kişi **${Time.duration({ ms: sure - date, skipZeros: true })}** boyunca __**${sebep || "Sebep belirtilmemiş"}**__ sebebinden jaile atıldı! **Ceza numarası:** \`#${guildDatabase.sc.sayı}\``, allowedMentions: { users: [member.id], repliedUser: true } }).then(mesaj => {
                    obje.idler.m = mesaj.id
                }).catch(err => { })
                dosyasunucu[member.id] = obje
                db.yaz(guildId, dosyasunucu, "tempjail", "diğerleri")
                guildDatabase.sc.sayı += 1
                let log = guildDatabase.jail.log
                let zaman = `<t:${(date / 1000).toFixed(0)}:F> - <t:${(date / 1000).toFixed(0)}:R>`
                if (log) {
                    let pp = member.displayAvatarURL()
                        , yapılanSeyler = [
                            `🧰 **SÜRELİ JAIL'E ATAN YETKİLİ**`,
                            `**• Adı:**  <@${msg.author.id}> - ${msg.author.tag}`,
                            `**• Jail'e atma zamanı:**  ${zaman}`,
                            `\n👤 **SÜRELİ JAIL'E ATILAN KİŞİ**`,
                            `**• Adı:**  <@${member.user.id}> - ${member.user.tag}`,
                            `**• Verilen rol:**  <@&${rol}>`,
                            `**• Sebebi:**  ${sebep || "Sebep belirtilmemiş"}`,
                            `**• Jail süresinin bitiş tarihi:**  <t:${(sure / 1000).toFixed(0)}:F> - <t:${(sure / 1000).toFixed(0)}:R>`,
                            `**• Kaç kere jaile atıldı:**  ${kisi.filter(a => a.bool == true).length} kere`,
                        ]
                        , embed = new EmbedBuilder()
                            .setAuthor({ name: member.user.tag, iconURL: pp })
                            .setDescription(yapılanSeyler.join("\n"))
                            .setThumbnail(pp)
                            .setColor("#af0003")
                            .setFooter({ text: `${msg.client.user.username} Log sistemi`, iconURL: clientPp })
                            .setTimestamp()
                    guild.channels.cache.get(log)?.send({ embeds: [embed] }).catch(err => { })
                }
                return;
            }).catch(err => {
                return hata(`**• <@${member.id}> adlı kişiye jail rolünü veremedim! Lütfen bana yönetici yetkisi verdiğinizden ve rolümün üstte olduğundan emin olunuz**\n\n` + "```js\n" + err + "```")
            })
        } catch (e) {
            msg.reply(`**‼️ <@${msg.author.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`).catch(err => { })
            msg.client.error(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }
    }
}


