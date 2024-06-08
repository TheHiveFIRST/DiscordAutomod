process.env.DISCORD_TOKEN = 'MTI0ODA4NTgyMDU4NjMzMjIzMw.GIskzi.0Q5mO_NpLjBZ-swGMe3AM_S9vC52tixX9-nqmw'; // Directly setting the token for testing

const { Client, Intents } = require('discord.js');
const sqlite3 = require('sqlite3');


const client = new Client({
    intents: [1 << 0, 1 << 9]
});

// Open or create SQLite database
const db = new sqlite3.Database('logs.db', err => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the database.');
        // Create table if not exists
        db.run(`CREATE TABLE IF NOT EXISTS logsChannels (
            guildId TEXT PRIMARY KEY,
            channelId TEXT
        )`);
    }
});

// List of swear words to filter
const swearWords = ['badword1', 'badword2', 'badword3']; // List of swear words

// Function to check if a message contains swear words
function containsSwearWords(messageContent) {
    const content = messageContent.toLowerCase(); // Convert message content to lowercase
    return swearWords.some(swear => content.includes(swear)); // Check if any swear word is included in the message
}

// Event to execute when the bot is ready
client.once('ready', () => {
    console.log('Bot is ready!');
});

// Set logs channel command
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    if (interaction.commandName === 'setlogschannel') {
        if (!interaction.member.permissions.has('MANAGE_CHANNELS')) {
            return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
        }

        const logsChannel = interaction.options.getChannel('logschannel');
        if (!logsChannel || logsChannel.type !== 'GUILD_TEXT') {
            return interaction.reply({ content: 'Please specify a valid text channel.', ephemeral: true });
        }

        // Update or insert logs channel into the database
        db.run('INSERT OR REPLACE INTO logsChannels(guildId, channelId) VALUES(?, ?)', [interaction.guildId, logsChannel.id], err => {
            if (err) {
                console.error('Error setting logs channel:', err.message);
                return interaction.reply({ content: 'Failed to set logs channel.', ephemeral: true });
            }
            interaction.reply({ content: `Logs channel set to ${logsChannel}.`, ephemeral: true });
        });
    }
});

// Event to execute when a message is received
client.on('messageCreate', message => {
    // Ignore messages from the bot itself to prevent infinite loops
    if (message.author.bot) return;

    // Check if the message contains swear words
    if (containsSwearWords(message.content)) {
        // Delete the message
        message.delete()
            .then(() => {
                // Notify the user
                message.channel.send(`${message.author}, your message was deleted because it contains inappropriate language.`);
            })
            .catch(err => console.error('Failed to delete the message:', err));
    }

    // Check if the message is sent in the logs channel
    db.get('SELECT channelId FROM logsChannels WHERE guildId = ?', [message.guild.id], (err, row) => {
        if (err) {
            console.error('Error querying logs channel:', err.message);
            return;
        }

        if (row && row.channelId === message.channelId) {
            // Log the message
            console.log(`[${message.guild.name} / ${message.channel.name}] ${message.author.tag}: ${message.content}`);
            // Here, you can further process the message, such as logging it to a file or sending it to another channel
        }
    });

    // Your custom logic to determine the bot's response
    if (message.content.toLowerCase() === 'hello') {
        message.channel.send('Hello! How can I assist you?');
    } else if (message.content.toLowerCase() === 'bye') {
        message.channel.send('Goodbye! Have a great day!');
    } else {
        message.channel.send('I am a simple bot and I did not understand that.');
    }
});

// Replace 'DISCORD_TOKEN' with your bot token
client.login(process.env.DISCORD_TOKEN);
