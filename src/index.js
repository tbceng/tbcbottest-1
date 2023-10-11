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

// check if a message is pong and respond with ping back 
client.on('messageCreate', (message) => {
    if (message.content == 'pong'){
        message.reply('ping')
    }
});

// check if a message if yes make respond
client.on('messageCreate', (message) => {
    if (message.content == 'how to code a discord bot'){
        message.reply('Idk man try google or something')
    }
});


//check if cleint says ball and respond with balls 
client.on('messageCreate', (message) => {
    if (message.content == 'ball'){
        message.reply("balls")
    }
});

//login and token for the bot 
//token is hidden 
client.login(process.env.TOKEN);


