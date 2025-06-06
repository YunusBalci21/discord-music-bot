import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { useQueue } from 'discord-player';

export default {
    data: new SlashCommandBuilder()
        .setName('pause')
        .setDescription('Pause the current track'),

    async execute(interaction) {
        const queue = useQueue(interaction.guild.id);

        if (!queue || !queue.isPlaying()) {
            return interaction.reply('❌ No music is currently playing!');
        }

        if (queue.node.isPaused()) {
            return interaction.reply('⏸️ Music is already paused!');
        }

        const success = queue.node.pause();

        if (success) {
            const embed = new EmbedBuilder()
                .setColor('#ff9800')
                .setDescription('⏸️ Music has been paused')
                .setFooter({ text: 'Use /resume to continue playback' });

            return interaction.reply({ embeds: [embed] });
        }

        return interaction.reply('❌ Failed to pause the music!');
    }
};