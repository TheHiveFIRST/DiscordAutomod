require('dotenv').config();
const { Client, GatewayIntentBits, ChannelType, PermissionsBitField } = require('discord.js');
const fs = require('fs');
const path = require('path');

//Port Binding because Render
const express = require('express')
const app = express()
const port = process.env.PORT || 4000;

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })

//Is the bot moderating
let isActive = true;

//channel id for the log messages
let logsChannelId = null;

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Function to read swear words from the file
function getSwearWords() {
    const filePath = path.join(__dirname, 'swearwords.txt');
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return data.split(/\r?\n/).filter(Boolean); // Split by new lines and filter out empty lines
    } catch (err) {
        console.error('Error reading swear words file:', err);
        return [];
    }
}

// Function to check if a message contains swear words
function containsSwearWords(messageContent) {
    const swearWords = getSwearWords(); // Read the latest swear words from the file
    const content = messageContent.toLowerCase(); // Convert message content to lowercase
    return swearWords.some(swear => content.includes(swear)); // Check if any swear word is included in the message
}


// Event to execute when the bot is ready
client.once('ready', () => {
    console.log('Bot is ready!');
});

// Event to execute when a message is received
client.on('messageCreate', message => {

    // Ignore messages from the bot itself to prevent infinite loops
    if (message.author.bot) return;

    // Check if the message contains swear words
    if (isActive && containsSwearWords(message.content)) {

        message.delete()  //Remove the message

            .then(() => {
                // Send a log message to the #logs channel
                const logsChannel = message.guild.channels.cache.get(logsChannelId); //Get the logs channel

                if (logsChannel) {
                    const embed = { //Make an embed
                        color: 0xff0000, // Integer color value for red
                        title: '**Message Deleted Due to Inappropriate Language**', // Bold title
                        description: `**User:** <@${message.author.id}>\n**------------------------------**\n**Message:** \`${message.content}\`\n**------------------------------**\n **Channel:** ${message.channel}\n **------------------------------**\n*Date and Time:* ${new Date().toLocaleString()}`, // Bold and code block formatting
                        timestamp: new Date() //Add date and time
                    };
                    logsChannel.send({ embeds: [embed] }); //Send the Embed
                } 
                else {
                    //If no logs channel
                    console.error('Error: Logs channel not found.');
                }
            })
            .catch(err => console.error('Failed to delete the message:', err));
    }
});

// Handling interactionCreate event for slash commands
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName, options } = interaction;

    // Check if the user has the 'MANAGE_GUILD' permission
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
        await interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
        return;
    }

    //Activate moderation command
    if (commandName === 'activate') {
        isActive = !isActive;
        await interaction.reply(`Bot is now ${isActive ? 'moderating' : 'no longer moderating'}.`);
    } 
    //Set logs channel command
    else if (commandName === 'logschannel') {
        const channel = options.getChannel('logschannel'); //Get the specified channel

        //Make sure it's only a text channel
        if (channel.type !== ChannelType.GuildText) {
            await interaction.reply('Please select a text channel.');
            return;
        }
        //Get channel id
        logsChannelId = channel.id;

        await interaction.reply(`Logs channel set to ${channel.name}.`);
    }
});

//Connect bot to discord
client.login(process.env.DISCORD_TOKEN);
