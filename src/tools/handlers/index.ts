import { LinearService } from "../../services/linear-service.js";
import {
  handleGetIssues,
  handleGetIssueById,
  handleSearchIssues,
  handleCreateIssue,
  handleUpdateIssue,
  handleCreateComment,
  handleAddIssueLabel,
  handleRemoveIssueLabel,
  // New Issue Management handlers
  handleAssignIssue,
  handleSubscribeToIssue,
  handleConvertIssueToSubtask,
  handleCreateIssueRelation,
  handleArchiveIssue,
  handleSetIssuePriority,
  handleTransferIssue,
  handleDuplicateIssue,
  handleGetIssueHistory
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
    linear_createComment: handleCreateComment(linearService),
    linear_addIssueLabel: handleAddIssueLabel(linearService),
    linear_removeIssueLabel: handleRemoveIssueLabel(linearService),
    
    // New Issue Management tools
    linear_assignIssue: handleAssignIssue(linearService),
    linear_subscribeToIssue: handleSubscribeToIssue(linearService),
    linear_convertIssueToSubtask: handleConvertIssueToSubtask(linearService),
    linear_createIssueRelation: handleCreateIssueRelation(linearService),
    linear_archiveIssue: handleArchiveIssue(linearService),
    linear_setIssuePriority: handleSetIssuePriority(linearService),
    linear_transferIssue: handleTransferIssue(linearService),
    linear_duplicateIssue: handleDuplicateIssue(linearService),
    linear_getIssueHistory: handleGetIssueHistory(linearService)
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
  handleAddIssueLabel,
  handleRemoveIssueLabel,
  handleGetProjects,
  handleCreateProject,
  handleGetTeams,
  handleGetViewer,
  handleGetOrganization,
  handleGetUsers,
  handleGetLabels,
  
  // New Issue Management handlers
  handleAssignIssue,
  handleSubscribeToIssue,
  handleConvertIssueToSubtask,
  handleCreateIssueRelation,
  handleArchiveIssue,
  handleSetIssuePriority,
  handleTransferIssue,
  handleDuplicateIssue,
  handleGetIssueHistory
}; 