# Deployment Guide

## Prerequisites
- Cloudflare account with Workers and Durable Objects enabled
- Discord bot token
- Node.js 18+ installed

## Architecture Overview

```
┌─────────────────────┐
│   Discord Server    │
│   (Presence Data)   │
└──────────┬──────────┘
           │
           v
┌─────────────────────┐
│  Discord Bot        │
│  (bot/src/index.ts) │
│  - Monitors presence│
│  - Formats data     │
└──────────┬──────────┘
           │ Webhook (HTTPS)
           │ Bearer Token Auth
           v
┌─────────────────────┐
│ Cloudflare Worker   │
│  (src/index.ts)     │
│  - REST API         │
│  - WebSocket Server │
└──────────┬──────────┘
           │
           v
┌─────────────────────┐
│  Durable Object     │
│  - State Storage    │
│  - WS Broadcasting  │
└─────────────────────┘
```

## Part 1: Deploy Cloudflare Worker

### 1. Install Dependencies

```bash
npm install
```

### 2. Authenticate with Cloudflare

```bash
npx wrangler login
```

### 3. Configure Secrets

Set the webhook secret (generate a secure random string):

```bash
npx wrangler secret put WEBHOOK_SECRET
```

When prompted, enter a strong random secret. You can generate one with:

```bash
openssl rand -base64 32
```

### 4. Configure Environment Variables

Edit `wrangler.toml` to set your frontend URL:

```toml
[vars]
FRONTEND_URL = "https://your-frontend-domain.com"
```

For local development, keep `http://localhost:3070`.

### 5. Deploy to Cloudflare

```bash
npm run deploy
```

After deployment, note your Worker URL:
```
https://rich-presence-worker.YOUR-SUBDOMAIN.workers.dev
```

## Part 2: Deploy Discord Bot

The bot needs to run continuously. Choose one of these hosting options:

### Option A: Railway.app (Recommended)

Railway offers a free tier and automatic deployments.

1. Create account at https://railway.app
2. Click "New Project" → "Deploy from GitHub repo"
3. Connect your GitHub repository
4. Configure the service:
   - **Root Directory**: `bot`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add environment variables:
   ```
   BOT_TOKEN=your_discord_bot_token_here
   GUILD_ID=your_discord_server_id
   WEBHOOK_URL=https://rich-presence-worker.YOUR-SUBDOMAIN.workers.dev
   WEBHOOK_SECRET=same_secret_you_used_in_step_3
   ```
6. Click "Deploy"

### Option B: Render.com

1. Create account at https://render.com
2. Click "New" → "Web Service"
3. Connect your repository
4. Configure:
   - **Root Directory**: `bot`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add environment variables (same as Railway)
6. Click "Create Web Service"

### Option C: Heroku

1. Install Heroku CLI
2. Create a new Heroku app:
   ```bash
   heroku create your-app-name
   ```
3. Set environment variables:
   ```bash
   heroku config:set BOT_TOKEN=your_bot_token
   heroku config:set GUILD_ID=your_guild_id
   heroku config:set WEBHOOK_URL=https://your-worker.workers.dev
   heroku config:set WEBHOOK_SECRET=your_secret
   ```
4. Deploy:
   ```bash
   git subtree push --prefix bot heroku main
   ```

### Option D: VPS (Self-Hosted)

For full control, deploy to your own server:

```bash
# On your server
cd bot
npm install
npm install -g pm2

# Create .env file with your variables
cat > .env << EOF
BOT_TOKEN=your_bot_token
GUILD_ID=your_guild_id
WEBHOOK_URL=https://your-worker.workers.dev
WEBHOOK_SECRET=your_secret
EOF

# Start with PM2 (process manager)
pm2 start npm --name "discord-presence-bot" -- start
pm2 save
pm2 startup
```

## Part 3: Testing

### Test the Worker Health Endpoint

```bash
curl https://rich-presence-worker.YOUR-SUBDOMAIN.workers.dev/
```

Expected response:
```json
{"success": true, "🐱": "meow"}
```

### Test Presence REST API

```bash
curl https://rich-presence-worker.YOUR-SUBDOMAIN.workers.dev/presence/USER_ID
```

Replace `USER_ID` with a Discord user ID from your server.

### Test WebSocket Connection

Create a test HTML file:

```html
<!DOCTYPE html>
<html>
<body>
  <h1>Presence WebSocket Test</h1>
  <pre id="output"></pre>
  
  <script>
    const ws = new WebSocket('wss://rich-presence-worker.YOUR-SUBDOMAIN.workers.dev/presence/USER_ID/ws');
    const output = document.getElementById('output');
    
    ws.onopen = () => {
      output.textContent += 'Connected!\n';
    };
    
    ws.onmessage = (event) => {
      output.textContent += 'Received: ' + event.data + '\n\n';
      console.log('Presence data:', JSON.parse(event.data));
    };
    
    ws.onerror = (error) => {
      output.textContent += 'Error: ' + error + '\n';
    };
    
    ws.onclose = () => {
      output.textContent += 'Disconnected\n';
    };
  </script>
</body>
</html>
```

## Monitoring & Debugging

### View Worker Logs

```bash
npx wrangler tail
```

### View Bot Logs

**Railway**: Check the "Logs" tab in your service dashboard

**Render**: Check the "Logs" tab

**PM2**: 
```bash
pm2 logs discord-presence-bot
```

## Security Notes

1. **Never commit secrets** to Git
2. **Rotate webhook secret** periodically
3. **Use HTTPS** for all communication
4. **Restrict CORS** to your frontend domain only
5. **Monitor logs** for unauthorized access attempts

## Troubleshooting

### Bot not sending updates

1. Check bot logs for errors
2. Verify `WEBHOOK_URL` is correct
3. Verify `WEBHOOK_SECRET` matches on both sides
4. Ensure bot has the `GUILD_PRESENCES` intent enabled in Discord Developer Portal

### WebSocket not connecting

1. Check CORS settings in `wrangler.toml`
2. Verify your frontend URL is whitelisted
3. Use `wss://` (not `ws://`) for secure connections

### "Unauthorized" errors

1. Verify webhook secret matches between bot and worker
2. Check authorization header format: `Bearer YOUR_SECRET`

### Data not persisting

1. Verify Durable Objects are properly configured in `wrangler.toml`
2. Check migrations are applied
3. Redeploy if needed

## Updating the Worker

```bash
npm run deploy
```

Changes are deployed instantly with zero downtime.

## Updating the Bot

Changes depend on your hosting platform:

- **Railway/Render**: Push to GitHub, auto-deploys
- **Heroku**: `git push heroku main`
- **PM2**: `git pull && pm2 restart discord-presence-bot`

## Costs

- **Cloudflare Workers**: Free tier includes 100,000 requests/day
- **Durable Objects**: First 1M reads/writes per month free
- **Railway**: $5/month after free tier
- **Render**: Free tier available with limitations
- **Discord Bot**: Free (runs on your hosting)

## Next Steps

1. Set up monitoring alerts
2. Configure custom domain for Worker
3. Add rate limiting if needed
4. Implement logging/analytics
5. Set up CI/CD pipeline
