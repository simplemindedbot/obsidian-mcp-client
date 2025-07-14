# Development Guide

## Development Environment Setup

### Prerequisites
- **Node.js**: Version 16 or higher
- **npm**: Version 8 or higher
- **Git**: Latest stable version
- **Obsidian**: Desktop version for testing
- **Text Editor**: VS Code recommended with TypeScript support

### Project Setup

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/simplemindedbot/obsidian-mcp-client.git
   cd obsidian-mcp-client
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Development Build**:
   ```bash
   npm run dev
   ```

4. **Link to Obsidian**:
   ```bash
   # Create symlink to your development vault
   ln -s $(pwd) "/path/to/your/vault/.obsidian/plugins/obsidian-mcp-client"
   ```

### Development Commands

#### Build Commands
```bash
# Development build with watch mode
npm run dev

# Production build
npm run build

# Clean build artifacts
npm run clean
```

#### Testing Commands
```bash
# Run test suite (planned)
npm test

# Run test coverage (planned)
npm run test:coverage

# Run linter
npm run lint

# Fix linting issues
npm run lint:fix
```

#### Utility Commands
```bash
# Start test MCP server
node test-mcp-server.js

# Validate configuration
npm run validate-config

# Generate documentation
npm run docs
```

## Project Structure

```
obsidian-mcp-client/
├── src/                    # Source code (future organization)
├── docs/                   # Documentation
├── config_sample/          # Sample configurations
├── main.ts                 # Main plugin entry point
├── mcp-client.ts          # Core MCP client implementation
├── styles.css             # Plugin styles
├── manifest.json          # Plugin manifest
├── package.json           # Node.js dependencies
├── tsconfig.json          # TypeScript configuration
├── esbuild.config.js      # Build configuration
├── test-mcp-server.js     # Test server for development
├── README.md              # Project overview
├── TODO.md                # Development roadmap
├── CLAUDE.md              # Claude development instructions
└── LICENSE                # MIT license
```

## Architecture Deep Dive

### Core Components

#### MCPClient (mcp-client.ts)
**Purpose**: Core MCP protocol implementation
**Key Responsibilities**:
- WebSocket connection management
- JSON-RPC 2.0 protocol implementation
- Request/response correlation
- Error handling and recovery
- Connection retry logic

**Important Methods**:
- `connect()`: Establishes WebSocket connection
- `initialize()`: Performs MCP handshake
- `sendRequest()`: Sends JSON-RPC requests
- `handleMessage()`: Processes incoming messages

#### MCPClientPlugin (main.ts)
**Purpose**: Plugin orchestration and Obsidian integration
**Key Responsibilities**:
- Plugin lifecycle management
- Settings management
- Multi-server coordination
- UI component creation
- Command registration

**Important Methods**:
- `onload()`: Plugin initialization
- `onunload()`: Plugin cleanup
- `loadSettings()`: Configuration loading
- `saveSettings()`: Configuration persistence

#### MCPView (main.ts)
**Purpose**: Primary user interface
**Key Responsibilities**:
- Connection status display
- Resource and tool interaction
- Content formatting and insertion
- Error display and user feedback

**Important Methods**:
- `getViewType()`: Returns unique view identifier
- `onOpen()`: View initialization
- `renderConnectedView()`: Displays connected server state
- `insertContent()`: Inserts content into documents

#### MCPSettingTab (main.ts)
**Purpose**: Configuration interface
**Key Responsibilities**:
- Server configuration management
- Config file synchronization
- Preset server selection
- Connection settings

**Important Methods**:
- `display()`: Renders settings interface
- `addServer()`: Creates new server configurations
- `updateServer()`: Modifies existing servers
- `loadConfigFile()`: Reads external config files

### Data Flow

#### Connection Flow
1. User initiates connection via UI
2. MCPView calls MCPClientPlugin.connectServer()
3. Plugin creates MCPClient instance
4. MCPClient establishes WebSocket connection
5. Initialize handshake performed
6. Status updates propagated to UI

#### Resource/Tool Flow
1. User clicks resource/tool button
2. MCPView calls appropriate client method
3. MCPClient sends JSON-RPC request
4. Server response processed and formatted
5. Content inserted into active document

## Development Patterns

### Error Handling
```typescript
// Always wrap async operations in try-catch
try {
  const result = await client.callTool(toolName, {});
  return this.formatContent(result);
} catch (error) {
  if (error instanceof MCPError) {
    this.showError(`Tool error: ${error.message}`);
  } else {
    this.showError(`Unexpected error: ${error.message}`);
  }
  throw error;
}
```

### Configuration Management
```typescript
// Always validate configuration before use
if (!this.validateServerConfig(server)) {
  throw new Error('Invalid server configuration');
}

// Sync with external config file
await this.syncConfigFile();
```

### Resource Management
```typescript
// Always clean up resources
try {
  await client.connect();
  // ... use client
} finally {
  await client.disconnect();
}
```

### UI Updates
```typescript
// Always update UI state reactively
this.updateConnectionStatus(server.name, 'connecting');
try {
  await client.connect();
  this.updateConnectionStatus(server.name, 'connected');
} catch (error) {
  this.updateConnectionStatus(server.name, 'error', error.message);
}
```

## Testing Strategy

### Unit Testing (Planned)
```typescript
// Example test structure
describe('MCPClient', () => {
  let client: MCPClient;
  
  beforeEach(() => {
    client = new MCPClient('ws://localhost:3000');
  });
  
  afterEach(async () => {
    await client.disconnect();
  });
  
  it('should connect to server', async () => {
    await client.connect();
    expect(client.isConnected()).toBe(true);
  });
});
```

### Integration Testing
```typescript
// Test with real MCP server
describe('MCP Integration', () => {
  let server: TestMCPServer;
  let client: MCPClient;
  
  beforeAll(async () => {
    server = new TestMCPServer();
    await server.start();
  });
  
  afterAll(async () => {
    await server.stop();
  });
  
  it('should list resources', async () => {
    const resources = await client.listResources();
    expect(resources).toHaveLength(3);
  });
});
```

### Manual Testing
1. **Start Test Server**: `node test-mcp-server.js`
2. **Build Plugin**: `npm run dev`
3. **Test in Obsidian**: Enable plugin and test features
4. **Verify Functionality**: Check connection, resources, tools

## Debugging

### Debug Configuration
```typescript
// Enable debug logging
const DEBUG = process.env.NODE_ENV === 'development';

if (DEBUG) {
  console.log('MCP Request:', request);
  console.log('MCP Response:', response);
}
```

### Common Issues

#### Connection Problems
- **Symptom**: Connection timeouts or failures
- **Debugging**: Check WebSocket URL, server availability
- **Solution**: Verify server is running, check network connectivity

#### Protocol Errors
- **Symptom**: Invalid JSON-RPC responses
- **Debugging**: Enable request/response logging
- **Solution**: Verify server protocol compliance

#### UI Issues
- **Symptom**: Interface not updating
- **Debugging**: Check event listeners and state updates
- **Solution**: Ensure proper event binding and state management

### Browser Developer Tools
1. **Open Obsidian Developer Console**: Ctrl+Shift+I (Windows/Linux) or Cmd+Option+I (Mac)
2. **View Network Tab**: Monitor WebSocket connections
3. **Check Console**: Review error messages and logs
4. **Inspect Elements**: Debug UI rendering issues

## Contributing

### Code Standards

#### TypeScript
- Use strict TypeScript configuration
- Provide type annotations for all public APIs
- Use interfaces for data structures
- Avoid `any` type unless absolutely necessary

#### Code Style
- Use ESLint configuration
- Follow existing naming conventions
- Write clear, descriptive comments
- Keep functions small and focused

#### Git Workflow
1. **Create Feature Branch**: `git checkout -b feature/your-feature`
2. **Make Changes**: Implement your feature
3. **Write Tests**: Add appropriate test coverage
4. **Commit**: Use descriptive commit messages
5. **Push**: Push to your fork
6. **Pull Request**: Create PR with description

### Pull Request Process

1. **Fork Repository**: Create personal fork
2. **Create Branch**: Feature or bug fix branch
3. **Implement Changes**: Follow code standards
4. **Test Changes**: Ensure all tests pass
5. **Update Documentation**: Update relevant docs
6. **Submit PR**: Detailed description of changes

### Code Review Checklist
- [ ] Code follows project standards
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] No breaking changes without discussion
- [ ] Performance impact considered
- [ ] Security implications reviewed

## Release Process

### Version Management
- Follow semantic versioning (semver)
- Update version in `manifest.json` and `package.json`
- Tag releases with version numbers
- Maintain changelog for releases

### Release Steps
1. **Update Version**: Increment version numbers
2. **Build Release**: `npm run build`
3. **Test Release**: Full testing in clean environment
4. **Create Release**: GitHub release with artifacts
5. **Update Documentation**: Release notes and changelog

### Distribution
- **GitHub Releases**: Primary distribution method
- **Community Plugins**: Future submission to Obsidian community
- **Documentation**: Update installation instructions

## Future Development

### Planned Features
See [TODO.md](../TODO.md) for comprehensive roadmap.

**High Priority**:
1. **STDIO Implementation**: Command-line server support
2. **HTTP/SSE Transport**: Web-based server support
3. **Tool Parameters**: Interactive tool execution
4. **Enhanced Error Handling**: Better error recovery

**Medium Priority**:
1. **Authentication**: API key and OAuth support
2. **Performance**: Connection pooling and caching
3. **UI Enhancements**: Better resource browsing
4. **Testing**: Comprehensive test suite

### Architecture Evolution
- **Modular Design**: Split into smaller, focused modules
- **Plugin System**: Support for custom extensions
- **Performance Optimization**: Lazy loading and caching
- **Mobile Support**: Adapt for mobile environments

### Community
- **Documentation**: Comprehensive guides and examples
- **Examples**: Sample MCP servers and configurations
- **Support**: Community forums and issue tracking
- **Contributions**: Welcoming community contributions

---

*Development guide for plugin version as of July 2025.*