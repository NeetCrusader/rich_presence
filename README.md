# Discord Presence Tracker

A modern, scalable system for tracking and displaying Discord user presence in real-time using Cloudflare Workers and Durable Objects.

## 🏗️ Architecture

```
┌─────────────────────┐
│   Discord Server    │
│   (Presence Data)   │
└──────────┬──────────┘
           │
           v
┌─────────────────────┐
│  Discord Bot        │
│  - Monitors presence│
│  - Formats data     │
│  - Sends webhooks   │
└──────────┬──────────┘
           │ HTTPS + Auth
           v
┌─────────────────────┐
│ Cloudflare Worker   │
│  - REST API         │
│  - WebSocket Server │
│  - Durable Objects  │
└─────────────────────┘
           │
           v
┌─────────────────────┐
│  Your Frontend      │
│  - Real-time updates│
└─────────────────────┘
```

### Components

1. **Cloudflare Worker** (`src/`)
   - REST API for presence queries
   - WebSocket server for real-time updates
   - Webhook endpoint for receiving updates from bot
   - CORS configured for frontend integration

2. **Durable Objects** (`src/durable-objects/`)
   - Persistent state storage per user
   - WebSocket session management
   - Real-time broadcasting to connected clients

3. **Discord Bot** (`bot/`)
   - Monitors Discord presence changes
   - Formats presence data
   - Sends updates via secure webhook

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Cloudflare account (free tier works)
- Discord bot token
- Hosting for the bot (Railway, Render, VPS, etc.)

### 1. Deploy Cloudflare Worker

```bash
# Install dependencies
npm install

# Login to Cloudflare
npx wrangler login

# Set webhook secret
npx wrangler secret put WEBHOOK_SECRET

# Deploy
npm run deploy
```

Your Worker will be available at:
```
https://rich-presence-worker.YOUR-SUBDOMAIN.workers.dev
```

### 2. Deploy Discord Bot

```bash
cd bot
npm install

# Create .env file (copy from .env.example)
cp .env.example .env

# Edit .env with your values
# BOT_TOKEN, GUILD_ID, WEBHOOK_URL, WEBHOOK_SECRET

# Run locally
npm run dev

# Or deploy to Railway, Render, Heroku, etc.
```

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

## 📡 API Reference

### REST Endpoints

#### `GET /`
Health check endpoint.

**Response:**
```json
{
  "success": true,
  "🐱": "meow"
}
```

#### `GET /presence/:userId`
Get current presence for a user.

**Parameters:**
- `userId` - Discord user ID

**Response:**
```json
{
  "_id": "123456789",
  "tag": "username",
  "pfp": "https://cdn.discordapp.com/avatars/...",
  "status": "online",
  "customStatus": {
    "name": "Custom status text",
    "createdTimestamp": 1234567890,
    "emoji": "https://cdn.discordapp.com/emojis/..."
  },
  "activities": [
    {
      "name": "Visual Studio Code",
      "type": "Playing",
      "details": "Editing index.ts",
      "state": "Working on presence system",
      "timestamps": {
        "start": "2024-01-01T00:00:00.000Z",
        "end": null
      }
    }
  ],
  "platform": {
    "desktop": "online"
  },
  "badges": ["Discord Nitro", "Early Supporter"],
  "_dn": "Display Name"
}
```

#### `GET /presence/:userId/ws`
WebSocket endpoint for real-time presence updates.

**Example (JavaScript):**
```javascript
const ws = new WebSocket('wss://your-worker.workers.dev/presence/123456789/ws');

ws.onmessage = (event) => {
  const presence = JSON.parse(event.data);
  console.log('Updated presence:', presence);
};

// Send ping to keep connection alive
setInterval(() => {
  ws.send('ping');
}, 30000);
```

#### `POST /webhook/presence`
Internal webhook endpoint for bot updates. Secured with Bearer token authentication.

**Headers:**
```
Authorization: Bearer YOUR_WEBHOOK_SECRET
Content-Type: application/json
```

**Body:**
```json
{
  "userId": "123456789",
  "presence": { /* presence object */ }
}
```

## 🔧 Configuration

### Worker Configuration (`wrangler.toml`)

```toml
name = "rich-presence-worker"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[durable_objects]
bindings = [
  { name = "PRESENCE", class_name = "PresenceDurableObject" }
]

[[migrations]]
tag = "v1"
new_classes = ["PresenceDurableObject"]

[vars]
FRONTEND_URL = "https://your-frontend.com"
```

### Bot Configuration (`bot/.env`)

```env
BOT_TOKEN=your_discord_bot_token
GUILD_ID=your_guild_id
WEBHOOK_URL=https://your-worker.workers.dev
WEBHOOK_SECRET=your_webhook_secret
```

## 🔐 Security

- **Webhook Authentication**: All webhook requests require Bearer token authentication
- **CORS**: Restricted to configured frontend URL
- **Secrets**: Stored in Cloudflare Workers secrets (not in code)
- **HTTPS**: All communication encrypted

## 🛠️ Development

### Local Development

**Worker:**
```bash
npm run dev
```

**Bot:**
```bash
cd bot
npm run dev
```

### Testing

Test WebSocket connection:
```bash
# Install wscat
npm install -g wscat

# Connect
wscat -c "wss://your-worker.workers.dev/presence/USER_ID/ws"
```

## 📊 Monitoring

View real-time logs:
```bash
npx wrangler tail
```

## 💰 Costs

- **Cloudflare Workers**: Free tier includes 100,000 requests/day
- **Durable Objects**: First 1M reads/writes per month free
- **Bot Hosting**: Varies by platform (Railway/Render have free tiers)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

MIT License - See LICENSE file for details

## 🆘 Support

- See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed setup instructions
- Check issues for common problems
- Create an issue for bugs or feature requests

## 🌟 Features

- ✅ Real-time presence updates via WebSocket
- ✅ RESTful API for presence queries
- ✅ Persistent state with Durable Objects
- ✅ Scalable Cloudflare Workers infrastructure
- ✅ Secure webhook authentication
- ✅ CORS configured for frontend integration
- ✅ Support for custom status, activities, and badges
- ✅ Multi-platform presence detection (desktop, mobile, web)

## 🔄 Migration from v1.x

If you're upgrading from the Bun + Elysia.js version:

1. The API endpoints remain the same for compatibility
2. WebSocket path changed from `/presence/:id` to `/presence/:id/ws`
3. Deploy the new Worker and Bot separately
4. Update your frontend WebSocket connection URLs
5. The old service can be decommissioned once the new system is verified

---

Made with ❤️ using Cloudflare Workers and Discord.js
