export default {
    name: 'ready',
    once: true,
    execute(client) {
        console.log(`✅ ${client.user.tag} is online!`);
        console.log(`📊 Serving ${client.guilds.cache.size} servers`);

        // Set bot status
        client.user.setActivity('/play to start', { type: 'LISTENING' });

        // Register slash commands
        const commands = client.commands.map(command => command.data.toJSON());
        client.application.commands.set(commands);
    }
};