import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { useQueue } from 'discord-player';

const leaveCommand = {
    data: new SlashCommandBuilder()
        .setName('leave')
        .setDescription('Make the bot leave the voice channel'),

    async execute(interaction) {
        const queue = useQueue(interaction.guild.id);

        if (!queue) {
            return interaction.reply('❌ I\'m not in a voice channel!');
        }

        // Check if user is in the same voice channel
        const userVoiceChannel = interaction.member.voice.channel;
        const botVoiceChannel = interaction.guild.members.me.voice.channel;

        if (!userVoiceChannel) {
            return interaction.reply('❌ You must be in a voice channel to use this command!');
        }

        if (userVoiceChannel.id !== botVoiceChannel.id) {
            return interaction.reply('❌ You must be in the same voice channel as me!');
        }

        try {
            // Get queue info before deleting
            const tracksCount = queue.tracks.size;
            const currentTrack = queue.currentTrack;

            // Delete the queue (this disconnects the bot)
            queue.delete();

            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('👋 Disconnected')
                .setDescription('Left the voice channel and cleared the queue');

            if (currentTrack) {
                embed.addFields({
                    name: 'Was Playing',
                    value: `${currentTrack.title} - ${currentTrack.author}`
                });
            }

            if (tracksCount > 0) {
                embed.addFields({
                    name: 'Cleared',
                    value: `${tracksCount} tracks from the queue`
                });
            }

            return interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Leave command error:', error);
            return interaction.reply('❌ Failed to leave the voice channel!');
        }
    }
};

export default leaveCommand;