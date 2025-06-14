import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js';
import { useMainPlayer } from 'discord-player';

export default {
    data: new SlashCommandBuilder()
        .setName('search')
        .setDescription('Search for tracks and choose which one to play')
        .addStringOption(option =>
            option.setName('query')
                .setDescription('Search query')
                .setRequired(true)
        ),

    async execute(interaction) {
        const query = interaction.options.getString('query');

        const voiceChannel = interaction.member.voice.channel;
        if (!voiceChannel) {
            return interaction.reply('❌ You must be in a voice channel to use this command!');
        }

        await interaction.deferReply();
        const player = useMainPlayer();

        try {
            // Search for tracks with explicit preference
            const searchResult = await player.search(`${query} explicit`, {
                requestedBy: interaction.user
            });

            if (!searchResult.hasTracks()) {
                return interaction.editReply('❌ No tracks found for your search!');
            }

            // Take top 10 results
            const tracks = searchResult.tracks.slice(0, 10);

            // Create embed with search results
            const embed = new EmbedBuilder()
                .setColor('#3498db')
                .setTitle('🔍 Search Results')
                .setDescription(`Found ${tracks.length} tracks for: **${query}**\n\nSelect a track from the menu below:`)
                .setFooter({ text: 'Selection expires in 60 seconds' });

            // Add track list to embed
            tracks.forEach((track, index) => {
                const explicitTag = track.title.toLowerCase().includes('explicit') ? ' 🅴' : '';
                embed.addFields({
                    name: `${index + 1}. ${track.title}${explicitTag}`,
                    value: `By: ${track.author} | Duration: ${track.duration || 'Unknown'}`,
                    inline: false
                });
            });

            // Create select menu
            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('track_select')
                .setPlaceholder('Choose a track to play')
                .addOptions(
                    tracks.map((track, index) => ({
                        label: `${index + 1}. ${track.title.substring(0, 80)}`,
                        description: `${track.author} - ${track.duration || 'Unknown'}`,
                        value: index.toString()
                        // Removed emoji to avoid Discord API errors
                    }))
                );

            const row = new ActionRowBuilder().addComponents(selectMenu);

            const response = await interaction.editReply({
                embeds: [embed],
                components: [row]
            });

            // Wait for selection
            const collector = response.createMessageComponentCollector({
                time: 60000 // 60 seconds
            });

            collector.on('collect', async i => {
                if (i.user.id !== interaction.user.id) {
                    return i.reply({
                        content: '❌ Only the person who used the command can select a track!',
                        ephemeral: true
                    });
                }

                const selectedIndex = parseInt(i.values[0]);
                const selectedTrack = tracks[selectedIndex];

                await i.deferUpdate();

                try {
                    await player.play(voiceChannel, selectedTrack, {
                        nodeOptions: {
                            metadata: interaction,
                            volume: 50,
                            selfDeaf: true
                        }
                    });

                    const playEmbed = new EmbedBuilder()
                        .setColor('#00ff00')
                        .setTitle('🎵 Added to Queue')
                        .setDescription(`**${selectedTrack.title}**\nBy: ${selectedTrack.author}`)
                        .setThumbnail(selectedTrack.thumbnail)
                        .addFields(
                            { name: 'Duration', value: selectedTrack.duration || 'Unknown', inline: true },
                            { name: 'Source', value: selectedTrack.source || 'Unknown', inline: true }
                        );

                    await interaction.editReply({
                        embeds: [playEmbed],
                        components: []
                    });

                    collector.stop();
                } catch (error) {
                    console.error('Error playing selected track:', error);
                    await interaction.editReply({
                        content: '❌ Failed to play the selected track!',
                        embeds: [],
                        components: []
                    });
                }
            });

            collector.on('end', collected => {
                if (collected.size === 0) {
                    interaction.editReply({
                        content: '⏱️ Selection timed out.',
                        embeds: [],
                        components: []
                    });
                }
            });

        } catch (error) {
            console.error('Search command error:', error);
            return interaction.editReply('❌ An error occurred while searching for tracks.');
        }
    }
};