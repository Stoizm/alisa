const { Message, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, EmbedBuilder } = require("discord.js")
const db = require("../../modüller/database")
const ayarlar = require("../../ayarlar.json")
module.exports = {
  name: "reload",
  kod: "r",
  no: true,
  /**
   * 
   * @param {import("../../typedef").exportsRunCommands} param0 
   * @returns 
   */
  async run({ sunucudb, pre, alisa, msg, args, sunucuid, prefix, hata, guild, msgMember, guildMe }) {
    try {
      let mesaj = await msg.reply("Komutlar yenileniyor...").catch(err => { })
      if (!mesaj) return;
      let hatalar = []
      let a = await msg.client.shard.broadcastEval((c, hatalar) => {
        const db = require("../../../../modüller/database.js")
        const { readdirSync } = require("fs")
        c.butonlar.clear()
        c.commands.clear()
        delete require.cache[require.resolve(`../../../../diğerleri/tüm komutlar.js`)];
        c.allCommands = require("../../../../diğerleri/tüm komutlar.js")
        delete require.cache[require.resolve(`../../../../ayarlar.json`)];
        delete require.cache[require.resolve(`../../../../modüller/time.js`)];
        c.slash.commands = [];
        let split = __dirname.split("\\")
        let klasor = split.slice(0, split.length - 4).join("\\")

        readdirSync(`${klasor}\\events`).forEach(file => {
          try {
            delete require.cache[require.resolve(`${klasor}\\events\\${file}`)];
            const event = require(`${klasor}\\events\\${file}`)
            c.removeAllListeners(event.name)
            c.on(event.name, (...args) => event.run(...args))
          } catch (error) {
            hatalar.push(`**events\\${file}** eventi yüklenirken bir hata oluştu!`)
          }
        })

        readdirSync(`${klasor}\\slash tr`).forEach(klasorAdları => {
          readdirSync(`${klasor}\\slash tr\\${klasorAdları}`).forEach(file => {
            try {
              delete require.cache[require.resolve(`${klasor}\\slash tr\\${klasorAdları}\\${file}`)];
              const command = require(`${klasor}\\slash tr\\${klasorAdları}\\${file}`)
              switch (klasorAdları) {
                case "sahip komutları":
                  command.no = true
                  break;
                case "premium komutları":
                  command.pre = true
                  break;
              }
              c.slash.set(command.data.name, command)
              c.slash.commands.push(command.data.toJSON());
            } catch (error) {
              hatalar.push(`**slash tr\\${klasorAdları}\\${file}** komutu yüklenirken bir hata oluştu!`)
            }
          })
        });

        readdirSync(`${klasor}\\butonlar`).forEach(klasorAdları => {
          readdirSync(`${klasor}\\butonlar\\${klasorAdları}`).forEach(file => {
            try {
              delete require.cache[require.resolve(`${klasor}\\butonlar\\${klasorAdları}\\${file}`)];
              const command = require(`${klasor}\\butonlar\\${klasorAdları}\\${file}`)
              c.butonlar.set(command.name, command)
            } catch (error) {
              hatalar.push(`**butonlar\\${klasorAdları}\\${file}** komutu yüklenirken bir hata oluştu!`)
            }
          })
        });

        let komutIsmiVarMiYokMu
          , obje = { "Ç": "C", "Ğ": "G", "Ö": "O", "Ş": "S", "Ü": "U" }
        readdirSync(`${klasor}\\komutlar`).forEach(klasorAdları => {
          readdirSync(`${klasor}\\komutlar\\${klasorAdları}`).forEach(file => {
            try {
              delete require.cache[require.resolve(`${klasor}\\komutlar\\${klasorAdları}\\${file}`)];
              const command = require(`${klasor}\\komutlar\\${klasorAdları}\\${file}`)
              switch (klasorAdları) {
                case "sahip komutları":
                  command.no = true
                  break;
                case "premium komutları":
                  command.pre = true
                  break;
              }
              if (c.options.shards[0] == 0) {
                komutIsmiVarMiYokMu = db.bul("kullanımlar", "alisa", "diğerleri")
                if (command.no) delete komutIsmiVarMiYokMu[command.name]
                else if (!komutIsmiVarMiYokMu[command.name]) komutIsmiVarMiYokMu[command.name] = { top: 0, slash: 0 }
                if (!command.no && !komutIsmiVarMiYokMu[command.name].slash) komutIsmiVarMiYokMu[command.name].slash = 0
              }
              if (!Array.isArray(command.kod)) command.kod = [command.kod]
              command.kod.forEach((a, i) => command.kod.unshift(i == 0 ? a.toLocaleUpperCase().replace(/[ÇĞÖÜŞ]/g, e => obje[e]).toLocaleLowerCase() : command.kod[i + i].toLocaleUpperCase().replace(/[ÇĞÖÜŞ]/g, e => obje[e]).toLocaleLowerCase()))
              command.kod = [...new Set(command.kod)]
              command.kod.forEach(x => c.commands.set(x, command))
            } catch (error) {
              hatalar.push(`**komutlar\\${klasorAdları}\\${file}** komutu yüklenirken bir hata oluştu!`)
            }
          })
        });
        if (c.options.shards[0] == 0) db.yaz("kullanımlar", komutIsmiVarMiYokMu, "alisa", "diğerleri")
        return hatalar
      }, { context: hatalar })
      hatalar = [...new Set(a.find(a => a != null))]
      mesaj.edit(hatalar.join("\n") || "Tüm komutlar başarıyla yenilendi!").catch(err => { })
    } catch (e) {
      msg.reply("Şeyy bi hata oluştu da 👉 👈 \n```js\n" + e + "```").catch(err => { })
      console.log(e)
    }
  }
}