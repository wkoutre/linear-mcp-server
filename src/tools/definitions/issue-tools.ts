import { MCPToolDefinition } from "../../types.js";

/**
 * Tool definition for getting issues
 */
export const getIssuesToolDefinition: MCPToolDefinition = {
  name: "linear_getIssues",
  description: "Get a list of recent issues from Linear",
  input_schema: {
    type: "object",
    properties: {
      limit: {
        type: "number",
        description: "Maximum number of issues to return (default: 10)",
      },
    }
  },
  output_schema: {
    type: "array",
    items: {
      type: "object",
      properties: {
        id: { type: "string" },
        identifier: { type: "string" },
        title: { type: "string" },
        description: { type: "string" },
        state: { type: "string" },
        team: { type: "object" },
        assignee: { type: "object" },
        project: { type: "object" },
        url: { type: "string" }
      }
    }
  }
};

/**
 * Tool definition for getting issue by ID
 */
export const getIssueByIdToolDefinition: MCPToolDefinition = {
  name: "linear_getIssueById",
  description: "Get a specific issue by ID or identifier (e.g., ABC-123)",
  input_schema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "The ID or identifier of the issue (e.g., ABC-123)",
      },
    },
    required: ["id"],
  },
  output_schema: {
    type: "object",
    properties: {
      id: { type: "string" },
      identifier: { type: "string" },
      title: { type: "string" },
      description: { type: "string" },
      state: { type: "string" },
      team: { type: "object" },
      assignee: { type: "object" },
      project: { type: "object" },
      url: { type: "string" },
      comments: { type: "array" }
    }
  }
};

/**
 * Tool definition for searching issues
 */
export const searchIssuesToolDefinition: MCPToolDefinition = {
  name: "linear_searchIssues",
  description: "Search for issues with various filters",
  input_schema: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "Text to search for in issue title or description",
      },
      teamId: {
        type: "string",
        description: "Filter issues by team ID",
      },
      assigneeId: {
        type: "string",
        description: "Filter issues by assignee ID",
      },
      projectId: {
        type: "string",
        description: "Filter issues by project ID",
      },
      states: {
        type: "array",
        items: { type: "string" },
        description: "Filter issues by state name (e.g., 'Todo', 'In Progress', 'Done')",
      },
      limit: {
        type: "number",
        description: "Maximum number of issues to return (default: 10)",
      },
    },
    required: [],
  },
  output_schema: {
    type: "array",
    items: {
      type: "object",
      properties: {
        id: { type: "string" },
        identifier: { type: "string" },
        title: { type: "string" },
        description: { type: "string" },
        state: { type: "string" },
        team: { type: "object" },
        assignee: { type: "object" },
        project: { type: "object" },
        url: { type: "string" }
      }
    }
  }
};

/**
 * Tool definition for creating an issue
 */
export const createIssueToolDefinition: MCPToolDefinition = {
  name: "linear_createIssue",
  description: "Create a new issue in Linear",
  input_schema: {
    type: "object",
    properties: {
      title: {
        type: "string",
        description: "Title of the issue",
      },
      description: {
        type: "string",
        description: "Description of the issue (Markdown supported)",
      },
      teamId: {
        type: "string",
        description: "ID of the team the issue belongs to",
      },
      assigneeId: {
        type: "string",
        description: "ID of the user to assign the issue to",
      },
      priority: {
        type: "number",
        description: "Priority of the issue (0 = No priority, 1 = Urgent, 2 = High, 3 = Normal, 4 = Low)",
      },
      projectId: {
        type: "string",
        description: "ID of the project the issue belongs to",
      },
    },
    required: ["title", "teamId"],
  },
  output_schema: {
    type: "object",
    properties: {
      id: { type: "string" },
      identifier: { type: "string" },
      title: { type: "string" },
      url: { type: "string" }
    }
  }
};

/**
 * Tool definition for updating an issue
 */
export const updateIssueToolDefinition: MCPToolDefinition = {
  name: "linear_updateIssue",
  description: "Update an existing issue in Linear",
  input_schema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "ID or identifier of the issue to update (e.g., ABC-123)",
      },
      title: {
        type: "string",
        description: "New title for the issue",
      },
      description: {
        type: "string",
        description: "New description for the issue (Markdown supported)",
      },
      stateId: {
        type: "string",
        description: "ID of the new state for the issue",
      },
      priority: {
        type: "number",
        description: "New priority for the issue (0 = No priority, 1 = Urgent, 2 = High, 3 = Normal, 4 = Low)",
      },
      projectId: {
        type: "string",
        description: "ID of the project to move the issue to",
      },
      assigneeId: {
        type: "string",
        description: "ID of the user to assign the issue to, or null to unassign",
      },
    },
    required: ["id"],
  },
  output_schema: {
    type: "object",
    properties: {
      id: { type: "string" },
      identifier: { type: "string" },
      title: { type: "string" },
      url: { type: "string" }
    }
  }
};

/**
 * Tool definition for creating a comment
 */
export const createCommentToolDefinition: MCPToolDefinition = {
  name: "linear_createComment",
  description: "Add a comment to an issue in Linear",
  input_schema: {
    type: "object",
    properties: {
      issueId: {
        type: "string",
        description: "ID or identifier of the issue to comment on (e.g., ABC-123)",
      },
      body: {
        type: "string",
        description: "Text of the comment (Markdown supported)",
      },
    },
    required: ["issueId", "body"],
  },
  output_schema: {
    type: "object",
    properties: {
      id: { type: "string" },
      body: { type: "string" },
      url: { type: "string" }
    }
  }
}; 