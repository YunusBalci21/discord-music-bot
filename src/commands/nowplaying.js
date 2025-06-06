import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { useQueue } from 'discord-player';

export default {
    data: new SlashCommandBuilder()
        .setName('nowplaying')
        .setDescription('Show information about the current track'),

    async execute(interaction) {
        const queue = useQueue(interaction.guild.id);

        if (!queue || !queue.isPlaying()) {
            return interaction.reply('❌ No music is currently playing!');
        }

        const track = queue.currentTrack;
        const progress = queue.node.createProgressBar();

        const embed = new EmbedBuilder()
            .setColor('#3498db')
            .setTitle('🎵 Now Playing')
            .setDescription(`**${track.title}**\nBy: ${track.author}`)
            .setThumbnail(track.thumbnail)
            .addFields(
                { name: 'Duration', value: track.duration, inline: true },
                { name: 'Requested By', value: track.requestedBy.toString(), inline: true },
                { name: 'Source', value: track.source || 'Unknown', inline: true },
                { name: 'Progress', value: progress }
            );

        // Add queue info
        if (queue.tracks.size > 0) {
            embed.addFields({
                name: 'Queue',
                value: `${queue.tracks.size} tracks remaining`
            });
        }

        // Add volume and loop status
        const loopModes = ['Off', 'Track', 'Queue', 'Autoplay'];
        embed.setFooter({
            text: `Volume: ${queue.node.volume}% | Loop: ${loopModes[queue.repeatMode]}`
        });

        return interaction.reply({ embeds: [embed] });
    }
};