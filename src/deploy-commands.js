import { REST, Routes } from 'discord.js';
import { readdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ✅ Correct path to your commands directory
const commands = [];
const commandsPath = join(__dirname, 'commands');
const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.js'));

// Load all slash command modules with error handling
for (const file of commandFiles) {
    const filePath = join(commandsPath, file);
    try {
        console.log(`Loading command: ${file}`);
        const command = await import(pathToFileURL(filePath));

        // Check if the command has the expected structure
        if (!command.default) {
            console.error(`❌ ${file} is missing default export`);
            continue;
        }

        if (!command.default.data) {
            console.error(`❌ ${file} is missing data property`);
            continue;
        }

        if (!command.default.data.toJSON) {
            console.error(`❌ ${file} data is not a SlashCommandBuilder`);
            continue;
        }

        commands.push(command.default.data.toJSON());
        console.log(`✅ Successfully loaded ${file}`);
    } catch (error) {
        console.error(`❌ Error loading ${file}:`, error.message);
    }
}

if (commands.length === 0) {
    console.error('❌ No commands were loaded successfully!');
    process.exit(1);
}

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

// Register commands globally
(async () => {
    try {
        console.log(`\nStarted refreshing ${commands.length} application (/) commands.`);

        const data = await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands },
        );

        console.log(`✅ Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
        console.error('❌ Error deploying commands:', error);
    }
})();