require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');

const swearWords = ['badword1', 'badword2', 'badword3']; // List of swear words

let isActive = true;

let logsChannelId = process.env.LOGS_CHANNEL_ID;

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Function to check if a message contains swear words
function containsSwearWords(messageContent) {
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
        message.delete()
            .then(() => {
                // Send a log message to the #logs channel
                const logsChannel = message.guild.channels.cache.get(logsChannelId);
                if (logsChannel) {
                    const embed = {
                        color: 0xff0000, // Integer color value for red
                        title: '**Message Deleted Due to Inappropriate Language**', // Bold title
                        description: `**User:** <@${message.author.id}>\n**------------------------------**\n**Message:** \`${message.content}\`\n**------------------------------**\n **Channel:** ${message.channel}\n **------------------------------**\n*Date and Time:* ${new Date().toLocaleString()}`, // Bold and code block formatting
                        timestamp: new Date()
                    };
                    logsChannel.send({ embeds: [embed] });
                } else {
                    console.error('Error: Logs channel not found.');
                }
                // No need to send a message to the user
            })
            .catch(err => console.error('Failed to delete the message:', err));
    }

    // No need to send "I am a simple bot" message

    // Your custom logic to determine the bot's response
    if (message.content.toLowerCase() === 'hello') {
        message.channel.send('Hello! How can I assist you?');
    } else if (message.content.toLowerCase() === 'bye') {
        message.channel.send('Goodbye! Have a great day!');
    }
});

// Handling interactionCreate event for slash commands
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName, options } = interaction;

    if (commandName === 'activate') {
        isActive = !isActive;
        if (isActive){
            await interaction.reply('Bot now moderating!');
        }
        else {
            await interaction.reply('Bot no longer moderating!');
        }
        
    } else if (commandName === 'logschannel') {
        const channel = options.getChannel('logschannel');
        if (channel.type !== 'GUILD_TEXT') {
            await interaction.reply('Please select a text channel.');
            return;
        }
        logsChannelId = channel.id;
        await interaction.reply(`Logs channel set to ${channel.name}.`);
    }
});

client.login(process.env.DISCORD_TOKEN);
