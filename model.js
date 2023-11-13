const net = require('net');
require('dotenv').config();
const vision = require('@google-cloud/vision');
const { Client, IntentsBitField, messageLink, Discord } = require('discord.js');
const { channel } = require('diagnostics_channel');
const factchannel = require('diagnostics_channel');
const axios = require("axios");
const Canvas = require('canvas');
const Image = Canvas.Image;
const { TextServiceClient } = require("@google-ai/generativelanguage").v1beta2;
const vision_client = new vision.ImageAnnotatorClient();
const GOOGLE_CLOUD_VISION_API_ENDPOINT = 'https://vision.googleapis.com/v1/images:annotate';

const { GoogleAuth } = require("google-auth-library");

const MODEL_NAME = "models/text-bison-001";
const API_KEY = process.env.GOOGLE_API;
const client = new TextServiceClient({
  authClient: new GoogleAuth().fromAPIKey(API_KEY),
});

// Setup of guilds
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
  if (message.content == 'pong') {
    message.reply('ping');
  }
});

bot.on('messageCreate', (message) => {
  console.log(message.content);
});

bot.on('messageCreate', async message => {
  if (message.content.startsWith('!ask')) {
    const [command, question, context] = message.content.split(' | ');
    console.log(command, question, context);

    axios.post('http://127.0.0.1:5050/ask', { question, context })
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
          message.suppressEmbeds(true);
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
        aioutput = aioutput.replace('\n', ' ')
        message.channel.send(aioutput);
        console.log(JSON.stringify(result[0].candidates[0].output, null, 2));
      })
      .catch(error => {
        console.error(error);
      });
  }
});

bot.on('messageCreate', async message => {
  async function isImageUrl(url) {
    try {
      // Fetch the image headers
      const response = await fetch(url, { method: 'HEAD' });

      // Check if the request was successful (status code 2xx)
      if (!response.ok) {
        return false;
      }

      // Get the content type from the response headers
      const contentType = response.headers.get('Content-Type');

      // Check if the content type indicates an image and the URL ends with a valid image file extension
      return contentType.startsWith('image/') && /\.(jpg|jpeg|png|gif|bmp|svg)$/i.test(url);
    } catch (error) {
      // Handle fetch errors (e.g., network issues)
      console.error('Error checking image URL:', error);
      return false;
    }
  }
  if (message.content.startsWith('!mood ')) {
    const commandPrefix = '!mood ';
    const command = commandPrefix;
    const question = message.content.slice(commandPrefix.length).trim();
    console.log(command, question);
    console.log("Command:", command);
    console.log("\nQuestion:", question);
    if (!isImageUrl(question)) return message.channel.send(` Please include a link to the image`);
    const imageUrl = question;
    const apiKey = process.env.GOOGLE_API;
    async function detectFacesInImageUrlAndLogToConsole(apiKey, imageUrl) {
        const image = new Image();
      
        await image.loadImage(imageUrl);
      
        const request = {
          image: {
            content: await image.toDataURL(),
          },
          features: [
            {
              type: 'FACE_DETECTION',
              maxResults: 10,
            },
          ],
        };
      
        const response = await client.annotateImage(request);
      
        const faceAnnotations = response.responses[0].faceAnnotations;
      
        for (const faceAnnotation of faceAnnotations) {
          const boundingBox = faceAnnotation.boundingBox;
      
          // Draw a bounding box around the face
          image.getContext('2d').strokeStyle = 'red';
          image.getContext('2d').lineWidth = 5;
          image.getContext('2d').strokeRect(
            boundingBox.vertices[0].x,
            boundingBox.vertices[0].y,
            boundingBox.vertices[2].x - boundingBox.vertices[0].x,
            boundingBox.vertices[2].y - boundingBox.vertices[0].y
          );
      
          // Log the face's identity
          console.log(faceAnnotation.landmarkAnnotations.find((landmarkAnnotation) => landmarkAnnotation.type === 'NOSE_TIP').position);
        }
      
        // Display the image with the bounding boxes drawn on it
        // This can be done by creating a canvas element and setting its image source to the image data from the Canvas object
        // You can then append the canvas element to the DOM
      }      
      
      // Example usage:
      
      
      await detectFacesInImageUrlAndLogToConsole(apiKey, imageUrl);
    // axios.post(`https://generativelanguage.googleapis.com/v1beta2/models/chat-bison-001:generateMessage?key=${API_KEY}`,{
    //     params:{
    //         "prompt": {"messages": [{"content":"hi"}]}
    //     }
    // })
  }
});

bot.login(process.env.TOKEN);
