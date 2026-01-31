# Discord Presence Bot

This is the Discord bot component that monitors presence changes and sends updates to the Cloudflare Worker via webhook.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your values:
- `BOT_TOKEN`: Your Discord bot token from [Discord Developer Portal](https://discord.com/developers/applications)
- `GUILD_ID`: Your Discord server ID
- `WEBHOOK_URL`: Your Cloudflare Worker URL (e.g., `https://rich-presence-worker.your-subdomain.workers.dev`)
- `WEBHOOK_SECRET`: The same secret you set in the Worker with `wrangler secret put WEBHOOK_SECRET`

3. Run the bot:

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

## Discord Bot Setup

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to "Bot" section
4. Click "Reset Token" and copy your bot token
5. Enable "Presence Intent" under "Privileged Gateway Intents"
6. Go to "OAuth2" > "URL Generator"
7. Select scopes: `bot`
8. Select permissions: `Read Messages/View Channels`
9. Copy the generated URL and invite the bot to your server

## How It Works

1. Bot connects to Discord with presence intents enabled
2. Monitors `presenceUpdate` events for users in your configured guild
3. Formats presence data (status, activities, custom status, badges)
4. Sends formatted data to Worker webhook endpoint with authentication
5. Worker stores the data in Durable Objects and broadcasts to WebSocket clients

## Deployment Options

See the main [DEPLOYMENT.md](../DEPLOYMENT.md) for deployment options:
- Railway.app (recommended)
- Render.com
- Heroku
- VPS/Self-hosted

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `BOT_TOKEN` | Discord bot token | `Your bot token from Discord Developer Portal` |
| `GUILD_ID` | Discord server ID | `123456789012345678` |
| `WEBHOOK_URL` | Cloudflare Worker URL | `https://rich-presence-worker.your-subdomain.workers.dev` |
| `WEBHOOK_SECRET` | Webhook authentication secret | `your-secure-random-string` |

## Troubleshooting

**Bot not receiving presence updates:**
- Ensure "Presence Intent" is enabled in Discord Developer Portal
- Verify the bot is in the server (check `GUILD_ID`)
- Check bot has required permissions

**Webhook errors:**
- Verify `WEBHOOK_URL` is correct (include https://)
- Ensure `WEBHOOK_SECRET` matches between bot and Worker
- Check Worker logs with `npx wrangler tail`

**Bot crashes on start:**
- Verify `BOT_TOKEN` is valid
- Check Node.js version is 18+
- Ensure all dependencies are installed
