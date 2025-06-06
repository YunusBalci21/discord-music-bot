// src/commands/volume.js
import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { useQueue } from 'discord-player';

export default {
    data: new SlashCommandBuilder()
        .setName('volume')
        .setDescription('Adjust the playback volume')
        .addIntegerOption(option =>
            option.setName('level')
                .setDescription('Volume level (0-100)')
                .setRequired(false)
                .setMinValue(0)
                .setMaxValue(100)
        ),

    async execute(interaction) {
        const queue = useQueue(interaction.guild.id);

        if (!queue || !queue.isPlaying()) {
            return interaction.reply('❌ No music is currently playing!');
        }

        const volumeLevel = interaction.options.getInteger('level');

        // If no volume specified, show current volume
        if (volumeLevel === null) {
            const embed = new EmbedBuilder()
                .setColor('#3498db')
                .setDescription(`🔊 Current volume: **${queue.node.volume}%**`);

            return interaction.reply({ embeds: [embed] });
        }

        // Set new volume
        queue.node.setVolume(volumeLevel);

        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setDescription(`🔊 Volume set to **${volumeLevel}%**`);

        // Add visual volume bar
        const volumeBar = createVolumeBar(volumeLevel);
        embed.addFields({
            name: 'Volume Level',
            value: volumeBar
        });

        return interaction.reply({ embeds: [embed] });
    }
};

function createVolumeBar(volume) {
    const filled = Math.round(volume / 10);
    const empty = 10 - filled;
    return '█'.repeat(filled) + '░'.repeat(empty) + ` ${volume}%`;
}