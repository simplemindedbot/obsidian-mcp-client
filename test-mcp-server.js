const WebSocket = require('ws');

const server = new WebSocket.Server({ port: 3000 });

console.log('🚀 Test MCP Server starting on ws://localhost:3000');

server.on('connection', (ws) => {
  console.log('🔗 MCP Client connected');
  
  ws.on('message', (data) => {
    const message = JSON.parse(data.toString());
    console.log('📨 Received:', message.method, message.id);
    
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
      console.log('✅ Initialized');
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
              description: 'A test resource for POC',
              mimeType: 'text/plain'
            },
            {
              uri: 'test://data',
              name: 'Sample Data',
              description: 'Some sample JSON data',
              mimeType: 'application/json'
            }
          ]
        }
      }));
      console.log('📋 Listed resources');
    }
    
    // Handle resources/read
    else if (message.method === 'resources/read') {
      const uri = message.params?.uri;
      let content = 'Unknown resource';
      
      if (uri === 'test://example') {
        content = 'Hello from MCP! This is a test resource.';
      } else if (uri === 'test://data') {
        content = JSON.stringify({
          message: 'Hello from MCP',
          timestamp: new Date().toISOString(),
          data: [1, 2, 3, 4, 5]
        }, null, 2);
      }
      
      ws.send(JSON.stringify({
        jsonrpc: '2.0',
        id: message.id,
        result: {
          contents: [
            {
              uri: uri,
              mimeType: uri === 'test://data' ? 'application/json' : 'text/plain',
              text: content
            }
          ]
        }
      }));
      console.log('📖 Read resource:', uri);
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
              description: 'Echo back the input text',
              inputSchema: {
                type: 'object',
                properties: {
                  text: { 
                    type: 'string',
                    description: 'Text to echo back'
                  }
                },
                required: ['text']
              }
            },
            {
              name: 'timestamp',
              description: 'Get current timestamp',
              inputSchema: {
                type: 'object',
                properties: {}
              }
            },
            {
              name: 'calculate',
              description: 'Simple calculator',
              inputSchema: {
                type: 'object',
                properties: {
                  expression: {
                    type: 'string',
                    description: 'Mathematical expression to evaluate'
                  }
                },
                required: ['expression']
              }
            }
          ]
        }
      }));
      console.log('🔧 Listed tools');
    }
    
    // Handle tool calls
    else if (message.method === 'tools/call') {
      const toolName = message.params?.name;
      const args = message.params?.arguments || {};
      
      let result = 'Unknown tool';
      
      if (toolName === 'echo') {
        result = `Echo: ${args.text || 'No text provided'}`;
      } else if (toolName === 'timestamp') {
        result = `Current timestamp: ${new Date().toISOString()}`;
      } else if (toolName === 'calculate') {
        try {
          // Simple eval - don't do this in production!
          const safeExpr = args.expression?.replace(/[^0-9+\-*/().\s]/g, '');
          const calculated = eval(safeExpr);
          result = `${args.expression} = ${calculated}`;
        } catch (error) {
          result = `Error calculating: ${error.message}`;
        }
      }
      
      ws.send(JSON.stringify({
        jsonrpc: '2.0',
        id: message.id,
        result: {
          content: [
            {
              type: 'text',
              text: result
            }
          ]
        }
      }));
      console.log('⚡ Called tool:', toolName);
    }
    
    // Handle unknown methods
    else {
      ws.send(JSON.stringify({
        jsonrpc: '2.0',
        id: message.id,
        error: {
          code: -32601,
          message: 'Method not found',
          data: { method: message.method }
        }
      }));
      console.log('❌ Unknown method:', message.method);
    }
  });
  
  ws.on('close', () => {
    console.log('🔌 Client disconnected');
  });
  
  ws.on('error', (error) => {
    console.error('💥 WebSocket error:', error);
  });
});

server.on('error', (error) => {
  console.error('💥 Server error:', error);
});

console.log('📡 Ready to accept MCP connections...');