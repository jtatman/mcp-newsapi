import { McpServer } from '@modelcontextprotocol/sdk/server/mcp';

declare global {
  var mcpServerInstance: McpServer | undefined;
}
