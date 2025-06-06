import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Show info about all music commands'),

    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor('#5865F2')
            .setTitle('🎧 Fidelio Help')
            .setDescription('Here are the available commands:')
            .addFields(
                { name: '/play <query>', value: 'Plays a song from Spotify, YouTube, or SoundCloud.' },
                { name: '/pause', value: 'Pauses the current song.' },
                { name: '/resume', value: 'Resumes the paused song.' },
                { name: '/skip', value: 'Skips to the next track.' },
                { name: '/queue', value: 'Shows the current song queue.' },
                { name: '/clear', value: 'Clears the entire queue.' },
                { name: '/loop', value: 'Toggles loop for the current track.' },
                { name: '/shuffle', value: 'Shuffles the queue.' },
                { name: '/volume <1-100>', value: 'Adjusts the playback volume.' },
                { name: '/lyrics', value: 'Fetches lyrics from Genius.' },
                { name: '/nowplaying', value: 'Shows info about the currently playing song.' }
            )
            .setFooter({ text: 'Fidelio – Your private music companion 🎭' });

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
};
