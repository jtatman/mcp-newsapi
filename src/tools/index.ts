import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { everythingTool } from './everything.js';
import { topHeadlinesTool } from './topHeadlines.js';

// A generic type for our tool definitions to ensure they have the correct shape.
type NewsApiToolDefinition = {
  name: string;
  description: string;
  inputSchemaShape: z.ZodRawShape;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handler: (input: any) => Promise<any>;
};

const newsApiTools: NewsApiToolDefinition[] = [everythingTool, topHeadlinesTool];

/**
 * Registers all the defined News API tools with the McpServer instance.
 * @param server The McpServer to register the tools with.
 */
export const registerNewsApiTools = (server: McpServer): void => {
  console.log('Registering News API tools...');
  newsApiTools.forEach((tool) => {
    server.tool(tool.name, tool.description, tool.inputSchemaShape, async (input) => {
      const result = await tool.handler(input);
      // The handler's result must be wrapped in the MCP content format.
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    });
    console.log(`- Registered tool: ${tool.name}`);
  });
  console.log('Tool registration complete.');
}