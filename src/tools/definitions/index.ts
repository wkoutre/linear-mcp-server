import { MCPToolDefinition } from "../../types.js";
import {
  getIssuesToolDefinition,
  getIssueByIdToolDefinition,
  searchIssuesToolDefinition,
  createIssueToolDefinition,
  updateIssueToolDefinition,
  createCommentToolDefinition,
  addIssueLabelToolDefinition,
  removeIssueLabelToolDefinition,
  // New Issue Management tools
  assignIssueToolDefinition,
  subscribeToIssueToolDefinition,
  convertIssueToSubtaskToolDefinition,
  createIssueRelationToolDefinition,
  archiveIssueToolDefinition,
  setIssuePriorityToolDefinition,
  transferIssueToolDefinition,
  duplicateIssueToolDefinition,
  getIssueHistoryToolDefinition
} from "./issue-tools.js";
import {
  getProjectsToolDefinition,
  createProjectToolDefinition
} from "./project-tools.js";
import { getTeamsToolDefinition } from "./team-tools.js";
import {
  getViewerToolDefinition,
  getOrganizationToolDefinition,
  getUsersToolDefinition,
  getLabelsToolDefinition
} from "./user-tools.js";

// All tool definitions
export const allToolDefinitions: MCPToolDefinition[] = [
  // User tools
  getViewerToolDefinition,
  getOrganizationToolDefinition,
  getUsersToolDefinition,
  getLabelsToolDefinition,
  
  // Team tools
  getTeamsToolDefinition,
  
  // Project tools
  getProjectsToolDefinition,
  createProjectToolDefinition,
  
  // Issue tools
  getIssuesToolDefinition,
  getIssueByIdToolDefinition,
  searchIssuesToolDefinition,
  createIssueToolDefinition,
  updateIssueToolDefinition,
  createCommentToolDefinition,
  addIssueLabelToolDefinition,
  removeIssueLabelToolDefinition,
  
  // New Issue Management tools
  assignIssueToolDefinition,
  subscribeToIssueToolDefinition,
  convertIssueToSubtaskToolDefinition,
  createIssueRelationToolDefinition,
  archiveIssueToolDefinition,
  setIssuePriorityToolDefinition,
  transferIssueToolDefinition,
  duplicateIssueToolDefinition,
  getIssueHistoryToolDefinition
];

// Export all tool definitions individually
export {
  getIssuesToolDefinition,
  getIssueByIdToolDefinition,
  searchIssuesToolDefinition,
  createIssueToolDefinition,
  updateIssueToolDefinition,
  createCommentToolDefinition,
  addIssueLabelToolDefinition,
  removeIssueLabelToolDefinition,
  getProjectsToolDefinition,
  createProjectToolDefinition,
  getTeamsToolDefinition,
  getViewerToolDefinition,
  getOrganizationToolDefinition,
  getUsersToolDefinition,
  getLabelsToolDefinition,
  
  // New Issue Management tools
  assignIssueToolDefinition,
  subscribeToIssueToolDefinition,
  convertIssueToSubtaskToolDefinition,
  createIssueRelationToolDefinition,
  archiveIssueToolDefinition,
  setIssuePriorityToolDefinition,
  transferIssueToolDefinition,
  duplicateIssueToolDefinition,
  getIssueHistoryToolDefinition
}; 