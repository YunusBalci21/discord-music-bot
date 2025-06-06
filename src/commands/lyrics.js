import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { useQueue } from 'discord-player';
import { lyricsExtractor } from '@discord-player/extractor';

const genius = lyricsExtractor(process.env.GENIUS_API_TOKEN);

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

        const queue = useQueue(interaction.guild.id);
        const query = interaction.options.getString('query');

        let searchQuery;
        if (query) {
            searchQuery = query;
        } else if (queue && queue.currentTrack) {
            searchQuery = `${queue.currentTrack.title} ${queue.currentTrack.author}`;
        } else {
            return interaction.followUp('❌ No track playing and no search query provided!');
        }

        try {
            const lyrics = await genius.search(searchQuery);

            if (!lyrics) {
                return interaction.followUp('❌ No lyrics found!');
            }

            // Split lyrics if too long
            const chunks = lyrics.lyrics.match(/[\s\S]{1,4000}/g) || [];

            const embed = new EmbedBuilder()
                .setColor('#e74c3c')
                .setTitle(`📜 ${lyrics.title}`)
                .setDescription(chunks[0])
                .setFooter({ text: `By ${lyrics.artist} • Page 1/${chunks.length}` });

            await interaction.followUp({ embeds: [embed] });

            // Send remaining chunks
            for (let i = 1; i < chunks.length && i < 3; i++) {
                const followEmbed = new EmbedBuilder()
                    .setColor('#e74c3c')
                    .setDescription(chunks[i])
                    .setFooter({ text: `Page ${i + 1}/${chunks.length}` });

                await interaction.followUp({ embeds: [followEmbed] });
            }
        } catch (error) {
            console.error('Lyrics error:', error);
            return interaction.followUp('❌ Failed to fetch lyrics!');
        }
    }
};