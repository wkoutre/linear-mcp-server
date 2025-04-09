import express from 'express';
import cors from 'cors';
import http from 'http';
import { WebSocket, WebSocketServer } from 'ws';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { Transport } from '@modelcontextprotocol/sdk/shared/transport.js';
import { JSONRPCMessage, JSONRPCMessageSchema } from '@modelcontextprotocol/sdk/types.js';
import { logInfo, logError } from './utils/config.js';

// Required MCP subprotocol
const MCP_SUBPROTOCOL = 'mcp';

/**
 * WebSocket server transport for MCP
 */
export class WebSocketServerTransport implements Transport {
  private _wss: WebSocketServer;
  private _clients: Set<WebSocket> = new Set();

  onclose?: () => void;
  onerror?: (error: Error) => void;
  onmessage?: (message: JSONRPCMessage) => void;

  constructor(server: http.Server) {
    this._wss = new WebSocketServer({
      server,
      path: '/mcp',
      clientTracking: true,
      // Use simple object for handleProtocols to ensure compatibility
      handleProtocols(protocols, request) {
        logInfo(`Client requested protocols: ${protocols}`);

        // Check if client supports the required MCP subprotocol
        if (Array.isArray(protocols) && protocols.includes(MCP_SUBPROTOCOL)) {
          return MCP_SUBPROTOCOL;
        }

        // If no matching subprotocol, return false to reject the connection
        return false;
      },
    });
  }

  async start(): Promise<void> {
    return new Promise<void>((resolve) => {
      // Handle WebSocket connection upgrade
      this._wss.on('headers', (headers, request) => {
        const protocols = request.headers['sec-websocket-protocol'];
        logInfo(`WebSocket connection attempt with protocols: ${protocols}`);

        // Ensure the Sec-WebSocket-Protocol header is included in the response
        if (protocols && protocols.toString().includes(MCP_SUBPROTOCOL)) {
          const wsProtocolIndex = headers.findIndex((h) =>
            h.toLowerCase().startsWith('sec-websocket-protocol'),
          );

          if (wsProtocolIndex === -1) {
            headers.push(`Sec-WebSocket-Protocol: ${MCP_SUBPROTOCOL}`);
            logInfo(`Added Sec-WebSocket-Protocol header: ${MCP_SUBPROTOCOL}`);
          }
        }
      });

      this._wss.on('connection', (ws: WebSocket, request) => {
        const requestedProtocols = request.headers['sec-websocket-protocol'];
        logInfo(`WebSocket connected with protocols: ${requestedProtocols}`);

        // Double check that this connection has the MCP subprotocol
        if (!(ws as any).protocol) {
          logError(`WebSocket connected, but protocol was not properly set`);
        } else {
          logInfo(`WebSocket using protocol: ${(ws as any).protocol}`);
        }

        this._clients.add(ws);

        ws.on('message', (data: Buffer) => {
          try {
            const messageStr = data.toString();
            logInfo(
              `Received WebSocket message: ${messageStr.substring(0, 100)}${messageStr.length > 100 ? '...' : ''}`,
            );

            const message = JSONRPCMessageSchema.parse(JSON.parse(messageStr));
            this.onmessage?.(message);
          } catch (error) {
            logError(`Error parsing WebSocket message:`, error);
            this.onerror?.(error as Error);
          }
        });

        ws.on('close', (code, reason) => {
          logInfo(`WebSocket closed: ${code} ${reason}`);
          this._clients.delete(ws);
        });

        ws.on('error', (error) => {
          logError(`WebSocket client error:`, error);
          this.onerror?.(error);
        });
      });

      this._wss.on('error', (error) => {
        logError(`WebSocket server error:`, error);
        this.onerror?.(error);
      });

      logInfo('WebSocket server transport started');
      resolve();
    });
  }

  async close(): Promise<void> {
    this._wss.close(() => {
      logInfo('WebSocket server transport closed');
      this.onclose?.();
    });
  }

  async send(message: JSONRPCMessage): Promise<void> {
    const messageStr = JSON.stringify(message);
    logInfo(
      `Sending WebSocket message: ${messageStr.substring(0, 100)}${messageStr.length > 100 ? '...' : ''}`,
    );

    const promises: Promise<void>[] = [];

    this._clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        promises.push(
          new Promise<void>((resolve, reject) => {
            client.send(messageStr, (err) => {
              if (err) {
                logError(`Error sending WebSocket message:`, err);
                reject(err);
              } else {
                resolve();
              }
            });
          }),
        );
      }
    });

    await Promise.all(promises);
  }
}

/**
 * Create and start an MCP WebSocket server using Express
 */
export function createMcpWebSocketServer(
  mcpServer: Server,
  port: number = 3000,
): { expressApp: express.Express; httpServer: http.Server } {
  const app = express();
  const server = http.createServer(app);

  // Setup CORS using the cors package
  app.use(
    cors({
      origin: '*',
      methods: ['GET', 'POST', 'OPTIONS'],
      allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept'],
    }),
  );

  app.get('/', (req, res) => {
    res.send(`
      <html>
        <head>
          <title>Linear MCP WebSocket Server</title>
          <style>
            body { font-family: system-ui, sans-serif; line-height: 1.5; padding: 2rem; max-width: 800px; margin: 0 auto; }
            pre { background: #f5f5f5; padding: 1rem; border-radius: 4px; overflow-x: auto; }
            h1 { color: #333; }
            .note { background: #fffde7; padding: 1rem; border-left: 4px solid #ffd600; margin: 1rem 0; }
          </style>
        </head>
        <body>
          <h1>Linear MCP WebSocket Server</h1>
          <p>The server is running. Connect to the WebSocket endpoint with:</p>
          <pre>ws://localhost:${port}/mcp</pre>

          <div class="note">
            <strong>Important:</strong> You must specify the <code>mcp</code> subprotocol when connecting.
          </div>

          <h2>Example Connection (JavaScript)</h2>
          <pre>
const ws = new WebSocket('ws://localhost:${port}/mcp', ['mcp']);

ws.onopen = () => {
  console.log('Connected to MCP server');

  // Example: List tools
  ws.send(JSON.stringify({
    jsonrpc: "2.0",
    id: "1",
    method: "tools/list",
    params: {}
  }));
};

ws.onmessage = (event) => {
  console.log('Received:', JSON.parse(event.data));
};
          </pre>
        </body>
      </html>
    `);
  });

  const transport = new WebSocketServerTransport(server);

  // Connect the MCP server to the WebSocket transport
  mcpServer.connect(transport).catch((error) => {
    logError('Error connecting MCP server to WebSocket transport:', error);
  });

  return { expressApp: app, httpServer: server };
}
