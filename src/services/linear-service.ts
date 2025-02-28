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
} 