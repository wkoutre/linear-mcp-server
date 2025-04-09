#!/usr/bin/env node

import { LinearClient } from '@linear/sdk';
import { createMcpWebSocketServer } from './websocket-server.js';

import { LinearService } from './services/linear-service.js';
import { allToolDefinitions } from './tools/definitions/index.js';
import { registerToolHandlers } from './tools/handlers/index.js';
import { getLinearApiToken, logInfo, logError } from './utils/config.js';

/**
 * Get the WebSocket server port from environment or use default
 */
function getServerPort(): number {
  const port = process.env.PORT || '3000';
  return parseInt(port, 10);
}

/**
 * Main function to run the Linear MCP WebSocket server
 */
async function runWebSocketServer() {
  try {
    // Get Linear API token
    const linearApiToken = getLinearApiToken();

    if (!linearApiToken) {
      throw new Error(
        'Linear API token not found. Please provide it via --token command line argument or LINEAR_API_TOKEN environment variable.',
      );
    }

    const port = getServerPort();
    logInfo(`Starting Linear MCP WebSocket server on port ${port}...`);

    // Initialize Linear client and service
    const linearClient = new LinearClient({ apiKey: linearApiToken });
    const linearService = new LinearService(linearClient);

    // Create the MCP server (but don't connect it to a transport yet)
    const server = new Server(
      {
        name: 'linear-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      },
    );

    // Convert tool definitions to the SDK format
    const sdkTools = allToolDefinitions.map(convertToolDefinition);

    // Handle list tools request
    server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: sdkTools,
    }));

    // Handle call tool request
    server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        const { name, arguments: args } = request.params;

        if (!args) {
          throw new Error('No arguments provided');
        }

        // Get all handlers
        const handlers = registerToolHandlers(linearService);
        const toolName = name;

        if (toolName in handlers) {
          // Use a type assertion here since we know the tool name is valid
          const handler = handlers[toolName as keyof typeof handlers];
          const result = await handler(args);

          return {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
            isError: false,
          };
        } else {
          throw new Error(`Unknown tool: ${toolName}`);
        }
      } catch (error) {
        console.error('Error in tool handler:', error);
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    });

    // Create and start the WebSocket server
    const { httpServer } = createMcpWebSocketServer(server, port);

    // Start the HTTP server
    httpServer.listen(port, () => {
      logInfo(`Linear MCP WebSocket server is running at http://localhost:${port}`);
      logInfo(`Connect to the WebSocket at ws://localhost:${port}/mcp`);
    });

    // Set up heartbeat to keep server alive
    setInterval(() => {
      logInfo('Linear MCP WebSocket server is running...');
    }, 60000);
  } catch (error) {
    logError('Error starting Linear MCP WebSocket server', error);
    process.exit(1);
  }
}

// Import required types
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { MCPToolDefinition } from './types.js';

/**
 * Convert MCPToolDefinition to the MCP SDK Tool format
 */
function convertToolDefinition(toolDef: MCPToolDefinition): Tool {
  return {
    name: toolDef.name,
    description: toolDef.description,
    inputSchema: {
      type: 'object',
      properties: toolDef.input_schema.properties,
      ...(toolDef.input_schema.required ? { required: toolDef.input_schema.required } : {}),
    },
  };
}

// Start the WebSocket server
runWebSocketServer().catch((error) => {
  logError('Fatal error in Linear MCP WebSocket server', error);
  process.exit(1);
});
