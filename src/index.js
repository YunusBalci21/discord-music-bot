import { Client, GatewayIntentBits, Collection } from 'discord.js';
import { Player } from 'discord-player';
import { YoutubeiExtractor } from 'discord-player-youtubei';
import { SpotifyExtractor, SoundCloudExtractor } from '@discord-player/extractor';
import express from 'express';
import dotenv from 'dotenv';
import { fileURLToPath, pathToFileURL } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();

// Keep-alive endpoint
app.get('/', (req, res) => {
    res.send(`
        <h1>Discord Music Bot is running!</h1>
        <p>Bot: ${client.user?.tag || 'Loading...'}</p>
        <p>Servers: ${client.guilds?.cache.size || 0}</p>
        <p>Uptime: ${process.uptime().toFixed(0)}s</p>
    `);
});

app.get('/ping', (req, res) => {
    res.json({ status: 'alive', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Keep-alive server running on port ${PORT}`);
});

// Initialize Discord client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.MessageContent
    ]
});

// Initialize Discord Player
const player = new Player(client, {
    ytdlOptions: {
        quality: 'highestaudio',
        highWaterMark: 1 << 25
    }
});

// Register all supported extractors
await player.extractors.register(YoutubeiExtractor, {});
await player.extractors.register(SpotifyExtractor, {});
await player.extractors.register(SoundCloudExtractor, {});

// Make player accessible in commands
client.player = player;

// Command collection
client.commands = new Collection();

// Load commands with better error handling
const commandsPath = join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = join(commandsPath, file);
    try {
        const command = await import(pathToFileURL(filePath));

        // Check if command has proper structure
        if (!command.default) {
            console.warn(`⚠️  Skipping ${file}: missing default export`);
            continue;
        }

        if (!command.default.data || !command.default.data.name) {
            console.warn(`⚠️  Skipping ${file}: missing data or name property`);
            continue;
        }

        if (!command.default.execute) {
            console.warn(`⚠️  Skipping ${file}: missing execute function`);
            continue;
        }

        client.commands.set(command.default.data.name, command.default);
        console.log(`✅ Loaded command: ${command.default.data.name}`);
    } catch (error) {
        console.error(`❌ Error loading command ${file}:`, error);
    }
}

console.log(`📊 Loaded ${client.commands.size} commands total`);

// Load events with better error handling
const eventsPath = join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = join(eventsPath, file);
    try {
        const event = await import(pathToFileURL(filePath));

        if (!event.default) {
            console.warn(`⚠️  Skipping event ${file}: missing default export`);
            continue;
        }

        if (!event.default.name || !event.default.execute) {
            console.warn(`⚠️  Skipping event ${file}: missing name or execute`);
            continue;
        }

        if (event.default.once) {
            client.once(event.default.name, (...args) => event.default.execute(...args));
        } else {
            client.on(event.default.name, (...args) => event.default.execute(...args));
        }
        console.log(`✅ Loaded event: ${event.default.name}`);
    } catch (error) {
        console.error(`❌ Error loading event ${file}:`, error);
    }
}

// Keep-alive server for hosting platforms
const app = express();
app.get('/', (req, res) => res.send('Discord Music Bot is running!'));
app.listen(process.env.PORT || 3000);

// Error handling
client.on('error', error => console.error('Client error:', error));
process.on('unhandledRejection', error => console.error('Unhandled rejection:', error));

// Login
client.login(process.env.DISCORD_TOKEN);