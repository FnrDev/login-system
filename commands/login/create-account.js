const { MessageEmbed } = require('discord.js')
const db = require('quick.db')
const code = require('random-code-gen')
const nodemailer = require('nodemailer')
const config = require('../../config.json')

module.exports = {
    name: "create",
    run: async(client, message, args) => {
        let email = "";
        let username = "";
        let password = "";
        let token = "";
        const authCode = code.random(5)
        const filter = (m) => m.author.id == message.author.id && !m.author.bot
        const msg = await message.channel.send('**Email: **')
        const collector = await message.channel.createMessageCollector(filter, { max: 1, time: 30000 })
        message.channel.awaitMessages(filter, {
            max: 1,
            time: 30000,
            errors: ['time']
        }).then(collected => {
            email = collected.first().content
            collected.first().delete()
            msg.edit('**Username: **').then(msg => {
                message.channel.awaitMessages(filter, {
                    max: 1,
                    time: 30000,
                    errors: ['time']
                }).then(collected => {
                    username = collected.first().content
                    collected.first().delete()
                    msg.edit('**Password: **').then(msg => {
                        message.channel.awaitMessages(filter, {
                            max: 1,
                            time: 30000,
                            errors: ['time']
                        }).then(collected => {
                            password = collected.first().content
                            collected.first().delete()
                            msg.edit(`a confirmation code has been sent to **${args[0]}**\n\n**Note: You have 3 minutes to type the code**`).then(msg => {
                                message.channel.awaitMessages(filter, {
                                    max: 1,
                                    time: 30000,
                                    errors: ['time']
                                }).then(collected => {
                                    token = collected.first().content
                                    collected.first().delete()
                                })
                            })
                            var transporter = nodemailer.createTransport({
                                service: 'gmail',
                                auth: {
                                    user: config.email,
                                    pass: config.password
                                }
                            })
                            var Options = {
                                from: 'Developers Team',
                                to: email,
                                subject: 'Confirmation code to creating new account',
                                text: `Hello there,\n\nWe need to verify your email please send code below to verify\n\nYour verify code: ${authCode}\nNote: You have 3 minutes to send the code`
                            }
                            transporter.sendMail(Options, function(error, info) {
                                if (error) {
                                    message.channel.send(':x: There was an error please make sure:\n**1- Your email is vaild**\n\n> if you are about your email please dm <@596227913209217024>\n\n> Developers Team')
                                } else {
                                    msg.edit(`a confirmation code has been sent to **${email}**\n\n**Note: You have 3 mintes to type the code**`)
                                    message.channel.awaitMessages(filter, {
                                        max: 1,
                                        time: 180000,
                                        errors: ['time']
                                    }).then(collected => {
                                        token = collected.first().content
                                        collected.first().delete()
                                        if (token !== authCode) {
                                            msg.edit(':x: Wrong code!')
                                        }
                                        if (token == authCode) {
                                            db.set(`user_${message.author.id}_emailAccount`, email)
                                            db.set(`user_${message.author.id}_username`, username)
                                            db.set(`user_${message.author.id}_password`, password)
                                            msg.edit('**✅ Successfully created your account**\n**And we have sent your account info in dm**')
                                            const embed = new MessageEmbed()
                                            .setTitle('Your account info')
                                            .setColor('RANDOM')
                                            .setFooter('Developers Team', message.author.displayAvatarURL({ dynamic: true }))
                                            .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
                                            .addFields(
                                                {
                                                    name: "Email: ",
                                                    value: email,
                                                },
                                                {
                                                    name: "Username: ",
                                                    value: username
                                                },
                                                {
                                                    name: "Password: ",
                                                    value: password
                                                }
                                            )
                                            message.author.send(embed)
                                            const logChannel = client.channels.cache.get(config.logchannel)
                                            const signupLogs = new MessageEmbed()
                                            .setAuthor(message.author.tag, message.author.displayAvatarURL({ dynamic: true }))
                                            .setDescription(`${message.author} has created new account!`)
                                            .setColor('RANDOM')
                                            .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
                                            .setFooter('Signup Logs', message.author.displayAvatarURL({ dynamic: true }))
                                            .addFields(
                                                {
                                                    name: "Email: ",
                                                    value: email
                                                },
                                                {
                                                    name: "Username: ",
                                                    value: username
                                                },
                                                {
                                                    name: "Password: ",
                                                    value: password
                                                },
                                                {
                                                    name: "Account Token: ",
                                                    value: authCode
                                                }
                                            )
                                            logChannel.send(signupLogs)
                                        }
                                    })
                                }
                            })
                        })
                    })
                })
            })
        })
    }
}