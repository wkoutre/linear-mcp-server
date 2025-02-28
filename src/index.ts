#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { LinearClient } from "@linear/sdk";
import dotenv from 'dotenv';

// Load env variables
dotenv.config();

// Define Linear API service
class LinearService {
  private client: LinearClient;
  
  constructor(apiKey: string) {
    this.client = new LinearClient({ apiKey });
  }
  
  async getUserInfo() {
    const viewer = await this.client.viewer;
    return {
      id: viewer.id,
      name: viewer.name,
      email: viewer.email,
      displayName: viewer.displayName,
      active: viewer.active
    };
  }
  
  async getTeams() {
    const teams = await this.client.teams();
    return teams.nodes.map(team => ({
      id: team.id,
      name: team.name,
      key: team.key,
      description: team.description
    }));
  }
  
  async getProjects() {
    const projects = await this.client.projects();
    return Promise.all(projects.nodes.map(async (project) => {
      // We need to fetch teams using the relationship
      const teams = await project.teams();
      
      return {
        id: project.id,
        name: project.name,
        description: project.description,
        state: project.state,
        teams: teams.nodes.map(team => ({
          id: team.id,
          name: team.name
        }))
      };
    }));
  }
  
  async getIssues(limit = 25) {
    const issues = await this.client.issues({ first: limit });
    return Promise.all(issues.nodes.map(async issue => {
      // For relations, we need to fetch the objects
      const teamData = issue.team ? await issue.team : null;
      const assigneeData = issue.assignee ? await issue.assignee : null;
      const projectData = issue.project ? await issue.project : null;
      
      return {
        id: issue.id,
        title: issue.title,
        description: issue.description,
        state: issue.state,
        priority: issue.priority,
        team: teamData ? {
          id: teamData.id,
          name: teamData.name
        } : null,
        assignee: assigneeData ? {
          id: assigneeData.id,
          name: assigneeData.name
        } : null,
        project: projectData ? {
          id: projectData.id,
          name: projectData.name
        } : null,
        createdAt: issue.createdAt
      };
    }));
  }
  
  async createIssue(args: {
    title: string;
    description?: string;
    teamId: string;
    assigneeId?: string;
    priority?: number;
    projectId?: string;
  }) {
    const createdIssue = await this.client.createIssue(args);
    
    // Access the issue from the payload
    if (createdIssue.success && createdIssue.issue) {
      const issueData = await createdIssue.issue;
      return {
        id: issueData.id,
        title: issueData.title,
        description: issueData.description,
        url: issueData.url
      };
    } else {
      throw new Error("Failed to create issue");
    }
  }
  
  async updateIssue(args: {
    id: string;
    title?: string;
    description?: string;
    stateId?: string;
    priority?: number;
    projectId?: string;
    assigneeId?: string;
  }) {
    const updatedIssue = await this.client.updateIssue(args.id, {
      title: args.title,
      description: args.description,
      stateId: args.stateId,
      priority: args.priority,
      projectId: args.projectId,
      assigneeId: args.assigneeId
    });
    
    if (updatedIssue.success && updatedIssue.issue) {
      const issueData = await updatedIssue.issue;
      return {
        id: issueData.id,
        title: issueData.title,
        description: issueData.description,
        url: issueData.url
      };
    } else {
      throw new Error("Failed to update issue");
    }
  }
  
  async createComment(args: {
    issueId: string;
    body: string;
  }) {
    const createdComment = await this.client.createComment({
      issueId: args.issueId,
      body: args.body
    });
    
    if (createdComment.success && createdComment.comment) {
      const commentData = await createdComment.comment;
      return {
        id: commentData.id,
        body: commentData.body,
        url: commentData.url
      };
    } else {
      throw new Error("Failed to create comment");
    }
  }
  
  async createProject(args: {
    name: string;
    description?: string;
    teamId: string;
    state?: string;
    startDate?: string;
    targetDate?: string;
  }) {
    const createdProject = await this.client.createProject({
      name: args.name,
      description: args.description,
      teamIds: [args.teamId], // Use teamIds array instead of teamId
      state: args.state,
      startDate: args.startDate ? new Date(args.startDate) : undefined,
      targetDate: args.targetDate ? new Date(args.targetDate) : undefined
    });
    
    if (createdProject.success && createdProject.project) {
      const projectData = await createdProject.project;
      return {
        id: projectData.id,
        name: projectData.name,
        description: projectData.description,
        url: projectData.url
      };
    } else {
      throw new Error("Failed to create project");
    }
  }
}

// Initialize Linear service
let linearService: LinearService | null = null;

// Parse command line arguments
const args = process.argv.slice(2);
let tokenFromArgs: string | undefined;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--token' && i + 1 < args.length) {
    tokenFromArgs = args[i + 1];
    break;
  }
}

// Use token from args or environment variable
const linearApiKey = tokenFromArgs || process.env.LINEAR_API_TOKEN;

if (linearApiKey) {
  try {
    linearService = new LinearService(linearApiKey);
    console.error("LinearService initialized with token from " + 
      (tokenFromArgs ? "command-line arguments" : "environment variable"));
  } catch (error) {
    console.error("Failed to initialize LinearService:", error);
  }
} else {
  console.error("LINEAR_API_TOKEN not found in environment variables or command-line arguments");
}

// Define tools
const GET_ISSUES_TOOL: Tool = {
  name: "linear_getIssues",
  description: "Get a list of issues from Linear.",
  inputSchema: {
    type: "object",
    properties: {
      limit: {
        type: "number",
        description: "Maximum number of issues to return (default: 25)",
        default: 25
      }
    }
  },
};

const GET_TEAMS_TOOL: Tool = {
  name: "linear_getTeams",
  description: "Get a list of teams from Linear.",
  inputSchema: {
    type: "object",
    properties: {}
  },
};

const GET_PROJECTS_TOOL: Tool = {
  name: "linear_getProjects",
  description: "Get a list of projects from Linear.",
  inputSchema: {
    type: "object",
    properties: {}
  },
};

const CREATE_ISSUE_TOOL: Tool = {
  name: "linear_createIssue",
  description: "Create a new issue in Linear.",
  inputSchema: {
    type: "object",
    properties: {
      title: {
        type: "string",
        description: "Title of the issue"
      },
      description: {
        type: "string",
        description: "Description of the issue"
      },
      teamId: {
        type: "string",
        description: "ID of the team this issue belongs to"
      },
      assigneeId: {
        type: "string",
        description: "ID of the user this issue is assigned to"
      },
      priority: {
        type: "number",
        description: "Priority of the issue (0-4)"
      },
      projectId: {
        type: "string",
        description: "ID of the project this issue belongs to"
      }
    },
    required: ["title", "teamId"]
  },
};

const UPDATE_ISSUE_TOOL: Tool = {
  name: "linear_updateIssue",
  description: "Update an existing issue in Linear.",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "ID of the issue to update"
      },
      title: {
        type: "string",
        description: "New title of the issue"
      },
      description: {
        type: "string",
        description: "New description of the issue"
      },
      stateId: {
        type: "string",
        description: "New state ID for the issue"
      },
      priority: {
        type: "number",
        description: "New priority of the issue (0-4)"
      },
      projectId: {
        type: "string",
        description: "New project ID for the issue"
      },
      assigneeId: {
        type: "string",
        description: "New assignee ID for the issue"
      }
    },
    required: ["id"]
  },
};

const CREATE_COMMENT_TOOL: Tool = {
  name: "linear_createComment",
  description: "Add a comment to an issue in Linear.",
  inputSchema: {
    type: "object",
    properties: {
      issueId: {
        type: "string",
        description: "ID of the issue to comment on"
      },
      body: {
        type: "string",
        description: "Text content of the comment"
      }
    },
    required: ["issueId", "body"]
  },
};

const CREATE_PROJECT_TOOL: Tool = {
  name: "linear_createProject",
  description: "Create a new project in Linear.",
  inputSchema: {
    type: "object",
    properties: {
      name: {
        type: "string",
        description: "Name of the project"
      },
      description: {
        type: "string",
        description: "Description of the project"
      },
      teamId: {
        type: "string",
        description: "ID of the team this project belongs to"
      },
      state: {
        type: "string",
        description: "State of the project (e.g., planned, in-progress, completed)"
      },
      startDate: {
        type: "string",
        description: "Start date of the project (ISO format)"
      },
      targetDate: {
        type: "string",
        description: "Target completion date of the project (ISO format)"
      }
    },
    required: ["name", "teamId"]
  },
};

// Define the hello world tool for testing
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

// Type guards for arguments
function isHelloWorldArgs(args: unknown): args is { name: string } {
  return (
    typeof args === "object" &&
    args !== null &&
    "name" in args &&
    typeof (args as { name: string }).name === "string"
  );
}

function isGetIssuesArgs(args: unknown): args is { limit?: number } {
  return (
    typeof args === "object" &&
    args !== null &&
    (!("limit" in args) || typeof (args as { limit: number }).limit === "number")
  );
}

function isCreateIssueArgs(args: unknown): args is {
  title: string;
  description?: string;
  teamId: string;
  assigneeId?: string;
  priority?: number;
  projectId?: string;
} {
  return (
    typeof args === "object" &&
    args !== null &&
    "title" in args &&
    typeof (args as { title: string }).title === "string" &&
    "teamId" in args &&
    typeof (args as { teamId: string }).teamId === "string"
  );
}

function isUpdateIssueArgs(args: unknown): args is {
  id: string;
  title?: string;
  description?: string;
  stateId?: string;
  priority?: number;
  projectId?: string;
  assigneeId?: string;
} {
  return (
    typeof args === "object" &&
    args !== null &&
    "id" in args &&
    typeof (args as { id: string }).id === "string"
  );
}

function isCreateCommentArgs(args: unknown): args is {
  issueId: string;
  body: string;
} {
  return (
    typeof args === "object" &&
    args !== null &&
    "issueId" in args &&
    typeof (args as { issueId: string }).issueId === "string" &&
    "body" in args &&
    typeof (args as { body: string }).body === "string"
  );
}

function isCreateProjectArgs(args: unknown): args is {
  name: string;
  description?: string;
  teamId: string;
  state?: string;
  startDate?: string;
  targetDate?: string;
} {
  return (
    typeof args === "object" &&
    args !== null &&
    "name" in args &&
    typeof (args as { name: string }).name === "string" &&
    "teamId" in args &&
    typeof (args as { teamId: string }).teamId === "string"
  );
}

// Simple function to generate a hello world message
function generateHelloWorld(name: string): string {
  return `Hello, ${name}! This is a test message from the Linear MCP Server.`;
}

// Tool handlers
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    HELLO_WORLD_TOOL, 
    GET_ISSUES_TOOL, 
    GET_TEAMS_TOOL,
    GET_PROJECTS_TOOL,
    CREATE_ISSUE_TOOL,
    UPDATE_ISSUE_TOOL,
    CREATE_COMMENT_TOOL, 
    CREATE_PROJECT_TOOL
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params;

    if (!args) {
      throw new Error("No arguments provided");
    }
    
    // Check if Linear service is initialized
    if (!linearService && name !== "linear_helloWorld") {
      throw new Error("Linear service not initialized. Please set LINEAR_API_TOKEN environment variable.");
    }

    switch (name) {
      case "linear_helloWorld": {
        if (!isHelloWorldArgs(args)) {
          throw new Error("Invalid arguments for linear_helloWorld");
        }
        const result = generateHelloWorld(args.name);
        return {
          content: [{ type: "text", text: result }],
          isError: false,
        };
      }
      
      case "linear_getIssues": {
        if (!isGetIssuesArgs(args)) {
          throw new Error("Invalid arguments for linear_getIssues");
        }
        const issues = await linearService!.getIssues(args.limit);
        return {
          content: [{ type: "text", text: JSON.stringify(issues, null, 2) }],
          isError: false,
        };
      }
      
      case "linear_getTeams": {
        const teams = await linearService!.getTeams();
        return {
          content: [{ type: "text", text: JSON.stringify(teams, null, 2) }],
          isError: false,
        };
      }
      
      case "linear_getProjects": {
        const projects = await linearService!.getProjects();
        return {
          content: [{ type: "text", text: JSON.stringify(projects, null, 2) }],
          isError: false,
        };
      }
      
      case "linear_createIssue": {
        if (!isCreateIssueArgs(args)) {
          throw new Error("Invalid arguments for linear_createIssue");
        }
        const issue = await linearService!.createIssue(args);
        return {
          content: [{ type: "text", text: JSON.stringify(issue, null, 2) }],
          isError: false,
        };
      }
      
      case "linear_updateIssue": {
        if (!isUpdateIssueArgs(args)) {
          throw new Error("Invalid arguments for linear_updateIssue");
        }
        const issue = await linearService!.updateIssue(args);
        return {
          content: [{ type: "text", text: JSON.stringify(issue, null, 2) }],
          isError: false,
        };
      }
      
      case "linear_createComment": {
        if (!isCreateCommentArgs(args)) {
          throw new Error("Invalid arguments for linear_createComment");
        }
        const comment = await linearService!.createComment(args);
        return {
          content: [{ type: "text", text: JSON.stringify(comment, null, 2) }],
          isError: false,
        };
      }
      
      case "linear_createProject": {
        if (!isCreateProjectArgs(args)) {
          throw new Error("Invalid arguments for linear_createProject");
        }
        const project = await linearService!.createProject(args);
        return {
          content: [{ type: "text", text: JSON.stringify(project, null, 2) }],
          isError: false,
        };
      }
      
      default:
        return {
          content: [{ type: "text", text: `Unknown tool: ${name}` }],
          isError: true,
        };
    }
  } catch (error) {
    console.error("Error in tool handler:", error);
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

// Run the server
async function runServer() {
  console.error("Starting Linear MCP Server...");
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Linear MCP Server running on stdio");
}

runServer().catch((error) => {
  console.error("Fatal error running server:", error);
  process.exit(1);
}); 