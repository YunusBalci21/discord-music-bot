import { SlashCommandBuilder } from 'discord.js';
import { useQueue } from 'discord-player';

export default {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Show the current music queue'),

    async execute(interaction) {
        const queue = useQueue(interaction.guild.id);

        if (!queue || !queue.isPlaying()) {
            return interaction.reply({ content: '❌ No music is currently playing.', ephemeral: true });
        }

        const currentTrack = queue.currentTrack;
        const tracks = queue.tracks.toArray(); // ✅ FIX: convert queue.tracks to an array

        const upcoming =
            tracks.length > 0
                ? tracks
                    .slice(0, 10)
                    .map((track, i) => `${i + 1}. **${track.title}** ([link](${track.url}))`)
                    .join('\n')
                : 'No more tracks in queue.';

        return interaction.reply({
            embeds: [
                {
                    title: '🎵 Current Queue',
                    description: `**Now Playing:** [${currentTrack.title}](${currentTrack.url})\n\n**Next up:**\n${upcoming}`,
                    color: 0x1DB954
                }
            ]
        });
    }
};
