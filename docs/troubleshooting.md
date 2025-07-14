# Troubleshooting

## Common Issues and Solutions

### Connection Issues

#### WebSocket Connection Failed
**Symptoms**:
- Server status shows "Error" or "Disconnected"
- Error message: "Failed to connect to WebSocket server"
- Red connection indicator in UI

**Common Causes**:
1. **Server Not Running**: MCP server is not started
2. **Wrong URL**: Incorrect WebSocket URL format
3. **Network Issues**: Firewall or network connectivity problems
4. **Port Conflicts**: Port already in use by another application

**Solutions**:
1. **Verify Server Status**:
   ```bash
   # Check if test server is running
   node test-mcp-server.js
   # Should show: "MCP server running on ws://localhost:3000"
   ```

2. **Check URL Format**:
   ```json
   // Correct formats
   "url": "ws://localhost:3000"
   "url": "wss://api.example.com/mcp"
   
   // Incorrect formats
   "url": "http://localhost:3000"     // Wrong protocol
   "url": "localhost:3000"           // Missing protocol
   "url": "ws://localhost:3000/"     // Trailing slash may cause issues
   ```

3. **Test Network Connectivity**:
   ```bash
   # Test basic connectivity
   curl -I http://localhost:3000
   
   # Test WebSocket connection
   npx wscat -c ws://localhost:3000
   ```

4. **Check Firewall Settings**:
   - Ensure port is not blocked by firewall
   - Add exception for Obsidian if needed
   - Check corporate network restrictions

#### Connection Timeout
**Symptoms**:
- Connection attempt hangs indefinitely
- Error message: "Connection timeout"
- Yellow "Connecting" indicator persists

**Solutions**:
1. **Adjust Timeout Settings**:
   ```json
   // In plugin settings or config file
   "connectionTimeout": 15000,  // 15 seconds
   "requestTimeout": 45000      // 45 seconds
   ```

2. **Check Server Response Time**:
   ```bash
   # Test server response time
   time curl -I http://localhost:3000
   ```

3. **Reduce Concurrent Connections**:
   - Disconnect unused servers
   - Avoid connecting to all servers simultaneously

#### Frequent Disconnections
**Symptoms**:
- Connection drops repeatedly
- Automatic reconnection attempts
- Unstable connection status

**Solutions**:
1. **Check Server Stability**:
   - Review server logs for errors
   - Ensure server can handle persistent connections
   - Check for memory leaks in server

2. **Adjust Retry Settings**:
   ```json
   "retryAttempts": 5,
   "retryDelay": 2000,
   "maxRetryDelay": 60000
   ```

3. **Network Stability**:
   - Check for intermittent network issues
   - Use wired connection if possible
   - Check for VPN disconnections

### Configuration Issues

#### Config File Not Found
**Symptoms**:
- Error: "Config file not found at path"
- Settings interface shows empty server list
- Unable to load server configurations

**Solutions**:
1. **Check File Path**:
   ```bash
   # Verify default location
   ls -la ~/.mcp-config.json
   
   # Check custom path
   ls -la /path/to/your/config.json
   ```

2. **Create Default Config**:
   ```json
   {
     "mcpServers": {}
   }
   ```

3. **Fix Permissions**:
   ```bash
   # Make file readable
   chmod 644 ~/.mcp-config.json
   
   # Fix directory permissions
   chmod 755 ~/.
   ```

#### Invalid JSON Syntax
**Symptoms**:
- Error: "Invalid JSON in configuration file"
- Configuration fails to load
- Plugin shows error on startup

**Solutions**:
1. **Validate JSON**:
   ```bash
   # Use built-in JSON validator
   python -m json.tool ~/.mcp-config.json
   
   # Or use online JSON validator
   ```

2. **Common JSON Errors**:
   ```json
   // Missing comma
   {
     "mcpServers": {
       "server1": { "enabled": true }
       "server2": { "enabled": false }  // Missing comma above
     }
   }
   
   // Trailing comma
   {
     "mcpServers": {
       "server1": { "enabled": true }, // Trailing comma
     }
   }
   
   // Unescaped quotes
   {
     "description": "This is "quoted" text"  // Should be \"quoted\"
   }
   ```

3. **Use JSON Formatter**:
   - Use VS Code or other editor with JSON validation
   - Online JSON formatters and validators
   - Command-line tools like `jq`

#### Server Configuration Invalid
**Symptoms**:
- Error: "Invalid server configuration"
- Server appears in list but won't connect
- Missing required fields warning

**Solutions**:
1. **Check Required Fields**:
   ```json
   // WebSocket server minimum requirements
   {
     "server-name": {
       "command": "websocket",
       "connectionType": "websocket",
       "url": "ws://localhost:3000",
       "enabled": true,
       "autoConnect": false
     }
   }
   ```

2. **Validate Field Types**:
   ```json
   // Correct types
   {
     "enabled": true,           // Boolean, not string
     "autoConnect": false,      // Boolean, not string
     "url": "ws://localhost:3000" // String with valid URL
   }
   ```

3. **Check Connection Type**:
   ```json
   // Supported connection types
   "connectionType": "websocket"  // ✅ Supported
   "connectionType": "stdio"      // ❌ Not yet supported
   "connectionType": "http"       // ❌ Not yet supported
   ```

### Protocol Issues

#### JSON-RPC Errors
**Symptoms**:
- Error codes like -32600, -32601, -32602
- Method not found errors
- Invalid parameters errors

**Solutions**:
1. **Check Protocol Version**:
   ```json
   // Ensure server supports MCP protocol version 2024-11-05
   ```

2. **Verify Server Compliance**:
   ```bash
   # Test server with simple JSON-RPC request
   echo '{"jsonrpc":"2.0","id":"1","method":"initialize","params":{}}' | \
   npx wscat -c ws://localhost:3000
   ```

3. **Review Server Documentation**:
   - Check supported methods
   - Verify parameter formats
   - Ensure proper MCP implementation

#### Initialize Handshake Failed
**Symptoms**:
- Connection established but initialization fails
- Error: "Handshake failed"
- Server capabilities not received

**Solutions**:
1. **Check Server Implementation**:
   ```javascript
   // Server should respond to initialize method
   {
     "jsonrpc": "2.0",
     "id": "request-id",
     "result": {
       "protocolVersion": "2024-11-05",
       "capabilities": {...},
       "serverInfo": {...}
     }
   }
   ```

2. **Verify Protocol Version**:
   - Ensure server supports protocol version 2024-11-05
   - Check for version compatibility issues

3. **Check Server Logs**:
   - Review server logs for initialization errors
   - Look for capability negotiation issues

### Resource and Tool Issues

#### Resources Not Loading
**Symptoms**:
- Empty resource list
- Error: "Failed to list resources"
- Resources show but can't be read

**Solutions**:
1. **Check Server Implementation**:
   ```bash
   # Test resources/list method
   echo '{"jsonrpc":"2.0","id":"1","method":"resources/list","params":{}}' | \
   npx wscat -c ws://localhost:3000
   ```

2. **Verify Server Capabilities**:
   ```json
   // Server should advertise resource capabilities
   {
     "capabilities": {
       "resources": {
         "subscribe": false,
         "listChanged": true
       }
     }
   }
   ```

3. **Check Resource URIs**:
   ```json
   // Valid resource format
   {
     "uri": "resource://server/path/to/resource",
     "name": "Resource Name",
     "description": "Resource description"
   }
   ```

#### Tool Execution Failed
**Symptoms**:
- Error: "Tool execution failed"
- Tools show but don't execute
- Empty tool results

**Solutions**:
1. **Check Tool Implementation**:
   ```bash
   # Test tools/call method
   echo '{"jsonrpc":"2.0","id":"1","method":"tools/call","params":{"name":"tool-name","arguments":{}}}' | \
   npx wscat -c ws://localhost:3000
   ```

2. **Verify Tool Parameters**:
   ```json
   // Current limitation: only empty parameters supported
   {
     "name": "tool-name",
     "arguments": {}  // Must be empty object
   }
   ```

3. **Check Tool Capabilities**:
   ```json
   // Server should advertise tool capabilities
   {
     "capabilities": {
       "tools": {
         "listChanged": true
       }
     }
   }
   ```

### UI Issues

#### MCP Panel Not Visible
**Symptoms**:
- MCP Client ribbon icon missing
- Cannot open MCP panel
- Plugin appears disabled

**Solutions**:
1. **Check Plugin Status**:
   - Open Obsidian Settings → Community Plugins
   - Verify "MCP Client" is enabled
   - Toggle off and on if necessary

2. **Reload Plugin**:
   ```
   Ctrl+Shift+P (Windows/Linux) or Cmd+Shift+P (Mac)
   → "Reload app without saving"
   ```

3. **Check Console for Errors**:
   ```
   Ctrl+Shift+I (Windows/Linux) or Cmd+Option+I (Mac)
   → Check Console tab for errors
   ```

#### Settings Interface Not Loading
**Symptoms**:
- Settings page shows blank or loading
- Cannot modify server configurations
- Error when accessing settings

**Solutions**:
1. **Check File Permissions**:
   ```bash
   # Ensure config file is readable/writable
   chmod 644 ~/.mcp-config.json
   ```

2. **Reset Configuration**:
   ```bash
   # Backup existing config
   cp ~/.mcp-config.json ~/.mcp-config.json.backup
   
   # Create minimal config
   echo '{"mcpServers":{}}' > ~/.mcp-config.json
   ```

3. **Clear Plugin Data**:
   - Disable plugin
   - Clear plugin data in Obsidian settings
   - Re-enable plugin

### Performance Issues

#### Slow Response Times
**Symptoms**:
- Long delays when executing tools
- Slow resource loading
- UI becomes unresponsive

**Solutions**:
1. **Increase Timeouts**:
   ```json
   {
     "connectionTimeout": 30000,
     "requestTimeout": 60000
   }
   ```

2. **Limit Concurrent Connections**:
   - Connect only to necessary servers
   - Disable unused servers
   - Use auto-connect sparingly

3. **Check Server Performance**:
   - Monitor server CPU and memory usage
   - Optimize server implementation
   - Use local servers when possible

#### Memory Usage Issues
**Symptoms**:
- Obsidian becomes sluggish
- High memory usage
- Frequent crashes

**Solutions**:
1. **Restart Obsidian**:
   - Close and reopen Obsidian
   - Clear memory leaks

2. **Reduce Connection Count**:
   - Disconnect unused servers
   - Limit auto-connect servers

3. **Check for Memory Leaks**:
   - Review plugin logs
   - Report persistent memory issues

## Debug Mode

### Enabling Debug Mode
1. **Environment Variable**:
   ```bash
   export MCP_DEBUG=true
   ```

2. **Plugin Settings**:
   - Enable "Debug Mode" in plugin settings
   - Restart Obsidian for changes to take effect

3. **Console Logging**:
   ```javascript
   // Manual debug logging
   console.log('[MCP] Debug message');
   ```

### Debug Information
- **Connection Events**: WebSocket open, close, error events
- **Protocol Messages**: JSON-RPC requests and responses
- **Error Details**: Detailed error messages and stack traces
- **Performance Metrics**: Request timing and connection statistics

## Diagnostic Commands

### Network Diagnostics
```bash
# Test WebSocket connection
npx wscat -c ws://localhost:3000

# Test HTTP connectivity
curl -I http://localhost:3000

# Check port availability
netstat -an | grep :3000
```

### Configuration Diagnostics
```bash
# Validate JSON configuration
python -m json.tool ~/.mcp-config.json

# Check file permissions
ls -la ~/.mcp-config.json

# View configuration
cat ~/.mcp-config.json | jq
```

### Plugin Diagnostics
```bash
# Check plugin files
ls -la /path/to/vault/.obsidian/plugins/obsidian-mcp-client/

# Verify plugin manifest
cat /path/to/vault/.obsidian/plugins/obsidian-mcp-client/manifest.json
```

## Getting Help

### Information to Include
When reporting issues, please include:

1. **Environment Information**:
   - Obsidian version
   - Operating system
   - Plugin version
   - Node.js version (if applicable)

2. **Configuration Details**:
   - Server configuration (sanitized)
   - Connection type and URL
   - Timeout settings

3. **Error Messages**:
   - Exact error messages
   - Console output
   - Stack traces

4. **Steps to Reproduce**:
   - Detailed steps to reproduce issue
   - Expected vs actual behavior
   - Screenshots if applicable

### Support Channels
- **GitHub Issues**: https://github.com/simplemindedbot/obsidian-mcp-client/issues
- **Community Forum**: Obsidian community discussions
- **Documentation**: Comprehensive guides in docs/ folder

### Before Reporting
1. **Check This Guide**: Review relevant troubleshooting sections
2. **Search Existing Issues**: Look for similar reported issues
3. **Try Basic Solutions**: Restart, reconnect, reload plugin
4. **Test with Minimal Config**: Use simple test configuration

---

*Troubleshooting guide for plugin version as of July 2025.*