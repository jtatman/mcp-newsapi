import { Request, Response } from 'express';
import express from 'express';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { registerNewsApiTools } from './tools/index.js';
import { randomUUID } from 'crypto';

const app = express();
const server = new McpServer({
  name: 'mcp-newsapi',
  version: '1.0.0',
  description: 'MCP Server for accessing News API endpoints.',
});

registerNewsApiTools(server);

app.all('/mcp', async (req: Request, res: Response) => {
  const transport = new StreamableHTTPServerTransport({
  	sessionIdGenerator: () => randomUUID(),
  });
  await transport.handleRequest(req, res, server);
});


app.listen(3000, () => {
  console.log('MCP News API Server listening on http://localhost:3000/mcp');
});
