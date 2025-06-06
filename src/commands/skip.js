import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { useQueue } from 'discord-player';

export default {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Skip the current track'),

    async execute(interaction) {
        const queue = useQueue(interaction.guild.id);

        if (!queue || !queue.isPlaying()) {
            return interaction.reply('❌ No music is currently playing!');
        }

        const currentTrack = queue.currentTrack;
        const success = queue.node.skip();

        if (success) {
            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setDescription(`⏭️ Skipped **${currentTrack.title}**`);

            return interaction.reply({ embeds: [embed] });
        }

        return interaction.reply('❌ Something went wrong while skipping the track!');
    }
};