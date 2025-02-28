#!/usr/bin/env node

import { LinearClient } from "@linear/sdk";
import { runMCPServer } from "./mcp-server.js";

import { LinearService } from "./services/linear-service.js";
import { allToolDefinitions } from "./tools/definitions/index.js";
import { registerToolHandlers } from "./tools/handlers/index.js";
import { getLinearApiToken, logInfo, logError } from "./utils/config.js";

/**
 * Main function to run the Linear MCP server
 */
async function runServer() {
  try {
    // Get Linear API token
    const linearApiToken = getLinearApiToken();
    
    if (!linearApiToken) {
      throw new Error(
        "Linear API token not found. Please provide it via --token command line argument or LINEAR_API_TOKEN environment variable."
      );
    }
    
    logInfo(`Starting Linear MCP server...`);

    // Initialize Linear client and service
    const linearClient = new LinearClient({ apiKey: linearApiToken });
    const linearService = new LinearService(linearClient);

    // Start the MCP server
    const server = await runMCPServer({
      tools: allToolDefinitions,
      handleInitialize: async () => {
        logInfo("Linear MCP server initialized successfully.");
        return {
          tools: allToolDefinitions,
        };
      },
      handleRequest: async (req: { name: string; args: unknown }) => {
        const handlers = registerToolHandlers(linearService);
        const toolName = req.name;
        
        if (toolName in handlers) {
          // Use a type assertion here since we know the tool name is valid
          const handler = handlers[toolName as keyof typeof handlers];
          return await handler(req.args);
        } else {
          throw new Error(`Unknown tool: ${toolName}`);
        }
      },
    });

    // Set up heartbeat to keep server alive
    setInterval(() => {
      logInfo("Linear MCP server is running...");
    }, 60000);

    return server;
  } catch (error) {
    logError("Error starting Linear MCP server", error);
    process.exit(1);
  }
}

// Start the server
runServer().catch((error) => {
  logError("Fatal error in Linear MCP server", error);
  process.exit(1);
}); 