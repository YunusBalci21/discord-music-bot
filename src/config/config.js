export default {
    // Bot configuration
    bot: {
        defaultVolume: 50,
        maxQueueSize: 100,
        leaveOnEmpty: true,
        leaveOnEmptyDelay: 30000, // 30 seconds
        leaveOnStop: true,
        leaveOnStopDelay: 30000,
        selfDeaf: true,
        ytdlOptions: {
            quality: 'highestaudio',
            highWaterMark: 1 << 25,
            dlChunkSize: 0
        }
    },

    // Music sources configuration
    sources: {
        spotify: {
            enabled: true,
            clientId: process.env.SPOTIFY_CLIENT_ID,
            clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
            // Note: Only 30-second previews are available
            previewOnly: true
        },
        youtube: {
            enabled: true,
            // Only for royalty-free content
            allowedChannels: [
                'YouTube Audio Library',
                'NoCopyrightSounds',
                'Audio Library — Music for content creators'
            ]
        },
        soundcloud: {
            enabled: true,
            // Only for user uploads with proper permissions
            requireAttribution: true
        }
    },

    // Command cooldowns (in seconds)
    cooldowns: {
        play: 3,
        skip: 2,
        queue: 5,
        lyrics: 10
    }
};