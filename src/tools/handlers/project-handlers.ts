import { isCreateProjectArgs } from "../type-guards.js";
import { LinearService } from "../../services/linear-service.js";
import { logError } from "../../utils/config.js";

/**
 * Handler for getting projects
 */
export function handleGetProjects(linearService: LinearService) {
  return async (args: unknown) => {
    try {
      return await linearService.getProjects();
    } catch (error) {
      logError("Error getting projects", error);
      throw error;
    }
  };
}

/**
 * Handler for creating a project
 */
export function handleCreateProject(linearService: LinearService) {
  return async (args: unknown) => {
    try {
      if (!isCreateProjectArgs(args)) {
        throw new Error("Invalid arguments for createProject");
      }
      
      return await linearService.createProject(args);
    } catch (error) {
      logError("Error creating project", error);
      throw error;
    }
  };
} 