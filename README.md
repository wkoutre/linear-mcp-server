# Linear MCP Server

A Model Context Protocol (MCP) server implementation for the Linear GraphQL API that enables AI assistants to interact with Linear project management systems.

![Linear MCP Server](https://img.shields.io/badge/MCP-Linear-blue)
[![npm version](https://img.shields.io/npm/v/@emmett.deen/linear-mcp-server.svg)](https://www.npmjs.com/package/@emmett.deen/linear-mcp-server)
[![Smithery](https://img.shields.io/badge/Smithery-Compatible-brightgreen)](https://smithery.ai/server/@emmett.deen/linear-mcp-server)

## Features

- Access to Linear's GraphQL API through MCP tools
- Authentication via Linear API key
- Retrieve and modify data related to users, teams, projects, and issues
- Create, update and comment on issues
- Add and remove labels
- Create projects
- Comprehensive documentation of available tools

## Installation

### Installing via Smithery (Recommended)

To install Linear MCP Server for Claude Desktop automatically via Smithery:

```bash
npx -y @smithery/cli install @emmett.deen/linear-mcp-server --client claude
```

### Manual Configuration

After installation, add the following to your MCP settings file:

```json
{
  "mcpServers": {
    "linear": {
      "command": "npx",
      "args": ["-y", "@emmett.deen/linear-mcp-server"],
      "env": {
        "LINEAR_API_KEY": "your_linear_api_key_here"
      }
    }
  }
}
```

### Client-Specific Configuration Locations

- Claude Desktop: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Claude VSCode Extension: `~/Library/Application Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`
- GoMCP: `~/.config/gomcp/config.yaml`

### Manual Installation

1. Clone the repository

```bash
git clone https://github.com/yourusername/Linear-MCP-Server.git
cd Linear-MCP-Server
```

2. Install dependencies

```bash
npm install
```

3. Build the project

```bash
npm run build
```

4. Create a `.env` file with your Linear API token

```
LINEAR_API_KEY=your_linear_api_key_here
```

5. Start the server

```bash
npm start
```

## Available Tools

See [TOOLS.md](TOOLS.md) for a complete list of available tools and planned features.

## Overview

Linear-MCP-Server bridges the gap between Claude (AI assistant) and Linear (project management tool) by implementing the MCP protocol. This allows Claude to:

- Retrieve issues, projects, teams, and other data from Linear
- Create and update issues
- Change issue status
- Assign issues to team members
- Add comments
- Create projects and teams

The server uses Linear's GraphQL API and authenticates via user tokens (not OAuth) for simplicity.

## Getting Started

### Prerequisites

- Node.js (v18+)
- NPM or Yarn
- Linear API token

### Installation

```bash
# Install globally
npm install -g @emmett.deen/linear-mcp-server

# Or clone and install locally
git clone https://github.com/yourusername/Linear-MCP-Server.git
cd Linear-MCP-Server
npm install
npm link  # Makes the package available globally
```

### Running the Server

Run the server with your Linear API token:

```bash
linear-mcp-server --token YOUR_LINEAR_API_TOKEN
```

Or set the token in your environment and run without arguments:

```bash
export LINEAR_API_TOKEN=YOUR_LINEAR_API_TOKEN
linear-mcp-server
```

## Using with Claude Desktop

To use this MCP server with Claude Desktop:

1. Enable Developer Mode in Claude Desktop (from the menu bar)
2. Go to Settings > Developer options
3. Click "Add Server"
4. Configure with the following settings:
   - **Name**: Linear MCP Server
   - **Type**: Local Process
   - **Command**: linear-mcp-server
   - **Arguments**: --token YOUR_LINEAR_API_TOKEN

Alternatively, manually edit the config file:

```json
{
  "mcp": {
    "servers": [
      {
        "name": "Linear MCP Server",
        "transport": {
          "type": "stdio",
          "command": "linear-mcp-server",
          "args": ["--token", "YOUR_LINEAR_API_TOKEN"]
        }
      }
    ]
  }
}
```

5. Save the config
6. Restart Claude Desktop (quit completely and reopen)
7. You should now see Linear MCP Server available as a tool in Claude

## Example Claude Prompts

Once connected to Claude Desktop, you can use prompts like:

- "Show me all my Linear issues"
- "Create a new issue titled 'Fix login bug' in the Frontend team"
- "Change the status of issue FE-123 to 'In Progress'"
- "Assign issue BE-456 to John Smith"
- "Add a comment to issue UI-789: 'This needs to be fixed by Friday'"

## Development

To develop locally:

```bash
# Clone the repository
git clone https://github.com/yourusername/Linear-MCP-Server.git
cd Linear-MCP-Server

# Install dependencies
npm install

# Run in development mode
npm run dev -- --token YOUR_LINEAR_API_TOKEN
```

### Extending the Server

To add new tools to the server:

1. Follow the implementation guide in the [TOOLS.md](./TOOLS.md) document
2. Make sure to follow the established code structure in the `src/` directory
3. Update the documentation to reflect your changes

## Developing and Contributing

### Setup Development Environment

1. Clone the repository

```bash
git clone https://github.com/yourusername/Linear-MCP-Server.git
cd Linear-MCP-Server
```

2. Install dependencies

```bash
npm install
```

3. Start in development mode

```bash
npm run dev
```

### Publishing to npm

To publish this package to npm:

1. Update the version in package.json

```bash
npm version patch  # or minor, or major
```

2. Build the project

```bash
npm run build
```

3. Make sure you've already logged in to npm

```bash
npm login
```

4. Publish to npm

```bash
npm publish --access public
```

5. For Smithery registry, you'll need to work with the Smithery team to get your server listed in their catalog.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
