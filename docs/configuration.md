# Configuration

## Overview

The Obsidian MCP Client uses a Claude Desktop-compatible JSON configuration format with extensions to support WebSocket and HTTP server types. This document provides comprehensive guidance on configuring the plugin.

## Configuration File

### File Location
- **Default**: `~/.mcp-config.json`
- **Custom**: Configurable via plugin settings
- **Format**: JSON with Claude Desktop compatibility

### File Structure
```json
{
  "mcpServers": {
    "server-name": {
      "command": "connection-command",
      "connectionType": "websocket|stdio|http",
      "enabled": true,
      "autoConnect": false,
      // ... additional connection-specific options
    }
  }
}
```

## Server Configuration Types

### WebSocket Servers (✅ Supported)

WebSocket servers provide real-time, bidirectional communication over WebSocket protocol.

**Configuration**:
```json
{
  "mcpServers": {
    "websocket-server": {
      "command": "websocket",
      "connectionType": "websocket",
      "url": "ws://localhost:3000",
      "enabled": true,
      "autoConnect": false
    }
  }
}
```

**Parameters**:
- `command`: Must be `"websocket"`
- `connectionType`: Must be `"websocket"`
- `url`: WebSocket URL (ws:// or wss://)
- `enabled`: Whether server is available for connection
- `autoConnect`: Connect automatically when plugin loads

**URL Examples**:
- `ws://localhost:3000` - Local development server
- `wss://api.example.com/mcp` - Secure production server
- `ws://192.168.1.100:8080` - Network server

### STDIO Servers (❌ Not Yet Supported)

STDIO servers run as child processes and communicate via stdin/stdout.

**Configuration**:
```json
{
  "mcpServers": {
    "stdio-server": {
      "command": "npx",
      "args": ["-y", "mcp-server-package"],
      "connectionType": "stdio",
      "env": {
        "API_KEY": "your-api-key",
        "NODE_ENV": "production"
      },
      "cwd": "/path/to/working/directory",
      "enabled": true,
      "autoConnect": false
    }
  }
}
```

**Parameters**:
- `command`: Executable command (npx, node, python, etc.)
- `args`: Command-line arguments array
- `connectionType`: Must be `"stdio"`
- `env`: Environment variables object
- `cwd`: Working directory for the process
- `enabled`: Whether server is available for connection
- `autoConnect`: Connect automatically when plugin loads

**Common Commands**:
- `npx -y package-name` - NPM packages
- `node /path/to/server.js` - Node.js scripts
- `python /path/to/server.py` - Python scripts
- `docker run -i image-name` - Docker containers

### HTTP Servers (❌ Not Yet Supported)

HTTP servers provide request/response communication over HTTP with optional Server-Sent Events.

**Configuration**:
```json
{
  "mcpServers": {
    "http-server": {
      "command": "http",
      "connectionType": "http",
      "httpUrl": "https://api.example.com/mcp",
      "headers": {
        "Authorization": "Bearer your-token",
        "Content-Type": "application/json"
      },
      "enabled": true,
      "autoConnect": false
    }
  }
}
```

**Parameters**:
- `command`: Must be `"http"`
- `connectionType`: Must be `"http"`
- `httpUrl`: HTTP endpoint URL
- `headers`: HTTP headers object
- `enabled`: Whether server is available for connection
- `autoConnect`: Connect automatically when plugin loads

## Server Presets

The plugin includes built-in presets for popular MCP servers. These presets provide quick setup for common use cases.

### AI Humanizer
**Purpose**: Text detection and humanization
**Type**: STDIO (not yet supported)

```json
{
  "ai-humanizer": {
    "command": "npx",
    "args": ["-y", "ai-humanizer-mcp-server"],
    "connectionType": "stdio",
    "enabled": true,
    "autoConnect": false
  }
}
```

### Sequential Thinking
**Purpose**: Structured reasoning and problem-solving
**Type**: STDIO (not yet supported)

```json
{
  "sequential-thinking": {
    "command": "npx",
    "args": ["-y", "mcp-sequentialthinking-tools"],
    "connectionType": "stdio",
    "enabled": true,
    "autoConnect": false
  }
}
```

### Claude Code
**Purpose**: Code analysis and generation
**Type**: STDIO (not yet supported)

```json
{
  "claude-code": {
    "command": "npx",
    "args": ["-y", "claude-code-mcp-server"],
    "connectionType": "stdio",
    "enabled": true,
    "autoConnect": false
  }
}
```

### Memory (Docker)
**Purpose**: Knowledge graph and memory management
**Type**: STDIO (not yet supported)

```json
{
  "memory": {
    "command": "docker",
    "args": ["run", "-i", "memory-mcp-server"],
    "connectionType": "stdio",
    "enabled": true,
    "autoConnect": false
  }
}
```

### Obsidian MCP Tools
**Purpose**: Obsidian-specific integrations
**Type**: STDIO (not yet supported)

```json
{
  "obsidian-tools": {
    "command": "npx",
    "args": ["-y", "obsidian-mcp-tools"],
    "connectionType": "stdio",
    "enabled": true,
    "autoConnect": false
  }
}
```

## Plugin Settings

### Configuration File Settings

#### Config File Path
- **Default**: `~/.mcp-config.json`
- **Purpose**: Location of the main configuration file
- **Format**: Absolute file path
- **Example**: `/Users/username/.mcp-config.json`

#### Auto-load Configuration
- **Default**: `true`
- **Purpose**: Automatically load configuration file on plugin start
- **Note**: Manual reload available via settings interface

### Connection Settings

#### Global Connection Timeout
- **Default**: `10000` (10 seconds)
- **Purpose**: Maximum time to wait for connection establishment
- **Units**: Milliseconds
- **Range**: 1000-60000 (1-60 seconds)

#### Global Request Timeout
- **Default**: `30000` (30 seconds)
- **Purpose**: Maximum time to wait for request response
- **Units**: Milliseconds
- **Range**: 5000-300000 (5-300 seconds)

#### Retry Settings
- **Max Retry Attempts**: Default `3`
- **Initial Retry Delay**: Default `1000ms`
- **Max Retry Delay**: Default `30000ms`
- **Backoff Strategy**: Exponential backoff

## Configuration Examples

### Development Setup
```json
{
  "mcpServers": {
    "test-server": {
      "command": "websocket",
      "connectionType": "websocket",
      "url": "ws://localhost:3000",
      "enabled": true,
      "autoConnect": true
    },
    "local-api": {
      "command": "websocket",
      "connectionType": "websocket",
      "url": "ws://localhost:8080",
      "enabled": true,
      "autoConnect": false
    }
  }
}
```

### Production Setup
```json
{
  "mcpServers": {
    "knowledge-base": {
      "command": "websocket",
      "connectionType": "websocket",
      "url": "wss://api.company.com/mcp",
      "enabled": true,
      "autoConnect": true
    },
    "ai-tools": {
      "command": "npx",
      "args": ["-y", "ai-humanizer-mcp-server"],
      "connectionType": "stdio",
      "env": {
        "API_KEY": "prod-key-here"
      },
      "enabled": true,
      "autoConnect": false
    }
  }
}
```

### Multi-Environment Setup
```json
{
  "mcpServers": {
    "dev-server": {
      "command": "websocket",
      "connectionType": "websocket",
      "url": "ws://localhost:3000",
      "enabled": true,
      "autoConnect": false
    },
    "staging-server": {
      "command": "websocket",
      "connectionType": "websocket",
      "url": "wss://staging.api.com/mcp",
      "enabled": false,
      "autoConnect": false
    },
    "prod-server": {
      "command": "websocket",
      "connectionType": "websocket",
      "url": "wss://api.company.com/mcp",
      "enabled": false,
      "autoConnect": false
    }
  }
}
```

## Configuration Management

### File Synchronization
- **Automatic Sync**: Configuration file automatically synchronized with plugin settings
- **Conflict Resolution**: Plugin settings take precedence over file settings
- **Backup**: Original configuration file backed up before modifications

### Validation
- **JSON Validation**: Configuration file validated for proper JSON syntax
- **Schema Validation**: Server configurations validated against expected schema
- **URL Validation**: WebSocket URLs validated for proper format
- **Error Reporting**: Detailed error messages for configuration issues

### Migration
- **Format Migration**: Automatic migration from older configuration formats
- **Compatibility**: Maintains compatibility with Claude Desktop configurations
- **Backup Creation**: Automatic backup before migration

## Environment Variables

### Configuration File Path
```bash
# Override default config file location
export MCP_CONFIG_PATH="/custom/path/to/config.json"
```

### Debug Mode
```bash
# Enable debug logging
export MCP_DEBUG=true
```

### Connection Timeouts
```bash
# Override default connection timeout
export MCP_CONNECTION_TIMEOUT=15000

# Override default request timeout
export MCP_REQUEST_TIMEOUT=45000
```

## Advanced Configuration

### Connection Pooling (Planned)
```json
{
  "mcpServers": {
    "pooled-server": {
      "command": "websocket",
      "connectionType": "websocket",
      "url": "ws://localhost:3000",
      "pool": {
        "maxConnections": 5,
        "keepAlive": true,
        "maxIdleTime": 300000
      }
    }
  }
}
```

### Authentication (Planned)
```json
{
  "mcpServers": {
    "auth-server": {
      "command": "websocket",
      "connectionType": "websocket",
      "url": "wss://api.example.com/mcp",
      "auth": {
        "type": "bearer",
        "token": "your-token-here"
      }
    }
  }
}
```

### TLS Configuration (Planned)
```json
{
  "mcpServers": {
    "secure-server": {
      "command": "websocket",
      "connectionType": "websocket",
      "url": "wss://api.example.com/mcp",
      "tls": {
        "rejectUnauthorized": true,
        "ca": "/path/to/ca.pem",
        "cert": "/path/to/cert.pem",
        "key": "/path/to/key.pem"
      }
    }
  }
}
```

## Troubleshooting

### Common Issues

#### Configuration File Not Found
**Error**: `Config file not found at path`
**Solution**: Check file path and permissions, create file if needed

#### Invalid JSON Syntax
**Error**: `Invalid JSON in configuration file`
**Solution**: Validate JSON syntax using online validator or IDE

#### Invalid Server Configuration
**Error**: `Invalid server configuration for 'server-name'`
**Solution**: Check required fields and value types

#### Connection Failures
**Error**: `Failed to connect to server`
**Solution**: Verify server URL, check network connectivity, confirm server is running

### Validation Commands

#### Check Configuration
```bash
# Validate configuration file
npm run validate-config
```

#### Test Connection
```bash
# Test WebSocket connection
npm run test-connection ws://localhost:3000
```

## Best Practices

### Security
- **Secure URLs**: Use `wss://` for production servers
- **Credential Management**: Store API keys securely
- **Network Security**: Use VPN for internal servers
- **Regular Updates**: Keep server credentials updated

### Performance
- **Selective Connections**: Only enable servers you actively use
- **Connection Limits**: Avoid too many simultaneous connections
- **Resource Management**: Monitor memory usage
- **Timeout Configuration**: Adjust timeouts based on server performance

### Organization
- **Descriptive Names**: Use clear, descriptive server names
- **Environment Separation**: Separate dev/staging/prod configurations
- **Documentation**: Document server purposes and configurations
- **Version Control**: Track configuration changes

---

*Configuration guide for plugin version as of July 2025.*