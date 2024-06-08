process.env.DISCORD_TOKEN = 'MTI0ODA4NTgyMDU4NjMzMjIzMw.GIskzi.0Q5mO_NpLjBZ-swGMe3AM_S9vC52tixX9-nqmw'; // Directly setting the token for testing

const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Event to execute when the bot is ready
client.once('ready', () => {
    console.log('Bot is ready!');
});

// Event to execute when a message is received
client.on('messageCreate', message => {
    // Ignore messages from the bot itself to prevent infinite loops
    if (message.author.bot) return;

    //Let's make things simple
    let usermessage = message.content;

    //Format for usability
    usermessage.toLowerCase(); //Take a guess
    usermessage.trim(); //Removes whitespaces at the start and end
    usermessage.replace(/\s/g, ""); //Gets rid of whitespaces in between words

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
