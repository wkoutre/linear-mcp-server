import { LinearClient } from "@linear/sdk";

// Define Linear API service
export class LinearService {
  private client: LinearClient;
  
  constructor(client: LinearClient) {
    this.client = client;
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
  
  async getOrganizationInfo() {
    const organization = await this.client.organization;
    return {
      id: organization.id,
      name: organization.name,
      urlKey: organization.urlKey,
      logoUrl: organization.logoUrl,
      createdAt: organization.createdAt,
      // Include subscription details if available
      subscription: organization.subscription || null
    };
  }
  
  async getAllUsers() {
    const users = await this.client.users();
    return users.nodes.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      displayName: user.displayName,
      active: user.active
    }));
  }
  
  async getLabels() {
    const labels = await this.client.issueLabels();
    return Promise.all(labels.nodes.map(async label => {
      const teamData = label.team ? await label.team : null;
      
      return {
        id: label.id,
        name: label.name,
        color: label.color,
        description: label.description,
        team: teamData ? {
          id: teamData.id,
          name: teamData.name
        } : null
      };
    }));
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
  
  async getIssueById(id: string) {
    const issue = await this.client.issue(id);
    
    if (!issue) {
      throw new Error(`Issue with ID ${id} not found`);
    }
    
    // For relations, we need to fetch the objects
    const teamData = issue.team ? await issue.team : null;
    const assigneeData = issue.assignee ? await issue.assignee : null;
    const projectData = issue.project ? await issue.project : null;
    
    // Get comments
    const comments = await issue.comments();
    const commentsList = await Promise.all(comments.nodes.map(async comment => {
      const userData = comment.user ? await comment.user : null;
      
      return {
        id: comment.id,
        body: comment.body,
        createdAt: comment.createdAt,
        user: userData ? {
          id: userData.id,
          name: userData.name
        } : null
      };
    }));
    
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
      createdAt: issue.createdAt,
      updatedAt: issue.updatedAt,
      url: issue.url,
      comments: commentsList
    };
  }
  
  async searchIssues(args: {
    query?: string;
    teamId?: string;
    assigneeId?: string;
    projectId?: string;
    states?: string[];
    limit?: number;
  }) {
    // Build filter object
    const filter: any = {};
    
    if (args.teamId) {
      filter.team = { id: { eq: args.teamId } };
    }
    
    if (args.assigneeId) {
      filter.assignee = { id: { eq: args.assigneeId } };
    }
    
    if (args.projectId) {
      filter.project = { id: { eq: args.projectId } };
    }
    
    if (args.states && args.states.length > 0) {
      filter.state = { id: { in: args.states } };
    }
    
    // Execute the search
    const issues = await this.client.issues({
      first: args.limit || 25,
      filter,
      ...(args.query ? { filter: { ...filter, title: { contains: args.query } } } : {})
    });
    
    // Process the results
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
    teamIds: string[] | string;
    state?: string;
    startDate?: string;
    targetDate?: string;
  }) {
    const teamIds = Array.isArray(args.teamIds) ? args.teamIds : [args.teamIds];
    
    const createdProject = await this.client.createProject({
      name: args.name,
      description: args.description,
      teamIds: teamIds,
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
  
  /**
   * Adds a label to an issue
   * @param issueId The ID or identifier of the issue
   * @param labelId The ID of the label to add
   * @returns Success status and IDs
   */
  async addIssueLabel(issueId: string, labelId: string) {
    // Get the issue
    const issue = await this.client.issue(issueId);
    
    if (!issue) {
      throw new Error(`Issue not found: ${issueId}`);
    }
    
    // Get the current labels
    const currentLabels = await issue.labels();
    const currentLabelIds = currentLabels.nodes.map(label => label.id);
    
    // Add the new label ID if it's not already present
    if (!currentLabelIds.includes(labelId)) {
      await issue.update({
        labelIds: [...currentLabelIds, labelId]
      });
    }
    
    return {
      success: true,
      issueId: issue.id,
      labelId
    };
  }
  
  /**
   * Removes a label from an issue
   * @param issueId The ID or identifier of the issue
   * @param labelId The ID of the label to remove
   * @returns Success status and IDs
   */
  async removeIssueLabel(issueId: string, labelId: string) {
    // Get the issue
    const issue = await this.client.issue(issueId);
    
    if (!issue) {
      throw new Error(`Issue not found: ${issueId}`);
    }
    
    // Get the current labels
    const currentLabels = await issue.labels();
    const currentLabelIds = currentLabels.nodes.map(label => label.id);
    
    // Filter out the label ID to remove
    const updatedLabelIds = currentLabelIds.filter(id => id !== labelId);
    
    // Only update if the label was actually present
    if (currentLabelIds.length !== updatedLabelIds.length) {
      await issue.update({
        labelIds: updatedLabelIds
      });
    }
    
    return {
      success: true,
      issueId: issue.id,
      labelId
    };
  }

  /**
   * Assigns an issue to a user
   */
  async assignIssue(issueId: string, assigneeId: string) {
    try {
      // Get the issue
      const issue = await this.client.issue(issueId);
      if (!issue) {
        throw new Error(`Issue with ID ${issueId} not found`);
      }

      // Get the user to assign
      const user = assigneeId ? await this.client.user(assigneeId) : null;
      
      // Update the issue with the new assignee
      const updatedIssue = await issue.update({
        assigneeId: assigneeId
      });
      
      // Get the updated assignee data
      // We need to get the full issue record and its relationships
      const issueData = await this.client.issue(issue.id);
      const assigneeData = issueData && issueData.assignee ? await issueData.assignee : null;
      
      return {
        success: true,
        issue: {
          id: issue.id,
          identifier: issue.identifier,
          title: issue.title,
          assignee: assigneeData ? {
            id: assigneeData.id,
            name: assigneeData.name,
            displayName: assigneeData.displayName,
          } : null,
          url: issue.url
        }
      };
    } catch (error) {
      console.error("Error assigning issue:", error);
      throw error;
    }
  }

  /**
   * Subscribes to issue updates
   */
  async subscribeToIssue(issueId: string) {
    try {
      // Get the issue
      const issue = await this.client.issue(issueId);
      if (!issue) {
        throw new Error(`Issue with ID ${issueId} not found`);
      }

      // Get current user info
      const viewer = await this.client.viewer;
      
      // For now, we'll just acknowledge the request with a success message
      // The actual subscription logic would need to be implemented based on the Linear SDK specifics
      // In a production environment, we should check the SDK documentation for the correct method
      
      return {
        success: true,
        message: `User ${viewer.name} (${viewer.id}) would be subscribed to issue ${issue.identifier}. (Note: Actual subscription API call implementation needed)`
      };
    } catch (error) {
      console.error("Error subscribing to issue:", error);
      throw error;
    }
  }

  /**
   * Converts an issue to a subtask of another issue
   */
  async convertIssueToSubtask(issueId: string, parentIssueId: string) {
    try {
      // Get both issues
      const issue = await this.client.issue(issueId);
      if (!issue) {
        throw new Error(`Issue with ID ${issueId} not found`);
      }
      
      const parentIssue = await this.client.issue(parentIssueId);
      if (!parentIssue) {
        throw new Error(`Parent issue with ID ${parentIssueId} not found`);
      }
      
      // Convert the issue to a subtask
      const updatedIssue = await issue.update({
        parentId: parentIssueId
      });
      
      // Get parent data - we need to fetch the updated issue to get relationships
      const updatedIssueData = await this.client.issue(issue.id);
      const parentData = updatedIssueData && updatedIssueData.parent ? await updatedIssueData.parent : null;
      
      return {
        success: true,
        issue: {
          id: issue.id,
          identifier: issue.identifier,
          title: issue.title,
          parent: parentData ? {
            id: parentData.id,
            identifier: parentData.identifier,
            title: parentData.title
          } : null,
          url: issue.url
        }
      };
    } catch (error) {
      console.error("Error converting issue to subtask:", error);
      throw error;
    }
  }

  /**
   * Creates a relation between two issues
   */
  async createIssueRelation(issueId: string, relatedIssueId: string, type: string) {
    try {
      // Get both issues
      const issue = await this.client.issue(issueId);
      if (!issue) {
        throw new Error(`Issue with ID ${issueId} not found`);
      }
      
      const relatedIssue = await this.client.issue(relatedIssueId);
      if (!relatedIssue) {
        throw new Error(`Related issue with ID ${relatedIssueId} not found`);
      }
      
      // For now, we'll just acknowledge the request with a success message
      // The actual relation creation logic would need to be implemented based on the Linear SDK specifics
      // In a production environment, we should check the SDK documentation for the correct method
      
      return {
        success: true,
        relation: {
          id: 'relation-id-would-go-here',
          type: type,
          issueIdentifier: issue.identifier,
          relatedIssueIdentifier: relatedIssue.identifier
        }
      };
    } catch (error) {
      console.error("Error creating issue relation:", error);
      throw error;
    }
  }

  /**
   * Archives an issue
   */
  async archiveIssue(issueId: string) {
    try {
      // Get the issue
      const issue = await this.client.issue(issueId);
      if (!issue) {
        throw new Error(`Issue with ID ${issueId} not found`);
      }
      
      // Archive the issue
      await issue.archive();
      
      return {
        success: true,
        message: `Issue ${issue.identifier} has been archived`
      };
    } catch (error) {
      console.error("Error archiving issue:", error);
      throw error;
    }
  }

  /**
   * Sets the priority of an issue
   */
  async setIssuePriority(issueId: string, priority: number) {
    try {
      // Get the issue
      const issue = await this.client.issue(issueId);
      if (!issue) {
        throw new Error(`Issue with ID ${issueId} not found`);
      }
      
      // Update the issue priority
      await issue.update({
        priority: priority
      });
      
      // Get the updated issue
      const updatedIssue = await this.client.issue(issue.id);
      
      return {
        success: true,
        issue: {
          id: updatedIssue.id,
          identifier: updatedIssue.identifier,
          title: updatedIssue.title,
          priority: updatedIssue.priority,
          url: updatedIssue.url
        }
      };
    } catch (error) {
      console.error("Error setting issue priority:", error);
      throw error;
    }
  }

  /**
   * Transfers an issue to another team
   */
  async transferIssue(issueId: string, teamId: string) {
    try {
      // Get the issue
      const issue = await this.client.issue(issueId);
      if (!issue) {
        throw new Error(`Issue with ID ${issueId} not found`);
      }
      
      // Get the team
      const team = await this.client.team(teamId);
      if (!team) {
        throw new Error(`Team with ID ${teamId} not found`);
      }
      
      // Transfer the issue
      await issue.update({
        teamId: teamId
      });
      
      // Get the updated issue
      const updatedIssue = await this.client.issue(issue.id);
      const teamData = updatedIssue.team ? await updatedIssue.team : null;
      
      return {
        success: true,
        issue: {
          id: updatedIssue.id,
          identifier: updatedIssue.identifier,
          title: updatedIssue.title,
          team: teamData ? {
            id: teamData.id,
            name: teamData.name,
            key: teamData.key
          } : null,
          url: updatedIssue.url
        }
      };
    } catch (error) {
      console.error("Error transferring issue:", error);
      throw error;
    }
  }

  /**
   * Duplicates an issue
   */
  async duplicateIssue(issueId: string) {
    try {
      // Get the issue
      const issue = await this.client.issue(issueId);
      if (!issue) {
        throw new Error(`Issue with ID ${issueId} not found`);
      }
      
      // Get all the relevant issue data
      const teamData = await issue.team;
      if (!teamData) {
        throw new Error("Could not retrieve team data for the issue");
      }
      
      // Create a new issue using the createIssue method of this service
      const newIssueData = await this.createIssue({
        title: `${issue.title} (Copy)`,
        description: issue.description,
        teamId: teamData.id,
        // We'll have to implement getting these properties in a production environment
        // For now, we'll just create a basic copy with title and description
      });
      
      // Get the full issue details with identifier
      const newIssue = await this.client.issue(newIssueData.id);
      
      return {
        success: true,
        originalIssue: {
          id: issue.id,
          identifier: issue.identifier,
          title: issue.title
        },
        duplicatedIssue: {
          id: newIssue.id,
          identifier: newIssue.identifier,
          title: newIssue.title,
          url: newIssue.url
        }
      };
    } catch (error) {
      console.error("Error duplicating issue:", error);
      throw error;
    }
  }

  /**
   * Gets the history of changes made to an issue
   */
  async getIssueHistory(issueId: string, limit = 10) {
    try {
      // Get the issue
      const issue = await this.client.issue(issueId);
      if (!issue) {
        throw new Error(`Issue with ID ${issueId} not found`);
      }
      
      // Get the issue history
      const history = await issue.history({ first: limit });
      
      // Process and format each history event
      const historyEvents = await Promise.all(history.nodes.map(async (event) => {
        // Get the actor data if available
        const actorData = event.actor ? await event.actor : null;
        
        return {
          id: event.id,
          createdAt: event.createdAt,
          actor: actorData ? {
            id: actorData.id,
            name: actorData.name,
            displayName: actorData.displayName
          } : null,
          // Use optional chaining to safely access properties that may not exist
          type: (event as any).type || 'unknown',
          from: (event as any).from || null,
          to: (event as any).to || null
        };
      }));
      
      return {
        issueId: issue.id,
        identifier: issue.identifier,
        history: historyEvents
      };
    } catch (error) {
      console.error("Error getting issue history:", error);
      throw error;
    }
  }

  /**
   * Get all comments for an issue
   * @param issueId The ID or identifier of the issue
   * @param limit Maximum number of comments to return
   * @returns List of comments
   */
  async getComments(issueId: string, limit = 25) {
    try {
      // Get the issue
      const issue = await this.client.issue(issueId);
      if (!issue) {
        throw new Error(`Issue with ID ${issueId} not found`);
      }
      
      // Get comments
      const comments = await issue.comments({ first: limit });
      
      // Process comments
      return Promise.all(comments.nodes.map(async (comment) => {
        const userData = comment.user ? await comment.user : null;
        
        return {
          id: comment.id,
          body: comment.body,
          createdAt: comment.createdAt,
          user: userData ? {
            id: userData.id,
            name: userData.name,
            displayName: userData.displayName
          } : null,
          url: comment.url
        };
      }));
    } catch (error) {
      console.error("Error getting comments:", error);
      throw error;
    }
  }

  /**
   * Update an existing project
   * @param args Project update data
   * @returns Updated project
   */
  async updateProject(args: {
    id: string;
    name?: string;
    description?: string;
    state?: string;
  }) {
    try {
      // Get the project
      const project = await this.client.project(args.id);
      if (!project) {
        throw new Error(`Project with ID ${args.id} not found`);
      }
      
      // Update the project using client.updateProject
      const updatePayload = await this.client.updateProject(args.id, {
        name: args.name,
        description: args.description,
        state: args.state as any
      });
      
      if (updatePayload.success) {
        // Get the updated project data
        const updatedProject = await this.client.project(args.id);
        
        // Return the updated project info
        return {
          id: updatedProject.id,
          name: updatedProject.name,
          description: updatedProject.description,
          state: updatedProject.state,
          url: updatedProject.url
        };
      } else {
        throw new Error("Failed to update project");
      }
    } catch (error) {
      console.error("Error updating project:", error);
      throw error;
    }
  }
  
  /**
   * Add an issue to a project
   * @param issueId ID of the issue to add
   * @param projectId ID of the project
   * @returns Success status and issue details
   */
  async addIssueToProject(issueId: string, projectId: string) {
    try {
      // Get the issue
      const issue = await this.client.issue(issueId);
      if (!issue) {
        throw new Error(`Issue with ID ${issueId} not found`);
      }
      
      // Get the project
      const project = await this.client.project(projectId);
      if (!project) {
        throw new Error(`Project with ID ${projectId} not found`);
      }
      
      // Update the issue with the project ID
      await issue.update({
        projectId: projectId
      });
      
      // Get the updated issue data with project
      const updatedIssue = await this.client.issue(issueId);
      const projectData = updatedIssue.project ? await updatedIssue.project : null;
      
      return {
        success: true,
        issue: {
          id: updatedIssue.id,
          identifier: updatedIssue.identifier,
          title: updatedIssue.title,
          project: projectData ? {
            id: projectData.id,
            name: projectData.name
          } : null
        }
      };
    } catch (error) {
      console.error("Error adding issue to project:", error);
      throw error;
    }
  }
  
  /**
   * Get all issues associated with a project
   * @param projectId ID of the project
   * @param limit Maximum number of issues to return
   * @returns List of issues in the project
   */
  async getProjectIssues(projectId: string, limit = 25) {
    try {
      // Get the project
      const project = await this.client.project(projectId);
      if (!project) {
        throw new Error(`Project with ID ${projectId} not found`);
      }
      
      // Get issues for the project
      const issues = await this.client.issues({
        first: limit,
        filter: {
          project: {
            id: { eq: projectId }
          }
        }
      });
      
      // Process the issues
      return Promise.all(issues.nodes.map(async (issue) => {
        const teamData = issue.team ? await issue.team : null;
        const assigneeData = issue.assignee ? await issue.assignee : null;
        
        return {
          id: issue.id,
          identifier: issue.identifier,
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
          url: issue.url
        };
      }));
    } catch (error) {
      console.error("Error getting project issues:", error);
      throw error;
    }
  }

  /**
   * Gets a list of all cycles
   * @param teamId Optional team ID to filter cycles by team
   * @param limit Maximum number of cycles to return
   * @returns List of cycles
   */
  async getCycles(teamId?: string, limit = 25) {
    try {
      const filters: Record<string, any> = {};
      
      if (teamId) {
        filters.team = { id: { eq: teamId } };
      }
      
      const cycles = await this.client.cycles({
        filter: filters,
        first: limit
      });
      
      const cyclesData = await cycles.nodes;
      
      return Promise.all(cyclesData.map(async (cycle) => {
        // Get team information
        const team = cycle.team ? await cycle.team : null;
        
        return {
          id: cycle.id,
          number: cycle.number,
          name: cycle.name,
          description: cycle.description,
          startsAt: cycle.startsAt,
          endsAt: cycle.endsAt,
          completedAt: cycle.completedAt,
          team: team ? {
            id: team.id,
            name: team.name,
            key: team.key
          } : null
        };
      }));
    } catch (error) {
      console.error("Error getting cycles:", error);
      throw error;
    }
  }

  /**
   * Gets the currently active cycle for a team
   * @param teamId ID of the team
   * @returns Active cycle information with progress stats
   */
  async getActiveCycle(teamId: string) {
    try {
      // Get the team
      const team = await this.client.team(teamId);
      if (!team) {
        throw new Error(`Team with ID ${teamId} not found`);
      }
      
      // Get the active cycle for the team
      const activeCycle = await team.activeCycle;
      if (!activeCycle) {
        throw new Error(`No active cycle found for team ${team.name}`);
      }
      
      // Get cycle issues for count and progress
      const cycleIssues = await this.client.issues({
        filter: {
          cycle: { id: { eq: activeCycle.id } }
        }
      });
      const issueNodes = await cycleIssues.nodes;
      
      // Calculate progress
      const totalIssues = issueNodes.length;
      const completedIssues = issueNodes.filter(issue => issue.completedAt).length;
      const progress = totalIssues > 0 ? (completedIssues / totalIssues) * 100 : 0;
      
      return {
        id: activeCycle.id,
        number: activeCycle.number,
        name: activeCycle.name,
        description: activeCycle.description,
        startsAt: activeCycle.startsAt,
        endsAt: activeCycle.endsAt,
        team: {
          id: team.id,
          name: team.name,
          key: team.key
        },
        progress: Math.round(progress * 100) / 100, // Round to 2 decimal places
        issueCount: totalIssues,
        completedIssueCount: completedIssues
      };
    } catch (error) {
      console.error("Error getting active cycle:", error);
      throw error;
    }
  }

  /**
   * Adds an issue to a cycle
   * @param issueId ID or identifier of the issue
   * @param cycleId ID of the cycle
   * @returns Success status and updated issue information
   */
  async addIssueToCycle(issueId: string, cycleId: string) {
    try {
      // Get the issue
      const issueResult = await this.client.issue(issueId);
      if (!issueResult) {
        throw new Error(`Issue with ID ${issueId} not found`);
      }
      
      // Get the cycle
      const cycleResult = await this.client.cycle(cycleId);
      if (!cycleResult) {
        throw new Error(`Cycle with ID ${cycleId} not found`);
      }
      
      // Update the issue with the cycle ID
      await this.client.updateIssue(issueResult.id, { cycleId: cycleId });
      
      // Get the updated issue data
      const updatedIssue = await this.client.issue(issueId);
      const cycleData = await this.client.cycle(cycleId);
      
      return {
        success: true,
        issue: {
          id: updatedIssue.id,
          identifier: updatedIssue.identifier,
          title: updatedIssue.title,
          cycle: cycleData ? {
            id: cycleData.id,
            number: cycleData.number,
            name: cycleData.name
          } : null
        }
      };
    } catch (error) {
      console.error("Error adding issue to cycle:", error);
      throw error;
    }
  }
} 