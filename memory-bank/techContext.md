# Technical Context

This document details the technologies used, the development setup, technical constraints, and dependencies for the mcp-newsapi project.

## Technologies Used:
- **TypeScript:** The primary language for development.
- **Node.js:** The runtime environment for the MCP server.
- **MCP Framework:** The framework used to build and expose the tools (`@modelcontextprotocol/sdk`).
- **News API Node.js SDK:** The official SDK for interacting with the News API (`newsapi`).
- **Zod:** For input validation.
- **npm/yarn:** Package managers for dependency management.

## Development Setup:
- The project is developed in a standard Node.js environment.
- Dependencies are managed via `package.json`.
- Building is handled via `tsc` (TypeScript compiler).

## Technical Constraints:
- The project must adhere to the MCP specification for tool and resource exposure.
- News API rate limits need to be considered and potentially handled.
- Secure handling of the News API key is paramount.

## Dependencies:
- `@modelcontextprotocol/sdk`
- `newsapi`
- `zod`
- Development dependencies for TypeScript, ESLint, Prettier, etc., similar to the `mcp-indicators` project.
