# Migration Guide: v1.x to v2.0

This guide helps you migrate from the old Bun + Elysia.js monolithic architecture to the new Cloudflare Workers + separate bot architecture.

## Architecture Comparison

### Before (v1.x)
```
┌─────────────────────────────────┐
│   Single Bun Server             │
│                                 │
│  ┌──────────────────┐          │
│  │ Discord.js Bot   │          │
│  │ (WebSocket)      │          │
│  └─────────┬────────┘          │
│            │                    │
│  ┌─────────┴────────┐          │
│  │ Elysia REST API  │          │
│  │ + WebSocket      │          │
│  └──────────────────┘          │
└─────────────────────────────────┘
```

### After (v2.0)
```
┌──────────────────┐     Webhook      ┌─────────────────────┐
│  Discord Bot     │ ─────────────────>│ Cloudflare Worker   │
│  (Separate)      │     (HTTPS)       │                     │
└──────────────────┘                   │  ┌──────────────┐   │
                                        │  │ Durable      │   │
                                        │  │ Objects      │   │
                                        │  └──────────────┘   │
                                        │                     │
                                        │  REST API + WS      │
                                        └─────────────────────┘
```

## Breaking Changes

### 1. WebSocket Endpoint Path
- **Old**: `/presence/:userId`
- **New**: `/presence/:userId/ws`

**Frontend Update Required:**
```javascript
// Old
const ws = new WebSocket('ws://localhost:PORT/presence/USER_ID');

// New
const ws = new WebSocket('wss://your-worker.workers.dev/presence/USER_ID/ws');
```

### 2. Environment Variables

**Old `.env`:**
```env
BOT_TOKEN=...
GUILD_ID=...
FRONTEND_URL=...
PORT=...
```

**New Structure:**

**Worker (Cloudflare Secrets):**
```bash
npx wrangler secret put WEBHOOK_SECRET
```

**Worker (wrangler.toml):**
```toml
[vars]
FRONTEND_URL = "https://your-frontend.com"
```

**Bot (bot/.env):**
```env
BOT_TOKEN=...
GUILD_ID=...
WEBHOOK_URL=https://your-worker.workers.dev
WEBHOOK_SECRET=same-as-worker-secret
```

### 3. Deployment Process

**Old (Single Deployment):**
```bash
bun install
bun run start
```

**New (Two Deployments):**

1. Deploy Worker:
```bash
npm install
npx wrangler login
npx wrangler secret put WEBHOOK_SECRET
npm run deploy
```

2. Deploy Bot (Railway/Render/etc):
```bash
cd bot
npm install
# Configure environment variables on platform
# Deploy via platform
```

## Step-by-Step Migration

### Step 1: Backup Current Setup

1. Note your current environment variables
2. Save your Discord bot token
3. Document your frontend WebSocket URL

### Step 2: Deploy Cloudflare Worker

1. Clone/update to v2.0 code
2. Install dependencies:
   ```bash
   npm install
   ```

3. Login to Cloudflare:
   ```bash
   npx wrangler login
   ```

4. Generate a secure webhook secret:
   ```bash
   openssl rand -base64 32
   ```

5. Set the secret in Cloudflare:
   ```bash
   npx wrangler secret put WEBHOOK_SECRET
   # Paste the generated secret when prompted
   ```

6. Update `wrangler.toml` with your frontend URL:
   ```toml
   [vars]
   FRONTEND_URL = "https://your-frontend-domain.com"
   ```

7. Deploy:
   ```bash
   npm run deploy
   ```

8. Note your Worker URL (e.g., `https://rich-presence-worker.your-subdomain.workers.dev`)

### Step 3: Deploy Bot Service

1. Choose a hosting platform (Railway recommended)
2. Configure environment variables:
   - `BOT_TOKEN`: Your Discord bot token (same as before)
   - `GUILD_ID`: Your Discord server ID (same as before)
   - `WEBHOOK_URL`: Your Worker URL from Step 2
   - `WEBHOOK_SECRET`: The same secret you set in Step 2.5

3. Deploy the bot (see [DEPLOYMENT.md](DEPLOYMENT.md) for platform-specific instructions)

### Step 4: Update Frontend

Update your frontend WebSocket connection:

```javascript
// Before
const ws = new WebSocket(`ws://${OLD_SERVER_URL}/presence/${userId}`);

// After
const ws = new WebSocket(`wss://${WORKER_URL}/presence/${userId}/ws`);
```

REST API endpoint remains the same:
```javascript
// Both work the same way
fetch(`https://${WORKER_URL}/presence/${userId}`)
```

### Step 5: Test Everything

1. **Test Worker Health:**
   ```bash
   curl https://your-worker.workers.dev/
   ```
   Should return: `{"success": true, "🐱": "meow"}`

2. **Test REST API:**
   ```bash
   curl https://your-worker.workers.dev/presence/USER_ID
   ```

3. **Test WebSocket:**
   Open browser console:
   ```javascript
   const ws = new WebSocket('wss://your-worker.workers.dev/presence/USER_ID/ws');
   ws.onmessage = (e) => console.log(JSON.parse(e.data));
   ```

4. **Verify Bot Logs:**
   Check your bot hosting platform logs for presence updates

### Step 6: Decommission Old Server

Once everything is working:

1. Stop the old Bun server
2. Update any documentation with new URLs
3. Remove old deployment (if hosted)

## Rollback Plan

If something goes wrong, you can quickly rollback:

1. Keep old server running during migration
2. Switch frontend back to old WebSocket URL
3. Debug new setup without downtime
4. Old API: `/presence/:userId` (REST)
5. Old WS: `/presence/:userId` (WebSocket)

## Compatibility Notes

### What Stays the Same

✅ REST API response format (identical)
✅ Presence data structure (no changes)
✅ WebSocket message format (identical)
✅ Discord bot intents and permissions

### What Changes

❌ WebSocket endpoint path (add `/ws`)
❌ Infrastructure (split into Worker + Bot)
❌ Environment variable setup
❌ Deployment process

## Performance Improvements

### Before (v1.x)
- Single point of failure
- Limited scalability
- Manual server management
- Single region deployment

### After (v2.0)
- Cloudflare's global network (300+ cities)
- Automatic scaling
- Zero downtime deployments
- Durable Objects for persistence
- WebSocket session management per user

## Cost Comparison

### Before (v1.x)
- VPS/Server hosting: $5-20/month
- Single region bandwidth
- Manual scaling costs

### After (v2.0)
- Cloudflare Workers: Free tier up to 100k requests/day
- Durable Objects: First 1M operations free/month
- Bot hosting: Railway/Render free tier available
- Global CDN included

## Troubleshooting

### Bot not sending updates
- Verify webhook URL is correct
- Check webhook secret matches on both sides
- Look at bot logs for errors
- Ensure bot is running and connected

### WebSocket not connecting
- Verify path is `/presence/:userId/ws` (not just `/presence/:userId`)
- Check CORS settings in wrangler.toml
- Ensure using `wss://` (not `ws://`)

### 401 Unauthorized on webhook
- Webhook secrets don't match
- Check bot is sending correct Authorization header
- Verify secret was set with `wrangler secret put`

### Data not persisting
- Durable Objects need to be configured in wrangler.toml
- Check migrations are applied
- Redeploy if needed

## Need Help?

1. Check [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions
2. Check [README.md](README.md) for API documentation
3. Review [bot/README.md](bot/README.md) for bot-specific setup
4. Open an issue on GitHub with:
   - Steps to reproduce
   - Error messages
   - Platform (Railway/Render/etc)
   - Worker logs (`npx wrangler tail`)

## Success Criteria

✅ Worker deployed and responding to health checks
✅ Bot connected and sending updates
✅ WebSocket connections working
✅ REST API returning presence data
✅ Frontend receiving real-time updates
✅ Old server decommissioned

---

**Estimated Migration Time:** 30-60 minutes

**Difficulty:** Intermediate

**Recommended Time:** During low-traffic period
