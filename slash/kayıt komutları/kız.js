const { SlashCommandBuilder, ChatInputCommandInteraction, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
const Time = require("../../modüller/time")
module.exports = {
    name: "kız",
    data: new SlashCommandBuilder()
        .setName("kız")
        .setDescription("Üyeyi kız olarak kayıt et")
        .addUserOption(option => option.setName("üye").setDescription("üyeyi etiketle").setRequired(true))
        .addStringOption(option => option.setName("isim").setDescription("ismini gir").setRequired(true)),
    /**
     * @param {import("../../typedef").exportsRunSlash} param0 
     */
    async run({ int, guildDatabase, alisa, hata, guildId, guild }) {
        try {

            // Kontroller
            let prefix = guildDatabase.prefix || ayarlar.prefix
                , yetkilirolid = guildDatabase.kayıt.yetkili
                , intMember = int.member
            if (!yetkilirolid) return hata(`Bu sunucuda üyeleri kayıt eden yetkili rolü __ayarlanmamış__${intMember.permissions.has('Administrator') ? `\n\n• Ayarlamak için **${prefix}yetkili-rol @rol** yazabilirsiniz veya her şeyi teker teker ayarlamak yerine **${prefix}kur** yazıp bütün kayıt sistemini tek bir komutla ayarlayabilirsiniz` : ""}`)
            if (!intMember.roles.cache.has(yetkilirolid) && !intMember.permissions.has('Administrator')) return hata(`<@&${yetkilirolid}> rolüne veya Yönetici`, "yetki")
            if (guildDatabase.kayıt.secenek) return hata(`Kayıt seçeneğim __**Normal Kayıt**__ olarak ayarlı lütfen \`${prefix}kayıt\` komutunu kullanınız${intMember.permissions.has('Administrator') ? `\n\n• Eğer kız ve erkek olarak kayıt etmek isterseniz **${prefix}seç cinsiyet** yazabilirsiniz` : ""}`)
            if (guildDatabase.kayıt.ayar) return hata(`Şu anda kayıt ayarım kapalı durumda bu yüzden hiçbir kayıt işlemlerini __yapamazsınız__${intMember.permissions.has('Administrator') ? `\n\n• Eğer kayıt ayarımı açmak istiyorsanız **${prefix}ayar aç** yazabilirsiniz` : ""}`)
            let guildMe = int.guild.members.me
            if (!guildMe.permissions.has('ManageRoles')) return hata("Rolleri Yönet", "yetkibot")
            if (!guildMe.permissions.has('ManageNicknames')) return hata("Kullanıcı Adlarını Yönet", "yetkibot")
            var verilecekRolId = guildDatabase.kayıt.kız
            if (!verilecekRolId) return hata(`Bu sunucuda herhangi bir kız rolü __ayarlanmamış__${intMember.permissions.has('Administrator') ? `\n\n• Ayarlamak için **${prefix}kız-rol @rol** yazabilirsiniz veya her şeyi teker teker ayarlamak yerine **${prefix}kur** yazıp bütün kayıt sistemini tek bir komutla ayarlayabilirsiniz` : ""}`)
            var kayıtsızrolid = guildDatabase.kayıt.kayıtsız
            if (!kayıtsızrolid) return hata(`Bu sunucuda herhangi bir kayıtsız rolü __ayarlanmamış__${intMember.permissions.has('Administrator') ? `\n\n• Ayarlamak için **${prefix}alınacak-rol @rol** yazabilirsiniz veya her şeyi teker teker ayarlamak yerine **${prefix}kur** yazıp bütün kayıt sistemini tek bir komutla ayarlayabilirsiniz` : ""}`)
            let kayitkanal = guildDatabase.kayıt.kanal
            if (!kayitkanal) return hata(`Bu sunucuda herhangi bir kayıt kanalı __ayarlanmamış__${intMember.permissions.has('Administrator') ? `\n\n• Ayarlamak için **${prefix}kanal #kanal** yazabilirsiniz veya her şeyi teker teker ayarlamak yerine **${prefix}kur** yazıp bütün kayıt sistemini tek bir komutla ayarlayabilirsiniz` : ""}`)
            if (int.channelId !== kayitkanal) return hata(`Lütfen kayıtları kayıt kanalı olan <#${kayitkanal}> kanalında yapınız`)
            let rol = [...verilecekRolId, kayıtsızrolid].filter(a => guild.roles.cache.get(a)?.position >= guildMe.roles.highest.position)
            if (rol.length) return hata(`[${rol.map(a => "<@&" + a + ">").join(" | ")}] adlı rol(ler)'in sırası benim rolümün sırasından yüksek! Lütfen ${guildMe.roles.botRole.toString()} adlı rolü üste çekiniz ve tekrar deneyiniz`)
            var member = int.options.getMember("üye", false)
            if (!member) return hata(Time.isNull(member) ? "Görünen o ki etiketlediğiniz kişi sunucuda değil ya da başka bir şeyin ID'sini yazdınız :(" : "Lütfen bir kişiyi etiketleyiniz ya da ID\'sini giriniz")
            if (member.user.bot) {
                if (guildDatabase.kayıt.bot) return hata(`Bir botu kız olarak kayıt etemezsin şapşik şey seni\n\n• Eğer botu kayıt etmek isterseniz **${prefix}bot ${member.id}** yazabilirsiniz`)
                if (intMember.permissions.has('Administrator')) return hata('Bir botu kız olarak kayıt etemezsin şapşik şey seni\n\n• Eğer botu kayıt etmek isterseniz ilk önce **' + prefix + 'bot-rol** ile bir bot rolünü ayarlamalısınız')
                return hata('Bir botu kız olarak kayıt etemezsin şapşik şey seni\n\n• Eğer botu kayıt etmek isterseniz yetkililere bir bot rolü ayarlamasını söyleyiniz')
            }
            const memberid = member.user.id
            const sahipid = int.user.id
            const buttonCooldown = int.client.buttonCooldown.get(memberid + guildId)
            if (buttonCooldown) {
                if (buttonCooldown == sahipid) return hata("Heyyy dur bakalım orada! Aynı anda hem butonla hem de komutla kayıt edemezsin!")
                return hata("Heyyy dur bakalım orada! Şu anda başkası kayıt işlemini gerçekleştiriyor!")
            }
            if (memberid === sahipid) return hata('Kendi kendini kayıt edemezsin şapşik şey seni :)')
            if (memberid == guild.ownerId) return hata("Sunucu sahibini kayıt edemezsin şapşik şey seni :)")
            let erkekrolseysi = guildDatabase.kayıt.erkek || [], rolVarMı = true
            if ([...verilecekRolId, ...erkekrolseysi].some(a => member.roles.cache.has(a))) return hata('Etiketlediğiniz kişi zaten daha önceden kayıt edilmiş')
            if (!member.roles.cache.has(kayıtsızrolid)) rolVarMı = false
            if (member.roles.highest.position >= guildMe.roles.highest.position) return hata(`Etiketlediğiniz kişinin rolünün sırası benim rolümün sırasından yüksek! Lütfen ${guildMe.roles.botRole.toString()} adlı rolü üste çekiniz ve tekrar deneyiniz`)
            
            function UpperKelimeler(str) {
                if (!guildDatabase.kayıt.otoduzeltme) {
                    let sembol = guildDatabase.kayıt.sembol
                    if (sembol) return str.replace(/ /g, " " + sembol)
                    else return str
                }
                var parcalar = str.match(/[\wöçşıüğÖÇŞİÜĞ]+/g)
                if (!parcalar?.length) return str
                parcalar.forEach(a => str = str.replace(a, a[0].toLocaleUpperCase() + a.slice(1).toLocaleLowerCase()))
                let sembol = guildDatabase.kayıt.sembol
                if (sembol) return str.replace(/ /g, " " + sembol)
                else return str
            }

            let tag = guildDatabase.kayıt.tag, kayıtisim = guildDatabase.kayıt.isimler.kayıt, ismi, sadeceisim = int.options.getString("isim", true)
            if (kayıtisim) {
                if (kayıtisim.indexOf("<yaş>") != -1) {
                    let age = sadeceisim.match(int.client.regex.fetchAge)
                    if (age) {
                        let sınır = guildDatabase.kayıt.yassınır
                        if (sınır > age[0]) return hata(`Heyyy dur bakalım orada! Bu sunucuda **${sınır}** yaşından küçükleri kayıt edemezsin!`)
                        sadeceisim = sadeceisim.replace(age[0], "").replace(/ +/g, " ").trim()
                    } else if (guildDatabase.kayıt.yaszorunlu) return hata("Heyyy dur bakalım orada! Bu sunucuda kayıt ederken geçerli bir yaş girmek zorundasın!")
                    else age = [""]
                    ismi = kayıtisim.replace(/<tag>/g, (tag ? tag.slice(0, -1) : "")).replace(/<isim>/g, UpperKelimeler(sadeceisim)).replace(/<yaş>/g, age[0])
                } else ismi = kayıtisim.replace(/<tag>/g, (tag ? tag.slice(0, -1) : "")).replace(/<isim>/g, UpperKelimeler(sadeceisim))
            } else {
                if (guildDatabase.kayıt.yaszorunlu) {
                    let sınır = guildDatabase.kayıt.yassınır
                    if (sınır) {
                        let age = sadeceisim.match(int.client.regex.fetchAge)
                        if (!age) return hata("Heyyy dur bakalım orada! Bu sunucuda kayıt ederken geçerli bir yaş girmek zorundasın!")
                        if (sınır > age[0]) return hata(`Heyyy dur bakalım orada! Bu sunucuda **${sınır}** yaşından küçükleri kayıt edemezsin!`)
                    } else if (sadeceisim.search(int.client.regex.fetchAge) == -1) return hata("Heyyy dur bakalım orada! Bu sunucuda kayıt ederken geçerli bir yaş girmek zorundasın!")
                }
                ismi = `${tag || ""}${UpperKelimeler(sadeceisim)}`
            }
            
            // Kontroller
            if (ismi.length > 32) return hata('Sunucu ismi 32 karakterden fazla olamaz lütfen karakter sayısını düşürünüz')
            
            // Üyeyi kız olarak kayıt etme
            await member.edit({ roles: [...verilecekRolId, ...member.roles.cache.filter(a => a.id != kayıtsızrolid).map(a => a.id)], nick: ismi }).then(async () => {
                let date = Date.now()
                    , date2 = (date / 1000).toFixed(0)
                    , zaman = `<t:${date2}:F>`
                    , desmsg = null
                    , verilecekRolString = verilecekRolId.map(a => "<@&" + a + ">").join(", ")
                    , sahip = { kız: 0, toplam: 0, erkek: 0, normal: 0, ...guildDatabase.kayıtkisiler[sahipid] }
                    , kontrolisimler = guildDatabase.isimler[memberid]
                    , kl = guildDatabase.kl[memberid] || []
                    , ranklar = ayarlar.ranklar
                kl.unshift({ type: "k", c: "Kız", author: sahipid, timestamp: date })
                guildDatabase.kl[memberid] = kl
                if (!kontrolisimler) {
                    sahip.toplam += 1
                    sahip.kız += 1
                    let rankIndex = ayarlar.rankSayıları.indexOf(sahip.toplam)
                    if (rankIndex != -1) {
                        sahip.rank = String(rankIndex)
                        desmsg = `• <@${sahipid}> Tebrikler **${ranklar[rankIndex]}** kümesine terfi ettin! 🎉`
                    }
                } else desmsg = `• <@${memberid}> adlı kişi bu sunucuda daha önceden **${kontrolisimler?.length}** kere kayıt edildiği için kayıt puanlarına ekleme yapılmadı (**${prefix}isimler ${memberid}**)`
                let kayıtsayısı = sahip.toplam || 0
                    , clientPp = int.client.user.displayAvatarURL()
                    , kişininfotografı = member.displayAvatarURL()
                    , dugmeler = new ActionRowBuilder().addComponents(new ButtonBuilder().setLabel("İsmini değiştir").setEmoji("📝").setStyle(1).setCustomId("KAYIT_İSİM_DEĞİŞTİR" + memberid)).addComponents(new ButtonBuilder().setLabel("Cinsiyetini değiştir").setEmoji("♻️").setStyle(2).setCustomId("KAYIT_CİNSİYET_DEĞİŞTİR" + memberid)).addComponents(new ButtonBuilder().setLabel("Kayıtsıza at").setEmoji("⚒️").setStyle(4).setCustomId("KAYIT_KAYITSIZ" + memberid))
                    , embed = new EmbedBuilder()
                        .setAuthor({ name: 'Kayıt yapıldı', iconURL: guild.iconURL() })
                        .setDescription(desmsg)
                        .addFields(
                            {
                                name: '`Kayıt yapan`',
                                value: `> 👤 **Adı:** <@${sahipid}>\n> 🔰 **Rankı:** ${ranklar[sahip.rank] || "Rankı yok"}\n> 📈 **Kayıt sayısı:** ${kayıtsayısı}`,
                                inline: true
                            }
                            , {
                                name: '`Kayıt edilen`',
                                value: `> 👤 **Adı:** <@${memberid}>\n> 📝 **Yeni ismi:** \`${ismi}\`\n> ${ayarlar.emoji.rol} **Verilen rol(ler):** ${verilecekRolString}`,
                                inline: true
                            }
                        )
                        .setThumbnail(kişininfotografı)
                        .setFooter({ text: `${int.client.user.username} Kayıt sistemi`, iconURL: clientPp })
                        .setColor('#b90ebf')
                        .setTimestamp()
                int.reply({ embeds: [embed], components: [dugmeler] }).catch(err => { })
                let logkanalid = guildDatabase.kayıt.günlük
                if (logkanalid) {
                    let g = guildDatabase.kayıt.gözel
                    const mesajlar = [...ayarlar.k, `<@${member.id}> gözümü alan bu güzellik ne böyle`, `Güzelliğin ete kemiğe bürünmüş hali gibisin <m>`, `Güzellik diyince akla sen geliyorsun <m>`, `Yok yok ben iyiyim <m> sadece güzelliğin gözlerimi aldı da`, `<m> uzuun araştırmalarım sonucunda çok güzel olduğuna karar verdim`, `<m> pardon güzellik salonuna mı geldim`, `<m> pardon hanımefendi güzellik yarışmasına katılmayı hiç düşündünüz mü?`, `<m> bu güzelliği taşırken hiç yorulmuyor musun?`, `<m> hanımefendi müsadenizle size yürüyeceğim`, "Şeyy <m> senden Bi ricam var. Nikah masasında ayağımı çiğner misin?"]
                    if (g) {
                        let taglar = []
                        if (tag) taglar.push(tag.slice(0, -1))
                        if (guildDatabase.kayıt.dis) taglar.push(`#${guildDatabase.kayıt.dis}`)
                        taglar = taglar.join(" - ") || "**TAG YOK**"
                        const kisi = guild.memberCount
                        let r = g.yazı.replace(/<üye>/g, `<@${member.id}>`).replace(/<üyeİsim>/g, member.user.username).replace(/<üyeI[dD]>/g, memberid).replace(/<rol>/g, verilecekRolString).replace(/<üyeTag>/g, member.user.tag).replace(/<toplam>/g, kisi.toLocaleString().replace(".", ",")).replace(/<emojiToplam>/g, int.client.stringToEmojis(kisi)).replace(/<yetkili>/g, `<@${int.user.id}>`).replace(/<yetkiliTag>/g, int.user.tag).replace(/<yetkiliİsim>/g, int.user.username).replace(/<yetkiliI[dD]>/g, sahipid).replace(/<sayı>/g, kayıtsayısı).replace(/<tag>/g, taglar)
                        guild.channels.cache.get(logkanalid)?.send(g.embed ? { content: mesajlar[Math.floor(Math.random() * mesajlar.length)].replace("<m>", `<@${memberid}>`), embeds: [new EmbedBuilder().setTitle(`Aramıza hoşgeldin ${member.user.username} ${ayarlar.emoji.selam}`).setDescription(r).setTimestamp().setThumbnail(kişininfotografı).setColor('#df5702')] } : { content: r, allowedMentions: { users: [memberid], roles: !verilecekRolId } }).catch(err => { })
                    } else {
                        const hepsi = new EmbedBuilder()
                            .setTitle(`Aramıza hoşgeldin ${member.user.username} ${ayarlar.emoji.selam}`)
                            .setDescription(`${ayarlar.emoji.cildir} **• <@${member.id}> aramıza ${verilecekRolString} rolleriyle katıldı**`)
                            .addFields(
                                {
                                    name: "Kaydın bilgileri",
                                    value: `• **Kayıt edilen kişi:** <@${memberid}>\n• **Kayıt eden yetkili:** <@${sahipid}>`
                                }
                            )
                            .setFooter({ text: `Kayıt sayısı => ${kayıtsayısı}` })
                            .setThumbnail(kişininfotografı)
                            .setColor('#b90ebf')
                        guild.channels.cache.get(logkanalid)?.send({ embeds: [hepsi], content: mesajlar[Math.floor(Math.random() * mesajlar.length)].replace("<m>", `<@${memberid}>`) }).catch(err => { })
                    }
                }
                guildDatabase.son.unshift({ c: ayarlar.emoji.kiz, s: sahipid, k: memberid, z: date2 })
                let logKanali = guildDatabase.kayıt.log
                if (logKanali) {
                    const yapılanSeyler = [
                        `**• Sunucuda toplam ${guildDatabase.son.length.toLocaleString().replace(/\./g, ",")} kişi kayıt edildi!**\n`,
                        `🧰 **KAYIT EDEN YETKİLİ**`,
                        `**• Adı:**  <@${int.user.id}> - ${int.user.tag}`,
                        `**• Kayıt sayısı:**  ${kayıtsayısı} - (${ayarlar.emoji.erkek} ${sahip.erkek || 0}, ${ayarlar.emoji.kiz} ${sahip.kız || 0})`,
                        `**• Nasıl kayıt etti:**  Komut kullanarak`,
                        `**• Kayıt zamanı:**  ${zaman} - <t:${(date / 1000).toFixed(0)}:R>`,
                        `\n👤 **KAYIT EDİLEN ÜYE**`,
                        `**• Adı:**  <@${member.id}> - ${member.user.tag}`,
                        `**• Alınan rol:**  ${rolVarMı ? `<@&${kayıtsızrolid}>` : "Üyede kayıtsız rolü yoktu"}`,
                        `**• Verilen rol(ler):**  ${verilecekRolString}`,
                        `**• Yeni ismi:**  ${ismi}`,
                        `**• Kayıt şekli:**  Kız ${ayarlar.emoji.kiz}`,
                        `**• Üye daha önceden kayıt edilmiş mi:**  ${kontrolisimler?.length ? `Evet ${kontrolisimler?.length} kere` : "Hayır"}`
                    ]
                    const embed = new EmbedBuilder()
                        .setAuthor({ name: member.user.tag, iconURL: kişininfotografı })
                        .setDescription(yapılanSeyler.join("\n"))
                        .setThumbnail(kişininfotografı)
                        .setColor("#b90ebf")
                        .setFooter({ text: `${int.client.user.username} Log sistemi`, iconURL: clientPp })
                        .setTimestamp()
                    guild.channels.cache.get(logKanali)?.send({ embeds: [embed] }).catch(err => { })
                }
                const toplamherkes = db.topla(guildId, 1, "kayıt toplam herkes", "diğerleri")
                if (toplamherkes % 1000 == 0) {
                    alisa.kayıtsayı[toplamherkes.toString()] = date
                    db.yazdosya(alisa, "alisa", "diğerleri")
                }
                db.topla(guildId, 1, "kız toplam herkes", "diğerleri")
                const obje = { kk: "<@" + memberid + ">", r: verilecekRolString, z: zaman }
                sahip.son = obje
                if (!sahip.ilk) sahip.ilk = obje
                const isimler = { c: ayarlar.emoji.kiz, n: ismi, r: verilecekRolString, s: sahipid, z: date2 }
                if (kontrolisimler) kontrolisimler.unshift(isimler)
                else guildDatabase.isimler[memberid] = [isimler]
                guildDatabase.kayıtkisiler[sahipid] = sahip
                db.yazdosya(guildDatabase, guildId)
            }).catch(async err => {
                if (err?.code == 50013) return hata(`<@${memberid}> adlı kişinin ismini ve rollerini düzenlemeye yetkim yetmiyor. Lütfen ${guildMe.roles.botRole?.toString() || guildMe.roles.highest?.toString()} adlı rolü üste çekiniz ve tekrar deneyiniz`)
                console.log(err)
                return hata('Iıııı şey.. Bir hata oluştu da daha sonra tekrar dener misin?\n```js\n' + err + "```")
            })
        } catch (e) {
            hata(`**‼️ <@${int.user.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`, true).catch(err => { })
            int.client.error(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }
    }
}

