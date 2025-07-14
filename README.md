# Obsidian MCP Client

**⚠️ WORK IN PROGRESS - PROOF OF CONCEPT ⚠️**

This is an experimental Obsidian plugin that implements a Model Context Protocol (MCP) client, allowing Obsidian to connect to MCP servers and insert their content/tool outputs directly into your documents.

## 🚧 Current Status

### ✅ What's Working

- **WebSocket Connections**: Full support for WebSocket-based MCP servers
- **Resource Reading**: Browse and read MCP resources, insert content into active documents
- **Tool Execution**: Execute MCP tools and insert their output into documents
- **JSON Configuration**: Claude Desktop-compatible config file format
- **Multi-Server Support**: Connect to multiple MCP servers simultaneously
- **Rich UI**: Intuitive settings interface with server management
- **Document Integration**: Smart insertion at cursor position with fallback to new files
- **Connection Management**: Automatic retry logic, connection status indicators
- **Preset Configurations**: Quick setup for common MCP servers

### ❌ What's Not Working (Yet)

- **STDIO Connections**: Command-based MCP servers (npx, docker, etc.) - UI ready but not implemented
- **HTTP/SSE Transport**: HTTP-based MCP servers with Server-Sent Events
- **Process Management**: No subprocess spawning for local MCP servers
- **Advanced Tool Parameters**: Tools are called with empty parameters only
- **Streaming Responses**: No support for real-time streaming content
- **Error Recovery**: Basic error handling, could be more robust

### 🔄 Partially Working

- **Config File Support**: JSON config works but only STDIO servers are saved (WebSocket/HTTP are Obsidian-specific)
- **Content Formatting**: Basic formatting works but complex objects may not render perfectly

## 📋 Requirements

- Obsidian desktop app (requires Node.js APIs)
- MCP server(s) to connect to
- Basic understanding of MCP protocol

## 🚀 Installation

### Development Installation

1. Clone this repository to your Obsidian plugins directory:
   ```bash
   git clone https://github.com/scotcampbell/obsidian-mcp-client.git
   cd obsidian-mcp-client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the plugin:
   ```bash
   npm run build
   ```

4. Copy the built files to your Obsidian vault:
   ```bash
   # Copy main.js, manifest.json, and styles.css to:
   # /path/to/your/vault/.obsidian/plugins/obsidian-mcp-client/
   ```

5. Enable the plugin in Obsidian Settings → Community Plugins

## 🔧 Configuration

### Config File Location

The plugin uses a JSON configuration file compatible with Claude Desktop's format. Default location: `~/.mcp-config.json`

### Example Configuration

```json
{
  "mcpServers": {
    "test-websocket": {
      "command": "websocket",
      "connectionType": "websocket", 
      "url": "ws://localhost:3000",
      "enabled": true,
      "autoConnect": false
    },
    "ai-humanizer": {
      "command": "npx",
      "args": ["-y", "ai-humanizer-mcp-server"],
      "connectionType": "stdio",
      "enabled": true,
      "autoConnect": false
    }
  }
}
```

### Settings UI

1. Open Obsidian Settings
2. Go to Community Plugins → MCP Client
3. Configure your config file path
4. Add servers using the UI or preset configurations
5. Enable/disable servers as needed

## 📚 Usage

### Connecting to Servers

1. Configure your MCP servers in settings
2. Use the MCP Client panel (ribbon icon or command palette)
3. Click "Connect" for individual servers or "Connect All"

### Using Resources

1. Browse available resources in the MCP Client panel
2. Click "Read" to view content in console
3. Click "Insert" to add formatted content to your active document

### Using Tools

1. View available tools in the MCP Client panel
2. Click "Call" to execute with empty parameters
3. Click "Insert" to add tool output to your document

## 🧪 Testing

### Test Server

The repository includes a test WebSocket MCP server:

```bash
node test-mcp-server.js
```

This runs a server on `ws://localhost:3000` with sample resources and tools.

## 🛠️ Development

### Commands

- `npm run dev` - Development build with watch mode
- `npm run build` - Production build with TypeScript checking
- `npm install` - Install dependencies

### Architecture

- **MCPClient** (`mcp-client.ts`) - WebSocket-based JSON-RPC client
- **MCPClientPlugin** (`main.ts`) - Main plugin class with settings and commands
- **MCPView** - UI component for server interaction
- **MCPSettingTab** - Configuration interface

### Key Features

- JSON-RPC 2.0 protocol implementation
- WebSocket connection management with retry logic
- Obsidian ItemView for custom UI panels
- Claude Desktop-compatible configuration format

## 🚨 Known Issues

1. **STDIO servers show "not yet implemented" error**
2. **Complex tool parameters not supported**
3. **No input validation for tool arguments**
4. **Limited error reporting in UI**
5. **No authentication support**

## 🔮 Planned Features

- Full STDIO connection support
- HTTP/SSE transport implementation
- Advanced tool parameter handling
- Streaming response support
- Better error handling and recovery
- Authentication mechanisms
- Performance optimizations

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 Contributing

This is a proof of concept and contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## ⚠️ Disclaimer

This is experimental software. Use at your own risk. The MCP protocol is still evolving, and this implementation may not be compatible with all MCP servers or future protocol versions.

## 🔗 Related Projects

- [Model Context Protocol](https://modelcontextprotocol.io/) - Official MCP documentation
- [Claude Desktop](https://claude.ai/download) - Reference MCP client implementation
- [MCP Servers](https://github.com/modelcontextprotocol/servers) - Official MCP server implementations

## 💬 Support

For issues, questions, or contributions, please use the GitHub issue tracker.