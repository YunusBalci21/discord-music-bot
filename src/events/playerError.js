export default {
    name: 'playerError',
    execute(queue, error, track) {
        console.error(`Player error: ${error.message}`);
        console.error(`Track: ${track.title}`);

        queue.metadata.followUp({
            content: `❌ Error playing **${track.title}**: ${error.message}`,
            ephemeral: true
        });
    }
};