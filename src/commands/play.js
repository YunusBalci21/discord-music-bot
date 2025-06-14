import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { useMainPlayer, QueryType } from 'discord-player';

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
        const isSpotifyLink = cleanedQuery.includes('spotify.com');
        const isLink = cleanedQuery.startsWith('http');

        const voiceChannel = interaction.member.voice.channel;
        if (!voiceChannel) {
            return interaction.reply('❌ You must be in a voice channel to use this command!');
        }

        await interaction.deferReply();
        const player = useMainPlayer();

        try {
            let searchResult;

            // For Spotify links, extract track info and search for explicit version
            if (isSpotifyLink) {
                // First get the track info from the Spotify link
                const spotifyResult = await player.search(cleanedQuery, {
                    requestedBy: interaction.user,
                    searchEngine: QueryType.SPOTIFY_SONG
                });

                if (!spotifyResult.hasTracks()) {
                    return interaction.editReply('❌ Could not fetch track information from Spotify!');
                }

                const spotifyTrack = spotifyResult.tracks[0];

                // Search for the explicit version using track name and artist
                const explicitQuery = `${spotifyTrack.title} ${spotifyTrack.author} explicit`;
                searchResult = await player.search(explicitQuery, {
                    requestedBy: interaction.user,
                    searchEngine: QueryType.AUTO // Let it find the best source
                });

                // If no explicit version found, fallback to the original
                if (!searchResult.hasTracks()) {
                    searchResult = spotifyResult;
                }
            } else {
                // For non-Spotify/link queries, do a smart search
                // First try exact search
                searchResult = await player.search(cleanedQuery, {
                    requestedBy: interaction.user,
                    searchEngine: QueryType.AUTO
                });

                // If we got results, check if there's an explicit version available
                if (searchResult.hasTracks()) {
                    const tracks = searchResult.tracks;
                    const firstTrack = tracks[0];

                    // Only search for explicit if the first result seems to be a music track
                    // (not a short video, podcast, etc)
                    const isMusicTrack = firstTrack.duration !== '0:00' &&
                        !firstTrack.title.toLowerCase().includes('#shorts') &&
                        !firstTrack.title.toLowerCase().includes('podcast');

                    if (isMusicTrack && tracks.length < 5) {
                        // Try to find explicit version with artist name
                        const explicitSearch = await player.search(`${cleanedQuery} explicit`, {
                            requestedBy: interaction.user,
                            searchEngine: QueryType.AUTO
                        });

                        if (explicitSearch.hasTracks()) {
                            // Merge results, preferring explicit versions
                            const allTracks = [...explicitSearch.tracks, ...tracks];
                            const uniqueTracks = Array.from(new Map(allTracks.map(t => [t.url, t])).values());
                            searchResult.tracks = uniqueTracks.slice(0, 10);
                        }
                    }
                }
            }

            if (!searchResult.hasTracks()) {
                return interaction.editReply('❌ No tracks found for your search!');
            }

            // Enhanced filtering for explicit tracks
            const tracks = searchResult.tracks;

            // First, filter out obvious non-music content
            const musicTracks = tracks.filter(track => {
                const lowerTitle = track.title.toLowerCase();
                return !lowerTitle.includes('#shorts') &&
                    !lowerTitle.includes('podcast') &&
                    track.duration !== '0:00';
            });

            const tracksToSearch = musicTracks.length > 0 ? musicTracks : tracks;

            // Filter out clean versions only if we have alternatives
            const nonCleanTracks = tracksToSearch.filter(track => {
                const lowerTitle = track.title.toLowerCase();
                const lowerDescription = (track.description || '').toLowerCase();

                return !lowerTitle.includes('clean version') &&
                    !lowerTitle.includes('radio edit') &&
                    !lowerTitle.includes('censored version');
            });

            // Use non-clean tracks if available, otherwise use all tracks
            const filteredTracks = nonCleanTracks.length > 0 ? nonCleanTracks : tracksToSearch;

            // Find explicitly marked explicit tracks
            const explicitTrack = filteredTracks.find(track => {
                const lowerTitle = track.title.toLowerCase();
                const lowerDescription = (track.description || '').toLowerCase();

                return lowerTitle.includes('explicit') ||
                    lowerDescription.includes('explicit') ||
                    track.raw?.explicit === true;
            });

            // Select the best track - prefer explicit if found, otherwise first result
            const track = explicitTrack || filteredTracks[0] || tracks[0];

            await player.play(voiceChannel, track, {
                nodeOptions: {
                    metadata: interaction,
                    volume: 50,
                    selfDeaf: true,
                    leaveOnEmpty: true,
                    leaveOnEmptyCooldown: 30000,
                    leaveOnEnd: false,
                    leaveOnEndCooldown: 30000
                }
            });

            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('🎵 Added to Queue')
                .setDescription(`**${track.title}**\nBy: ${track.author}`)
                .setThumbnail(track.thumbnail)
                .addFields(
                    { name: 'Duration', value: track.duration || 'Unknown', inline: true },
                    { name: 'Source', value: track.source || 'Unknown', inline: true }
                );

            // Add warning if we couldn't confirm it's explicit
            if (!explicitTrack && isSpotifyLink) {
                embed.addFields({
                    name: '⚠️ Note',
                    value: 'Could not confirm if this is the explicit version'
                });
            }

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Play command error:', error);
            return interaction.editReply('❌ An error occurred while trying to play the track.');
        }
    }
};