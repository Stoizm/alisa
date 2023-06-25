const { Message, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
  cooldown: 10,
  name: "kbilgi",
  aliases: "kbilgi",
  /**
   * @param {import("../../typedef").exportsRunCommands} param0 
   */
  async run({ guildDatabase, pre, alisa, msg, args, guildId, prefix, hata, guild, msgMember, guildMe }) {
    try {
      let kişi = msg.mentions.members.first() || await msg.client.fetchMember(args[0], msg)
        , ranklar = ayarlar.ranklar
        , simdikizaman = Date.now() / 1000
        , bot = 0
        , son1saat = 0
        , son1gün = 0
        , son1hafta = 0
        , son1ay = 0
        , benimyerim
      if (kişi) {
        if (kişi.user.bot) {
          if (kişi.id == msg.client.user.id) {
            let ilk
              , son
              , kayıtlarseysi
              , sahip = guildDatabase.kayıtkisiler[msg.client.user.id]
              , toplam = (sahip?.toplam || 0)
              , kişininfotografı = kişi.displayAvatarURL()
            if (sahip) {
              kayıtlarseysi = guildDatabase.son.filter(a => {
                if (a.s != msg.client.user.id) return false
                let zaman = a.z
                if (simdikizaman - 3600 < zaman) son1saat += 1
                if (simdikizaman - 86400 < zaman) son1gün += 1
                if (simdikizaman - 604800 < zaman) son1hafta += 1
                if (simdikizaman - 2629800 < zaman) son1ay += 1
                return true
              }).slice(0, 5).map(a => `• (${a.c}) <@${a.k}> | <t:${a.z}:F>`).join("\n") || "• Burada gösterilecek hiçbir şey yok..."
              let ilkKayıt = sahip.ilk
                , sonKayıt = sahip.son
                , sıralama = Object.entries(guildDatabase.kayıtkisiler).filter(a => a[1].toplam).sort((a, b) => b[1].toplam - a[1].toplam)
              ilk = `👤 **Kayıt ettiğim kişi:**  ${ilkKayıt.kk}\n${ayarlar.emoji.rol} **Verdiğim rol(ler):**  ${ilkKayıt.r} \n⏲️ **Tarihi:**  ${ilkKayıt.z}`
              son = `👤 **Kayıt ettiğim kişi:**  ${sonKayıt.kk}\n${ayarlar.emoji.rol} **Verdiğim rol(ler):**  ${sonKayıt.r} \n⏲️ **Tarihi:**  ${sonKayıt.z}`
              benimyerim = "\n📈 **Sunucu sıralamam:**  " + (sıralama.indexOf(sıralama.find(a => a[0] == kişi.id)) + 1) + ". sıradayım *(" + sıralama.length + " kişi içinden)*"
            }
            const embed = new EmbedBuilder()
              .setAuthor({ name: kişi.user.tag, iconURL: kişininfotografı })
              .setDescription(`🔰 **Rankım:**  Botların rankı olmaz :)${benimyerim || ""}`)
              .addFields(
                {
                  name: 'Kayıt ettiklerim (' + toplam + ")",
                  value: `**🤖 Bot:**  ${toplam}`,
                  inline: true
                },
                {
                  name: "\u200b",
                  value: "\u200b",
                  inline: true
                },
                {
                  name: "Kayıt etkinliğim",
                  value: `**⏰ Son 1 saat:** \`${son1saat}\`\n**📅 Son 1 gün:** \`${son1gün}\`\n**📆 Son 1 hafta:** \`${son1hafta}\`\n**🗓️ Son 1 ay:** \`${son1ay}\`\n`,
                  inline: true
                },
                {
                  name: '`Kayıt ettiğim ilk kişi`',
                  value: `${ilk || "• Burada gösterilecek hiçbir şey yok..."}`
                },
                {
                  name: '`Kayıt ettiğim son kişi`',
                  value: `${son || "• Burada gösterilecek hiçbir şey yok..."}`
                },
                {
                  name: "`Son 5 kaydım`",
                  value: (kayıtlarseysi || "• Burada gösterilecek hiçbir şey yok...")
                }
              )
              .setColor('#7a1ac0')
              .setThumbnail(kişininfotografı)
              .setTimestamp()
              .setColor('#7a1ac0')
              .setFooter({ text: `Sizleri seviyorum <3` })
            return msg.reply({ embeds: [embed] }).catch(err => { })
          } else return hata("Botların kayıt sayısına bakmayı gerçekten düşünmüyorsun değil mi?")
        }
        let kişininfotografı = kişi.displayAvatarURL()
          , sahip = guildDatabase.kayıtkisiler[kişi.id]
          , ilk
          , son
          , kayıtlarseysi
          , rankı = (ranklar[sahip?.rank] || "Rankı yok")
          , toplam = (sahip?.toplam || "0")
          , gercekToplam = 0
        if (!sahip) {
          ilk = "• Burada gösterilecek hiçbir şey yok..."
          son = "• Burada gösterilecek hiçbir şey yok..."
          kayıtlarseysi = "• Burada gösterilecek hiçbir şey yok..."
        } else {
          const a = sahip.ilk
          ilk = `👤 **Kayıt ettiği kişi:**  ${a.kk}\n${ayarlar.emoji.rol} **Verdiği rol(ler):**  ${a.r} \n⏲️ **Tarihi:**  ${a.z}`
          const b = sahip.son
          son = `👤 **Kayıt ettiği kişi:**  ${b.kk}\n${ayarlar.emoji.rol} **Verdiği rol(ler):**  ${b.r} \n⏲️ **Tarihi:**  ${b.z}`
          kayıtlarseysi = guildDatabase.son.filter(a => {
            if (a.s != kişi.id) return false
            if (a.c == "🤖") bot += 1
            gercekToplam += 1
            let zaman = a.z
            if (simdikizaman - 3600 < zaman) son1saat += 1
            if (simdikizaman - 86400 < zaman) son1gün += 1
            if (simdikizaman - 604800 < zaman) son1hafta += 1
            if (simdikizaman - 2629800 < zaman) son1ay += 1
            return true
          }).slice(0, 5).map(a => `• (${a.c}) <@${a.k}> | <t:${a.z}:F>`).join("\n") || "• Burada gösterilecek hiçbir şey yok..."
          const sıralama = Object.entries(guildDatabase.kayıtkisiler).filter(a => a[1].toplam).sort((a, b) => b[1].toplam - a[1].toplam)
          benimyerim = "\n📈 **Sunucu sıralaması:**  " + (sıralama.indexOf(sıralama.find(a => a[0] == kişi.id)) + 1) + ". sıra *(" + sıralama.length + " kişi içinden)*"
        }
        const embed = new EmbedBuilder()
          .setAuthor({ name: kişi.user.tag, iconURL: kişininfotografı })
          .addFields(
            {
              name: `Kayıt ettikleri (${toplam})`,
              value: `**${guildDatabase.kayıt.secenek ? `${ayarlar.emoji.uye} Üye:**  ${sahip?.normal || "0"}` : `${ayarlar.emoji.erkek} Erkek:**  ${sahip?.erkek || "0"}\n**${ayarlar.emoji.kiz} Kız:**  ${sahip?.kız || "0"}`}\n**🤖 Bot:**  ${bot}\n\n**🗂️ Gerçek kayıt sayısı:**  ${gercekToplam}`,
              inline: true
            },
            {
              name: "\u200b",
              value: "\u200b",
              inline: true
            },
            {
              name: "Kayıt etkinliği",
              value: `**⏰ Son 1 saat:** \`${son1saat}\`\n**📅 Son 1 gün:** \`${son1gün}\`\n**📆 Son 1 hafta:** \`${son1hafta}\`\n**🗓️ Son 1 ay:** \`${son1ay}\`\n`,
              inline: true
            },
            {
              name: '`Kayıt ettiği ilk kişi`',
              value: `${ilk}`
            },
            {
              name: '`Kayıt ettiği son kişi`',
              value: `${son}`
            },
            {
              name: "`Son 5 kaydı`",
              value: kayıtlarseysi
            }
          )
          .setDescription('🔰 **Rankı:** ' + rankı + (benimyerim || ""))
          .setColor('#7a1ac0')
          .setThumbnail(kişininfotografı)
          .setTimestamp()
        msg.reply({ embeds: [embed] }).catch(err => { })
      } else {
        let kişininfotografı = msgMember.displayAvatarURL()
          , sahip = guildDatabase.kayıtkisiler[msg.author.id]
          , bot = 0
          , son1saat = 0
          , son1gün = 0
          , son1hafta = 0
          , son1ay = 0
          , ilk
          , son
          , kayıtlarseysi
          , rankı = (ranklar[sahip?.rank] || "Rankın yok")
          , toplam = (sahip?.toplam || "0")
          , gercekToplam = 0
        if (!sahip) {
          ilk = "• Burada gösterilecek hiçbir şey yok..."
          son = "• Burada gösterilecek hiçbir şey yok..."
          kayıtlarseysi = "• Burada gösterilecek hiçbir şey yok..."
        } else {
          let a = sahip.ilk
            , b = sahip.son
            , sıralama = Object.entries(guildDatabase.kayıtkisiler).filter(a => a[1].toplam).sort((a, b) => b[1].toplam - a[1].toplam)
          ilk = `👤 **Kayıt ettiğin kişi:**  ${a.kk}\n${ayarlar.emoji.rol} **Verdiğin rol(ler):**  ${a.r} \n⏲️ **Tarihi:**  ${a.z}`
          son = `👤 **Kayıt ettiğin kişi:**  ${b.kk}\n${ayarlar.emoji.rol} **Verdiğin rol(ler):**  ${b.r} \n⏲️ **Tarihi:**  ${b.z}`
          kayıtlarseysi = guildDatabase.son.filter(a => {
            if (a.s != msg.author.id) return false
            gercekToplam += 1
            if (a.c == "🤖") bot += 1
            let zaman = a.z
            if (simdikizaman - 3600 < zaman) son1saat += 1
            if (simdikizaman - 86400 < zaman) son1gün += 1
            if (simdikizaman - 604800 < zaman) son1hafta += 1
            if (simdikizaman - 2629800 < zaman) son1ay += 1
            return true
          }).slice(0, 5).map(a => `• (${a.c}) <@${a.k}> | <t:${a.z}:F>`).join("\n") || "• Burada gösterilecek hiçbir şey yok..."
          benimyerim = "\n📈 **Sunucu sıralaman:**  " + (sıralama.indexOf(sıralama.find(a => a[0] == msg.author.id)) + 1) + ". sıra *(" + sıralama.length + " kişi içinden)*"
        }
        const embed = new EmbedBuilder()
          .setAuthor({ name: msg.author.tag, iconURL: kişininfotografı })
          .setDescription('🔰 **Rankın:** ' + rankı + (benimyerim || ""))
          .setThumbnail(kişininfotografı)
          .setColor('#7a1ac0')
          .setTimestamp()
          .addFields(
            {
              name: `Kayıt ettiklerin (${toplam})`,
              value: `**${guildDatabase.kayıt.secenek ? `${ayarlar.emoji.uye} Üye:**  ${sahip?.normal || "0"}` : `${ayarlar.emoji.erkek} Erkek:**  ${sahip?.erkek || "0"}\n**${ayarlar.emoji.kiz} Kız:**  ${sahip?.kız || "0"}`}\n**🤖 Bot:**  ${bot}\n\n**🗂️ Gerçek kayıt sayın:**  ${gercekToplam}`,
              inline: true
            },
            {
              name: "\u200b",
              value: "\u200b",
              inline: true
            },
            {
              name: "Kayıt etkinliğin",
              value: `**⏰ Son 1 saat:** \`${son1saat}\`\n**📅 Son 1 gün:** \`${son1gün}\`\n**📆 Son 1 hafta:** \`${son1hafta}\`\n**🗓️ Son 1 ay:** \`${son1ay}\`\n`,
              inline: true
            },
            {
              name: '`Kayıt ettiğin ilk kişi`',
              value: `${ilk}`
            },
            {
              name: '`Kayıt ettiğin son kişi`',
              value: `${son}`
            },
            {
              name: "`Son 5 kaydın`",
              value: kayıtlarseysi
            }
          )
        msg.reply({ embeds: [embed] }).catch(err => { })
      }
    } catch (e) {
      msg.reply(`**‼️ <@${msg.author.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`).catch(err => { })
      msg.client.error(module.id.split("\\").slice(5).join("\\"), e)
      console.log(e)
    }
  }
}
