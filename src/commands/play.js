import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { useMainPlayer } from 'discord-player';

function cleanURL(url) {
    try {
        const parsed = new URL(url);
        parsed.search = '';
        return parsed.toString();
    } catch {
        return url;
    }
}

export default {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Play explicit music from Spotify, YouTube, or SoundCloud')
        .addStringOption(option =>
            option.setName('query')
                .setDescription('Song name, artist, or URL')
                .setRequired(true)
        ),

    async execute(interaction) {
        const rawQuery = interaction.options.getString('query');
        const cleanedQuery = cleanURL(rawQuery);
        const isLink = cleanedQuery.startsWith('http');

        // Push toward explicit search results
        const query = isLink ? cleanedQuery : `${cleanedQuery} explicit uncensored dirty`;

        const voiceChannel = interaction.member.voice.channel;
        if (!voiceChannel) {
            return interaction.reply('❌ You must be in a voice channel to use this command!');
        }

        await interaction.deferReply();
        const player = useMainPlayer();

        try {
            const searchResult = await player.search(query, {
                requestedBy: interaction.user,
                searchEngine: 'auto'
            });

            if (!searchResult.hasTracks()) {
                return interaction.editReply('❌ No tracks found for your search!');
            }

            // Filter out clean/radio edit tracks
            const filteredTracks = searchResult.tracks.filter(track =>
                !track.title.toLowerCase().includes('clean') &&
                !track.title.toLowerCase().includes('radio edit') &&
                !track.title.toLowerCase().includes('censored')
            );

            const explicitTrack = filteredTracks.find(track =>
                track.title.toLowerCase().includes('explicit') ||
                track.title.toLowerCase().includes('dirty') ||
                track.description?.toLowerCase().includes('explicit') ||
                track.url.toLowerCase().includes('explicit')
            );

            const track = explicitTrack || filteredTracks[0] || searchResult.tracks[0];

            await player.play(voiceChannel, track, {
                nodeOptions: {
                    metadata: interaction
                }
            });

            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('🎵 Now Playing')
                .setDescription(`**${track.title}**\nBy: ${track.author}`)
                .setThumbnail(track.thumbnail)
                .addFields(
                    { name: 'Duration', value: track.duration, inline: true },
                    { name: 'Source', value: track.source, inline: true }
                );

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Play command error:', error);
            return interaction.editReply('❌ An error occurred while trying to play the track.');
        }
    }
};
