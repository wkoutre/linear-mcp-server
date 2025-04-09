# Linear MCP WebSocket Server

This is a WebSocket implementation of the Linear MCP server that allows AI assistants to interact with Linear project management systems over a WebSocket connection instead of stdin/stdout.

## Installation

```bash
# Install dependencies
npm install

# Build the server
npm run build
```

## Running the WebSocket Server

```bash
# Start the WebSocket server (default port 3000)
npm run start:websocket

# Or with a custom port
PORT=8080 npm run start:websocket

# Or for development with auto-restart
npm run dev:websocket
```

## Usage

The server will start on the specified port (default: 3000). You can connect to it using any WebSocket client at:

```
ws://localhost:3000/mcp
```

⚠️ **IMPORTANT**: Your WebSocket client **MUST** specify the `mcp` subprotocol when connecting, as required by the MCP specification.

A simple check that the server is running is available at:

```
http://localhost:3000/
```

## Environment Variables

- `LINEAR_API_TOKEN`: Your Linear API token (required)
- `PORT`: The port to run the WebSocket server on (default: 3000)

## WebSocket Protocol

The server implements the Model Context Protocol (MCP) over WebSockets. Clients can connect and communicate using the standard MCP JSON-RPC protocol.

### Example WebSocket Client

Here's a simple example of connecting to the MCP server using a WebSocket client in Node.js:

```javascript
import WebSocket from 'ws';

// Note the second parameter: specifying the required 'mcp' subprotocol
const ws = new WebSocket('ws://localhost:3000/mcp', ['mcp']);

ws.on('open', function open() {
  console.log('Connected to Linear MCP server');

  // List available tools
  const message = {
    jsonrpc: "2.0",
    id: "1",
    method: "tools/list",
    params: {}
  };

  ws.send(JSON.stringify(message));
});

ws.on('message', function incoming(data) {
  const response = JSON.parse(data.toString());
  console.log('Received response:', response);
});

ws.on('error', function error(err) {
  console.error('WebSocket error:', err);
});

ws.on('close', function close(code, reason) {
  console.log(`Connection closed: ${code} ${reason}`);
});
```

### Browser Example

```javascript
// Note the second parameter: specifying the required 'mcp' subprotocol
const ws = new WebSocket('ws://localhost:3000/mcp', ['mcp']);

ws.onopen = () => {
  console.log('Connected to Linear MCP server');

  // List available tools
  const message = {
    jsonrpc: "2.0",
    id: "1",
    method: "tools/list",
    params: {}
  };

  ws.send(JSON.stringify(message));
};

ws.onmessage = (event) => {
  const response = JSON.parse(event.data);
  console.log('Received response:', response);
};

ws.onerror = (error) => {
  console.error('WebSocket error:', error);
};

ws.onclose = (event) => {
  console.log(`Connection closed: ${event.code} ${event.reason}`);
};
```

## Features

The WebSocket server provides the same functionality as the standard Linear MCP server, but with the following benefits:

1. Can be accessed remotely over the network
2. Supports multiple simultaneous client connections
3. Works with web browsers and other environments that don't have access to stdin/stdout
4. Can be integrated with web applications and services

## How It Works

This implementation uses:

1. Express.js for serving the HTTP endpoint
2. ws library for WebSocket handling
3. The core MCP server implementation from the MCP SDK
4. A custom WebSocketServerTransport to bridge between the two

## Troubleshooting

- **400 Bad Request Error**: Make sure you're specifying the `'mcp'` subprotocol when connecting. For example: `new WebSocket('ws://localhost:3000/mcp', ['mcp'])`.
- **Connection issues**: Make sure you're connecting to the correct URL and port.
- **Authentication errors**: Ensure your Linear API token is correctly set.
- **Protocol errors**: Make sure your client is following the MCP JSON-RPC protocol correctly.

## License

MIT
