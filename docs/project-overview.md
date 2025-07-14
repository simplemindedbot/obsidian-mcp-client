# Project Overview

## What is the Obsidian MCP Client?

The Obsidian MCP Client is an experimental plugin that brings Model Context Protocol (MCP) capabilities directly into Obsidian. It allows users to connect to MCP servers, browse their resources, execute tools, and insert the results directly into their notes.

## 🎯 Project Goals

### Primary Goal
Create a comprehensive MCP client for Obsidian that provides feature parity with Claude Desktop's MCP integration, enabling users to:
- Connect to any MCP server from their Obsidian workspace
- Browse and read MCP resources
- Execute MCP tools with parameters
- Insert MCP content seamlessly into documents

### Secondary Goals
- **Claude Desktop Compatibility**: Support the same configuration format and server types
- **Multi-server Management**: Connect to multiple MCP servers simultaneously
- **Rich Integration**: Leverage Obsidian's document structure and linking capabilities
- **Extensible Architecture**: Support for future MCP protocol enhancements

## 🚧 Current Status: Proof of Concept

As of July 2025, this is a **working proof of concept** with solid foundations but limited transport support.

### ✅ What's Working Well

**Core Infrastructure:**
- **WebSocket Transport**: Full JSON-RPC 2.0 implementation with automatic reconnection
- **Multi-server Support**: Connect to multiple MCP servers with individual controls
- **Resource Operations**: Browse, read, and insert MCP resources into documents
- **Tool Execution**: Execute MCP tools and insert formatted output
- **Configuration System**: Claude Desktop-compatible JSON configuration with extensions

**User Experience:**
- **Intuitive UI**: Settings panel with server management and real-time status
- **Document Integration**: Smart insertion at cursor position with fallback handling
- **Error Handling**: Connection retry logic with exponential backoff
- **Server Presets**: Quick setup for common MCP servers

### ❌ Key Limitations

**Transport Support:**
- **STDIO Connections**: Not implemented (blocks most Claude Desktop configs)
- **HTTP/SSE Transport**: Not implemented (blocks web-based MCP servers)

**Feature Gaps:**
- **Tool Parameters**: Tools can only be called with empty parameters
- **Streaming Responses**: No real-time content updates
- **Authentication**: No API key or OAuth support

**Polish Items:**
- **Error Recovery**: Basic retry logic could be more robust
- **Performance**: No connection pooling or response caching
- **Mobile Support**: Desktop-only due to Node.js dependencies

## 🏗️ Architecture Philosophy

### Design Principles

1. **Protocol Compliance**: Strict adherence to MCP specification
2. **Transport Agnostic**: Extensible architecture supporting WebSocket, STDIO, and HTTP
3. **Obsidian Integration**: Leverage Obsidian's strengths (documents, linking, plugins)
4. **User Experience**: Intuitive interface with minimal configuration required
5. **Reliability**: Robust error handling and automatic recovery

### Technical Approach

- **TypeScript**: Full type safety with comprehensive interfaces
- **Modular Design**: Clear separation between transport, protocol, and UI layers
- **Async/Await**: Promise-based architecture throughout
- **Error Boundaries**: Proper error handling with user-friendly messages
- **Resource Management**: Automatic cleanup to prevent memory leaks

## 🌟 Key Features

### Multi-Server Management
- Connect to multiple MCP servers simultaneously
- Individual enable/disable controls for each server
- Auto-connect functionality for seamless workflow
- Real-time connection status with retry indicators

### Configuration System
- Claude Desktop-compatible JSON configuration format
- Extensions for WebSocket and HTTP server types
- Server presets for common MCP implementations
- Automatic config file synchronization

### Document Integration
- Smart insertion at cursor position in active editor
- Fallback to new file creation when no editor is active
- Formatted output for different content types
- Proper cursor positioning after insertion

### Resource Operations
- Browse available resources from connected servers
- Read resource content with formatted display
- Insert resources directly into documents
- Support for various content types (text, JSON, etc.)

### Tool Execution
- Discover available tools from MCP servers
- Execute tools with formatted output display
- Insert tool results into documents
- Basic error handling for tool failures

## 🚀 Use Cases

### Research and Documentation
- **Knowledge Base Integration**: Connect to internal knowledge systems
- **API Documentation**: Access live API documentation and examples
- **Database Queries**: Execute database queries and insert results
- **Code Analysis**: Analyze codebases and insert findings

### Content Creation
- **Template Systems**: Use MCP servers as template providers
- **Data Visualization**: Generate charts and graphs from MCP tools
- **Content Enhancement**: Enrich notes with external data sources
- **Workflow Automation**: Trigger external processes from within notes

### Development Workflow
- **Code Generation**: Generate code snippets from MCP tools
- **Testing Integration**: Execute tests and insert results
- **Documentation Generation**: Auto-generate documentation from codebases
- **Deployment Monitoring**: Check deployment status and insert logs

## 🔮 Future Vision

### Short-term (Next 3 months)
1. **STDIO Implementation**: Enable Claude Desktop config compatibility
2. **Tool Parameters**: Support interactive tool execution
3. **HTTP/SSE Transport**: Enable web-based MCP servers
4. **Enhanced Error Handling**: More robust connection management

### Medium-term (3-6 months)
1. **Authentication Support**: API keys and OAuth integration
2. **Streaming Responses**: Real-time content updates
3. **Performance Optimization**: Connection pooling and caching
4. **Advanced UI Features**: Better resource browsing and filtering

### Long-term (6+ months)
1. **Obsidian Integration**: Deep integration with Obsidian's plugin ecosystem
2. **Community Features**: Server registry and sharing capabilities
3. **Advanced Protocol Support**: Subscriptions, notifications, batch operations
4. **Mobile Support**: Adapt architecture for mobile environments

## 📊 Success Metrics

### Technical Metrics
- **Server Compatibility**: Successfully connect to 95% of public MCP servers
- **Reliability**: 99.9% uptime for established connections
- **Performance**: Sub-200ms response times for typical operations
- **Error Recovery**: Automatic recovery from 90% of connection failures

### User Experience Metrics
- **Ease of Setup**: New users can connect their first server in under 5 minutes
- **Daily Usage**: Active users perform 10+ MCP operations per day
- **Integration**: Users insert MCP content into 25% of their notes
- **Satisfaction**: 4.5+ star rating in community plugin directory

## 🏆 Competitive Advantages

### Over Claude Desktop
- **Integrated Workflow**: No context switching between applications
- **Document Integration**: Direct insertion into structured notes
- **Multi-server Management**: Better visualization and control
- **Extensibility**: Plugin ecosystem and customization options

### Over Other MCP Clients
- **Note-centric Design**: Built specifically for knowledge workers
- **Obsidian Integration**: Leverage existing plugin ecosystem
- **Open Source**: Community-driven development and contributions
- **Cross-platform**: Works wherever Obsidian works

## 🤝 Community and Ecosystem

### Target Audience
- **Knowledge Workers**: Researchers, writers, consultants
- **Developers**: Software engineers, technical writers
- **Students**: Academic researchers, note-takers
- **Teams**: Collaborative knowledge management

### Community Building
- **Open Source**: MIT license encourages contributions
- **Documentation**: Comprehensive guides for users and developers
- **Examples**: Sample configurations and use cases
- **Support**: GitHub issues and community forums

### Plugin Ecosystem
- **Obsidian Plugins**: Integration with DataView, Templater, etc.
- **MCP Servers**: Support for existing and new MCP server implementations
- **Extensions**: Plugin architecture for custom functionality
- **Themes**: UI customization and branding options

---

*This overview represents the current state and vision as of July 2025. The project is actively evolving based on community feedback and contributions.*