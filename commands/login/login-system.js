const { MessageCollector } = require('discord.js')
const db = require('quick.db')

module.exports = {
    name: "login",
    run: async(client, message, args) => {
        let username = "";
        let password = "";
        const filter = (m) => m.author.id == message.author.id && !m.author.bot;
        const msg = await message.channel.send('**Please input your email**')
        const collector = await message.channel.createMessageCollector(filter, { max: 1, time: 30000 })
        message.channel.awaitMessages(filter, {
            max: 1,
            time: 30000,
            errors: ['time']
        }).then(collected => {
            username = collected.first().content
            collected.first().delete()
            msg.edit('**Please input your password**').then(msg => {
                message.channel.awaitMessages(filter, {
                    max: 1,
                    time: 30000,
                    errors: ['time']
                }).then(collected => {
                    password = collected.first().content
                    collected.first().delete()
                    if (username !== db.get(`user_${message.author.id}_emailAccount`) && password !== db.get(`user_${message.author.id}_password`)) {
                        msg.edit(':x: **Your username or password is invaild**')
                    } else {
                        message.delete()
                        msg.edit(`✅ You have been logged in as **@${username}**`)
                    }
                })
            })
        })
    }
}