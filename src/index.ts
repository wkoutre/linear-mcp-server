#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";

// Define a simple hello world tool
const HELLO_WORLD_TOOL: Tool = {
  name: "linear_helloWorld",
  description: "A simple tool that returns a hello world message with the provided name.",
  inputSchema: {
    type: "object",
    properties: {
      name: {
        type: "string",
        description: "Your name"
      }
    },
    required: ["name"],
  },
};

// Server implementation (following the Brave Search example exactly)
const server = new Server(
  {
    name: "linear-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

// Type guard for hello world arguments
function isHelloWorldArgs(args: unknown): args is { name: string } {
  return (
    typeof args === "object" &&
    args !== null &&
    "name" in args &&
    typeof (args as { name: string }).name === "string"
  );
}

// Simple function to generate a hello world message
function generateHelloWorld(name: string): string {
  return `Hello, ${name}! This is a test message from the Linear MCP Server.`;
}

// Tool handlers (following the Brave Search example exactly)
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [HELLO_WORLD_TOOL],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params;

    if (!args) {
      throw new Error("No arguments provided");
    }

    // Check if the tool name matches our hello world tool
    if (name === "linear_helloWorld") {
      if (!isHelloWorldArgs(args)) {
        throw new Error("Invalid arguments for linear_helloWorld");
      }
      
      const result = generateHelloWorld(args.name);
      
      return {
        content: [{ type: "text", text: result }],
        isError: false,
      };
    } else {
      return {
        content: [{ type: "text", text: `Unknown tool: ${name}` }],
        isError: true,
      };
    }
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
});

// Run the server (following the Brave Search example exactly)
async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Linear MCP Server running on stdio");
}

runServer().catch((error) => {
  console.error("Fatal error running server:", error);
  process.exit(1);
}); 