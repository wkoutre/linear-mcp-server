# Linear MCP Server Implementation Plan (REVISED)

This document outlines the step-by-step plan for implementing an MCP (Model Context Protocol) server for the Linear GraphQL API. This server will allow Claude to interact with Linear project management using user tokens.

## 0. Architectural Correction

> **IMPORTANT NOTE**: The initial implementation incorrectly built a REST API using Express instead of a proper MCP server. This plan has been revised to follow the correct MCP architecture using the official SDK.

MCP servers should be built using the MCP SDK, not as REST APIs. Key differences:

- MCP servers use transports like stdio, not HTTP endpoints
- Resources, tools, and prompts are defined using the MCP SDK patterns
- MCP servers connect directly to MCP clients (like Claude Desktop), not via REST API calls

## 1. Project Setup

- [x] Create project repository
- [x] Set up basic Node.js/TypeScript project
- [x] Add dependency management (package.json, yarn.lock, etc.)
- [x] Configure TypeScript, ESLint, and Prettier
- [x] Create basic documentation (README.md)
- [x] Set up testing framework (Jest)
- [ ] Add MCP SDK dependency (`@modelcontextprotocol/sdk`)

## 2. Core MCP Server Structure

- [ ] ~~Initialize MCP server framework~~ (INCORRECT APPROACH)
- [ ] ~~Set up routing and endpoint structure~~ (INCORRECT APPROACH)
- [ ] ~~Implement authentication middleware for Linear API tokens~~ (INCORRECT APPROACH)
- [ ] ~~Set up error handling and logging~~ (INCORRECT APPROACH)
- [ ] ~~Create health check endpoints~~ (INCORRECT APPROACH)

### 2. Corrected MCP Server Structure

- [ ] Create MCP server instance using `McpServer` class from the SDK
- [ ] Set up stdio transport layer with `StdioServerTransport`
- [ ] Configure server information (name, version)
- [ ] Set up initialization handlers
- [ ] Implement proper error handling for MCP protocol

## 3. Linear GraphQL Integration

- [x] Obtain Linear GraphQL schema
- [x] Create GraphQL client with typed operations
- [x] Implement token-based authentication for Linear
- [x] Create utility functions for common GraphQL operations
- [ ] Set up request caching for improved performance
- [ ] Adapt Linear service to work with MCP patterns instead of REST API

## 4. MCP Protocol Implementation

- [ ] ~~Implement context retrieval endpoint~~ (INCORRECT APPROACH)
  - [ ] ~~Fetch and format issues/tasks~~ (INCORRECT APPROACH)
  - [ ] ~~Retrieve projects and teams~~ (INCORRECT APPROACH)
  - [ ] ~~Get user information~~ (INCORRECT APPROACH)
  - [ ] ~~Format response according to MCP protocol~~ (INCORRECT APPROACH)
- [ ] ~~Implement action endpoint~~ (INCORRECT APPROACH)
  - [ ] ~~Create/update issues~~ (INCORRECT APPROACH)
  - [ ] ~~Change issue status~~ (INCORRECT APPROACH)
  - [ ] ~~Assign issues~~ (INCORRECT APPROACH)
  - [ ] ~~Add comments~~ (INCORRECT APPROACH)
  - [ ] ~~Create projects/teams~~ (INCORRECT APPROACH)

### 4. Corrected MCP Protocol Implementation

- [ ] Implement MCP resources
  - [ ] Define resource for issues/tasks
  - [ ] Define resource for projects
  - [ ] Define resource for teams
  - [ ] Define resource for user information
  - [ ] Create resource templates with appropriate URI patterns
- [ ] Implement MCP tools
  - [ ] Tool for creating/updating issues
  - [ ] Tool for changing issue status
  - [ ] Tool for assigning issues
  - [ ] Tool for adding comments
  - [ ] Tool for creating projects/teams
- [ ] Implement MCP prompts (optional)
  - [ ] Define prompt templates for common Linear interactions

## 5. Advanced Features

- [ ] Implement pagination for large result sets
- [ ] Add support for custom filters
- [ ] Create helper functions for complex queries
- [ ] Add support for resource caching
- [ ] Implement proper error handling and reporting

## 6. Testing

- [ ] Write unit tests for core functionality
- [ ] Create integration tests with mock Linear API
- [ ] Set up tests for MCP server using the MCP Inspector tool
- [ ] Implement CI/CD pipeline for automated testing

## 7. Documentation

- [ ] Create comprehensive API documentation (focusing on MCP resources and tools)
- [ ] Write setup and installation guide
- [ ] Document authentication process
- [ ] Create examples for common use cases
- [ ] Add troubleshooting section
- [ ] Update README with MCP-specific instructions

## 8. Configuration and Deployment

- [ ] Set up configuration options (token, debug mode, etc.)
- [ ] Create launchers for different environments
- [ ] Set up packaging for distribution
- [ ] Configure proper logging

## 9. Security and Compliance

- [ ] Implement secure token storage
- [ ] Add rate limiting to protect Linear API
- [ ] Set up input validation for tool arguments
- [ ] Ensure GDPR compliance
- [ ] Implement audit logging

## 10. Launch and Distribution

- [ ] Create MCP server example repository
- [ ] Write blog post/announcement
- [ ] Create demo video
- [ ] Publish to NPM registry
- [ ] Set up support channels

## Progress Tracking

| Section                      | Previous | Current | Notes                                                  |
| ---------------------------- | -------- | ------- | ------------------------------------------------------ |
| Project Setup                | 100%     | 85%     | Need to add MCP SDK dependency                         |
| Core MCP Server Structure    | 100%     | 0%      | Need to implement proper MCP server patterns           |
| Linear GraphQL Integration   | 80%      | 80%     | Basic integration completed, needs adaptation to MCP   |
| MCP Protocol Implementation  | 100%     | 0%      | Need to reimplement using proper MCP resources & tools |
| Advanced Features            | 0%       | 0%      | Not started                                            |
| Testing                      | 0%       | 0%      | Framework set up, but tests not written                |
| Documentation                | 100%     | 50%     | Need to update for MCP-specific implementation         |
| Configuration and Deployment | 60%      | 10%     | Need to refactor for MCP server approach               |
| Security and Compliance      | 60%      | 30%     | Some security aspects need to be reconsidered for MCP  |
| Launch and Distribution      | 0%       | 0%      | Not started                                            |
