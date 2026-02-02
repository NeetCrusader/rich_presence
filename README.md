# Discord Rich Presence API

A real-time Discord presence tracking system built with Bun, Elysia, and Discord.js. This API allows you to display live Discord user status, activities, badges, and custom statuses on your personal website or applications.

## ✨ Features

- **Real-time WebSocket Updates** - Receive instant presence updates via WebSocket connections
- **REST API Endpoint** - Fetch user presence data with a simple HTTP GET request
- **Comprehensive User Data** - Track status, activities, custom statuses, badges, and more
- **Platform Detection** - Identify user status across web, mobile, and desktop platforms
- **Rich Activity Information** - Display detailed information about games, Spotify, and custom activities
- **Badge System** - Show Discord badges including Nitro, HypeSquad, Early Supporter, and more
- **CORS & Security** - Built-in CORS support and Helmet security headers

## 🛠️ Technologies

- **[Bun](https://bun.sh/)** - Fast all-in-one JavaScript runtime
- **[Elysia](https://elysiajs.com/)** - Ergonomic web framework for Bun
- **[Discord.js](https://discord.js.org/)** - Powerful Discord API library
- **TypeScript** - Type-safe development

## 📋 Prerequisites

- [Bun](https://bun.sh/) installed on your system
- A Discord Bot with the following:
  - Bot Token
  - `Guilds` and `Guild Presences` intents enabled
  - Added to your Discord server

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/NeetCrusader/rich_presence.git
   cd rich_presence
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   BOT_TOKEN=your_discord_bot_token
   GUILD_ID=your_discord_server_id
   FRONTEND_URL=https://your-website.com
   PORT=3000
   ```

4. **Start the server**
   ```bash
   bun run start
   ```
   
   For development with hot reload:
   ```bash
   bun run dev
   ```

## 🔐 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `BOT_TOKEN` | Your Discord bot token from [Discord Developer Portal](https://discord.com/developers/applications) | `MTIzNDU2Nzg5MDEyMzQ1Njc4OQ.Gxxxxx.xxxxxxxxxxxxxxxxxxxxxx` |
| `GUILD_ID` | The Discord server ID where the bot tracks presence | `123456789012345678` |
| `FRONTEND_URL` | Your website URL for CORS configuration | `https://yourwebsite.com` |
| `PORT` | Port number for the API server | `3000` |

## 📡 API Endpoints

### REST API

#### Get User Presence
```http
GET /presence/:userId
```

**Response:**
```json
{
  "_id": "123456789012345678",
  "_dn": "John Doe",
  "tag": "johndoe",
  "pfp": "https://cdn.discordapp.com/avatars/...",
  "platform": {
    "desktop": "online",
    "mobile": "offline",
    "web": "offline"
  },
  "status": "online",
  "customStatus": {
    "name": "Coding 🚀",
    "createdTimestamp": 1234567890,
    "emoji": "https://cdn.jsdelivr.net/gh/jdecked/twemoji@latest/assets/svg/1f680.svg"
  },
  "activities": [
    {
      "applicationId": "382624125287399424",
      "name": "Visual Studio Code",
      "type": "Playing",
      "title": "Playing Visual Studio Code",
      "details": "Editing README.md",
      "state": "Workspace: rich_presence",
      "assets": {
        "largeImage": "https://cdn.discordapp.com/app-assets/...",
        "largeText": "Visual Studio Code",
        "smallImage": "https://cdn.discordapp.com/app-assets/...",
        "smallText": "Editing"
      },
      "timestamps": {
        "start": "2026-02-02T12:00:00.000Z",
        "end": null
      }
    }
  ],
  "badges": [
    "Discord Nitro",
    "HypeSquad Bravery",
    "Early Supporter"
  ]
}
```

### WebSocket API

#### Connect to User Presence Stream
```javascript
const ws = new WebSocket('ws://localhost:3000/presence/123456789012345678');

ws.onopen = () => {
  console.log('Connected to presence stream');
};

ws.onmessage = (event) => {
  const presence = JSON.parse(event.data);
  console.log('Presence update:', presence);
};

// Send ping to keep connection alive
ws.send('ping'); // Server responds with 'pong'
```

**Features:**
- Automatic presence updates when user status changes
- Initial presence data sent immediately on connection
- Ping/pong support for connection health checks
- Automatic cleanup on disconnect

## 📁 Project Structure

```
rich_presence/
├── src/
│   ├── index.ts                 # Main application entry point
│   ├── interfaces/
│   │   └── Presence.ts          # TypeScript interfaces for presence data
│   ├── routes/
│   │   └── PresenceRouter.ts    # WebSocket and REST endpoints
│   └── utils/
│       ├── FormatUtils.ts       # Formatting utilities (emojis, badges, assets)
│       └── PresenceUtils.ts     # Core presence processing logic
├── .env                         # Environment variables (not in repo)
├── package.json                 # Dependencies and scripts
├── tsconfig.json                # TypeScript configuration
└── README.md                    # Documentation
```

## 🎯 Use Cases

- **Personal Portfolio** - Display your live Discord status on your website
- **Gaming Communities** - Show what games members are playing
- **Developer Showcases** - Highlight your current coding activities
- **Social Integration** - Connect your website with your Discord presence

## 🔍 How It Works

1. **Discord Bot** monitors presence updates in your specified Discord server
2. **WebSocket Server** maintains real-time connections with clients
3. **Presence Updates** are automatically pushed to connected clients
4. **REST API** provides on-demand presence data for static implementations

## 🎨 Supported Activity Types

- **Playing** - Games and applications
- **Listening** - Spotify and other music services
- **Watching** - YouTube and streaming platforms
- **Competing** - Competitive games
- **Streaming** - Twitch, YouTube Live, etc.
- **Custom Status** - User-defined status with emoji support

## 🏅 Supported Badges

- Discord Staff
- Partnered Server Owner
- HypeSquad Events
- HypeSquad Bravery/Brilliance/Balance
- Discord Bug Hunter (Level 1 & 2)
- Early Supporter
- Early Verified Bot Developer
- Discord Certified Moderator
- Active Developer
- Discord Nitro (detected from profile features)

## 🛡️ Security Features

- CORS protection with configurable origins
- Helmet security headers
- Environment variable validation on startup
- WebSocket connection cleanup
- Error handling and validation

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is open source and available under the MIT License.

## 💡 Tips

- Enable both `Guilds` and `Guild Presences` intents in your Discord bot settings
- Use the WebSocket connection for real-time updates on dynamic websites
- Use the REST endpoint for static site generators or on-demand fetches
- The bot must share a server with the users you want to track

## 🐛 Troubleshooting

**Bot not receiving presence updates?**
- Verify `Guild Presences` intent is enabled in Discord Developer Portal
- Ensure the bot has proper permissions in your Discord server
- Check that `GUILD_ID` matches your Discord server

**CORS errors?**
- Add your website URL to the `FRONTEND_URL` environment variable
- Check that the frontend is using the correct API URL

**WebSocket connection closing?**
- Verify the user exists in the specified guild
- Ensure the user ID is correct
- Check server logs for detailed error messages
