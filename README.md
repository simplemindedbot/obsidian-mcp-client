# Obsidian MCP Client Plugin - POC

A proof-of-concept Obsidian plugin that enables connection to Model Context Protocol (MCP) servers.

## Features

- Connect to MCP servers via WebSockets
- Browse available resources and tools
- Execute MCP tools from within Obsidian
- Read MCP resources
- Simple UI integrated into Obsidian's interface

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Build the plugin:**
   ```bash
   npm run build
   ```

3. **Install in Obsidian:**
   - Copy the built files (`main.js`, `manifest.json`, `styles.css`) to your Obsidian vault's `.obsidian/plugins/mcp-client/` directory
   - Enable the plugin in Obsidian's settings

## Testing

To test this plugin, you'll need an MCP server running. Here's a simple test server:

### Quick Test Server (Node.js)

Create a simple MCP server for testing:

```javascript
// test-mcp-server.js
const WebSocket = require('ws');

const server = new WebSocket.Server({ port: 3000 });

server.on('connection', (ws) => {
  console.log('MCP Client connected');
  
  ws.on('message', (data) => {
    const message = JSON.parse(data.toString());
    console.log('Received:', message);
    
    // Handle initialize
    if (message.method === 'initialize') {
      ws.send(JSON.stringify({
        jsonrpc: '2.0',
        id: message.id,
        result: {
          protocolVersion: '2024-11-05',
          capabilities: {
            resources: { subscribe: true, listChanged: true },
            tools: { listChanged: true }
          },
          serverInfo: {
            name: 'Test MCP Server',
            version: '1.0.0'
          }
        }
      }));
    }
    
    // Handle resources/list
    else if (message.method === 'resources/list') {
      ws.send(JSON.stringify({
        jsonrpc: '2.0',
        id: message.id,
        result: {
          resources: [
            {
              uri: 'test://example',
              name: 'Example Resource',
              description: 'A test resource',
              mimeType: 'text/plain'
            }
          ]
        }
      }));
    }
    
    // Handle tools/list
    else if (message.method === 'tools/list') {
      ws.send(JSON.stringify({
        jsonrpc: '2.0',
        id: message.id,
        result: {
          tools: [
            {
              name: 'echo',
              description: 'Echo back the input',
              inputSchema: {
                type: 'object',
                properties: {
                  text: { type: 'string' }
                }
              }
            }
          ]
        }
      }));
    }
    
    // Handle tool calls
    else if (message.method === 'tools/call') {
      ws.send(JSON.stringify({
        jsonrpc: '2.0',
        id: message.id,
        result: {
          content: [
            {
              type: 'text',
              text: `Echo: ${JSON.stringify(message.params)}`
            }
          ]
        }
      }));
    }
  });
});

console.log('Test MCP server running on ws://localhost:3000');
```

Run with: `node test-mcp-server.js`

## Usage

1. Open Obsidian
2. Click the network icon in the ribbon or use "MCP Client: Connect to MCP Server" command
3. Configure server URL in settings (default: `ws://localhost:3000`)
4. Click "Connect" in the MCP Client panel
5. Browse resources and tools
6. Click "Read" on resources or "Call" on tools to test functionality

## Architecture

- **MCPClient**: Core WebSocket-based JSON-RPC client
- **MCPView**: Obsidian UI component for interacting with MCP servers
- **Settings**: Configuration for server connection

## Next Steps

- Add authentication support
- Implement resource caching
- Create better UI for tool parameters
- Add support for different transport protocols
- Resource integration with Obsidian notes