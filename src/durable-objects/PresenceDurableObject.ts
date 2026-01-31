export class PresenceDurableObject {
  private state: DurableObjectState;
  private presence: any = null;
  private sessions: Set<WebSocket> = new Set();

  constructor(state: DurableObjectState) {
    this.state = state;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    // WebSocket upgrade
    if (request.headers.get('Upgrade') === 'websocket') {
      const pair = new WebSocketPair();
      const [client, server] = Object.values(pair);

      this.handleWebSocket(server);

      return new Response(null, {
        status: 101,
        webSocket: client,
      });
    }

    // Get current presence
    if (url.pathname === '/get') {
      const presence = await this.state.storage.get('presence') || this.presence;
      return Response.json(presence || { error: 'No presence data' });
    }

    // Update presence (from webhook)
    if (url.pathname === '/update' && request.method === 'POST') {
      this.presence = await request.json();
      await this.state.storage.put('presence', this.presence);
      
      // Broadcast to all connected WebSocket clients
      this.broadcast(JSON.stringify(this.presence));
      
      return Response.json({ success: true });
    }

    return new Response('Not Found', { status: 404 });
  }

  private handleWebSocket(ws: WebSocket) {
    ws.accept();
    this.sessions.add(ws);

    // Send current presence immediately
    if (this.presence) {
      ws.send(JSON.stringify(this.presence));
    }

    ws.addEventListener('message', (msg) => {
      if (msg.data === 'ping') {
        ws.send('pong');
      }
    });

    ws.addEventListener('close', () => {
      this.sessions.delete(ws);
    });

    ws.addEventListener('error', () => {
      this.sessions.delete(ws);
    });
  }

  private broadcast(message: string) {
    for (const session of this.sessions) {
      try {
        session.send(message);
      } catch (err) {
        this.sessions.delete(session);
      }
    }
  }
}
