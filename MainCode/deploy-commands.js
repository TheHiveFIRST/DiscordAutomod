require('dotenv').config();
const { REST, Routes, SlashCommandBuilder, ChannelType } = require('discord.js');

const commands = [
    new SlashCommandBuilder()
        .setName('activate')
        .setDescription('Toggle if the bot is moderating or not!'),
    new SlashCommandBuilder()
        .setName('logschannel')
        .setDescription('Set the channel that logs embed gets sent to')
        .addChannelOption(option => 
            option.setName('logschannel')
                .setDescription('The channel where logs get sent to')
                .addChannelTypes(ChannelType.GuildText) // Only allow text channels
                .setRequired(true))
]
.map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands },
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();
