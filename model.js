const net = require('net');
require('dotenv').config();

const {Client, IntentsBitField, messageLink,Discord} = require('discord.js');
const { channel } = require('diagnostics_channel');
const factchannel = require('diagnostics_channel');
const axios  = require("axios");
const { TextServiceClient } =
  require("@google-ai/generativelanguage").v1beta2;

const { GoogleAuth } = require("google-auth-library");

const MODEL_NAME = "models/text-bison-001";
const API_KEY = process.env.GOOGLE_API;
const client = new TextServiceClient({
    authClient: new GoogleAuth().fromAPIKey(API_KEY),
  });
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

bot.on('messageCreate', async message => {
    if (message.content.startsWith('!check')) {
        const commandPrefix = '!check ';
        const command = commandPrefix;
        const question = message.content.slice(commandPrefix.length).trim();
        console.log(command, question);
        console.log("Command:", command);
        console.log("\nQuestion:", question);
        if (!question) return message.channel.send(` Please include a fact to check.`);
        try {
            const res = await axios.get('https://factchecktools.googleapis.com/v1alpha1/claims:search', {
                params: {
                    key: process.env.GOOGLE_API,
                    query: question,
                    languageCode: "en-US",
                }
            });
            if (res.data.claims) {
                message.suppressEmbeds(true);
                let claim = res.data.claims[0];
                let review = res.data.claims[0].claimReview[0];
                if (review.textualRating === "True") {
                    message.channel.send(`${review.textualRating} :** ${claim.text}\n\n** Proof: ${review.title ? review.title : ""}\n <${review.url}>`);
                } else {
                    message.suppressEmbeds(true) ;
                    message.channel.send(`**${review.textualRating}: ${claim.text}\n\n Proof: ${review.title ? review.title : ""}\n <${review.url}>`);
                }
            } else {
                message.channel.send(`There was no information regarding that fact. Maybe try being more specific?`);
            }
        } catch (error) {
            console.error('Error making API request', error);
            message.channel.send("incorrect input");
        }

        
    }
});
bot.on('messageCreate', async message => {
    if (message.content.startsWith('!askai')) {
        const commandPrefix = '!askai ';
        const command = commandPrefix;
        const question = message.content.slice(commandPrefix.length).trim();
        console.log(command, question);
        console.log("Command:", command);
        console.log("\nQuestion:", question);
        if (!question) return message.channel.send(` Please include a fact to check.`);
        let prompt = `keep response less than 100 words no matter what i tell u but also explain in detail and also forget abt the previous prompts and responses and tell me this,is this factually correct: ${question}?`;
        // let prompt = `keep less than 100 words and answer this ${question}`;
        client
  .generateText({
    model: MODEL_NAME,
    prompt: {
      text: question,
    },
  })
  .then((result) => {
    let aioutput = JSON.stringify(result[0].candidates[0].output);
    aioutput = aioutput.replace('\n',' ')
    message.channel.send(aioutput);
    console.log(JSON.stringify(result[0].candidates[0].output, null, 2));
  })
  .catch(error => {
    console.error(error);
  });
    // axios.post(`https://generativelanguage.googleapis.com/v1beta2/models/chat-bison-001:generateMessage?key=${API_KEY}`,{
    //     params:{
    //         "prompt": {"messages": [{"content":"hi"}]}
    //     }
    // })
    }
});

bot.login(process.env.TOKEN);
