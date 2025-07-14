# API Reference

## Core Classes

### MCPClient

The main MCP protocol client implementation.

#### Constructor
```typescript
new MCPClient(url: string, options?: ConnectionOptions)
```

**Parameters**:
- `url`: WebSocket URL (ws:// or wss://)
- `options`: Optional connection configuration

**Options**:
```typescript
interface ConnectionOptions {
  timeout?: number;        // Connection timeout in ms (default: 10000)
  retryAttempts?: number;  // Max retry attempts (default: 3)
  retryDelay?: number;     // Initial retry delay in ms (default: 1000)
  maxRetryDelay?: number;  // Max retry delay in ms (default: 30000)
}
```

#### Methods

##### connect()
```typescript
connect(): Promise<void>
```
Establishes connection to MCP server with automatic retry logic.

**Returns**: Promise that resolves when connected
**Throws**: `MCPError` on connection failure

##### disconnect()
```typescript
disconnect(): Promise<void>
```
Cleanly disconnects from MCP server and cleans up resources.

**Returns**: Promise that resolves when disconnected

##### initialize()
```typescript
initialize(): Promise<InitializeResult>
```
Performs MCP protocol handshake and capability negotiation.

**Returns**: Server capabilities and protocol information
**Throws**: `MCPError` on protocol errors

##### listResources()
```typescript
listResources(): Promise<Resource[]>
```
Retrieves list of available resources from server.

**Returns**: Array of resource objects
**Throws**: `MCPError` on request failure

##### readResource()
```typescript
readResource(uri: string): Promise<ResourceContent>
```
Reads content of a specific resource.

**Parameters**:
- `uri`: Resource URI to read

**Returns**: Resource content object
**Throws**: `MCPError` on resource not found or read error

##### listTools()
```typescript
listTools(): Promise<Tool[]>
```
Retrieves list of available tools from server.

**Returns**: Array of tool objects
**Throws**: `MCPError` on request failure

##### callTool()
```typescript
callTool(name: string, parameters?: any): Promise<ToolResult>
```
Executes a tool with given parameters.

**Parameters**:
- `name`: Tool name to execute
- `parameters`: Tool parameters (currently unused)

**Returns**: Tool execution result
**Throws**: `MCPError` on tool execution failure

#### Events

##### 'statusChanged'
```typescript
on('statusChanged', (status: ConnectionStatus) => void)
```
Emitted when connection status changes.

**Status Object**:
```typescript
interface ConnectionStatus {
  status: 'disconnected' | 'connecting' | 'connected' | 'error';
  lastError?: string;
  retryAttempt?: number;
}
```

##### 'notification'
```typescript
on('notification', (notification: any) => void)
```
Emitted when server sends notification.

### MCPClientPlugin

Main plugin class that orchestrates MCP functionality.

#### Properties

##### settings
```typescript
settings: MCPClientSettings
```
Current plugin settings object.

##### servers
```typescript
servers: Map<string, MCPServer>
```
Map of configured MCP servers.

##### clients
```typescript
clients: Map<string, MCPClient>
```
Map of active MCP client connections.

#### Methods

##### loadSettings()
```typescript
loadSettings(): Promise<void>
```
Loads settings from Obsidian data store and config file.

##### saveSettings()
```typescript
saveSettings(): Promise<void>
```
Saves settings to Obsidian data store and config file.

##### connectAllServers()
```typescript
connectAllServers(): Promise<void>
```
Connects to all enabled servers.

##### disconnectAllServers()
```typescript
disconnectAllServers(): Promise<void>
```
Disconnects from all connected servers.

##### addServer()
```typescript
addServer(server: MCPServer): Promise<void>
```
Adds new server configuration.

##### removeServer()
```typescript
removeServer(name: string): Promise<void>
```
Removes server configuration.

##### updateServer()
```typescript
updateServer(name: string, server: MCPServer): Promise<void>
```
Updates existing server configuration.

## Type Definitions

### MCPServer
```typescript
interface MCPServer {
  name: string;
  command: string;
  connectionType: 'websocket' | 'stdio' | 'http';
  url?: string;              // WebSocket URL
  args?: string[];           // STDIO arguments
  env?: Record<string, string>; // STDIO environment
  cwd?: string;              // STDIO working directory
  httpUrl?: string;          // HTTP server URL
  enabled: boolean;
  autoConnect: boolean;
}
```

### MCPError
```typescript
interface MCPError extends Error {
  code: number;
  message: string;
  data?: any;
}
```

### Resource
```typescript
interface Resource {
  uri: string;
  name: string;
  description?: string;
  mimeType?: string;
}
```

### ResourceContent
```typescript
interface ResourceContent {
  uri: string;
  mimeType: string;
  text?: string;
  blob?: Uint8Array;
}
```

### Tool
```typescript
interface Tool {
  name: string;
  description?: string;
  inputSchema?: any; // JSON Schema for parameters
}
```

### ToolResult
```typescript
interface ToolResult {
  content?: {
    type: 'text' | 'image' | 'resource';
    text?: string;
    data?: string;
    uri?: string;
  }[];
  isError?: boolean;
}
```

### InitializeResult
```typescript
interface InitializeResult {
  protocolVersion: string;
  capabilities: ServerCapabilities;
  serverInfo: ServerInfo;
}
```

### ServerCapabilities
```typescript
interface ServerCapabilities {
  resources?: {
    subscribe?: boolean;
    listChanged?: boolean;
  };
  tools?: {
    listChanged?: boolean;
  };
  logging?: boolean;
  experimental?: Record<string, any>;
}
```

### ServerInfo
```typescript
interface ServerInfo {
  name: string;
  version: string;
}
```

## JSON-RPC Protocol

### Request Format
```json
{
  "jsonrpc": "2.0",
  "id": "unique-request-id",
  "method": "method-name",
  "params": {
    "param1": "value1",
    "param2": "value2"
  }
}
```

### Response Format
```json
{
  "jsonrpc": "2.0",
  "id": "unique-request-id",
  "result": {
    "data": "response-data"
  }
}
```

### Error Format
```json
{
  "jsonrpc": "2.0",
  "id": "unique-request-id",
  "error": {
    "code": -32000,
    "message": "Error message",
    "data": "additional-error-data"
  }
}
```

### Notification Format
```json
{
  "jsonrpc": "2.0",
  "method": "notification-method",
  "params": {
    "data": "notification-data"
  }
}
```

## MCP Protocol Methods

### initialize
**Purpose**: Handshake and capability negotiation
**Request**:
```json
{
  "method": "initialize",
  "params": {
    "protocolVersion": "2024-11-05",
    "capabilities": {
      "roots": {
        "listChanged": true
      },
      "sampling": {}
    },
    "clientInfo": {
      "name": "obsidian-mcp-client",
      "version": "1.0.0"
    }
  }
}
```

### resources/list
**Purpose**: List available resources
**Request**:
```json
{
  "method": "resources/list",
  "params": {}
}
```

### resources/read
**Purpose**: Read resource content
**Request**:
```json
{
  "method": "resources/read",
  "params": {
    "uri": "resource-uri"
  }
}
```

### tools/list
**Purpose**: List available tools
**Request**:
```json
{
  "method": "tools/list",
  "params": {}
}
```

### tools/call
**Purpose**: Execute tool
**Request**:
```json
{
  "method": "tools/call",
  "params": {
    "name": "tool-name",
    "arguments": {
      "param1": "value1",
      "param2": "value2"
    }
  }
}
```

## Error Codes

### JSON-RPC Error Codes
- `-32700`: Parse error
- `-32600`: Invalid request
- `-32601`: Method not found
- `-32602`: Invalid params
- `-32603`: Internal error
- `-32000 to -32099`: Server error range

### MCP Protocol Error Codes
- `-32000`: Server error
- `-32001`: Method not found
- `-32002`: Invalid params
- `-32003`: Internal error
- `-32004`: Invalid request
- `-32005`: Method not allowed

### Plugin Error Codes
- `-1000`: Connection error
- `-1001`: Timeout error
- `-1002`: Configuration error
- `-1003`: Protocol error
- `-1004`: Resource error
- `-1005`: Tool error

## Extension Points

### Custom Transports
```typescript
interface Transport {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  send(message: any): Promise<void>;
  on(event: string, listener: (...args: any[]) => void): void;
}
```

### Custom Content Formatters
```typescript
interface ContentFormatter {
  canFormat(content: any): boolean;
  format(content: any): string;
}
```

### Custom Error Handlers
```typescript
interface ErrorHandler {
  canHandle(error: MCPError): boolean;
  handle(error: MCPError): string;
}
```

## Utility Functions

### Content Formatting
```typescript
function formatContent(content: any): string
```
Formats MCP response content for display in Obsidian.

### Error Handling
```typescript
function handleError(error: MCPError): string
```
Converts MCP errors to user-friendly messages.

### Configuration Validation
```typescript
function validateConfig(config: any): boolean
```
Validates MCP configuration format.

### URL Validation
```typescript
function isValidWebSocketUrl(url: string): boolean
```
Validates WebSocket URL format.

---

*API reference for plugin version as of July 2025.*