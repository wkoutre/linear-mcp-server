import { MCPToolDefinition } from "../../types.js";

/**
 * Tool definition for getting projects
 */
export const getProjectsToolDefinition: MCPToolDefinition = {
  name: "linear_getProjects",
  description: "Get a list of projects from Linear",
  input_schema: {
    type: "object",
    properties: {},
  },
  output_schema: {
    type: "array",
    items: {
      type: "object",
      properties: {
        id: { type: "string" },
        name: { type: "string" },
        description: { type: "string" },
        state: { type: "string" },
        teams: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              name: { type: "string" }
            }
          }
        },
        url: { type: "string" }
      }
    }
  }
};

/**
 * Tool definition for creating a project
 */
export const createProjectToolDefinition: MCPToolDefinition = {
  name: "linear_createProject",
  description: "Create a new project in Linear",
  input_schema: {
    type: "object",
    properties: {
      name: {
        type: "string",
        description: "Name of the project",
      },
      description: {
        type: "string",
        description: "Description of the project (Markdown supported)",
      },
      teamIds: {
        type: "array",
        items: { type: "string" },
        description: "IDs of the teams this project belongs to",
      },
      state: {
        type: "string",
        description: "Initial state of the project (e.g., 'planned', 'started', 'paused', 'completed', 'canceled')",
      },
    },
    required: ["name", "teamIds"],
  },
  output_schema: {
    type: "object",
    properties: {
      id: { type: "string" },
      name: { type: "string" },
      url: { type: "string" }
    }
  }
}; 