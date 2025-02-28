/**
 * Type guard for linear_getIssues tool arguments
 */
export function isGetIssuesArgs(args: unknown): args is { limit?: number } {
  return (
    typeof args === "object" &&
    args !== null &&
    (!("limit" in args) || typeof (args as { limit: number }).limit === "number")
  );
}

/**
 * Type guard for linear_getIssueById tool arguments
 */
export function isGetIssueByIdArgs(args: unknown): args is { id: string } {
  return (
    typeof args === "object" &&
    args !== null &&
    "id" in args &&
    typeof (args as { id: string }).id === "string"
  );
}

/**
 * Type guard for linear_searchIssues tool arguments
 */
export function isSearchIssuesArgs(args: unknown): args is {
  query?: string;
  teamId?: string;
  assigneeId?: string;
  projectId?: string;
  states?: string[];
  limit?: number;
} {
  return (
    typeof args === "object" &&
    args !== null &&
    (!("query" in args) || typeof (args as { query: string }).query === "string") &&
    (!("teamId" in args) || typeof (args as { teamId: string }).teamId === "string") &&
    (!("assigneeId" in args) || typeof (args as { assigneeId: string }).assigneeId === "string") &&
    (!("projectId" in args) || typeof (args as { projectId: string }).projectId === "string") &&
    (!("states" in args) || Array.isArray((args as { states: string[] }).states)) &&
    (!("limit" in args) || typeof (args as { limit: number }).limit === "number")
  );
}

/**
 * Type guard for linear_createIssue tool arguments
 */
export function isCreateIssueArgs(args: unknown): args is {
  title: string;
  description?: string;
  teamId: string;
  assigneeId?: string;
  priority?: number;
  projectId?: string;
} {
  return (
    typeof args === "object" &&
    args !== null &&
    "title" in args &&
    typeof (args as { title: string }).title === "string" &&
    "teamId" in args &&
    typeof (args as { teamId: string }).teamId === "string"
  );
}

/**
 * Type guard for linear_updateIssue tool arguments
 */
export function isUpdateIssueArgs(args: unknown): args is {
  id: string;
  title?: string;
  description?: string;
  stateId?: string;
  priority?: number;
  projectId?: string;
  assigneeId?: string;
} {
  return (
    typeof args === "object" &&
    args !== null &&
    "id" in args &&
    typeof (args as { id: string }).id === "string"
  );
}

/**
 * Type guard for linear_createComment tool arguments
 */
export function isCreateCommentArgs(args: unknown): args is {
  issueId: string;
  body: string;
} {
  return (
    typeof args === "object" &&
    args !== null &&
    "issueId" in args &&
    typeof (args as { issueId: string }).issueId === "string" &&
    "body" in args &&
    typeof (args as { body: string }).body === "string"
  );
}

/**
 * Type guard for linear_createProject tool arguments
 */
export function isCreateProjectArgs(args: unknown): args is {
  name: string;
  description?: string;
  teamIds: string[];
  state?: string;
} {
  return (
    typeof args === "object" &&
    args !== null &&
    "name" in args &&
    typeof (args as { name: string }).name === "string" &&
    "teamIds" in args &&
    Array.isArray((args as { teamIds: string[] }).teamIds)
  );
}

/**
 * Type guard for linear_addIssueLabel tool arguments
 */
export function isAddIssueLabelArgs(args: unknown): args is {
  issueId: string;
  labelId: string;
} {
  return (
    typeof args === "object" &&
    args !== null &&
    "issueId" in args &&
    typeof (args as { issueId: string }).issueId === "string" &&
    "labelId" in args &&
    typeof (args as { labelId: string }).labelId === "string"
  );
}

/**
 * Type guard for linear_removeIssueLabel tool arguments
 */
export function isRemoveIssueLabelArgs(args: unknown): args is {
  issueId: string;
  labelId: string;
} {
  return (
    typeof args === "object" &&
    args !== null &&
    "issueId" in args &&
    typeof (args as { issueId: string }).issueId === "string" &&
    "labelId" in args &&
    typeof (args as { labelId: string }).labelId === "string"
  );
} 