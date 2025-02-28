import { LinearService } from "../../services/linear-service.js";
import { logError } from "../../utils/config.js";

/**
 * Handler for getting teams
 */
export function handleGetTeams(linearService: LinearService) {
  return async (args: unknown) => {
    try {
      return await linearService.getTeams();
    } catch (error) {
      logError("Error getting teams", error);
      throw error;
    }
  };
} 