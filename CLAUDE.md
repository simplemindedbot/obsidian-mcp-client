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

This is an Obsidian plugin that implements a Model Context Protocol (MCP) client. **Currently supports WebSocket connections only** - STDIO and HTTP connections are planned but not yet implemented.

**Core Components:**

- `MCPClient` (mcp-client.ts) - WebSocket-based JSON-RPC 2.0 client for MCP protocol
- `MCPClientPlugin` (main.ts) - Main plugin class with settings, commands, and multi-server management
- `MCPView` (main.ts) - UI component for interacting with MCP servers, browsing resources, and executing tools
- `MCPSettingTab` (main.ts) - Configuration interface with Claude Desktop-compatible JSON config support

**Key Patterns:**

- JSON-RPC 2.0 protocol implementation with promise-based request handling and proper ID management
- Obsidian's ItemView for custom UI panels with real-time status updates
- WebSocket connection management with automatic reconnection and exponential backoff retry logic
- Claude Desktop-compatible JSON configuration format with extensions for WebSocket/HTTP servers
- Settings persistence using both Obsidian's data storage and external JSON config files
- Robust error handling with typed exceptions (`MCPError`, `ConnectionStatus`) and proper cleanup
- Request timeouts (30s default) and resource management to prevent memory leaks
- Multi-server support with individual enable/disable and auto-connect functionality

**Plugin Structure:**

- Entry point: `main.ts` (compiled to `main.js`)
- Build system: esbuild with TypeScript compilation and source maps
- Target: ES2018, CommonJS format for Obsidian compatibility
- Dependencies: Obsidian API, WebSocket (`ws` package v8.18.3)
- TypeScript config: Synthetic default imports and ES module interop enabled

**MCP Protocol Support (Current):**

- ✅ Initialize handshake with capability negotiation (protocol version 2024-11-05)
- ✅ Resource listing (`resources/list`) and reading (`resources/read`)
- ✅ Tool discovery (`tools/list`) and execution (`tools/call`)
- ✅ Basic notification handling for server events
- ❌ Tool parameters (tools called with empty `{}` only)
- ❌ Streaming responses or real-time updates
- ❌ Resource subscriptions or batch operations

**Connection Types:**

- ✅ **WebSocket**: Fully implemented with retry logic, timeouts, and proper lifecycle management
- ❌ **STDIO**: UI framework ready but not implemented (see TODO.md for priority)
- ❌ **HTTP/SSE**: Interface placeholders only, no implementation

## Installation for Development

1. Build the plugin: `npm run build`
2. Copy `main.js`, `manifest.json`, `styles.css` to Obsidian vault's `.obsidian/plugins/mcp-client/`
3. Enable in Obsidian settings

## Configuration

**Config File Format:** Claude Desktop-compatible JSON format at `~/.mcp-config.json` (configurable)
**Settings Access:** Settings → MCP Client or ribbon icon → settings
**Server Presets:** Built-in configurations for AI Humanizer, Sequential Thinking, Claude Code, Memory, and Obsidian MCP Tools

**Example Configuration:**

```json
{
  "mcpServers": {
    "test-websocket": {
      "command": "websocket",
      "connectionType": "websocket", 
      "url": "ws://localhost:3000",
      "enabled": true,
      "autoConnect": false
    }
  }
}
```

## Current Implementation Status

**✅ Fully Working:**

- WebSocket MCP server connections with full JSON-RPC 2.0 support
- Multi-server management with individual controls
- Resource browsing and document insertion at cursor position
- Tool execution with output formatting and insertion
- Connection retry logic with exponential backoff
- Claude Desktop-compatible JSON configuration
- Comprehensive settings UI with server presets

**❌ Not Yet Implemented:**

- STDIO connections (main blocker for Claude Desktop config compatibility)
- HTTP/SSE transport for web-based MCP servers
- Tool parameters (tools called with empty parameters only)
- Streaming responses or real-time content updates
- Authentication mechanisms (API keys, OAuth)

**🔄 Partially Working:**

- Config file support (works but only WebSocket configs are fully supported)
- Error handling (basic retry logic, could be more robust)
- Content formatting (works for most cases, complex objects may not render perfectly)

## Development Roadmap

See [TODO.md](TODO.md) for comprehensive development roadmap with prioritized features. **High priority items:**

1. STDIO connection implementation (enables Claude Desktop config compatibility)
2. HTTP/SSE transport support
3. Tool parameter support for interactive tool usage

## Recent Improvements (July 2025)

### Major Implementation (July 14, 2025)

**Core Features Added:**

- **Complete WebSocket MCP client** with JSON-RPC 2.0 protocol support
- **Multi-server management** with individual connection controls
- **Claude Desktop-compatible JSON configuration** system with extensions
- **Document integration** with smart cursor positioning and fallback file creation
- **Resource and tool execution** with formatted output insertion
- **Server presets** for common MCP servers (AI Humanizer, Sequential Thinking, etc.)

**Technical Infrastructure:**

- **Connection reliability** with exponential backoff retry logic (configurable attempts and delays)
- **Connection timeouts** to prevent hanging connections (default 10s)
- **URL validation** ensuring only valid WebSocket URLs are accepted
- **Proper cleanup** of pending requests and timeouts on disconnect
- **Request timeouts** for individual MCP operations (default 30s)
- **Memory leak prevention** through proper resource cleanup

**User Experience:**

- **Comprehensive settings interface** with server add/edit/delete operations
- **Real-time status indicators** showing connection progress and retry attempts
- **Better error feedback** with last error messages displayed in UI
- **Disabled controls** during connection attempts to prevent conflicts
- **Visual indicators** for connecting, connected, disconnected, and error states

**Development Improvements:**

- **TypeScript config** updated with `allowSyntheticDefaultImports` and `esModuleInterop`
- **Enhanced CSS classes** for status states (`.status-connecting`, `.status-error`, disabled button styles)
- **Typed error interfaces** (`MCPError`, `ConnectionOptions`, `ConnectionStatus`)
- **Comprehensive development roadmap** added in TODO.md

### Architecture Enhancements

- **Connection options**: `timeout`, `retryAttempts`, `retryDelay`, `maxRetryDelay`
- **Status tracking**: `connecting`, `connected`, `lastError`, `retryAttempt`
- **Protocol version**: 2024-11-05 with full capability negotiation
- **Multi-transport ready**: Architecture supports WebSocket, STDIO, and HTTP (WebSocket only implemented)

## important-instruction-reminders

Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.
