import express from 'express';
import { Request, Response } from 'express';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { registerNewsApiTools } from './tools/index.js';
import { randomUUID } from 'crypto';

const app = express();
app.use((req, res, next) => {
  if (req.path !== '/mcp') {
    express.json({
      verify: (req, buf) => {
        // Attach the raw body to the request object
        (req as any).rawBody = buf.toString();
      }
    })(req, res, next);
  } else {
    next();
  }
});
import { NextFunction } from 'express';

app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log('Middleware: Ensuring request stream is initialized...');
  if (!req.readable) {
    console.error('Middleware: Request stream is not readable.');
  } else {
    console.log('Middleware: Request stream is readable.');
  }
  next();
});

const server = new McpServer({
  name: 'mcp-newsapi',
  version: '1.0.0',
  description: 'MCP Server for accessing News API endpoints.',
});

registerNewsApiTools(server);

console.log('Initializing StreamableHTTPServerTransport...');
const transport = new StreamableHTTPServerTransport({
  sessionIdGenerator: () => randomUUID(),
});
server.connect(transport).then(() => {
  console.log('McpServer successfully connected to the transport.');
}).catch((err) => {
  console.error('Error connecting McpServer to the transport:', err);
});

app.all('/mcp', async (req: Request, res: Response) => {
  console.log('Incoming Accept header:', req.headers['accept']);
  if (!req.headers['accept']?.includes('text/event-stream')) {
    console.error('Client did not send Accept: text/event-stream header');
    res.status(406).json({
      error: 'Not Acceptable: Client must accept text/event-stream',
      hint: 'Ensure your client sends the Accept: text/event-stream header.'
    });
    // Optional fallback for browsers
    if (req.headers['accept']?.includes('text/html')) {
      res.status(200).send('<p>This endpoint requires the Accept: text/event-stream header for streaming. Use a tool like curl or a custom client.</p>');
      return;
    }
  }

  console.log('Incoming request body:', req.body);
  console.log('Incoming Accept header:', req.headers['accept']);
  if (!req.headers['accept']?.includes('text/event-stream')) {
    console.error('Client did not send Accept: text/event-stream header');
    res.status(406).json({ error: 'Not Acceptable: Client must accept text/event-stream' });
    return;
  }
  console.log('Handling request with StreamableHTTPServerTransport...');
  console.log('Checking if request stream is readable...');
  if (!req.readable) {
    console.error('Request stream is not readable. Logging raw body if available:', (req as any).rawBody);
    console.error('Request stream is not readable.');
    res.status(400).json({ error: 'Bad Request: Stream is not readable' });
    return;
  }

  console.log('Request stream is readable. Proceeding with transport handling...');
  await transport
    .handleRequest(req, res)
    .catch((err) => {
      console.error('Failed to handle MCP request:', err.message);
      res.status(500).json({ error: 'Internal Server Error' });
    });

  app.use((req: Request) => {
    console.log('Incoming headers:', req.headers);
    console.log('Incoming body:', req.body);
  });
});

app.listen(3005, '0.0.0.0', () => {
  console.log('MCP News API Server listening on http://0.0.0.0:3005/mcp');
  console.log('Server is running and waiting for requests...');
});

// Keep the process alive with a periodic log
setInterval(() => {
  console.log('Server heartbeat: process is still running...');
}, 60000);