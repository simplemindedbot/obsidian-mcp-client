# Protocol Implementation

## MCP Protocol Overview

The Model Context Protocol (MCP) is a standardized communication protocol for integrating external data sources and tools into AI systems. This document details the current implementation status and technical specifics of MCP support in the Obsidian MCP Client.

## Protocol Version

**Current Support**: MCP Protocol Version `2024-11-05`
**JSON-RPC Version**: 2.0
**Transport**: WebSocket (primary), STDIO (planned), HTTP/SSE (planned)

## Implementation Status

### Core Protocol Features

#### ✅ Initialize Handshake
**Status**: Fully implemented
**Purpose**: Establishes connection and negotiates capabilities

**Request**:
```json
{
  "jsonrpc": "2.0",
  "id": "init-1",
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

**Response Handling**:
- Server capabilities stored and respected
- Protocol version compatibility checked
- Error handling for unsupported versions

#### ✅ Resource Operations
**Status**: Fully implemented for basic operations

**resources/list**:
```json
{
  "jsonrpc": "2.0",
  "id": "res-list-1",
  "method": "resources/list",
  "params": {}
}
```

**resources/read**:
```json
{
  "jsonrpc": "2.0",
  "id": "res-read-1",
  "method": "resources/read",
  "params": {
    "uri": "resource://example/path"
  }
}
```

**Implementation Details**:
- Resource listing with metadata
- Content reading with MIME type support
- Error handling for missing resources
- Content formatting for Obsidian display

#### ✅ Tool Operations
**Status**: Partially implemented (no parameter support)

**tools/list**:
```json
{
  "jsonrpc": "2.0",
  "id": "tool-list-1",
  "method": "tools/list",
  "params": {}
}
```

**tools/call**:
```json
{
  "jsonrpc": "2.0",
  "id": "tool-call-1",
  "method": "tools/call",
  "params": {
    "name": "example-tool",
    "arguments": {}
  }
}
```

**Current Limitations**:
- Tools called with empty parameters only
- No support for input schema validation
- No interactive parameter collection

#### 🔄 Notification Handling
**Status**: Basic implementation

**Supported Notifications**:
- Server status updates
- Resource change notifications (basic)
- Tool availability changes (basic)

**Planned Enhancements**:
- Resource subscriptions
- Real-time updates
- Progress notifications

### Advanced Protocol Features

#### ❌ Subscriptions
**Status**: Not implemented
**Purpose**: Real-time updates for resources and tools

**Planned Implementation**:
```json
{
  "jsonrpc": "2.0",
  "id": "sub-1",
  "method": "resources/subscribe",
  "params": {
    "uri": "resource://example/path"
  }
}
```

#### ❌ Sampling
**Status**: Not implemented
**Purpose**: AI model sampling configuration

**Planned Implementation**:
```json
{
  "jsonrpc": "2.0",
  "id": "sample-1",
  "method": "sampling/createMessage",
  "params": {
    "messages": [...],
    "maxTokens": 1000
  }
}
```

#### ❌ Logging
**Status**: Not implemented
**Purpose**: Structured logging to MCP servers

**Planned Implementation**:
```json
{
  "jsonrpc": "2.0",
  "method": "logging/setLevel",
  "params": {
    "level": "info"
  }
}
```

#### ❌ Progress Tracking
**Status**: Not implemented
**Purpose**: Progress updates for long-running operations

**Planned Implementation**:
```json
{
  "jsonrpc": "2.0",
  "method": "progress/notification",
  "params": {
    "progressToken": "token-123",
    "progress": {
      "total": 100,
      "completed": 50
    }
  }
}
```

## Transport Layer Implementation

### WebSocket Transport (✅ Implemented)

**Library**: `ws` package v8.18.3
**Protocol**: WebSocket (RFC 6455)
**Message Format**: JSON-RPC 2.0 over WebSocket

**Features**:
- Full-duplex communication
- Automatic reconnection with exponential backoff
- Connection timeout handling
- Proper connection lifecycle management
- URL validation (ws:// and wss://)

**Connection Options**:
```typescript
interface ConnectionOptions {
  timeout: number;        // Connection timeout (default: 10s)
  retryAttempts: number;  // Max retry attempts (default: 3)
  retryDelay: number;     // Initial retry delay (default: 1s)
  maxRetryDelay: number;  // Maximum retry delay (default: 30s)
}
```

**Implementation Details**:
```typescript
class MCPClient {
  private ws: WebSocket;
  private pendingRequests: Map<string, PendingRequest>;
  private connectionOptions: ConnectionOptions;
  
  async connect(): Promise<void> {
    this.ws = new WebSocket(this.url);
    this.ws.on('open', this.handleOpen.bind(this));
    this.ws.on('message', this.handleMessage.bind(this));
    this.ws.on('error', this.handleError.bind(this));
    this.ws.on('close', this.handleClose.bind(this));
  }
}
```

### STDIO Transport (❌ Planned)

**Purpose**: Support for command-line MCP servers
**Protocol**: JSON-RPC 2.0 over stdin/stdout

**Planned Features**:
- Child process spawning
- stdin/stdout stream handling
- Process lifecycle management
- Environment variable injection
- Working directory configuration

**Configuration Format**:
```json
{
  "command": "npx",
  "args": ["-y", "mcp-server-package"],
  "env": {
    "API_KEY": "secret-key"
  },
  "cwd": "/path/to/working/directory"
}
```

### HTTP/SSE Transport (❌ Planned)

**Purpose**: Support for web-based MCP servers
**Protocol**: JSON-RPC 2.0 over HTTP with SSE for notifications

**Planned Features**:
- HTTP POST for requests
- Server-Sent Events for notifications
- Session management
- Authentication headers
- Connection pooling

**Configuration Format**:
```json
{
  "httpUrl": "https://api.example.com/mcp",
  "headers": {
    "Authorization": "Bearer token"
  }
}
```

## JSON-RPC 2.0 Implementation

### Request Handling

**Request Structure**:
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

**ID Generation**:
- UUID v4 for unique request identification
- Correlation between requests and responses
- Timeout handling for orphaned requests

**Request Queue**:
- Pending requests tracked in Map
- Timeout cleanup to prevent memory leaks
- Proper error handling for failed requests

### Response Handling

**Success Response**:
```json
{
  "jsonrpc": "2.0",
  "id": "unique-request-id",
  "result": {
    "data": "response-data"
  }
}
```

**Error Response**:
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

**Error Codes**:
- Standard JSON-RPC error codes
- MCP-specific error codes
- Plugin-specific error codes

### Notification Handling

**Notification Structure**:
```json
{
  "jsonrpc": "2.0",
  "method": "notification-method",
  "params": {
    "data": "notification-data"
  }
}
```

**Current Handling**:
- Basic notification routing
- Event emission for UI updates
- Limited notification types supported

## Error Handling

### Error Types

#### Transport Errors
- Connection failures
- Network timeouts
- Protocol violations
- Authentication failures

#### Protocol Errors
- Invalid JSON-RPC format
- Unsupported method calls
- Parameter validation errors
- Server-side errors

#### Application Errors
- Resource not found
- Tool execution failures
- Configuration errors
- UI interaction errors

### Error Recovery

#### Connection Recovery
```typescript
private async handleConnectionError(error: Error): Promise<void> {
  this.updateStatus('error', error.message);
  
  if (this.retryAttempt < this.options.retryAttempts) {
    const delay = Math.min(
      this.options.retryDelay * Math.pow(2, this.retryAttempt),
      this.options.maxRetryDelay
    );
    
    setTimeout(() => {
      this.retryAttempt++;
      this.connect();
    }, delay);
  }
}
```

#### Request Recovery
```typescript
private handleRequestTimeout(requestId: string): void {
  const request = this.pendingRequests.get(requestId);
  if (request) {
    request.reject(new MCPError(-32603, 'Request timeout'));
    this.pendingRequests.delete(requestId);
  }
}
```

## Content Formatting

### Resource Content

**Text Content**:
```typescript
function formatTextContent(content: string): string {
  return content.trim();
}
```

**JSON Content**:
```typescript
function formatJsonContent(content: any): string {
  return '```json\n' + JSON.stringify(content, null, 2) + '\n```';
}
```

**Binary Content**:
```typescript
function formatBinaryContent(content: Uint8Array): string {
  return `[Binary content: ${content.length} bytes]`;
}
```

### Tool Results

**Text Results**:
```typescript
function formatToolResult(result: ToolResult): string {
  if (result.content) {
    return result.content
      .map(item => item.text || item.data || `[${item.type}]`)
      .join('\n');
  }
  return '[No content]';
}
```

**Error Results**:
```typescript
function formatToolError(result: ToolResult): string {
  return `Error: ${result.content?.[0]?.text || 'Unknown error'}`;
}
```

## Security Considerations

### Transport Security
- WebSocket TLS support (wss://)
- Certificate validation
- URL validation and sanitization
- Connection timeout enforcement

### Protocol Security
- Request/response validation
- Parameter sanitization
- Error message sanitization
- Resource URI validation

### Data Protection
- No sensitive data logging
- Secure credential storage
- Process isolation (planned for STDIO)
- Sandboxed execution (planned)

## Performance Optimization

### Connection Management
- Connection pooling (planned)
- Keep-alive mechanisms
- Connection reuse strategies
- Resource cleanup

### Request Optimization
- Request batching (planned)
- Response caching (planned)
- Compression support (planned)
- Streaming responses (planned)

### Memory Management
- Automatic cleanup of pending requests
- Timeout-based resource cleanup
- Event listener cleanup
- Garbage collection optimization

## Future Enhancements

### Protocol Extensions
- Custom method support
- Plugin-specific extensions
- Experimental feature flags
- Version negotiation improvements

### Performance Improvements
- Connection pooling
- Request batching
- Response streaming
- Compression support

### Security Enhancements
- Authentication mechanisms
- Authorization controls
- Audit logging
- Security headers

### Developer Experience
- Better error messages
- Debug mode support
- Protocol validation
- Development tools

---

*Protocol implementation details for plugin version as of July 2025.*