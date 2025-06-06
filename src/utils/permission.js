import { PermissionFlagsBits } from 'discord.js';

export function checkVoicePermissions(voiceChannel, botMember) {
    const permissions = voiceChannel.permissionsFor(botMember);

    if (!permissions.has(PermissionFlagsBits.Connect)) {
        return { success: false, message: 'I don\'t have permission to connect to this voice channel!' };
    }

    if (!permissions.has(PermissionFlagsBits.Speak)) {
        return { success: false, message: 'I don\'t have permission to speak in this voice channel!' };
    }

    if (voiceChannel.full && !permissions.has(PermissionFlagsBits.MoveMembers)) {
        return { success: false, message: 'The voice channel is full and I can\'t join!' };
    }

    return { success: true };
}