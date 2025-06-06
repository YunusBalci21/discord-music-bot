import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { useQueue } from 'discord-player';

export default {
    data: new SlashCommandBuilder()
        .setName('resume')
        .setDescription('Resume the paused track'),

    async execute(interaction) {
        const queue = useQueue(interaction.guild.id);

        if (!queue) {
            return interaction.reply('❌ No music queue exists!');
        }

        if (!queue.node.isPaused()) {
            return interaction.reply('▶️ Music is already playing!');
        }

        const success = queue.node.resume();

        if (success) {
            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setDescription('▶️ Music has been resumed')
                .addFields({
                    name: 'Now Playing',
                    value: `${queue.currentTrack.title} - ${queue.currentTrack.author}`
                });

            return interaction.reply({ embeds: [embed] });
        }

        return interaction.reply('❌ Failed to resume the music!');
    }
};