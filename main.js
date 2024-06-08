require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { MessageEmbed } = require('discord.js');

const swearWords = ['badword1', 'badword2', 'badword3']; // List of swear words

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
    if (containsSwearWords(message.content)) {
        message.delete()
            .then(() => {
                // Send a log message to the #logs channel
                const logsChannelId = '1248860649350762549'; // Replace 'YOUR_LOGS_CHANNEL_ID' with the actual channel ID
                const logsChannel = message.guild.channels.cache.get(logsChannelId);
                if (logsChannel) {
                    const embed = {
                        color: 0xff0000, // Integer color value for red
                        title: 'Message Deleted Due to Inappropriate Language',
                        description: `User: ${message.author}\nMessage: ${message.content}`,
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

client.login(process.env.DISCORD_TOKEN);
