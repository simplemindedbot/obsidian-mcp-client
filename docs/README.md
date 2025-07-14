# Obsidian MCP Client Documentation

Welcome to the comprehensive documentation for the Obsidian MCP Client plugin. This documentation provides detailed information about the plugin's architecture, usage, and development.

## 📚 Documentation Index

- **[Project Overview](project-overview.md)** - High-level project description, goals, and current status
- **[Architecture](architecture.md)** - Technical architecture, components, and design patterns
- **[User Guide](user-guide.md)** - Installation, configuration, and usage instructions
- **[API Reference](api-reference.md)** - Code documentation and API details
- **[Development Guide](development-guide.md)** - Setup, building, and contributing guidelines
- **[Protocol Implementation](protocol-implementation.md)** - MCP protocol support and limitations
- **[Configuration](configuration.md)** - Detailed configuration options and examples
- **[Troubleshooting](troubleshooting.md)** - Common issues and solutions

## 🚀 Quick Start

1. **New Users**: Start with [Project Overview](project-overview.md) and [User Guide](user-guide.md)
2. **Developers**: Check [Architecture](architecture.md) and [Development Guide](development-guide.md)
3. **Contributors**: See [Development Guide](development-guide.md) and review [TODO.md](../TODO.md)

## 📊 Project Status

**Current Version**: Proof of Concept (July 2025)
**Primary Transport**: WebSocket only (STDIO and HTTP planned)
**MCP Protocol Version**: 2024-11-05

### Implementation Status

| Feature | Status | Notes |
|---------|--------|-------|
| WebSocket Connections | ✅ Complete | Full JSON-RPC 2.0 support |
| Multi-server Management | ✅ Complete | Individual controls and presets |
| Resource Operations | ✅ Complete | Browse and insert into documents |
| Tool Execution | 🔄 Partial | No parameter support yet |
| STDIO Connections | ❌ Planned | High priority - see TODO.md |
| HTTP/SSE Transport | ❌ Planned | Medium priority |
| Authentication | ❌ Planned | API keys, OAuth support |

## 🔗 External Resources

- [Model Context Protocol Specification](https://modelcontextprotocol.io/)
- [Claude Desktop MCP Documentation](https://claude.ai/docs/mcp)
- [Obsidian Plugin API](https://docs.obsidian.md/Plugins)
- [Project Repository](https://github.com/simplemindedbot/obsidian-mcp-client)

## 🤝 Contributing

We welcome contributions! Please see:
- [Development Guide](development-guide.md) for setup instructions
- [TODO.md](../TODO.md) for current priorities
- [GitHub Issues](https://github.com/simplemindedbot/obsidian-mcp-client/issues) for bug reports and feature requests

## 📄 License

This project is licensed under the MIT License. See [LICENSE](../LICENSE) file for details.

---

*Documentation last updated: July 14, 2025*