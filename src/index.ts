import express from 'express';
import { Request, Response } from 'express';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { registerNewsApiTools } from './tools/index.js';
import { randomUUID } from 'crypto';

const app = express();

// This map will store active transports, keyed by their session ID.
const transports: { [sessionId: string]: StreamableHTTPServerTransport } = {};

// The single endpoint for all MCP communication.
app.all('/mcp', async (req: Request, res: Response) => {
  const sessionId = req.headers['mcp-session-id'] as string | undefined;
  let transport = sessionId ? transports[sessionId] : undefined;

  if (transport) {
    // If a session ID was provided and we have a transport for it, use it.
    console.log(`Using existing transport for session: ${sessionId}`);
  } else {
    // If no session ID was provided, this must be a new connection.
    // We create a new transport and a new server instance to handle it.
    // The transport itself will validate that the first request is a valid `initialize` message.
    console.log('No valid session found. Creating new transport for initialization.');

    const newTransport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID(),
      // This callback runs only after the transport has successfully processed
      // an `initialize` request and a session has been established.
      onsessioninitialized: (initializedSessionId) => {
        console.log(`Session initialized and stored: ${initializedSessionId}`);
        transports[initializedSessionId] = newTransport;
      },
    });

    // Each session requires its own dedicated McpServer instance.
    const server = new McpServer({
      name: 'mcp-newsapi',
      version: '1.0.0',
      description: 'MCP Server for accessing News API endpoints.',
    });
    registerNewsApiTools(server);
    await server.connect(newTransport);

    transport = newTransport;
  }

  // Pass the raw, untouched request directly to the transport. The transport
  // is responsible for reading the stream, parsing the body, and handling all
  // MCP-specific logic, including erroring on invalid requests.
  //
  // IMPORTANT: Do NOT `await` this call. It takes over the response stream
  // and manages the long-lived connection asynchronously.
  transport.handleRequest(req, res).catch((err) => {
    console.error(`Request handling failed for session ${sessionId}:`, err.message);
    if (!res.headersSent) {
      // The SDK should send a compliant error, but we have a fallback.
      res.status(400).json({
        jsonrpc: '2.0',
        error: { code: -32000, message: err.message || 'An unexpected error occurred.' },
        id: null,
      });
    }
  });
});

const PORT = 3005;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`MCP News API Server listening on http://${HOST}:${PORT}/mcp`);
});
