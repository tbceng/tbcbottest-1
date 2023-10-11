require('dotenv').config();

const {Client, IntentsBitField, messageLink} = require('discord.js');

//setup of guilds 
const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ],
});

// checks bot state and retures bot is online 
client.on('ready', (c) => {
    console.log(`${c.user.tag} is online`);

});

//logs messages 
client.on('messageCreate', (message)=> {
    console.log(message.content);
});

// check if a message is hello and respond with hello back 
client.on('messageCreate', (message) => {
    if (message.content == 'pong'){
        message.reply('ping')
    }
});

//login and token for the bot 
client.login(process.env.TOKEN);


