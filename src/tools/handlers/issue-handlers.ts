import { isCreateCommentArgs, isCreateIssueArgs, isGetIssueByIdArgs, isGetIssuesArgs, isSearchIssuesArgs, isUpdateIssueArgs } from "../type-guards.js";
import { LinearService } from "../../services/linear-service.js";
import { logError } from "../../utils/config.js";

/**
 * Handler for getting issues
 */
export function handleGetIssues(linearService: LinearService) {
  return async (args: unknown) => {
    try {
      if (!isGetIssuesArgs(args)) {
        throw new Error("Invalid arguments for getIssues");
      }
      
      return await linearService.getIssues(args.limit);
    } catch (error) {
      logError("Error getting issues", error);
      throw error;
    }
  };
}

/**
 * Handler for getting issue by ID
 */
export function handleGetIssueById(linearService: LinearService) {
  return async (args: unknown) => {
    try {
      if (!isGetIssueByIdArgs(args)) {
        throw new Error("Invalid arguments for getIssueById");
      }
      
      return await linearService.getIssueById(args.id);
    } catch (error) {
      logError("Error getting issue by ID", error);
      throw error;
    }
  };
}

/**
 * Handler for searching issues
 */
export function handleSearchIssues(linearService: LinearService) {
  return async (args: unknown) => {
    try {
      if (!isSearchIssuesArgs(args)) {
        throw new Error("Invalid arguments for searchIssues");
      }
      
      return await linearService.searchIssues(args);
    } catch (error) {
      logError("Error searching issues", error);
      throw error;
    }
  };
}

/**
 * Handler for creating an issue
 */
export function handleCreateIssue(linearService: LinearService) {
  return async (args: unknown) => {
    try {
      if (!isCreateIssueArgs(args)) {
        throw new Error("Invalid arguments for createIssue");
      }
      
      return await linearService.createIssue(args);
    } catch (error) {
      logError("Error creating issue", error);
      throw error;
    }
  };
}

/**
 * Handler for updating an issue
 */
export function handleUpdateIssue(linearService: LinearService) {
  return async (args: unknown) => {
    try {
      if (!isUpdateIssueArgs(args)) {
        throw new Error("Invalid arguments for updateIssue");
      }
      
      return await linearService.updateIssue(args);
    } catch (error) {
      logError("Error updating issue", error);
      throw error;
    }
  };
}

/**
 * Handler for creating a comment
 */
export function handleCreateComment(linearService: LinearService) {
  return async (args: unknown) => {
    try {
      if (!isCreateCommentArgs(args)) {
        throw new Error("Invalid arguments for createComment");
      }
      
      return await linearService.createComment(args);
    } catch (error) {
      logError("Error creating comment", error);
      throw error;
    }
  };
} 