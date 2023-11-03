const net = require('net');
require('dotenv').config();

const {Client, IntentsBitField, messageLink} = require('discord.js');
const { channel } = require('diagnostics_channel');
const factchannel = require('diagnostics_channel');
const axios  = require("axios");
//setup of guilds 
const bot = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ],
});

bot.on('ready', (c) => {
    console.log(`${c.user.tag} is online`);

});
bot.on('messageCreate', (message) => {
    if (message.content == 'pong'){
        message.reply('ping')
    }
});

bot.on('messageCreate', (message)=> {
    console.log(message.content);
});

bot.on('messageCreate', async message => {
    if (message.content.startsWith('!ask')) {
        const [command, question] = message.content.split(' | ');
        console.log(command,question);

        axios.post('http://127.0.0.1:5050/ask', {question})
        .then(response => {
          console.log(response);
          message.channel.send("um, actually: " + response.data.answer);
        })
        .catch(error => {
          console.error(error);
        });
    }
});

bot.login(process.env.TOKEN);
