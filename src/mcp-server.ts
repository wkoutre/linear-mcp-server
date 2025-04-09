import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { Transport } from '@modelcontextprotocol/sdk/shared/transport.js';
import { MCPToolDefinition } from './types.js';

/**
 * Interface for the MCP server handler functions
 */
export interface MCPServerHandlers {
  handleInitialize: () => Promise<{ tools: MCPToolDefinition[] }>;
  handleRequest: (req: { name: string; args: unknown }) => Promise<unknown>;
}

/**
 * Interface for the MCP server configuration
 */
export interface MCPServerConfig {
  tools: MCPToolDefinition[];
  handleInitialize: () => Promise<{ tools: MCPToolDefinition[] }>;
  handleRequest: (req: { name: string; args: unknown }) => Promise<unknown>;
  transport?: Transport; // Optional transport (defaults to stdio if not provided)
}

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

/**
 * Runs an MCP server with the given configuration
 */
export async function runMCPServer(config: MCPServerConfig) {
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

  // Convert our tool definitions to the SDK format
  const sdkTools = config.tools.map(convertToolDefinition);

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

      // Call the handler
      const result = await config.handleRequest({ name, args });

      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        isError: false,
      };
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

  // Connect the server to the provided transport or use stdio as default
  const transport = config.transport || new StdioServerTransport();
  await server.connect(transport);

  return server;
}
