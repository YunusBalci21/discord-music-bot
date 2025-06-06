export default {
    name: 'connection',
    execute(queue) {
        queue.dispatcher.voiceConnection.on('stateChange', (oldState, newState) => {
            if (oldState.status === 'ready' && newState.status === 'connecting') {
                queue.dispatcher.voiceConnection.configureNetworking();
            }
        });
    }
};