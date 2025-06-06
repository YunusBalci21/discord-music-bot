import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { useQueue, QueueRepeatMode } from 'discord-player';

export default {
    data: new SlashCommandBuilder()
        .setName('loop')
        .setDescription('Toggle loop modes')
        .addStringOption(option =>
            option.setName('mode')
                .setDescription('Loop mode to set')
                .setRequired(true)
                .addChoices(
                    { name: 'Off', value: 'off' },
                    { name: 'Track', value: 'track' },
                    { name: 'Queue', value: 'queue' },
                    { name: 'Autoplay', value: 'autoplay' }
                )
        ),

    async execute(interaction) {
        const queue = useQueue(interaction.guild.id);

        if (!queue || !queue.isPlaying()) {
            return interaction.reply('❌ No music is currently playing!');
        }

        const loopMode = interaction.options.getString('mode');
        let mode;
        let description;
        let emoji;

        switch (loopMode) {
            case 'off':
                mode = QueueRepeatMode.OFF;
                description = 'Loop mode disabled';
                emoji = '❌';
                break;
            case 'track':
                mode = QueueRepeatMode.TRACK;
                description = 'Looping current track';
                emoji = '🔂';
                break;
            case 'queue':
                mode = QueueRepeatMode.QUEUE;
                description = 'Looping entire queue';
                emoji = '🔁';
                break;
            case 'autoplay':
                mode = QueueRepeatMode.AUTOPLAY;
                description = 'Autoplay enabled (similar tracks will play)';
                emoji = '📻';
                break;
        }

        queue.setRepeatMode(mode);

        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setDescription(`${emoji} ${description}`)
            .addFields({
                name: 'Current Track',
                value: `${queue.currentTrack.title} - ${queue.currentTrack.author}`
            });

        return interaction.reply({ embeds: [embed] });
    }
};
