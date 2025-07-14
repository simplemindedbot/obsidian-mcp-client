# User Guide

## Getting Started

### Prerequisites
- **Obsidian Desktop**: Version 0.15.0 or higher (mobile not supported)
- **MCP Server**: At least one MCP server to connect to (WebSocket-based)
- **Basic Knowledge**: Familiarity with Obsidian and JSON configuration

### Installation

#### Option 1: Development Installation (Recommended)
1. **Clone the repository**:
   ```bash
   git clone https://github.com/simplemindedbot/obsidian-mcp-client.git
   cd obsidian-mcp-client
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Build the plugin**:
   ```bash
   npm run build
   ```

4. **Copy to Obsidian**:
   Copy `main.js`, `manifest.json`, and `styles.css` to your vault's plugins directory:
   ```
   /path/to/your/vault/.obsidian/plugins/obsidian-mcp-client/
   ```

5. **Enable the plugin**:
   - Open Obsidian Settings
   - Go to Community Plugins
   - Find "MCP Client" and enable it

#### Option 2: Manual Installation
1. Download the latest release from GitHub
2. Extract to your vault's plugins directory
3. Enable in Obsidian settings

### First-Time Setup

1. **Access Settings**:
   - Open Obsidian Settings
   - Navigate to Community Plugins → MCP Client
   - Or use the ribbon icon and click "Settings"

2. **Configure Config File Path**:
   - Default: `~/.mcp-config.json`
   - Or specify a custom path

3. **Add Your First Server**:
   - Click "Add Server"
   - Choose a preset or configure manually
   - Enable the server and optionally set auto-connect

## Configuration

### Config File Format

The plugin uses a Claude Desktop-compatible JSON configuration format with extensions for WebSocket and HTTP servers.

**Basic Structure**:
```json
{
  "mcpServers": {
    "server-name": {
      "command": "websocket",
      "connectionType": "websocket",
      "url": "ws://localhost:3000",
      "enabled": true,
      "autoConnect": false
    }
  }
}
```

### Server Types

#### WebSocket Servers (✅ Supported)
```json
{
  "test-websocket": {
    "command": "websocket",
    "connectionType": "websocket",
    "url": "ws://localhost:3000",
    "enabled": true,
    "autoConnect": false
  }
}
```

#### STDIO Servers (❌ Not Yet Supported)
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

#### HTTP Servers (❌ Not Yet Supported)
```json
{
  "web-server": {
    "command": "http",
    "connectionType": "http",
    "httpUrl": "https://api.example.com/mcp",
    "enabled": true,
    "autoConnect": false
  }
}
```

### Server Presets

The plugin includes built-in presets for common MCP servers:

#### AI Humanizer
- **Purpose**: Text detection and humanization
- **Type**: STDIO (not yet supported)
- **Configuration**: Automatically configured when preset is selected

#### Sequential Thinking
- **Purpose**: Structured reasoning and problem-solving
- **Type**: STDIO (not yet supported)
- **Configuration**: Automatically configured when preset is selected

#### Claude Code
- **Purpose**: Code analysis and generation
- **Type**: STDIO (not yet supported)
- **Configuration**: Automatically configured when preset is selected

#### Memory (Docker)
- **Purpose**: Knowledge graph and memory management
- **Type**: STDIO (not yet supported)
- **Configuration**: Requires Docker to be installed

#### Obsidian MCP Tools
- **Purpose**: Obsidian-specific integrations
- **Type**: STDIO (not yet supported)
- **Configuration**: Automatically configured when preset is selected

### Settings Interface

#### Server Management
- **Add Server**: Create new server configurations
- **Edit Server**: Modify existing server settings
- **Delete Server**: Remove server configurations
- **Enable/Disable**: Toggle server availability
- **Auto-connect**: Automatically connect when plugin loads

#### Connection Settings
- **Config File Path**: Location of your MCP configuration file
- **Default Settings**: Global connection timeout and retry settings
- **Status Display**: Real-time connection status for all servers

## Using the Plugin

### Accessing the MCP Client

1. **Ribbon Icon**: Click the MCP icon in the ribbon
2. **Command Palette**: Use "MCP Client: Open" command
3. **Settings**: Access via the settings panel

### Main Interface

The MCP Client view displays:
- **Server Status**: Connection status for each configured server
- **Global Controls**: Connect/disconnect all servers
- **Server List**: Individual server controls and information
- **Resources**: Available resources from connected servers
- **Tools**: Available tools from connected servers

### Connecting to Servers

#### Manual Connection
1. Click "Connect" next to a specific server
2. Or use "Connect All" to connect to all enabled servers
3. Monitor connection status in real-time

#### Auto-Connect
1. Enable "Auto Connect" in server settings
2. Plugin will automatically connect when loaded
3. Automatic reconnection on connection loss

### Working with Resources

#### Browsing Resources
1. **Connect to Server**: Ensure server is connected
2. **View Resources**: Resources appear in the MCP Client panel
3. **Resource Details**: Click to view resource information

#### Reading Resources
1. **Read Button**: Click "Read" to view resource content in console
2. **Content Display**: Resource content appears in Obsidian console
3. **Error Handling**: Error messages appear if resource unavailable

#### Inserting Resources
1. **Insert Button**: Click "Insert" to add content to document
2. **Cursor Position**: Content inserted at current cursor position
3. **New File**: Creates new file if no active editor
4. **Formatting**: Content automatically formatted for readability

### Working with Tools

#### Discovering Tools
1. **Connect to Server**: Ensure server is connected
2. **View Tools**: Tools appear in the MCP Client panel
3. **Tool Information**: View tool names and descriptions

#### Executing Tools
1. **Call Button**: Click "Call" to execute tool
2. **Parameters**: Currently called with empty parameters only
3. **Output Display**: Tool output appears in console
4. **Error Handling**: Error messages for failed executions

#### Inserting Tool Output
1. **Insert Button**: Click "Insert" to add output to document
2. **Formatted Output**: Tool results formatted for readability
3. **Document Integration**: Seamlessly integrates with your notes

### Document Integration

#### Insertion Behavior
- **Active Editor**: Content inserted at cursor position
- **No Active Editor**: New file created with content
- **Selection**: Content replaces selected text
- **Formatting**: Automatic formatting based on content type

#### Content Types
- **Text**: Plain text insertion
- **JSON**: Formatted JSON with syntax highlighting
- **Code**: Code blocks with appropriate language tags
- **Tables**: Markdown table formatting
- **Lists**: Bulleted or numbered lists

### Status and Feedback

#### Connection Status
- **Connected**: Green indicator, full functionality
- **Connecting**: Yellow indicator, connection in progress
- **Disconnected**: Red indicator, no connection
- **Error**: Red indicator with error message

#### Error Messages
- **Connection Errors**: Network or server issues
- **Protocol Errors**: MCP protocol violations
- **Resource Errors**: Missing or invalid resources
- **Tool Errors**: Tool execution failures

#### Retry Behavior
- **Automatic Retry**: Exponential backoff for connection failures
- **Manual Retry**: "Retry" button for manual reconnection
- **Max Attempts**: Configurable maximum retry attempts
- **Timeout**: Configurable connection and request timeouts

## Common Workflows

### Research and Note-Taking

1. **Setup**: Configure servers for your research domains
2. **Connect**: Auto-connect to relevant servers
3. **Browse**: Explore available resources and tools
4. **Insert**: Add relevant content to your notes
5. **Organize**: Use Obsidian's linking and tagging features

### Content Creation

1. **Template Server**: Connect to template-providing MCP server
2. **Generate Content**: Use tools to generate content
3. **Insert and Edit**: Add generated content to your documents
4. **Refine**: Edit and structure content as needed

### Data Analysis

1. **Data Server**: Connect to data-providing MCP server
2. **Query Data**: Use tools to query and analyze data
3. **Insert Results**: Add analysis results to your notes
4. **Visualize**: Use additional tools for data visualization

### Development Workflow

1. **Code Server**: Connect to code analysis MCP server
2. **Analyze Code**: Use tools to analyze codebases
3. **Generate Documentation**: Create documentation from analysis
4. **Track Changes**: Monitor code changes and updates

## Tips and Best Practices

### Performance Optimization
- **Selective Connections**: Only connect to servers you actively use
- **Connection Pooling**: Reuse connections when possible
- **Resource Caching**: Cache frequently accessed resources
- **Timeout Configuration**: Adjust timeouts based on server response times

### Organization
- **Server Naming**: Use descriptive names for servers
- **Grouping**: Group related servers together
- **Documentation**: Document server purposes and configurations
- **Backup**: Backup your configuration file regularly

### Security
- **Trusted Sources**: Only connect to trusted MCP servers
- **Network Security**: Use secure connections (wss://) when possible
- **Credential Management**: Store credentials securely
- **Access Control**: Limit server access to necessary resources

### Troubleshooting
- **Check Logs**: Review Obsidian console for error messages
- **Test Connections**: Use simple servers for connection testing
- **Configuration Validation**: Validate JSON configuration syntax
- **Version Compatibility**: Ensure server and plugin compatibility

## Limitations and Workarounds

### Current Limitations

#### Transport Support
- **STDIO**: Not yet implemented - blocks most Claude Desktop configs
- **HTTP/SSE**: Not yet implemented - blocks web-based servers
- **Workaround**: Use WebSocket-based MCP servers only

#### Tool Parameters
- **No Parameters**: Tools called with empty parameters only
- **Workaround**: Use tools that don't require parameters

#### Authentication
- **No Auth**: No support for API keys or OAuth
- **Workaround**: Use unauthenticated servers or local servers

#### Performance
- **No Caching**: No response caching or connection pooling
- **Workaround**: Minimize redundant requests

### Future Enhancements
See [TODO.md](../TODO.md) for planned improvements and timelines.

---

*User guide updated for plugin version as of July 2025.*