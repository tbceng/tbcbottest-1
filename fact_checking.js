const net = require('net');
require('dotenv').config();

const {Client, IntentsBitField, messageLink} = require('discord.js');
const { channel } = require('diagnostics_channel');
const factchannel = require('diagnostics_channel');

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
//
const socketclient = new net.Socket();

socketclient.connect(5050, '192.168.31.172', () => {
    console.log("connected from js") // use this as the command /factcheck tennis is an olympic sport
});


// for slash commands 
//
//

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    if (interaction.commandName === 'factcheck') {
        const args = interaction.options.getString('fact');

        if (!args) {
            interaction.reply(`You didn't provide any fact to check, ${interaction.user.username}!`);
            return; // Exit the function if no fact is provided
        }

        // Acknowledge the user's input
        await interaction.reply(`You asked: ${args} I am researching right now...`);

        // Function to send the result to the same channel
        const sendResultToChannel = (result) => {
            interaction.followUp(`Fact check result: ${result}`);
        };

        // Perform the fact checking and send the result to the same channel
        socketclient.on('data', (data) => {
            const result = data.toString(); // Assuming the data is a string
            sendResultToChannel(result);
        });

        // Send the user's fact to the socket
        socketclient.write(args);
    }
});

//console.log(interaction.commandName);
//});

//login and token for the bot 
//token is hidden 
client.login(process.env.TOKEN);