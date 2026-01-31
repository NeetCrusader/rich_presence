export interface Env {
  PRESENCE: DurableObjectNamespace;
  FRONTEND_URL: string;
  WEBHOOK_SECRET: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': env.FRONTEND_URL,
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Credentials': 'true',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Health check
    if (url.pathname === '/') {
      return Response.json({ success: true, '🐱': 'meow' }, { headers: corsHeaders });
    }

    // Webhook endpoint - receives presence updates from Discord bot
    if (url.pathname === '/webhook/presence' && request.method === 'POST') {
      const authHeader = request.headers.get('Authorization');
      if (authHeader !== `Bearer ${env.WEBHOOK_SECRET}`) {
        return new Response('Unauthorized', { status: 401 });
      }

      const data = await request.json() as { userId: string; presence: any };
      const id = env.PRESENCE.idFromName(data.userId);
      const stub = env.PRESENCE.get(id);
      
      await stub.fetch(new Request('https://internal/update', {
        method: 'POST',
        body: JSON.stringify(data.presence),
      }));

      return Response.json({ success: true }, { headers: corsHeaders });
    }

    // Presence endpoints
    const match = url.pathname.match(/^\/presence\/([^\/]+)(\/ws)?$/);
    if (match) {
      const userId = match[1];
      const isWebSocket = match[2] === '/ws';
      
      const id = env.PRESENCE.idFromName(userId);
      const stub = env.PRESENCE.get(id);
      
      if (isWebSocket && request.headers.get('Upgrade') === 'websocket') {
        return stub.fetch(request);
      } else if (!isWebSocket && request.method === 'GET') {
        const response = await stub.fetch(new Request('https://internal/get'));
        const data = await response.json();
        return Response.json(data, { headers: corsHeaders });
      }
    }

    return new Response('Not Found', { status: 404, headers: corsHeaders });
  }
};

export { PresenceDurableObject } from './durable-objects/PresenceDurableObject';
