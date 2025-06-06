import { SlashCommandBuilder } from 'discord.js';
import { useQueue } from 'discord-player';

const presets = {
    normal: [],
    clear: [
        'highpass=f=200',
        'dynaudnorm=g=5',
        'acompressor'
    ],
    bassboost: [
        'bass=g=10',
        'dynaudnorm=g=3',
        'acompressor'
    ],
    lofi: [
        'aresample=44100',
        'asetrate=44100*0.8',
        'atempo=1.1',
        'lowpass=f=300'
    ]
};

export default {
    data: new SlashCommandBuilder()
        .setName('preset')
        .setDescription('🎧 Apply an audio preset to the player')
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Choose the audio preset')
                .setRequired(true)
                .addChoices(
                    { name: 'Normal', value: 'normal' },
                    { name: 'Clear', value: 'clear' },
                    { name: 'Bass Boost', value: 'bassboost' },
                    { name: 'Lofi', value: 'lofi' },
                )),

    async execute(interaction) {
        const presetType = interaction.options.getString('type');
        const queue = useQueue(interaction.guildId);

        if (!queue || !queue.node.isPlaying()) {
            return interaction.reply({ content: '❌ No track is currently playing.', ephemeral: true });
        }

        const filters = presets[presetType];

        try {
            await queue.filters.ffmpeg.setFilters(filters);
            return interaction.reply(`✅ Applied the **${presetType}** preset.`);
        } catch (err) {
            console.error('Preset error:', err);
            return interaction.reply('❌ Failed to apply the preset.');
        }
    }
};
