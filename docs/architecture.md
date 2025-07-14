# Architecture

## System Overview

The Obsidian MCP Client follows a modular, layered architecture designed for extensibility and maintainability. The system is built around three primary layers: Transport, Protocol, and UI, with a Configuration layer providing cross-cutting concerns.

```
┌─────────────────────────────────────────────────────────────┐
│                        UI Layer                             │
├─────────────────────────────────────────────────────────────┤
│                    Protocol Layer                           │
├─────────────────────────────────────────────────────────────┤
│                   Transport Layer                           │
├─────────────────────────────────────────────────────────────┤
│                 Configuration Layer                         │
└─────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. MCPClient (mcp-client.ts)
**Purpose**: Core MCP protocol implementation and transport management
**Responsibilities**:
- JSON-RPC 2.0 protocol implementation
- WebSocket transport management
- Connection lifecycle (connect, disconnect, reconnect)
- Request/response handling with proper ID management
- Error handling and recovery
- Message queuing and timeout management

**Key Features**:
- Promise-based async API
- Automatic reconnection with exponential backoff
- Request timeout handling (default 30s)
- Connection timeout prevention (default 10s)
- Proper resource cleanup

### 2. MCPClientPlugin (main.ts)
**Purpose**: Main plugin orchestrator and Obsidian integration
**Responsibilities**:
- Plugin lifecycle management (load, unload, enable, disable)
- Multi-server coordination
- Configuration management
- Command registration
- View management
- Settings persistence

**Key Features**:
- Multi-server support with individual controls
- Configuration file synchronization
- Auto-connect functionality
- Error aggregation and reporting

### 3. MCPView (main.ts)
**Purpose**: Primary user interface for MCP interactions
**Responsibilities**:
- Server status display
- Resource browsing and interaction
- Tool discovery and execution
- Content insertion into documents
- Real-time status updates

**Key Features**:
- Real-time connection status indicators
- Interactive resource and tool lists
- Content formatting and insertion
- Error display and retry controls

### 4. MCPSettingTab (main.ts)
**Purpose**: Configuration interface for server management
**Responsibilities**:
- Server configuration (add, edit, delete)
- Config file path management
- Server preset selection
- Connection settings
- Enable/disable controls

**Key Features**:
- Claude Desktop-compatible configuration
- Server presets for common MCP implementations
- Real-time configuration validation
- Import/export functionality

## Data Flow

### Connection Establishment
```
User Action → MCPSettingTab → MCPClientPlugin → MCPClient → WebSocket
                                     ↓
                              Status Updates → MCPView
```

### Resource Operations
```
User Click → MCPView → MCPClientPlugin → MCPClient → MCP Server
                                                          ↓
Document ← Content Insertion ← Response Processing ← JSON-RPC Response
```

### Tool Execution
```
User Action → MCPView → MCPClientPlugin → MCPClient → MCP Server
                                                          ↓
Document ← Output Insertion ← Result Processing ← Tool Response
```

## Protocol Implementation

### JSON-RPC 2.0 Support
- **Request ID Management**: Unique IDs for request/response correlation
- **Method Dispatch**: Proper routing of requests and notifications
- **Error Handling**: Structured error responses with codes and messages
- **Batch Operations**: Support for multiple operations (planned)

### MCP Protocol Features

#### Implemented (✅)
- **Initialize**: Capability negotiation and handshake
- **Resources**: List and read operations
- **Tools**: Discovery and execution
- **Notifications**: Basic server-to-client notifications

#### Planned (🔄)
- **Subscriptions**: Resource change notifications
- **Streaming**: Real-time content updates
- **Batch Operations**: Multiple operations in single request
- **Authentication**: API key and OAuth support

## Transport Layer

### WebSocket Implementation (✅)
**Library**: `ws` package v8.18.3
**Features**:
- Full-duplex communication
- Automatic reconnection with exponential backoff
- Connection timeout prevention
- URL validation (ws:// and wss://)
- Proper connection lifecycle management

**Connection Options**:
```typescript
interface ConnectionOptions {
  timeout: number;        // Connection timeout (default: 10s)
  retryAttempts: number;  // Max retry attempts (default: 3)
  retryDelay: number;     // Initial retry delay (default: 1s)
  maxRetryDelay: number;  // Maximum retry delay (default: 30s)
}
```

### STDIO Implementation (❌ Planned)
**Purpose**: Support for command-line MCP servers
**Features**:
- Child process spawning
- stdin/stdout stream handling
- Environment variable injection
- Working directory management
- Process lifecycle management

### HTTP/SSE Implementation (❌ Planned)
**Purpose**: Support for web-based MCP servers
**Features**:
- HTTP POST for requests
- Server-Sent Events for notifications
- Session management
- Connection pooling
- Authentication headers

## Configuration System

### File Format
**Primary**: Claude Desktop-compatible JSON
**Extensions**: WebSocket and HTTP server types
**Location**: `~/.mcp-config.json` (configurable)

### Configuration Schema
```json
{
  "mcpServers": {
    "server-name": {
      "command": "websocket|npx|node|python|...",
      "connectionType": "websocket|stdio|http",
      "url": "ws://localhost:3000",           // WebSocket only
      "args": ["--arg1", "value1"],          // STDIO only
      "env": {"KEY": "value"},               // STDIO only
      "cwd": "/path/to/working/dir",         // STDIO only
      "httpUrl": "https://api.example.com",  // HTTP only
      "enabled": true,
      "autoConnect": false
    }
  }
}
```

### Server Presets
Built-in configurations for common MCP servers:
- **AI Humanizer**: Text detection and humanization
- **Sequential Thinking**: Structured reasoning tools
- **Claude Code**: Code analysis and generation
- **Memory**: Knowledge graph and memory management
- **Obsidian MCP Tools**: Obsidian-specific integrations

## Error Handling

### Error Types
```typescript
interface MCPError {
  code: number;
  message: string;
  data?: any;
}

interface ConnectionStatus {
  status: 'disconnected' | 'connecting' | 'connected' | 'error';
  lastError?: string;
  retryAttempt?: number;
}
```

### Error Recovery Strategies
1. **Connection Errors**: Exponential backoff retry
2. **Request Timeouts**: Configurable timeout with user notification
3. **Protocol Errors**: Structured error display with suggestions
4. **Resource Errors**: Graceful degradation with error logging

### Error Boundaries
- **Transport Layer**: Connection and communication errors
- **Protocol Layer**: JSON-RPC and MCP protocol errors
- **UI Layer**: User interface and interaction errors
- **Configuration Layer**: Config file and validation errors

## Performance Considerations

### Memory Management
- **Request Cleanup**: Automatic cleanup of pending requests
- **Timeout Management**: Proper timeout cleanup to prevent leaks
- **Connection Pooling**: Planned for HTTP transport
- **Resource Caching**: Planned for frequently accessed resources

### Response Handling
- **Streaming**: Planned for large responses
- **Pagination**: Planned for large resource lists
- **Compression**: Planned for HTTP transport
- **Caching**: Planned for repeated requests

## Security Considerations

### Transport Security
- **TLS/SSL**: Support for secure WebSocket (wss://)
- **Certificate Validation**: Proper certificate chain validation
- **URL Validation**: Whitelist of allowed protocols and hosts

### Authentication
- **API Keys**: Planned support for API key authentication
- **OAuth**: Planned support for OAuth 2.0 flows
- **Token Management**: Secure token storage and refresh

### Data Protection
- **Sensitive Data**: No logging of sensitive information
- **Config Security**: Secure storage of authentication credentials
- **Process Isolation**: Sandboxed STDIO processes (planned)

## Extensibility

### Plugin Architecture
- **Transport Plugins**: Support for custom transport implementations
- **Protocol Extensions**: Support for custom MCP protocol extensions
- **UI Extensions**: Custom views and settings panels
- **Configuration Extensions**: Custom server types and presets

### Integration Points
- **Obsidian Plugins**: Integration with DataView, Templater, etc.
- **MCP Ecosystem**: Support for emerging MCP server implementations
- **Community Extensions**: Plugin marketplace compatibility

## Testing Strategy

### Unit Testing
- **Protocol Layer**: JSON-RPC implementation testing
- **Transport Layer**: WebSocket connection testing
- **Configuration Layer**: Config file parsing and validation
- **Error Handling**: Error condition simulation

### Integration Testing
- **MCP Server Compatibility**: Testing with various MCP implementations
- **Obsidian Integration**: Plugin lifecycle and API testing
- **Cross-platform Testing**: Windows, macOS, Linux compatibility

### Performance Testing
- **Connection Performance**: Latency and throughput testing
- **Memory Usage**: Memory leak detection and optimization
- **Concurrency**: Multi-server and multi-request testing

## Build System

### TypeScript Configuration
```json
{
  "compilerOptions": {
    "target": "ES2018",
    "module": "CommonJS",
    "lib": ["ES6", "DOM"],
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true
  }
}
```

### Build Pipeline
1. **TypeScript Compilation**: Source files to JavaScript
2. **Bundling**: esbuild for efficient bundling
3. **Source Maps**: Development debugging support
4. **Minification**: Production build optimization
5. **Asset Copying**: Static files (manifest.json, styles.css)

### Development Tools
- **Watch Mode**: `npm run dev` for development
- **Production Build**: `npm run build` for releases
- **Testing**: `npm test` for test suite (planned)
- **Linting**: ESLint for code quality

---

*Architecture documentation reflects the current implementation and planned enhancements as of July 2025.*