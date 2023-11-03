// all code here is setup for / cmmds 

//check for files
require('dotenv').config();

//setup discord.js
const{REST, Routes} = require('discord.js');

//creating of the command 
const commands = [
    {
        name: 'factcheck',
        description: 'Checks a fact',
        options: [
            {
                name: 'fact',
                description: 'The fact to be checked',
                type: 3, // Type 3 represents a string
                required: true, // Set to true if the argument is required
            },
        ],
    },
    {
        name: 'get-info',
        description: 'Gives you a short summarization o a topic',
        options: [
            {
                name: 'topic',
                description: 'Topic you want to summarize',
                type: 3,
                required: true,
            }
        ],
    },
];

// get bot token
const rest = new REST({ version: '10'}).setToken('MTE2MjM4MzAwNTM1NzE5MTE5OA.GuuV7o.WMbcWVHZbV42UKMqWKvZrbZOe1U4GRNUuHKGYg');

(async () => {
    try{
        //try to send 
        console.log('Registering slash commands...');

        //more command setup with guilds 
        await rest.put(
            Routes.applicationGuildCommands(
                '1162383005357191198',
                '1159342687615455252'
                ),
            {body: commands }
        );
                // send back to the console
            console.log('Slash commands were registered successfully!');

            //look for errors within the code and catch them 
    } catch (error){
        console.log(`There was a error: ${error}`);
    }
})();