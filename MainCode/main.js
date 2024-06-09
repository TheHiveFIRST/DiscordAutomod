require('dotenv').config();
const { Client, GatewayIntentBits, ChannelType, PermissionsBitField } = require('discord.js');
const fs = require('fs');
const path = require('path');
const express = require('express');

// Path to the JSON file
const logsChannelsFilePath = path.join(__dirname, 'logsChannels.json');

// Function to read logs channels from the file
function readLogsChannels() {
    try {
        const data = fs.readFileSync(logsChannelsFilePath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error('Error reading logs channels file:', err);
        return {};
    }
}

// Function to write logs channels to the file
function writeLogsChannels(logsChannels) {
    try {
        fs.writeFileSync(logsChannelsFilePath, JSON.stringify(logsChannels, null, 2));
    } catch (err) {
        console.error('Error writing logs channels file:', err);
    }
}

// Function to get the logs channel ID for a guild
function getLogsChannelId(guildId) {
    const logsChannels = readLogsChannels();
    return logsChannels[guildId] || null;
}

// Function to set the logs channel ID for a guild
function setLogsChannelId(guildId, channelId) {
    const logsChannels = readLogsChannels();
    logsChannels[guildId] = channelId;
    writeLogsChannels(logsChannels);
}

// Is the bot moderating
let isActive = true;

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
                // Get the logs channel ID for the guild
                const logsChannelId = getLogsChannelId(message.guild.id);
                if (logsChannelId) {
                    const logsChannel = message.guild.channels.cache.get(logsChannelId);
                    if (logsChannel) {
                        const embed = { //Make an embed
                            color: 0xff0000, // Integer color value for red
                            title: '**Message Deleted Due to Inappropriate Language**', // Bold title
                            description: `**User:** <@${message.author.id}>\n**------------------------------**\n**Message:** \`${message.content}\`\n**------------------------------**\n **Channel:** ${message.channel}\n **------------------------------**\n*Date and Time:* ${new Date().toLocaleString()}`, // Bold and code block formatting
                            timestamp: new Date() //Add date and time
                        };
                        logsChannel.send({ embeds: [embed] }); //Send the Embed
                    } else {
                        console.error('Error: Logs channel not found.');
                    }
                } else {
                    console.error('Error: Logs channel not set for this guild.');
                }
            })
            .catch(err => console.error('Failed to delete the message:', err));
    }
});

// Event to log deleted messages
client.on('messageDelete', message => {
    if (message.partial) return; // Skip partial messages

    // Get the logs channel ID for the guild
    const logsChannelId = getLogsChannelId(message.guild.id);
    if (logsChannelId) {
        const logsChannel = message.guild.channels.cache.get(logsChannelId);
        if (logsChannel) {
            const embed = {
                color: 0xff0000, // Red color
                title: '**Message Deleted**',
                description: `**User:** <@${message.author.id}>\n**Message:** \`${message.content}\`\n**Channel:** ${message.channel}\n*Date and Time:* ${new Date().toLocaleString()}`,
                timestamp: new Date()
            };
            logsChannel.send({ embeds: [embed] });
        } else {
            console.error('Error: Logs channel not found.');
        }
    } else {
        console.error('Error: Logs channel not set for this guild.');
    }
});

// Event to log edited messages
client.on('messageUpdate', (oldMessage, newMessage) => {
    if (oldMessage.partial || newMessage.partial) return; // Skip partial messages
    if (oldMessage.content === newMessage.content) return; // Skip if the content is the same

    // Get the logs channel ID for the guild
    const logsChannelId = getLogsChannelId(oldMessage.guild.id);
    if (logsChannelId) {
        const logsChannel = oldMessage.guild.channels.cache.get(logsChannelId);
        if (logsChannel) {
            const embed = {
                color: 0xffa500, // Orange color
                title: '**Message Edited**',
                description: `**User:** <@${oldMessage.author.id}>\n**Before:** \`${oldMessage.content}\`\n**After:** \`${newMessage.content}\`\n**Channel:** ${oldMessage.channel}\n*Date and Time:* ${new Date().toLocaleString()}`,
                timestamp: new Date()
            };
            logsChannel.send({ embeds: [embed] });
        } else {
            console.error('Error: Logs channel not found.');
        }
    } else {
        console.error('Error: Logs channel not set for this guild.');
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
        //Set the logs channel ID for this guild
        setLogsChannelId(interaction.guild.id, channel.id);

        await interaction.reply(`Logs channel set to ${channel.name}.`);
    }
});

//Connect bot to discord
client.login(process.env.DISCORD_TOKEN);

// Set up an express server to handle the keep-alive endpoint
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Bot is running!');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
