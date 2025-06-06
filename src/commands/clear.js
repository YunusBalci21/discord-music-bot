import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { useQueue } from 'discord-player';

export default {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Clear the entire music queue'),

    async execute(interaction) {
        const queue = useQueue(interaction.guild.id);

        if (!queue || queue.isEmpty()) {
            return interaction.reply('❌ The queue is already empty!');
        }

        const tracksCount = queue.tracks.size;
        queue.clear();

        const embed = new EmbedBuilder()
            .setColor('#ff0000')
            .setDescription(`🗑️ Cleared **${tracksCount}** tracks from the queue`)
            .setFooter({ text: 'The current track will continue playing' });

        return interaction.reply({ embeds: [embed] });
    }
};