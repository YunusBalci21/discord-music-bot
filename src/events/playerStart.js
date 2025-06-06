import { EmbedBuilder } from 'discord.js';

export default {
    name: 'playerStart',
    execute(queue, track) {
        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('🎵 Now Playing')
            .setDescription(`**${track.title}**`)
            .addFields(
                { name: 'Artist', value: track.author, inline: true },
                { name: 'Duration', value: track.duration, inline: true },
                { name: 'Requested By', value: track.requestedBy.toString(), inline: true }
            )
            .setThumbnail(track.thumbnail)
            .setFooter({ text: `Queue: ${queue.tracks.size} tracks` });

        queue.metadata.followUp({ embeds: [embed] });
    }
};