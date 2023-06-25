const { SlashCommandBuilder, ChatInputCommandInteraction, ActionRowBuilder, ButtonBuilder, EmbedBuilder, version } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
const os = require("os")
module.exports = {
    name: "stat",
    data: new SlashCommandBuilder()
        .setName("istatistik")
        .setDescription("Botun linklerini gösterir"),
    /**
     * @param {import("../../typedef").exportsRunSlash} param0 
     */
    async run({ int, guildDatabase, alisa, hata, guildId, guild }) {
        try {
            const zaman = Date.now()
            const ilkembed = new EmbedBuilder()
                .setDescription(`${ayarlar.emoji.yukleniyor} **Veriler alınıyor biraz bekleyiniz**`)
                .setColor("#1536d8")
            await int.reply({ embeds: [ilkembed], fetchReply: true }).then(async editlenecekmesaj => {
                const mesajPing = Date.now()
                setTimeout(async () => {
                    ilkembed.setDescription(`${ayarlar.emoji.yukleniyor} **Veriler alınıyor biraz bekleyiniz.**`)
                    await editlenecekmesaj.edit({ embeds: [ilkembed] }).catch(err => { })
                    setTimeout(async () => {
                        ilkembed.setDescription(`${ayarlar.emoji.yukleniyor} **Veriler alınıyor biraz bekleyiniz..**`)
                        await editlenecekmesaj.edit({ embeds: [ilkembed] }).catch(err => { })
                        setTimeout(async () => {
                            ilkembed.setDescription(`${ayarlar.emoji.yukleniyor} **Veriler alınıyor biraz bekleyiniz...**`)
                            const düzenlemedenönce = Date.now()
                            await editlenecekmesaj.edit({ embeds: [ilkembed] }).then(() => {
                                const düzenlemedensonra = Date.now()
                                setTimeout(async () => {
                                    try {
                                        let ben = int.client.user
                                            , toplamram = os.totalmem()
                                            , boştaolanram = os.freemem()
                                            , kullanılanram = toplamram - boştaolanram
                                            , yüzde = (kullanılanram / toplamram * 100).toFixed(2)
                                            , shard = await int.client.shard.broadcastEval((client) => ({ sunucu: client.guilds.cache.size, kanal: client.channels.cache.size, kullanıcı: client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0), rol: client.guilds.cache.reduce((acc, guild) => acc + guild.roles.cache.size, 0), ramkullanımı: process.memoryUsage().heapUsed }))
                                            , ramkullanımı = shard.reduce((acc, shards) => acc + shards.ramkullanımı, 0)
                                            , sunucu = shard.map(a => a.sunucu).reduce((acc, guild) => acc + guild, 0)
                                            , kanal = shard.map(a => a.kanal).reduce((acc, kanal) => acc + kanal, 0)
                                            , kullanıcı = shard.map(a => a.kullanıcı).reduce((acc, kullanıcı) => acc + kullanıcı, 0)
                                            , rol = shard.map(a => a.rol).reduce((acc, rol) => acc + rol, 0)
                                            , dugme = new ActionRowBuilder().addComponents(new ButtonBuilder().setLabel("Beni davet et").setEmoji("💌").setStyle(5).setURL(ayarlar.davet)).addComponents(new ButtonBuilder().setEmoji("💗").setLabel("Oy ver").setURL(`https://top.gg/bot/${int.client.user.id}/vote`).setStyle(5)).addComponents(new ButtonBuilder().setStyle(5).setLabel("Destek sunucum").setEmoji("🎉").setURL(ayarlar.discord))
                                        if (ayarlar.web) dugme.addComponents(new ButtonBuilder().setLabel("Web sitesi").setEmoji("💯").setStyle(5).setURL(ayarlar.web))
                                        function mbOrGb(input) {
                                            return input >= 1073741824 ? `${(input / 1073741824).toFixed(2)} GB` : `${(input / 1048576).toFixed(2)} MB`
                                        }
                                        let embed = new EmbedBuilder()
                                            .setAuthor({ name: ben.username, iconURL: ben.displayAvatarURL() })
                                            .setDescription(`⏲️ **Son yeniden başlatma:**  <t:${(int.client.readyTimestamp / 1000).toFixed(0)}:F> - <t:${(int.client.readyTimestamp / 1000).toFixed(0)}:R>`)
                                            .addFields(
                                                {
                                                    name: "BOT BİLGİLERİ",
                                                    value: `✏️ **Kullanıcı adım:**  ${ben.tag}\n🆔 **Discord ID:**  ${int.client.user.id}\n📅 **Kuruluş tarihim:**  <t:${(int.client.user.createdTimestamp / 1000).toFixed(0)}:F>\n🎚️ **Ram kullanımı:**  ${mbOrGb(ramkullanımı)} - %${yüzde}`,
                                                    inline: true
                                                },
                                                {
                                                    name: "GECİKME BİLGİLERİM",
                                                    value: `📡 **Botun ana gecikmesi:**  ${int.client.ws.ping} ms\n📨 **Mesaj gecikmesi:**  ${(mesajPing - zaman)} ms\n📄 **Mesaj edit gecikmesi:**  ${(düzenlemedensonra - düzenlemedenönce)} ms\n📁 **Database gecikmesi:**  ${db.ping()} ms`,
                                                    inline: true
                                                },
                                                {
                                                    name: "GELİŞTİRİCİLERİM",
                                                    value: `👑 **${(await int.client.fetchUserForce(ayarlar.sahip))?.tag || "Deleted User#0000"} - ${ayarlar.sahip}** (Yapımcı)`
                                                },
                                                {
                                                    name: "SUNUCU BİLGİLERİ",
                                                    value: `💻 **Sunucu sayısı:**  ${sunucu.toLocaleString().replace(/\./g, ",")}\n👥 **Kullanıcı sayısı:**  ${kullanıcı.toLocaleString().replace(/\./g, ",")}\n${ayarlar.emoji.kanal} **Kanal sayısı:**  ${kanal.toLocaleString().replace(/\./g, ",")}\n${ayarlar.emoji.rol} **Rol sayısı:**  ${rol.toLocaleString().replace(/\./g, ",")}`,
                                                    inline: true
                                                },
                                                {
                                                    name: "VERSİYONLAR",
                                                    value: `🎛️ **Node.js versiyon:**  v${process.versions.node}\n🔨 **Discord.js versiyon:**  v${version}\n📒 **Database versiyon:**  v${db.version}\n${ayarlar.emoji.pp} **${int.client.user.username} versiyon:**  v${ayarlar.versiyon}`,
                                                    inline: true
                                                },
                                                {
                                                    name: "VDS BİLGİLERİ",
                                                    value: `📝 **VDS adı:**  ${int.client.user.username} Bot VDS\n🖥️ **Windows sürümü:**  Windows 10 (64 bit)\n🎞️ **CPU:**  ${os.cpus()[0].model}\n🔋 **Toplam ram:**  ${mbOrGb(toplamram)} (**Serbest:** ${mbOrGb(boştaolanram)})`
                                                })
                                            .setColor("#1536d8")
                                            .setTimestamp()
                                        await editlenecekmesaj.edit({ embeds: [embed], components: [dugme] }).catch(err => { })
                                    } catch (e) {

                                    }
                                }, 1000)
                            }).catch(err => { })
                        }, 1000)
                    }, 1000)
                }, 1000)
            }).catch(() => { })
        } catch (e) {
            hata(`**‼️ <@${int.user.id}> Komutta bir hata oluştu lütfen daha sonra tekrar deneyiniz!**`, true).catch(err => { })
            int.client.error(module.id.split("\\").slice(5).join("\\"), e)
            console.log(e)
        }
    }
}
