# Deploying Linear-MCP-Server on Smithery

This guide will walk you through the process of deploying the Linear-MCP-Server on Smithery, allowing it to be used by Claude and other users.

## Prerequisites

- A Smithery account (create one at [smithery.dev](https://smithery.dev))
- The Linear-MCP-Server codebase
- A Linear API token for testing

## Preparing for Deployment

1. Ensure your project builds correctly:

```bash
npm run build
```

2. Test locally to make sure everything is working:

```bash
npm start
```

3. Make sure all environment variables are properly configured in the `.env` file:

```
PORT=3000
NODE_ENV=production
LINEAR_API_URL=https://api.linear.app/graphql
CORS_ORIGINS=https://claude.ai,https://your-domain.com
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=100
LOG_LEVEL=info
```

## Smithery Deployment

### 1. Create a New Service on Smithery

1. Log in to your Smithery dashboard
2. Click "Create New Service"
3. Choose a name for your service (e.g., "linear-mcp-server")
4. Select "Node.js" as the runtime

### 2. Configure Build Settings

1. Set build command: `npm install && npm run build`
2. Set start command: `npm start`
3. Configure environment variables:
   - PORT: 8080 (Smithery default)
   - NODE_ENV: production
   - LINEAR_API_URL: https://api.linear.app/graphql
   - CORS_ORIGINS: https://claude.ai,https://your-domain.com
   - RATE_LIMIT_WINDOW_MS: 60000
   - RATE_LIMIT_MAX: 100
   - LOG_LEVEL: info

### 3. Configure MCP Protocol Settings

1. Set MCP Context Endpoint: `/api/context`
2. Set MCP Action Endpoint: `/api/action`
3. Configure authentication method as "API Key" using Bearer token

### 4. Deploy Your Service

1. Connect your GitHub repository to Smithery
2. Trigger the initial deployment
3. Wait for the build and deployment to complete

### 5. Testing the Deployment

1. Use the Smithery dashboard testing tools to verify your endpoints
2. Test the context endpoint with a sample Linear API token
3. Test the action endpoint with a sample action request

### 6. Publication and Sharing

1. Once testing is successful, publish your service to make it available
2. Generate API keys for users who will access your service
3. Share the service URL and API key with those who need to use it

## Monitoring and Maintenance

### Monitoring

- Set up alerts for service health
- Monitor error rates and response times
- Check logs for any issues

### Scaling

If your service usage grows:

1. Increase resource allocation in Smithery settings
2. Consider enabling auto-scaling
3. Implement more aggressive caching

### Updates and Maintenance

When updating your service:

1. Test changes locally first
2. Use staging deployments for major changes
3. Monitor closely after updates
4. Be prepared to rollback if issues occur

## Troubleshooting

### Common Issues

1. **Authentication Errors**:

   - Verify Linear API tokens are valid
   - Check token permissions

2. **Rate Limiting**:

   - Linear API has rate limits that may affect performance
   - Implement caching to reduce API calls

3. **Performance Issues**:
   - Check query optimization
   - Verify connection pooling settings
   - Consider increasing server resources

### Getting Help

- Contact Smithery support for deployment issues
- Refer to Linear API documentation for API-specific problems
- Check GitHub issues for known problems and solutions
