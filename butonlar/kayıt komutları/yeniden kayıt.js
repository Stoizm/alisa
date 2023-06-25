const { ButtonInteraction, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
    name: "yeniden",
    /**
       * @param {import("../../typedef").exportsRunButtons} param0 
       */
    async run({ int, guildDatabase, alisa, hata, guildId, guild }) {
        try {

            // Kontroller
            let prefix = guildDatabase.prefix || ayarlar.prefix
                , yetkilirolid = guildDatabase.kayıt.yetkili
                , intMember = int.member
            if (!yetkilirolid) return hata(`Bu sunucuda üyeleri kayıt eden yetkili rolü __ayarlanmamış__${intMember.permissions.has('Administrator') ? `\n\n• Ayarlamak için **${prefix}yetkili-rol @rol** yazabilirsiniz veya her şeyi teker teker ayarlamak yerine **${prefix}kur** yazıp bütün kayıt sistemini tek bir komutla ayarlayabilirsiniz` : ""}`)
            if (!intMember.roles.cache.has(yetkilirolid) && !intMember.permissions.has('Administrator')) return hata("Bunu sen yapamazsın şapşik şey seni :(")
            if (guildDatabase.kayıt.ayar) return hata(`Şu anda kayıt ayarım kapalı durumda bu yüzden hiçbir kayıt işlemlerini __yapamazsınız__${intMember.permissions.has('Administrator') ? `\n\n• Eğer kayıt ayarımı açmak istiyorsanız **${prefix}ayar aç** yazabilirsiniz` : ""}`)
            let guildMe = int.guild.members.me
            if (!guildMe.permissions.has('ManageRoles')) return hata("Rolleri Yönet", "yetkibot")
            if (!guildMe.permissions.has('ManageNicknames')) return hata("Kullanıcı Adlarını Yönet", "yetkibot")
            let memberid = int.customId.replace(this.name, "")
                , isimler = guildDatabase.isimler[memberid]
            if (!isimler) return hata(`Şeyyy... Bu kişi bu sunucuda daha önceden kayıt olmadığı için bu komutu kullanamazsın :(`)
            let c = isimler[0].c
                , sec = guildDatabase.kayıt.secenek
            if (c == ayarlar.emoji.uye && !sec) return hata(`Heyyy dur bakalım orada! Bu kişi daha önceden **Üye** olarak kayıt edilmiş ama şu anda kayıt seçeneğim __**Cinsiyet**__ olduğu için bu komutu kullanamazsın!`)
            let rol
                , yazı
                , renk
            if (sec) {
                c = ayarlar.emoji.uye
                rol = guildDatabase.kayıt.normal
                yazı = "üye"
                renk = "#df5702"
            } else {
                switch (c) {
                    case ayarlar.emoji.erkek:
                        rol = guildDatabase.kayıt.erkek
                        yazı = "erkek"
                        renk = "#1252ce"
                        break;
                    case ayarlar.emoji.kiz:
                        rol = guildDatabase.kayıt.kız
                        yazı = "kız"
                        renk = "#b90ebf"
                        break;
                }
            }
            let yazıdb = yazı == "üye" ? "normal" : yazı
            if (!rol) return hata(`Bu sunucuda herhangi bir ${yazı} rolü __ayarlanmamış__${intMember.permissions.has('Administrator') ? `\n\n• Ayarlamak için **${prefix}${yazı == "üye" ? "kayıt" : yazı}-rol @rol** yazabilirsiniz veya her şeyi teker teker ayarlamak yerine **${prefix}kur** yazıp bütün kayıt sistemini tek bir komutla ayarlayabilirsiniz` : ""}`)
            var kayıtsızrolid = guildDatabase.kayıt.kayıtsız
            if (!kayıtsızrolid) return hata(`Bu sunucuda herhangi bir kayıtsız rolü __ayarlanmamış__${intMember.permissions.has('Administrator') ? `\n\n• Ayarlamak için **${prefix}alınacak-rol @rol** yazabilirsiniz veya her şeyi teker teker ayarlamak yerine **${prefix}kur** yazıp bütün kayıt sistemini tek bir komutla ayarlayabilirsiniz` : ""}`)
            let roll = [...rol, kayıtsızrolid].filter(a => guild.roles.cache.get(a)?.position >= guildMe.roles.highest.position)
            if (roll.length) return hata(`[${roll.map(a => "<@&" + a + ">").join(" | ")}] adlı rol(ler)'in sırası benim rolümün sırasından yüksek! Lütfen ${guildMe.roles.botRole?.toString() || guildMe.roles.highest?.toString()} adlı rolü üste çekiniz ve tekrar deneyiniz`)
            let member = await int.client.fetchMemberForce(memberid, int)
            if (!member) return hata("Şeyyyy... Sanırım bu kişi artık sunucuda değil şapşik şey seni :(")
            let sahipid = int.user.id
                , buttonCooldown = int.client.buttonCooldown.get(memberid + guildId)
            if (buttonCooldown) return hata("Heyyy dur bakalım orada! Şu anda başkası bu kayıt işlemini gerçekleştiriyor!")
            if (memberid === sahipid) return hata('Kendi kendini kayıt edemezsin şapşik şey seni :)')
            if (memberid == guild.ownerId) return hata("Sunucu sahibini kayıt edemezsin şapşik şey seni :)")
            let rolKayıt
                , rolVarMı = true
            if (sec) rolKayıt = rol
            else rolKayıt = [...guildDatabase.kayıt.erkek, ...guildDatabase.kayıt.kız]
            if (rolKayıt.some(a => member.roles.cache.has(a))) return hata('Kayıt etmek istediğiniz kişi zaten daha önceden kayıt edilmiş')
            if (!member.roles.cache.has(kayıtsızrolid)) rolVarMı = false
            if (member.roles.highest.position >= guildMe.roles.highest.position) return hata(`Kayıt etmek istediğiniz kişinin rolünün sırası benim rolümün sırasından yüksek! Lütfen ${guildMe.roles.botRole?.toString() || guildMe.roles.highest?.toString()} adlı rolü üste çekiniz ve tekrar deneyiniz`)

            let tag = guildDatabase.kayıt.tag
                , n = isimler[0].n

            // Üyeyi yeniden kayıt etme
            await member.edit({ roles: [...rol, ...member.roles.cache.filter(a => ![kayıtsızrolid, ...rol].includes(a.id)).map(a => a.id)], nick: n }).then(async () => {
                let kisivarmıdatabasede = alisa.kisiler[sahipid] || 0
                    , sunucuvarmıdatabasede = alisa.skullanımlar[guildId] || 0
                    , date = Date.now()
                    , date2 = (date / 1000).toFixed(0)
                    , zaman = `<t:${date2}:F>`
                    , rollerimapleme = rol.map(a => "<@&" + a + ">").join(", ")
                    , sahip = { kız: 0, toplam: 0, erkek: 0, normal: 0, ...guildDatabase.kayıtkisiler[sahipid] }
                    , kl = guildDatabase.kl[memberid] || []
                kl.unshift({ type: "k", c: "Erkek", author: sahipid, timestamp: date })
                guildDatabase.kl[memberid] = kl
                kisivarmıdatabasede += 1
                alisa.kisiler[sahipid] = kisivarmıdatabasede
                sunucuvarmıdatabasede += 1
                alisa.skullanımlar[guildId] = sunucuvarmıdatabasede
                alisa.kullanımlar[yazı == "üye" ? "kayıt" : yazı].buton += 1
                let ranklar = ayarlar.ranklar
                    , rankı = sahip.rank
                    , kayıtsayısı = sahip.toplam || 0
                    , discordlogo = guild.iconURL()
                    , kişininfotografı = member.user.displayAvatarURL()
                    , dugmeler = new ActionRowBuilder().addComponents(new ButtonBuilder().setLabel("İsmini değiştir").setEmoji("📝").setStyle(1).setCustomId("KAYIT_İSİM_DEĞİŞTİR" + memberid)).addComponents(new ButtonBuilder().setLabel("Cinsiyetini değiştir").setEmoji("♻️").setStyle(2).setCustomId("KAYIT_CİNSİYET_DEĞİŞTİR" + memberid)).addComponents(new ButtonBuilder().setLabel("Kayıtsıza at").setEmoji("⚒️").setStyle(4).setCustomId("KAYIT_KAYITSIZ" + memberid))
                    , embed = new EmbedBuilder()
                        .setAuthor({ name: 'Yeniden kayıt edildi', iconURL: discordlogo })
                        .setDescription(`• <@${memberid}> adlı kişi bu sunucuda daha önceden **${isimler.length}** kere kayıt edildiği için kayıt puanlarına ekleme yapılmadı (**${prefix}isimler ${memberid}**)`)
                        .addFields(
                            {
                                name: '`Kayıt yapan`',
                                value: `> 👤 **Adı:** <@${sahipid}>\n> 🔰 **Rankı:** ${ranklar[rankı] || "Rankı yok"}\n> 📈 **Kayıt sayısı:** ${kayıtsayısı}`,
                                inline: true
                            }
                            , {
                                name: '`Kayıt edilen`',
                                value: `> 👤 **Adı:** <@${memberid}>\n> 📝 **Yeni ismi:** \`${n}\`\n> ${ayarlar.emoji.rol} **Verilen rol(ler):** ${rollerimapleme}`,
                                inline: true
                            }
                        )
                        .setThumbnail(kişininfotografı)
                        .setFooter({ text: `${int.client.user.username} Kayıt sistemi`, iconURL: int.client.user.displayAvatarURL() })
                        .setColor(renk)
                        .setTimestamp()
                int.message.reply({ embeds: [embed], components: [dugmeler] }).catch(err => { })
                let logkanalid = guildDatabase.kayıt.günlük
                if (logkanalid) {
                    let mesajlar
                    switch (yazı) {
                        case "erkek":
                            mesajlar = [...ayarlar.k, `Anlattıkları kadar karizmaymışsın <m>`, `<m> aramıza bir yakışıklı katıldı`, `Karizmalığın ete kemiğe bürünmüş hali gibisin <m>`, `Adam diyince akla sen geliyorsun <m>`, `Yok yok ben iyiyim <m> sadece yakışıklılığın gözlerimi aldı da`, `<m> uzuun araştırmalarım sonucunda çok yakışıklı olduğuna karar verdim`, `<m> pardon karizma salonuna mı geldim`, `<m> pardon beyefendi yakışıklılık yarışmasına katılmayı hiç düşündünüz mü?`, `<m> bu yakışıklılığı taşırken hiç yorulmuyor musun?`, `<m> beyefendi müsadenizle size yürüyeceğim`, `<m> sana yakışıklı diyorlar doğru mu?`]
                            break;
                        case "kız":
                            mesajlar = [...ayarlar.k, `<@${member.id}> gözümü alan bu güzellik ne böyle`, `Güzelliğin ete kemiğe bürünmüş hali gibisin <m>`, `Güzellik diyince akla sen geliyorsun <m>`, `Yok yok ben iyiyim <m> sadece güzelliğin gözlerimi aldı da`, `<m> uzuun araştırmalarım sonucunda çok güzel olduğuna karar verdim`, `<m> pardon güzellik salonuna mı geldim`, `<m> pardon hanımefendi güzellik yarışmasına katılmayı hiç düşündünüz mü?`, `<m> bu güzelliği taşırken hiç yorulmuyor musun?`, `<m> hanımefendi müsadenizle size yürüyeceğim`, "Şeyy <m> senden Bi ricam var. Nikah masasında ayağımı çiğner misin?"]
                            break;
                        default:
                            mesajlar = ayarlar.k
                            break;
                    }
                    let g = guildDatabase.kayıt.gözel
                    if (g) {
                        let taglar = []
                        if (tag) taglar.push(tag.slice(0, -1))
                        if (guildDatabase.kayıt.dis) taglar.push(`#${guildDatabase.kayıt.dis}`)
                        taglar = taglar.join(" - ") || "**TAG YOK**"
                        const kisi = guild.memberCount
                        let r = g.yazı.replace(/<üye>/g, `<@${member.id}>`).replace(/<üyeİsim>/g, member.user.username).replace(/<üyeI[dD]>/g, memberid).replace(/<rol>/g, rollerimapleme).replace(/<üyeTag>/g, member.user.tag).replace(/<toplam>/g, kisi.toLocaleString().replace(".", ",")).replace(/<emojiToplam>/g, int.client.stringToEmojis(kisi)).replace(/<yetkili>/g, `<@${int.user.id}>`).replace(/<yetkiliTag>/g, int.user.tag).replace(/<yetkiliİsim>/g, int.user.username).replace(/<yetkiliI[dD]>/g, sahipid).replace(/<sayı>/g, kayıtsayısı).replace(/<tag>/g, taglar)
                        guild.channels.cache.get(logkanalid)?.send(g.embed ? { content: mesajlar[Math.floor(Math.random() * mesajlar.length)].replace("<m>", `<@${memberid}>`), embeds: [new EmbedBuilder().setTitle(`Aramıza hoşgeldin ${member.user.username} ${ayarlar.emoji.selam}`).setDescription(r).setTimestamp().setThumbnail(kişininfotografı).setColor(renk)] } : { content: r, allowedMentions: { users: [memberid], roles: !rol } }).catch(err => { })
                    } else {
                        let hepsi = new EmbedBuilder()
                            .setTitle(`Aramıza hoşgeldin ${member.user.username} ${ayarlar.emoji.selam}`)
                            .setDescription(`${ayarlar.emoji.cildir} **• <@${memberid}> aramıza ${rollerimapleme} rolleriyle katıldı**`)
                            .addFields(
                                {
                                    name: "Kaydın bilgileri",
                                    value: `• **Kayıt edilen kişi:** <@${memberid}>\n• **Kayıt eden yetkili:** <@${sahipid}>`
                                }
                            )
                            .setFooter({ text: `Kayıt sayısı => ${kayıtsayısı}` })
                            .setThumbnail(kişininfotografı)
                            .setColor(renk)
                        guild.channels.cache.get(logkanalid)?.send({ embeds: [hepsi], content: mesajlar[Math.floor(Math.random() * mesajlar.length)].replace("<m>", `<@${memberid}>`) }).catch(err => { })
                    }
                }
                guildDatabase.son.unshift({ c: c, s: sahipid, k: memberid, z: date2 })
                let logKanali = guildDatabase.kayıt.log
                if (logKanali) {
                    let yapılanSeyler = [
                        `**• Sunucuda toplam ${guildDatabase.son.length.toLocaleString().replace(/\./g, ",")} kişi kayıt edildi!**\n`,
                        `🧰 **KAYIT EDEN YETKİLİ**`,
                        `**• Adı:**  <@${int.user.id}> - ${int.user.tag}`,
                        `**• Kayıt sayısı:**  ${kayıtsayısı} - ${sec ? `(${ayarlar.emoji.uye} ${sahip.normal || 0})` : `(${ayarlar.emoji.erkek} ${sahip.erkek || 0}, ${ayarlar.emoji.kiz} ${sahip.kız || 0})`}`,
                        `**• Nasıl kayıt etti:**  Buton kullanarak`,
                        `**• Kayıt zamanı:**  ${zaman} - <t:${(date / 1000).toFixed(0)}:R>`,
                        `\n👤 **KAYIT EDİLEN ÜYE**`,
                        `**• Adı:**  <@${member.user.id}> - ${member.user.tag}`,
                        `**• Alınan rol:**  ${rolVarMı ? `<@&${kayıtsızrolid}>` : "Üyede kayıtsız rolü yoktu"}`,
                        `**• Verilen rol(ler):**  ${rollerimapleme}`,
                        `**• Yeni ismi:**  ${n}`,
                        `**• Kayıt şekli:**  ${yazı[0].toLocaleUpperCase() + yazı.slice(1)} ${c}`,
                        `**• Üye daha önceden kayıt edilmiş mi:**  Evet ${isimler.length} kere`
                    ]
                        , embed = new EmbedBuilder()
                            .setAuthor({ name: member.user.tag, iconURL: kişininfotografı })
                            .setDescription(yapılanSeyler.join("\n"))
                            .setThumbnail(kişininfotografı)
                            .setColor(renk)
                            .setFooter({ text: `${int.client.user.username} Log sistemi`, iconURL: int.client.user.displayAvatarURL() })
                            .setTimestamp()
                    guild.channels.cache.get(logKanali)?.send({ embeds: [embed] }).catch(err => { })
                }
                let toplamherkes = db.topla(guildId, 1, "kayıt toplam herkes", "diğerleri")
                    , obje = { kk: "<@" + memberid + ">", r: rollerimapleme, z: zaman }
                    , isimler2 = { c: c, n: n, r: rollerimapleme, s: sahipid, z: date2 }
                if (toplamherkes % 1000 == 0) alisa.kayıtsayı[toplamherkes.toString()] = date
                db.topla(guildId, 1, `${yazıdb} toplam herkes`, "diğerleri")
                sahip.son = obje
                if (!sahip.ilk) sahip.ilk = obje
                isimler.unshift(isimler2)
                guildDatabase.isimler[memberid] = isimler
                guildDatabase.kayıtkisiler[sahipid] = sahip
                db.yazdosya(alisa, "alisa", "diğerleri")
                db.yazdosya(guildDatabase, guildId)
            }).catch(async err => {
                if (err?.code == 10007) return int.message.reply(`• <@${int.user.id}>, Şeyyyy... Sanırım bu kişi artık sunucuda değil şapşik şey seni :(`).catch(err => { })
                if (err?.code == 50013) return int.message.reply(`• <@${int.user.id}>, <@${memberid}> adlı kişinin ismini ve rollerini düzenlemeye yetkim yetmiyor. Lütfen ${guildMe.roles.botRole?.toString() || guildMe.roles.highest?.toString()} adlı rolü üste çekiniz ve tekrar deneyiniz`).catch(err => { })
                console.log(err)
                return int.message.reply({ content: '<@' + int.user.id + '>, Iıııı şey.. Bir hata oluştu da daha sonra tekrar dener misin?\n```js\n' + err + "```", ephemeral: true }).catch(err => { })
            })
        } catch (e) {
            hata(`**‼️ <@${int.user.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`, true)
            int.client.error(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }
    }
}