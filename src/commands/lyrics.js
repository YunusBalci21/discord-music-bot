import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { useQueue } from 'discord-player';
import { lyricsExtractor } from '@discord-player/extractor';

// Only initialize if API token exists
const genius = process.env.GENIUS_API_TOKEN ? lyricsExtractor(process.env.GENIUS_API_TOKEN) : null;

export default {
    data: new SlashCommandBuilder()
        .setName('lyrics')
        .setDescription('Get lyrics for the current track')
        .addStringOption(option =>
            option.setName('query')
                .setDescription('Search for specific lyrics')
                .setRequired(false)
        ),

    async execute(interaction) {
        await interaction.deferReply();

        // Check if Genius API is configured
        if (!genius) {
            return interaction.followUp('❌ Lyrics feature is not configured! Please add GENIUS_API_TOKEN to your .env file.');
        }

        const queue = useQueue(interaction.guild.id);
        const query = interaction.options.getString('query');

        let searchQuery;
        if (query) {
            searchQuery = query;
        } else if (queue && queue.currentTrack) {
            // Clean up the search query for better results
            const track = queue.currentTrack;
            // Remove common suffixes that might interfere with search
            let cleanTitle = track.title
                .replace(/\(.*?\)/g, '') // Remove anything in parentheses
                .replace(/\[.*?\]/g, '') // Remove anything in brackets
                .replace(/feat\..*/i, '') // Remove featuring artists
                .replace(/ft\..*/i, '') // Remove ft. artists
                .trim();

            searchQuery = `${cleanTitle} ${track.author}`;
        } else {
            return interaction.followUp('❌ No track playing and no search query provided!');
        }

        try {
            console.log(`Searching lyrics for: ${searchQuery}`);
            const lyrics = await genius.search(searchQuery);

            if (!lyrics || !lyrics.lyrics) {
                // Try a simpler search if the first one failed
                if (queue && queue.currentTrack && !query) {
                    const simpleQuery = `${queue.currentTrack.title}`;
                    console.log(`Retrying with simpler query: ${simpleQuery}`);

                    try {
                        const simpleLyrics = await genius.search(simpleQuery);
                        if (simpleLyrics && simpleLyrics.lyrics) {
                            return sendLyrics(interaction, simpleLyrics);
                        }
                    } catch (retryError) {
                        console.error('Retry search failed:', retryError);
                    }
                }

                return interaction.followUp('❌ No lyrics found! Try using `/lyrics <song name>` with a specific search.');
            }

            return sendLyrics(interaction, lyrics);

        } catch (error) {
            console.error('Lyrics error:', error);

            // Provide helpful error message based on the error type
            if (error.message?.includes('parse')) {
                return interaction.followUp('❌ Failed to parse lyrics from Genius. The lyrics format might be incompatible.');
            } else if (error.message?.includes('API')) {
                return interaction.followUp('❌ Genius API error. Please check your API token.');
            } else {
                return interaction.followUp('❌ Failed to fetch lyrics! Try searching with a different query.');
            }
        }
    }
};

async function sendLyrics(interaction, lyrics) {
    // Split lyrics if too long
    const chunks = lyrics.lyrics.match(/[\s\S]{1,4000}/g) || [];

    if (chunks.length === 0) {
        return interaction.followUp('❌ Lyrics are empty!');
    }

    const embed = new EmbedBuilder()
        .setColor('#e74c3c')
        .setTitle(`📜 ${lyrics.title || 'Lyrics'}`)
        .setDescription(chunks[0])
        .setFooter({ text: `By ${lyrics.artist || 'Unknown Artist'} • Page 1/${chunks.length}` });

    if (lyrics.thumbnail) {
        embed.setThumbnail(lyrics.thumbnail);
    }

    await interaction.followUp({ embeds: [embed] });

    // Send remaining chunks (limit to 3 messages total to avoid spam)
    for (let i = 1; i < chunks.length && i < 3; i++) {
        const followEmbed = new EmbedBuilder()
            .setColor('#e74c3c')
            .setDescription(chunks[i])
            .setFooter({ text: `Page ${i + 1}/${chunks.length}` });

        await interaction.followUp({ embeds: [followEmbed] });
    }

    if (chunks.length > 3) {
        await interaction.followUp('📄 *Lyrics truncated due to length...*');
    }
}