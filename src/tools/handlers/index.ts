import { LinearService } from "../../services/linear-service.js";
import {
  handleGetIssues,
  handleGetIssueById,
  handleSearchIssues,
  handleCreateIssue,
  handleUpdateIssue,
  handleCreateComment
} from "./issue-handlers.js";
import {
  handleGetProjects,
  handleCreateProject
} from "./project-handlers.js";
import { handleGetTeams } from "./team-handlers.js";
import {
  handleGetViewer,
  handleGetOrganization,
  handleGetUsers,
  handleGetLabels
} from "./user-handlers.js";

/**
 * Registers all tool handlers for the Linear MCP server
 * @param linearService The Linear service instance
 * @returns A map of tool name to handler function
 */
export function registerToolHandlers(linearService: LinearService) {
  return {
    // User tools
    linear_getViewer: handleGetViewer(linearService),
    linear_getOrganization: handleGetOrganization(linearService),
    linear_getUsers: handleGetUsers(linearService),
    linear_getLabels: handleGetLabels(linearService),

    // Team tools
    linear_getTeams: handleGetTeams(linearService),

    // Project tools
    linear_getProjects: handleGetProjects(linearService),
    linear_createProject: handleCreateProject(linearService),

    // Issue tools
    linear_getIssues: handleGetIssues(linearService),
    linear_getIssueById: handleGetIssueById(linearService),
    linear_searchIssues: handleSearchIssues(linearService),
    linear_createIssue: handleCreateIssue(linearService),
    linear_updateIssue: handleUpdateIssue(linearService),
    linear_createComment: handleCreateComment(linearService)
  };
}

// Export all handlers individually
export {
  handleGetIssues,
  handleGetIssueById,
  handleSearchIssues,
  handleCreateIssue,
  handleUpdateIssue,
  handleCreateComment,
  handleGetProjects,
  handleCreateProject,
  handleGetTeams,
  handleGetViewer,
  handleGetOrganization,
  handleGetUsers,
  handleGetLabels
}; 