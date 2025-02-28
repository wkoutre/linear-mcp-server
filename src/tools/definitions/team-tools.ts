import { MCPToolDefinition } from "../../types.js";

/**
 * Tool definition for getting teams
 */
export const getTeamsToolDefinition: MCPToolDefinition = {
  name: "linear_getTeams",
  description: "Get a list of teams from Linear",
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
        key: { type: "string" },
        description: { type: "string" },
        states: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              name: { type: "string" }
            }
          }
        }
      }
    }
  }
}; 