const { Message, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
    kod: "s-say",
    name: "sahip say",
    no: true,
    /**
   * @param {import("../../typedef").exportsRunCommands} param0 
   */
    async run({ sunucudb, pre, alisa, msg, args, sunucuid, prefix, hata, guild, msgMember, guildMe }) {
        try {
            let shards = await msg.client.shard.broadcastEval(c => ({ sunucu: c.guilds.cache.size, kullanıcı: c.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0) }))
            msg.reply({ content: `• **${shards.map(a => a.sunucu).reduce((acc, count) => acc + count, 0).toLocaleString().replace(/\./, ",")}** sunucu ve **${shards.map(a => a.kullanıcı).reduce((acc, count) => acc + count, 0).toLocaleString().replace(/\./, ",")}** kullanıcıya hizmet ediyorum!` }).catch(err => { })
        } catch (e) {
            msg.reply("Şeyy bi hata oluştu da 👉 👈 \n```js\n" + e + "```").catch(err => { })
            console.log(e)
        }
    }
}