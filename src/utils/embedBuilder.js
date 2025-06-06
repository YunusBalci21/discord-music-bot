import { EmbedBuilder } from 'discord.js';

export function createErrorEmbed(message) {
    return new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Error')
        .setDescription(message)
        .setTimestamp();
}

export function createSuccessEmbed(title, description) {
    return new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle(title)
        .setDescription(description)
        .setTimestamp();
}

export function createMusicEmbed(track) {
    const embed = new EmbedBuilder()
        .setColor('#3498db')
        .setTitle('🎵 ' + track.title)
        .setDescription(`By: ${track.author}`)
        .setThumbnail(track.thumbnail);

    if (track.duration) {
        embed.addFields({ name: 'Duration', value: track.duration, inline: true });
    }

    if (track.requestedBy) {
        embed.addFields({ name: 'Requested By', value: track.requestedBy.toString(), inline: true });
    }

    return embed;
}