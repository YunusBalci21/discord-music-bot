import { useQueue } from 'discord-player';

export default {
    name: 'voiceStateUpdate',
    async execute(oldState, newState) {
        // 1. Handle manual disconnection of the bot
        if (
            oldState.member?.user?.bot &&
            oldState.channelId &&
            !newState.channelId
        ) {
            console.log('Bot was disconnected from the voice channel.');
            return;
        }

        // 2. Handle user leaving voice channel where the bot is
        const botId = oldState.guild.members.me.id;
        const oldChannel = oldState.channel;

        if (oldChannel && oldChannel.members.has(botId)) {
            const nonBotMembers = oldChannel.members.filter(m => !m.user.bot);

            if (nonBotMembers.size === 0) {
                console.log('Bot is alone in voice channel. Waiting 30 seconds before leaving...');

                setTimeout(() => {
                    const channelStillExists = oldChannel.guild.channels.cache.get(oldChannel.id);
                    const membersStillThere = channelStillExists?.members;
                    const stillAlone = membersStillThere?.filter(m => !m.user.bot).size === 0;
                    const botStillPresent = membersStillThere?.has(botId);

                    if (stillAlone && botStillPresent) {
                        const queue = useQueue(oldChannel.guild.id);
                        if (queue) {
                            queue.delete();
                            console.log('Left empty voice channel after timeout.');
                        }
                    }
                }, 30_000); // 30 seconds delay
            }
        }
    }
};
