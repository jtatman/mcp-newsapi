import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
// Import individual tool definitions
import { everythingTool } from './everything.js';
import { topHeadlinesTool } from './topHeadlines.js';

// Placeholder type for tool definition
type NewsApiToolDefinition = {
  name: string;
  description: string;
  // Expecting the raw shape object for Zod validation
  inputSchemaShape: z.ZodRawShape;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handler: (input: any) => Promise<any>;
};

// Define the list of tools
const newsApiToolDefinitions: NewsApiToolDefinition[] = [
  everythingTool,
  topHeadlinesTool,
];

/**
 * Registers all News API tools with the MCP server.
 * @param server The McpServer instance.
 */
export const registerNewsApiTools = (server: McpServer): void => {
  newsApiToolDefinitions.forEach((toolDef) => {
    try {
      // Pass the raw shape to the inputSchema parameter, assuming SDK handles z.object()
      console.log(`Registering tool: ${toolDef.name}`);
      console.log(`Input schema shape for ${toolDef.name}:`, toolDef.inputSchemaShape);
      
      server.tool(toolDef.name, toolDef.description, toolDef.inputSchemaShape, async (input) => {
        const result = await toolDef.handler(input);
        // Assuming the handler returns the data directly, wrap it in the MCP content format
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      });
      console.log(`Registered News API tool: ${toolDef.name}`);
      console.log(`Tool description: ${toolDef.description}`);
      console.log(`Input schema shape:`, toolDef.inputSchemaShape);
    } catch (error) {
      console.error(`Failed to register tool ${toolDef.name}:`, error);
    }
  });
};
