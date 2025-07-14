# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Build and Development:**

- `npm run dev` - Start development build with watch mode
- `npm run build` - Build for production (includes TypeScript checking)
- `npm install` - Install dependencies

**Testing:**

- Test with the included `test-mcp-server.js`: `node test-mcp-server.js`
- The test server runs on `ws://localhost:3000` and provides sample resources/tools

## Architecture Overview

This is an Obsidian plugin that implements a Model Context Protocol (MCP) client with WebSocket connectivity.

**Core Components:**

- `MCPClient` (mcp-client.ts) - WebSocket-based JSON-RPC client for MCP protocol
- `MCPClientPlugin` (main.ts) - Main plugin class with settings and commands
- `MCPView` - UI component for interacting with MCP servers
- `MCPSettingTab` - Configuration interface for server settings

**Key Patterns:**

- JSON-RPC 2.0 protocol implementation with promise-based request handling
- Obsidian's ItemView for custom UI panels
- WebSocket connection management with automatic reconnection handling
- Settings persistence using Obsidian's data storage
- Robust error handling with typed exceptions and proper cleanup
- Connection resilience with exponential backoff retry logic
- Request timeouts and resource management to prevent memory leaks

**Plugin Structure:**

- Entry point: `main.ts` (compiled to `main.js`)
- Build system: esbuild with TypeScript compilation
- Target: ES2018, CommonJS format
- External dependencies: Obsidian API, WebSocket (`ws` package)

**MCP Protocol Support:**

- Initialize handshake with capability negotiation
- Resource listing and reading
- Tool discovery and execution
- Notification handling for server events

## Installation for Development

1. Build the plugin: `npm run build`
2. Copy `main.js`, `manifest.json`, `styles.css` to Obsidian vault's `.obsidian/plugins/mcp-client/`
3. Enable in Obsidian settings

## Configuration

Default server URL: `ws://localhost:3000`
Access via Settings → MCP Client or ribbon icon → settings

## Recent Improvements (July 2025)

### Connection Reliability

- **Automatic retry logic** with exponential backoff (configurable attempts and delays)
- **Connection timeouts** to prevent hanging connections (default 10s)
- **URL validation** ensuring only valid WebSocket URLs are accepted
- **Proper cleanup** of pending requests and timeouts on disconnect

### Error Handling & Type Safety

- **Typed error interfaces** (`MCPError`, `ConnectionOptions`, `ConnectionStatus`)
- **Enhanced error messages** with error codes and structured error information
- **Request timeouts** for individual MCP operations (default 30s)
- **Memory leak prevention** through proper resource cleanup

### User Experience

- **Loading states** showing connection progress and retry attempts
- **Better status feedback** with last error messages displayed in UI
- **Disabled controls** during connection attempts to prevent conflicts
- **Visual indicators** for connecting, connected, disconnected, and error states

### Implementation Details

- Connection options: `timeout`, `retryAttempts`, `retryDelay`, `maxRetryDelay`
- Status tracking: `connecting`, `connected`, `lastError`, `retryAttempt`
- Enhanced CSS classes: `.status-connecting`, `.status-error`, disabled button styles
- TypeScript config updated with `allowSyntheticDefaultImports` and `esModuleInterop`
