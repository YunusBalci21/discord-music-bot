import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { useQueue } from 'discord-player';

export default {
    data: new SlashCommandBuilder()
        .setName('shuffle')
        .setDescription('Shuffle the music queue'),

    async execute(interaction) {
        const queue = useQueue(interaction.guild.id);

        if (!queue || queue.isEmpty()) {
            return interaction.reply('❌ The queue is empty!');
        }

        if (queue.tracks.size < 2) {
            return interaction.reply('❌ Need at least 2 tracks in the queue to shuffle!');
        }

        queue.tracks.shuffle();

        const embed = new EmbedBuilder()
            .setColor('#9b59b6')
            .setDescription(`🔀 Shuffled **${queue.tracks.size}** tracks in the queue`)
            .addFields({
                name: 'Next Track',
                value: `${queue.tracks.at(0).title} - ${queue.tracks.at(0).author}`
            });

        return interaction.reply({ embeds: [embed] });
    }
};