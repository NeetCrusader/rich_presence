# Project Structure

```
rich_presence/
├── .gitattributes              # Git line ending configuration
├── .gitignore                  # Git ignore rules
├── README.md                   # Main documentation with architecture overview
├── DEPLOYMENT.md               # Comprehensive deployment guide
├── MIGRATION.md                # v1.x to v2.0 migration guide
├── TESTING.md                  # Testing checklist and procedures
├── package.json                # Worker dependencies (Cloudflare Workers)
├── tsconfig.json               # TypeScript config for Worker
├── wrangler.toml               # Cloudflare Workers configuration
│
├── src/                        # Cloudflare Worker source code
│   ├── index.ts                # Main Worker entry point
│   ├── durable-objects/
│   │   └── PresenceDurableObject.ts  # Durable Object for state management
│   └── types/
│       └── presence.ts         # TypeScript interfaces
│
└── bot/                        # Discord bot service (separate deployment)
    ├── README.md               # Bot setup instructions
    ├── .env.example            # Environment variables template
    ├── package.json            # Bot dependencies (Discord.js)
    ├── tsconfig.json           # TypeScript config for bot
    └── src/
        ├── index.ts            # Bot entry point
        └── utils/
            └── FormatUtils.ts  # Presence formatting utilities
```

## Architecture Components

### Cloudflare Worker (`/src`)
- **Purpose**: REST API + WebSocket server for frontend clients
- **Technology**: Cloudflare Workers with Durable Objects
- **Deployment**: `npm run deploy` (via Wrangler)
- **Scaling**: Automatic, global distribution

### Discord Bot (`/bot`)
- **Purpose**: Monitor Discord presence and send webhooks
- **Technology**: Discord.js
- **Deployment**: Railway/Render/Heroku/VPS
- **Communication**: HTTPS webhooks to Worker

### State Management
- **Durable Objects**: Per-user presence state
- **Persistence**: Automatic via Cloudflare
- **Broadcasting**: WebSocket updates to connected clients

## Quick Start

### Deploy Worker
```bash
npm install
npx wrangler login
npx wrangler secret put WEBHOOK_SECRET
npm run deploy
```

### Deploy Bot
```bash
cd bot
npm install
# Configure .env with your credentials
npm start
```

## Documentation

- **[README.md](README.md)**: Architecture, features, API reference
- **[DEPLOYMENT.md](DEPLOYMENT.md)**: Step-by-step deployment guide
- **[MIGRATION.md](MIGRATION.md)**: Upgrade from v1.x instructions
- **[TESTING.md](TESTING.md)**: Testing procedures and checklist
- **[bot/README.md](bot/README.md)**: Bot-specific setup

## API Endpoints

### REST API
- `GET /` - Health check
- `GET /presence/:userId` - Get user presence
- `POST /webhook/presence` - Webhook for bot updates (authenticated)

### WebSocket
- `WS /presence/:userId/ws` - Real-time presence updates

## Environment Variables

### Worker (Cloudflare Secrets)
```bash
WEBHOOK_SECRET  # Set via: wrangler secret put WEBHOOK_SECRET
```

### Worker (wrangler.toml)
```toml
FRONTEND_URL    # Your frontend domain
```

### Bot (.env)
```env
BOT_TOKEN       # Discord bot token
GUILD_ID        # Discord server ID
WEBHOOK_URL     # Worker URL
WEBHOOK_SECRET  # Same as worker secret
```

## Technology Stack

### Worker
- Cloudflare Workers (Serverless)
- Durable Objects (State management)
- TypeScript
- Wrangler CLI

### Bot
- Node.js 18+
- Discord.js v14
- TypeScript
- dotenv

## Features

✅ Real-time presence updates
✅ RESTful API
✅ WebSocket support
✅ Persistent state
✅ Global distribution
✅ Secure webhook authentication
✅ CORS configured
✅ Full TypeScript support

## Development

### Worker Development
```bash
npm run dev
```

### Bot Development
```bash
cd bot
npm run dev
```

## Testing

See [TESTING.md](TESTING.md) for comprehensive testing procedures.

Quick tests:
```bash
# Health check
curl https://your-worker.workers.dev/

# Get presence
curl https://your-worker.workers.dev/presence/USER_ID

# WebSocket test (browser console)
const ws = new WebSocket('wss://your-worker.workers.dev/presence/USER_ID/ws');
ws.onmessage = (e) => console.log(JSON.parse(e.data));
```

## Security

- Webhook authentication via Bearer tokens
- CORS restricted to configured frontend
- Secrets stored in Cloudflare Workers secrets
- No exposed credentials in code

## Performance

- **Latency**: <50ms globally (Cloudflare edge)
- **Scalability**: Automatic, unlimited
- **Uptime**: 99.9%+ (Cloudflare SLA)
- **Cost**: Free tier covers most use cases

## Support

- Issues: GitHub Issues
- Documentation: This repository
- Logs: `npx wrangler tail` (Worker), Platform dashboard (Bot)

---

**Version**: 2.0.0
**License**: MIT
**Last Updated**: 2024
