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
        const [command, question, context] = message.content.split(' | ');
        console.log(command,question,context);

        axios.post('http://127.0.0.1:5050/ask', {question, context})
        .then(response => {
          console.log(response);
          message.channel.send("um, actually: " + response.data.answer);
        })
        .catch(error => {
          console.error(error);
        });
    }
});
bot.on('messageCreate',async message => {
    if (message.content.startsWith('!check')){
        const [command, question] = message.content.split('|');
        console.log(command,question);
        if (!question) return message.channel.send(` Please include a fact to check.`);
        const url = `https://factchecktools.googleapis.com/v1alpha1/claims:search?key=${process.env.GOOGLE_API_KEY}&query=${encodeURIComponent(question)}`
        // await axios.post('https://factchecktools.googleapis.com/v1alpha1/claims:search', {
        // // headers:{key: process.env.GOOGLE_API_KEY},
        // params: {
        //     key: process.env.GOOGLE_API_KEY,
        //     query: question,
        //     languageCode: "en-US",
        // }
        await axios.get(url).then(res=>{
        if (res.data.claims) {
            let claim = res.data.claims[0]
            let review = res.data.claims[0].claimReview[0]
            if (review.textualRating === "True") {
                message.channel.send("fact is true.");  
            }
            else{
                message.channel.send("fact is false");
            }
            }
    })
    .catch(error => {
        console.error(error);
      });   
    }

})
bot.login(process.env.TOKEN);
