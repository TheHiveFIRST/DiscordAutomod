process.env.DISCORD_TOKEN = 'MTI0ODA4NTgyMDU4NjMzMjIzMw.GIskzi.0Q5mO_NpLjBZ-swGMe3AM_S9vC52tixX9-nqmw'; // Directly setting the token for testing

require('dotenv').config();
const { Client, GatewayIntentBits, MessageEmbed } = require('discord.js');

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
                const logsChannel = message.guild.channels.cache.find(channel => channel.name === 'logs');
                if (logsChannel) {
                    const embed = new MessageEmbed()
                        .setColor('#ff0000')
                        .setTitle('Message Deleted Due to Inappropriate Language')
                        .setDescription(`User: ${message.author}\nMessage: ${message.content}`)
                        .setTimestamp();
                    logsChannel.send({ embeds: [embed] });
                } else {
                    console.error('Error: Logs channel not found.');
                }
                message.channel.send(`${message.author}, your message was deleted because it contains inappropriate language.`);
            })
            .catch(err => console.error('Failed to delete the message:', err));
    }

    // Your custom logic to determine the bot's response
    if (message.content.toLowerCase() === 'hello') {
        message.channel.send('Hello! How can I assist you?');
    } else if (message.content.toLowerCase() === 'bye') {
        message.channel.send('Goodbye! Have a great day!');
    } else {
        message.channel.send('I am a simple bot and I did not understand that.');
    }
});

client.login(process.env.DISCORD_TOKEN);
