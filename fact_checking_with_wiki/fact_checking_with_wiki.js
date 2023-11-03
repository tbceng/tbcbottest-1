const net = require('net');
require('dotenv').config();

const {Client, IntentsBitField, messageLink} = require('discord.js');
const { channel } = require('diagnostics_channel');
const factchannel = require('diagnostics_channel');

var answered = false;

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

socketclient.connect(8080, '172.28.144.1', () => {
    console.log("connected from js") // use this as the command /factcheck tennis is an olympic sport
});


// for slash commands 
//
//

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) {
        console.log('no command');
        return;
    }

    if (interaction.commandName === 'factcheck') {
        const args = interaction.options.getString('fact');

        if (!args) {
            interaction.reply(`You didn't provide any fact to check, ${interaction.user.username}!`);
            return; // Exit the function if no fact is provided
        }

        // Acknowledge the user's input
        await interaction.reply(`You asked: ${args} I am researching right now...`);
        answered = false;

        // Function to send the result to the same channel
        const sendResultToChannel = (result) => {
            if (!answered)
            {
                interaction.followUp(`Fact check result: ${result}`);
                answered = true;
            };
        };

        // Perform the fact checking and send the result to the same channel
        socketclient.on('data', (data) => {
            const result = data.toString(); // Assuming the data is a string
            sendResultToChannel(result);
        });

        // Send the user's fact to the socket
        socketclient.write(args + 'factcheck');
    };
    if (interaction.commandName === 'get-info') {
        console.log("getinfo");
        const args1 = interaction.options.getString('topic');

        if (!args1) {
            interaction.reply(`You didn't provide any topic to summarize, ${interaction.user.username}!`);
            return; // Exit the function if no fact is provided
        }

        // Acknowledge the user's input
        await interaction.reply(`You wanted to summarize: ${args1} I am researching right now...`);
        answered = false;

        const sendResultToChannel = (result) => {
            if (!answered)
            {
                interaction.followUp(`Fact check result: ${result}`);
                answered = true;
            };
        };

        // Perform the fact checking and send the result to the same channel
        socketclient.on('data', (data) => {
            const result = data.toString(); // Assuming the data is a string
            sendResultToChannel(result);
        });

        // Send the user's fact to the socket
        socketclient.write(args1 + 'get-info');
    };
});

//console.log(interaction.commandName);
//});

//login and token for the bot 
//token is hidden 
client.login('MTE2MjM4MzAwNTM1NzE5MTE5OA.GuuV7o.WMbcWVHZbV42UKMqWKvZrbZOe1U4GRNUuHKGYg');
