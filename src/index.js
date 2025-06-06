import { Client, GatewayIntentBits, Collection } from 'discord.js';
import { Player } from 'discord-player';
import { YoutubeiExtractor } from 'discord-player-youtubei';
import { SpotifyExtractor, SoundCloudExtractor } from '@discord-player/extractor';
import express from 'express';
import dotenv from 'dotenv';
import { fileURLToPath, pathToFileURL } from 'url'; // ✅ Added pathToFileURL
import { dirname, join } from 'path';
import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

// Load commands
const commandsPath = join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = join(commandsPath, file);
    const command = await import(pathToFileURL(filePath)); // ✅ FIXED
    client.commands.set(command.default.data.name, command.default);
}

// Load events
const eventsPath = join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = join(eventsPath, file);
    const event = await import(pathToFileURL(filePath)); // ✅ FIXED
    if (event.default.once) {
        client.once(event.default.name, (...args) => event.default.execute(...args));
    } else {
        client.on(event.default.name, (...args) => event.default.execute(...args));
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
