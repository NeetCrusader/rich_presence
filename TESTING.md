# Testing Checklist

This document provides a comprehensive testing checklist for the Discord Presence Tracker system.

## Pre-Deployment Testing

### Worker Code Validation

- [x] TypeScript compilation passes (`npx tsc --noEmit`)
- [x] No TypeScript errors in Worker code
- [x] Proper types defined (no `any` types)
- [x] CodeQL security scan passes
- [x] Code review completed

### Bot Code Validation

- [x] TypeScript compilation passes (`cd bot && npx tsc --noEmit`)
- [x] No TypeScript errors in bot code
- [x] Formatting utilities ported correctly
- [x] Error handling in place

## Local Development Testing

### Worker Local Testing

```bash
# Start local worker
npm run dev

# In another terminal, test endpoints
curl http://localhost:8787/
# Expected: {"success": true, "🐱": "meow"}

# Test presence endpoint (will return error if no data)
curl http://localhost:8787/presence/123456789
```

### Bot Local Testing

```bash
cd bot

# Create .env file
cp .env.example .env
# Edit .env with your values

# Run bot
npm run dev

# Check console for:
# ✅ Bot logged in as YourBot#1234
# 📡 Updated presence for Username
```

## Post-Deployment Testing

### 1. Worker Health Check

```bash
curl https://your-worker.workers.dev/
```

**Expected Response:**
```json
{
  "success": true,
  "🐱": "meow"
}
```

**Status Code:** 200

### 2. CORS Preflight Request

```bash
curl -X OPTIONS https://your-worker.workers.dev/presence/123456789 \
  -H "Origin: https://your-frontend.com" \
  -H "Access-Control-Request-Method: GET"
```

**Expected Headers:**
- `Access-Control-Allow-Origin`: Your frontend URL
- `Access-Control-Allow-Methods`: Contains GET, POST, OPTIONS
- `Access-Control-Allow-Credentials`: true

### 3. REST API - Get Presence

```bash
curl https://your-worker.workers.dev/presence/USER_ID
```

**Expected Response (with data):**
```json
{
  "_id": "123456789",
  "tag": "username",
  "pfp": "https://cdn.discordapp.com/avatars/...",
  "status": "online",
  "customStatus": {
    "name": "Status text",
    "createdTimestamp": 1234567890,
    "emoji": "https://..."
  },
  "activities": [...],
  "platform": {"desktop": "online"},
  "badges": ["Discord Nitro"],
  "_dn": "Display Name"
}
```

**Expected Response (no data):**
```json
{
  "error": "No presence data"
}
```

### 4. WebSocket Connection

**Using Browser Console:**
```javascript
const ws = new WebSocket('wss://your-worker.workers.dev/presence/USER_ID/ws');

ws.onopen = () => console.log('✅ Connected');
ws.onmessage = (e) => console.log('📨 Message:', JSON.parse(e.data));
ws.onerror = (e) => console.error('❌ Error:', e);
ws.onclose = () => console.log('🔌 Disconnected');

// Send ping
ws.send('ping');
// Should receive: "pong"
```

**Using wscat:**
```bash
npm install -g wscat
wscat -c "wss://your-worker.workers.dev/presence/USER_ID/ws"

# Should receive presence data immediately
# Type: ping
# Should receive: pong
```

### 5. Webhook Endpoint (Bot to Worker)

**Test webhook authentication (should fail without auth):**
```bash
curl -X POST https://your-worker.workers.dev/webhook/presence \
  -H "Content-Type: application/json" \
  -d '{"userId":"123","presence":{}}'
```

**Expected Response:**
```
Unauthorized
```
**Status Code:** 401

**Test with valid auth (replace SECRET):**
```bash
curl -X POST https://your-worker.workers.dev/webhook/presence \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SECRET" \
  -d '{"userId":"123456789","presence":{"_id":"123456789","status":"online"}}'
```

**Expected Response:**
```json
{"success": true}
```

### 6. Bot Integration Test

1. Change your Discord status or activity
2. Check bot logs for update message:
   ```
   📡 Updated presence for YourUsername
   ```
3. Query REST API to verify data was updated:
   ```bash
   curl https://your-worker.workers.dev/presence/YOUR_USER_ID
   ```
4. Check WebSocket receives update in real-time

### 7. Durable Objects Persistence

1. Send presence update via webhook
2. Verify data is stored:
   ```bash
   curl https://your-worker.workers.dev/presence/USER_ID
   ```
3. Wait 5 minutes (or redeploy worker)
4. Check data persists:
   ```bash
   curl https://your-worker.workers.dev/presence/USER_ID
   ```
   Should still return the same data

### 8. Multiple WebSocket Clients

Open multiple browser tabs with WebSocket connections:

**Tab 1:**
```javascript
const ws1 = new WebSocket('wss://your-worker.workers.dev/presence/USER_ID/ws');
ws1.onmessage = (e) => console.log('Tab 1:', e.data);
```

**Tab 2:**
```javascript
const ws2 = new WebSocket('wss://your-worker.workers.dev/presence/USER_ID/ws');
ws2.onmessage = (e) => console.log('Tab 2:', e.data);
```

Change Discord presence and verify both tabs receive the update.

## Load Testing

### Concurrent WebSocket Connections

```javascript
// Test 10 concurrent connections
for (let i = 0; i < 10; i++) {
  const ws = new WebSocket('wss://your-worker.workers.dev/presence/USER_ID/ws');
  ws.onopen = () => console.log(`Connection ${i} opened`);
}
```

**Expected:** All connections open successfully

### REST API Load

```bash
# Install Apache Bench
sudo apt-get install apache2-utils

# Test 1000 requests with 10 concurrent
ab -n 1000 -c 10 https://your-worker.workers.dev/presence/USER_ID
```

**Expected:** 
- All requests succeed (200 OK)
- Low latency (<500ms average)

## Error Handling Tests

### 1. Invalid User ID
```bash
curl https://your-worker.workers.dev/presence/invalid_user_id
```
**Expected:** Returns "No presence data" error

### 2. Invalid Webhook Secret
```bash
curl -X POST https://your-worker.workers.dev/webhook/presence \
  -H "Authorization: Bearer WRONG_SECRET" \
  -H "Content-Type: application/json" \
  -d '{}'
```
**Expected:** 401 Unauthorized

### 3. Malformed WebSocket Path
```javascript
const ws = new WebSocket('wss://your-worker.workers.dev/presence/');
```
**Expected:** Connection fails or returns error

### 4. Bot Connectivity Issues

1. Stop bot service
2. Wait 5 minutes
3. Verify last known presence still available via API
4. Start bot again
5. Change Discord status
6. Verify updates resume

## Monitoring

### Worker Logs
```bash
npx wrangler tail
```

**Look for:**
- No errors
- Webhook requests logging
- WebSocket connections

### Bot Logs

**Railway/Render:** Check platform dashboard

**PM2:**
```bash
pm2 logs discord-presence-bot
```

**Look for:**
- Bot login success
- Presence update messages
- No error messages

## Security Testing

### 1. CORS Protection
```bash
# Try accessing from unauthorized origin
curl https://your-worker.workers.dev/presence/123456789 \
  -H "Origin: https://malicious-site.com"
```

**Expected:** CORS header should only allow your configured frontend URL

### 2. Webhook Authentication
Verify webhook endpoint requires Bearer token (tested above)

### 3. No Exposed Secrets
```bash
# Check deployed code doesn't contain secrets
curl https://your-worker.workers.dev/
```
Should never expose BOT_TOKEN or WEBHOOK_SECRET

### 4. Rate Limiting (if implemented)
Test excessive requests don't cause issues

## Platform-Specific Tests

### Railway Deployment
- [ ] Service starts successfully
- [ ] Logs show bot login
- [ ] Environment variables loaded
- [ ] Health checks passing

### Render Deployment
- [ ] Build completes
- [ ] Service running
- [ ] Logs accessible
- [ ] Auto-deploy on push working

### Cloudflare Workers
- [ ] Deployment successful
- [ ] Secrets properly set
- [ ] Durable Objects binding working
- [ ] Custom domain (if configured)

## Rollback Testing

1. Deploy v2.0
2. Test all endpoints
3. If issues found, verify rollback plan:
   - Old server can be restarted
   - Frontend can switch back
   - No data loss

## Acceptance Criteria

✅ All health checks pass
✅ REST API returns correct data
✅ WebSocket connections stable
✅ Bot sends updates successfully
✅ Durable Objects persist data
✅ CORS configured correctly
✅ Webhook authentication works
✅ No security vulnerabilities
✅ Documentation complete
✅ Migration path clear

## Performance Benchmarks

Document your results:

- **REST API latency**: _____ ms
- **WebSocket connection time**: _____ ms
- **Presence update delivery time**: _____ ms
- **Concurrent connections supported**: _____
- **Requests per second**: _____

## Troubleshooting

If any test fails, refer to:
- [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment issues
- [MIGRATION.md](MIGRATION.md) - Migration issues
- Worker logs: `npx wrangler tail`
- Bot logs: Platform dashboard or `pm2 logs`

## Sign-off

- [ ] All tests passing
- [ ] Performance acceptable
- [ ] Documentation reviewed
- [ ] Rollback plan validated
- [ ] Ready for production

---

**Last Updated:** Migration to v2.0
**Tested By:** _____________
**Date:** _____________
