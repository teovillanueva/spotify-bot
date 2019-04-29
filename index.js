const Discord = require('discord.js');

const commandHandler = require('./discord/commandHandler');

const client = new Discord.Client();

client.on('message', commandHandler)

client.login(process.env.DISCORD_SECRET_TOKEN);