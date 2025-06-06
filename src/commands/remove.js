import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { useQueue } from 'discord-player';

export default {
    data: new SlashCommandBuilder()
        .setName('remove')
        .setDescription('Remove a specific track from the queue')
        .addIntegerOption(option =>
            option.setName('position')
                .setDescription('Position of the track to remove')
                .setRequired(true)
                .setMinValue(1)
        ),

    async execute(interaction) {
        const queue = useQueue(interaction.guild.id);

        if (!queue || queue.isEmpty()) {
            return interaction.reply('❌ The queue is empty!');
        }

        const position = interaction.options.getInteger('position') - 1;

        if (position >= queue.tracks.size) {
            return interaction.reply(`❌ Invalid position! The queue only has ${queue.tracks.size} tracks.`);
        }

        const removedTrack = queue.removeTrack(position);

        if (removedTrack) {
            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setDescription(`🗑️ Removed **${removedTrack.title}** from the queue`)
                .addFields({
                    name: 'Removed Track',
                    value: `${removedTrack.title} - ${removedTrack.author}`
                });

            return interaction.reply({ embeds: [embed] });
        }

        return interaction.reply('❌ Failed to remove the track!');
    }
};