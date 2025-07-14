import { App, Plugin, PluginSettingTab, Setting, Notice, ItemView, WorkspaceLeaf, MarkdownView, Modal } from 'obsidian';
import { MCPClient, MCPResource, MCPTool, MCPError, ConnectionStatus } from './mcp-client';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

// Claude Desktop compatible config format
interface MCPServerConfig {
  command: string;
  args?: string[];
  env?: Record<string, string>;
  cwd?: string;
}

// Extended config format for Obsidian (supports all connection types)
interface ObsidianMCPServerConfig {
  command?: string;
  args?: string[];
  env?: Record<string, string>;
  cwd?: string;
  connectionType?: 'websocket' | 'stdio' | 'http';
  url?: string;
  httpUrl?: string;
  enabled?: boolean;
  autoConnect?: boolean;
}

interface ObsidianMCPConfig {
  mcpServers: Record<string, ObsidianMCPServerConfig>;
}

interface MCPConfig {
  mcpServers: Record<string, MCPServerConfig>;
}

// Internal plugin format (extended for UI needs)
interface MCPServer {
  id: string;
  name: string;
  enabled: boolean;
  autoConnect: boolean;
  connectionType: 'websocket' | 'stdio' | 'http';
  // WebSocket connection
  url?: string;
  // STDIO connection (command-based)
  command?: string;
  args?: string[];
  env?: Record<string, string>;
  cwd?: string;
  // HTTP connection
  httpUrl?: string;
}

interface MCPClientSettings {
  configFilePath: string;
  servers: MCPServer[];
  // Legacy settings for backward compatibility
  serverUrl?: string;
  autoConnect?: boolean;
}

const DEFAULT_SETTINGS: MCPClientSettings = {
  configFilePath: join(process.env.HOME || process.env.USERPROFILE || '', '.mcp-config.json'),
  servers: []
};

const VIEW_TYPE_MCP = 'mcp-view';

export default class MCPClientPlugin extends Plugin {
  settings: MCPClientSettings;
  mcpClients: Map<string, MCPClient> = new Map();

  // Convert config to internal format (supports both standard and extended formats)
  private convertFromMCPConfig(config: ObsidianMCPConfig): MCPServer[] {
    const servers: MCPServer[] = [];
    
    for (const [serverName, serverConfig] of Object.entries(config.mcpServers)) {
      const connectionType = serverConfig.connectionType || 'stdio';
      
      servers.push({
        id: serverName,
        name: serverName,
        enabled: serverConfig.enabled !== false,
        autoConnect: serverConfig.autoConnect || false,
        connectionType: connectionType,
        command: serverConfig.command,
        args: serverConfig.args,
        env: serverConfig.env,
        cwd: serverConfig.cwd,
        url: serverConfig.url,
        httpUrl: serverConfig.httpUrl
      });
    }
    
    return servers;
  }

  // Convert internal format to extended config (supports all connection types)
  private convertToMCPConfig(servers: MCPServer[]): ObsidianMCPConfig {
    const mcpServers: Record<string, ObsidianMCPServerConfig> = {};
    
    servers.forEach(server => {
      const serverConfig: ObsidianMCPServerConfig = {
        connectionType: server.connectionType,
        enabled: server.enabled,
        autoConnect: server.autoConnect
      };

      if (server.connectionType === 'stdio' && server.command) {
        serverConfig.command = server.command;
        serverConfig.args = server.args;
        serverConfig.env = server.env;
        serverConfig.cwd = server.cwd;
      } else if (server.connectionType === 'websocket' && server.url) {
        serverConfig.command = 'websocket'; // Placeholder for compatibility
        serverConfig.url = server.url;
      } else if (server.connectionType === 'http' && server.httpUrl) {
        serverConfig.command = 'http'; // Placeholder for compatibility
        serverConfig.httpUrl = server.httpUrl;
      }

      if (Object.keys(serverConfig).length > 3) { // More than just the base fields
        mcpServers[server.id] = serverConfig;
      }
    });
    
    return { mcpServers };
  }

  // Load config from JSON file
  private loadConfigFromFile(): MCPServer[] {
    try {
      if (!existsSync(this.settings.configFilePath)) {
        console.log('MCP config file not found, creating default');
        this.saveConfigToFile([]);
        return [];
      }

      const configData = readFileSync(this.settings.configFilePath, 'utf8');
      const config: ObsidianMCPConfig = JSON.parse(configData);
      
      return this.convertFromMCPConfig(config);
    } catch (error) {
      console.error('Error loading MCP config file:', error);
      new Notice('Error loading MCP config file. Using defaults.');
      return [];
    }
  }

  // Save config to JSON file
  private saveConfigToFile(servers: MCPServer[]): void {
    try {
      const config = this.convertToMCPConfig(servers);
      writeFileSync(this.settings.configFilePath, JSON.stringify(config, null, 2));
      console.log('MCP config saved to:', this.settings.configFilePath);
    } catch (error) {
      console.error('Error saving MCP config file:', error);
      new Notice('Error saving MCP config file');
    }
  }

  async onload() {
    await this.loadSettings();

    // Initialize clients for each server
    this.initializeClients();

    // Register view
    this.registerView(
      VIEW_TYPE_MCP,
      (leaf) => new MCPView(leaf, this)
    );

    // Add ribbon icon
    this.addRibbonIcon('network', 'MCP Client', () => {
      this.activateView();
    });

    // Add commands
    this.addCommand({
      id: 'connect-all-mcp',
      name: 'Connect to All MCP Servers',
      callback: () => this.connectToAllServers()
    });

    this.addCommand({
      id: 'disconnect-all-mcp',
      name: 'Disconnect from All MCP Servers',
      callback: () => this.disconnectFromAllServers()
    });

    // Add settings tab
    this.addSettingTab(new MCPSettingTab(this.app, this));

    // Auto-connect enabled servers
    setTimeout(() => this.autoConnectServers(), 1000);
  }

  async onunload() {
    await this.disconnectFromAllServers();
  }

  async loadSettings() {
    const loadedData = await this.loadData();
    this.settings = Object.assign({}, DEFAULT_SETTINGS, loadedData);
    
    // Load servers from JSON config file
    this.settings.servers = this.loadConfigFromFile();
    
    // Migrate legacy settings (only if no JSON config exists)
    if (loadedData?.serverUrl && !loadedData?.servers && this.settings.servers.length === 0) {
      this.settings.servers = [{
        id: 'migrated',
        name: 'Migrated Server',
        connectionType: 'websocket',
        url: loadedData.serverUrl,
        autoConnect: loadedData.autoConnect || false,
        enabled: true
      }];
      // Save to JSON file immediately
      this.saveConfigToFile(this.settings.servers);
    }
  }

  initializeClients() {
    this.settings.servers.forEach(server => {
      if (server.enabled) {
        const client = new MCPClient((notification) => {
          console.log(`MCP Notification from ${server.name}:`, notification);
        });
        this.mcpClients.set(server.id, client);
      }
    });
  }

  async saveSettings() {
    // Save servers to JSON config file
    this.saveConfigToFile(this.settings.servers);
    
    // Save plugin settings (without servers) to Obsidian data
    const settingsToSave = {
      configFilePath: this.settings.configFilePath,
      serverUrl: this.settings.serverUrl,
      autoConnect: this.settings.autoConnect
    };
    await this.saveData(settingsToSave);
  }

  async activateView() {
    const { workspace } = this.app;
    
    let leaf: WorkspaceLeaf | null = null;
    const leaves = workspace.getLeavesOfType(VIEW_TYPE_MCP);

    if (leaves.length > 0) {
      leaf = leaves[0];
    } else {
      leaf = workspace.getRightLeaf(false);
      await leaf.setViewState({ type: VIEW_TYPE_MCP, active: true });
    }

    workspace.revealLeaf(leaf);
  }

  async autoConnectServers() {
    const autoConnectServers = this.settings.servers.filter(s => s.enabled && s.autoConnect);
    for (const server of autoConnectServers) {
      await this.connectToServer(server.id);
    }
  }

  async connectToAllServers() {
    const enabledServers = this.settings.servers.filter(s => s.enabled);
    new Notice(`Connecting to ${enabledServers.length} servers...`);
    
    const promises = enabledServers.map(server => this.connectToServer(server.id));
    await Promise.allSettled(promises);
    this.refreshView();
  }

  async disconnectFromAllServers() {
    const promises = Array.from(this.mcpClients.values()).map(client => client.disconnect());
    await Promise.allSettled(promises);
    this.mcpClients.clear();
    new Notice('Disconnected from all MCP servers');
    this.refreshView();
  }

  async connectToServer(serverId: string) {
    const server = this.settings.servers.find(s => s.id === serverId);
    if (!server) {
      new Notice(`Server ${serverId} not found`);
      return;
    }

    let client = this.mcpClients.get(serverId);
    if (!client) {
      client = new MCPClient((notification) => {
        console.log(`MCP Notification from ${server.name}:`, notification);
      });
      this.mcpClients.set(serverId, client);
    }

    try {
      new Notice(`Connecting to ${server.name}...`);
      this.refreshView();
      
      if (server.connectionType === 'websocket') {
        if (!server.url) {
          throw new Error('WebSocket URL is required for websocket connection');
        }
        await client.connect(server.url, {
          timeout: 10000,
          retryAttempts: 3,
          retryDelay: 1000,
          maxRetryDelay: 5000
        });
      } else if (server.connectionType === 'stdio') {
        throw new Error('STDIO connections are not yet implemented. Please use WebSocket connections for now.');
      }
      
      await client.initialize({
        name: 'Obsidian MCP Client',
        version: '0.1.0'
      });
      
      new Notice(`Connected to ${server.name}`);
      this.refreshView();
    } catch (error) {
      const mcpError = error as MCPError;
      const message = mcpError.code 
        ? `Failed to connect to ${server.name} (${mcpError.code}): ${mcpError.message}`
        : `Failed to connect to ${server.name}: ${mcpError.message}`;
      new Notice(message);
      console.error(`MCP connection failed for ${server.name}:`, error);
      this.refreshView();
    }
  }

  async disconnectFromServer(serverId: string) {
    const client = this.mcpClients.get(serverId);
    const server = this.settings.servers.find(s => s.id === serverId);
    
    if (client) {
      await client.disconnect();
      new Notice(`Disconnected from ${server?.name || serverId}`);
      this.refreshView();
    }
  }

  refreshView() {
    const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_MCP);
    leaves.forEach(leaf => {
      if (leaf.view instanceof MCPView) {
        leaf.view.refresh();
      }
    });
  }
}

class MCPView extends ItemView {
  plugin: MCPClientPlugin;

  constructor(leaf: WorkspaceLeaf, plugin: MCPClientPlugin) {
    super(leaf);
    this.plugin = plugin;
  }

  getViewType() {
    return VIEW_TYPE_MCP;
  }

  getDisplayText() {
    return 'MCP Client';
  }

  async onOpen() {
    this.refresh();
  }

  async refresh() {
    const container = this.containerEl.children[1];
    container.empty();
    container.createEl('h2', { text: 'MCP Client' });

    // Global controls
    const globalControlsEl = container.createDiv('mcp-global-controls');
    
    const connectAllBtn = globalControlsEl.createEl('button', {
      text: 'Connect All'
    });
    connectAllBtn.onclick = () => this.plugin.connectToAllServers();

    const disconnectAllBtn = globalControlsEl.createEl('button', {
      text: 'Disconnect All'
    });
    disconnectAllBtn.onclick = () => this.plugin.disconnectFromAllServers();

    // Server sections
    for (const server of this.plugin.settings.servers) {
      if (!server.enabled) continue;
      
      const serverEl = container.createDiv('mcp-server');
      serverEl.createEl('h3', { text: server.name });

      const client = this.plugin.mcpClients.get(server.id);
      const status = client ? client.getConnectionStatus() : { 
        connected: false, 
        url: server.url, 
        connecting: false, 
        lastError: null 
      };
      
      const statusEl = serverEl.createDiv('mcp-status');
      
      let statusText = 'Disconnected';
      let statusClass = 'status-disconnected';
      
      if (status.connecting) {
        statusText = status.retryAttempt 
          ? `Connecting (retry ${status.retryAttempt}...)`
          : 'Connecting...';
        statusClass = 'status-connecting';
      } else if (status.connected) {
        statusText = 'Connected';
        statusClass = 'status-connected';
      }
      
      statusEl.createEl('p', {
        text: `Status: ${statusText}`,
        cls: statusClass
      });
      
      if (server.connectionType === 'websocket') {
        statusEl.createEl('p', { text: `URL: ${server.url}` });
      } else if (server.connectionType === 'stdio') {
        statusEl.createEl('p', { text: `Command: ${server.command} ${(server.args || []).join(' ')}` });
      }
      
      if (status.lastError && !status.connected) {
        statusEl.createEl('p', { 
          text: `Last error: ${status.lastError}`, 
          cls: 'status-error' 
        });
      }

      // Server controls
      const controlsEl = serverEl.createDiv('mcp-controls');
      
      const connectBtn = controlsEl.createEl('button', {
        text: status.connecting ? 'Cancel' : (status.connected ? 'Disconnect' : 'Connect')
      });
      connectBtn.disabled = status.connecting;
      connectBtn.onclick = () => {
        if (status.connected || status.connecting) {
          this.plugin.disconnectFromServer(server.id);
        } else {
          this.plugin.connectToServer(server.id);
        }
      };

      if (status.connected && client) {
        // Resources section
        const resourcesEl = serverEl.createDiv('mcp-resources');
        resourcesEl.createEl('h4', { text: 'Resources' });
        
        const refreshResourcesBtn = resourcesEl.createEl('button', {
          text: 'Refresh Resources'
        });
        refreshResourcesBtn.onclick = () => this.loadResources(resourcesEl, client);

        this.loadResources(resourcesEl, client);

        // Tools section
        const toolsEl = serverEl.createDiv('mcp-tools');
        toolsEl.createEl('h4', { text: 'Tools' });
        
        const refreshToolsBtn = toolsEl.createEl('button', {
          text: 'Refresh Tools'
        });
        refreshToolsBtn.onclick = () => this.loadTools(toolsEl, client);

        this.loadTools(toolsEl, client);
      }
    }
  }

  async loadResources(container: HTMLElement, client: MCPClient) {
    const resourceListEl = container.querySelector('.resource-list') as HTMLElement;
    if (resourceListEl) {
      resourceListEl.remove();
    }

    try {
      const resources = await client.listResources();
      const listEl = container.createDiv('resource-list');
      
      if (resources.length === 0) {
        listEl.createEl('p', { text: 'No resources available' });
        return;
      }

      resources.forEach((resource: MCPResource) => {
        const itemEl = listEl.createDiv('resource-item');
        itemEl.createEl('strong', { text: resource.name });
        if (resource.description) {
          itemEl.createEl('p', { text: resource.description });
        }
        itemEl.createEl('code', { text: resource.uri });
        
        const buttonContainer = itemEl.createDiv('button-container');
        
        const readBtn = buttonContainer.createEl('button', { text: 'Read' });
        readBtn.onclick = async () => {
          try {
            const content = await client.readResource(resource.uri);
            console.log('Resource content:', content);
            new Notice('Resource content logged to console');
          } catch (error) {
            new Notice(`Failed to read resource: ${(error as Error).message}`);
          }
        };

        const insertBtn = buttonContainer.createEl('button', { text: 'Insert' });
        insertBtn.onclick = async () => {
          try {
            const content = await client.readResource(resource.uri);
            console.log('Resource content:', content);
            const formattedContent = this.formatMCPContent(content);
            await this.insertIntoActiveDocument(`# ${resource.name}\n\n${formattedContent}\n\n`);
          } catch (error) {
            new Notice(`Failed to read resource: ${(error as Error).message}`);
          }
        };
      });
    } catch (error) {
      container.createEl('p', { text: `Error loading resources: ${(error as Error).message}` });
    }
  }

  async loadTools(container: HTMLElement, client: MCPClient) {
    const toolListEl = container.querySelector('.tool-list') as HTMLElement;
    if (toolListEl) {
      toolListEl.remove();
    }

    try {
      const tools = await client.listTools();
      const listEl = container.createDiv('tool-list');
      
      if (tools.length === 0) {
        listEl.createEl('p', { text: 'No tools available' });
        return;
      }

      tools.forEach((tool: MCPTool) => {
        const itemEl = listEl.createDiv('tool-item');
        itemEl.createEl('strong', { text: tool.name });
        if (tool.description) {
          itemEl.createEl('p', { text: tool.description });
        }
        
        const buttonContainer = itemEl.createDiv('button-container');
        
        const callBtn = buttonContainer.createEl('button', { text: 'Call' });
        callBtn.onclick = async () => {
          try {
            const result = await client.callTool(tool.name, {});
            console.log('Tool result:', result);
            new Notice('Tool result logged to console');
          } catch (error) {
            new Notice(`Failed to call tool: ${(error as Error).message}`);
          }
        };

        const insertBtn = buttonContainer.createEl('button', { text: 'Insert' });
        insertBtn.onclick = async () => {
          try {
            const result = await client.callTool(tool.name, {});
            console.log('Tool result:', result);
            const formattedContent = this.formatMCPContent(result);
            await this.insertIntoActiveDocument(`## ${tool.name} Tool Output\n\n${formattedContent}\n\n`);
          } catch (error) {
            new Notice(`Failed to call tool: ${(error as Error).message}`);
          }
        };
      });
    } catch (error) {
      container.createEl('p', { text: `Error loading tools: ${(error as Error).message}` });
    }
  }

  formatMCPContent(mcpResponse: any): string {
    // Handle different MCP response formats
    if (typeof mcpResponse === 'string') {
      return mcpResponse;
    }
    
    if (mcpResponse && typeof mcpResponse === 'object') {
      // Check for common MCP response formats
      if (mcpResponse.content) {
        if (Array.isArray(mcpResponse.content)) {
          // Handle array of content objects
          return mcpResponse.content.map((item: any) => {
            if (typeof item === 'string') return item;
            if (item.text) return item.text;
            if (item.content) return item.content;
            return JSON.stringify(item, null, 2);
          }).join('\n\n');
        } else if (typeof mcpResponse.content === 'string') {
          return mcpResponse.content;
        } else if (typeof mcpResponse.content === 'object') {
          return JSON.stringify(mcpResponse.content, null, 2);
        }
      }
      
      // Check for text field
      if (mcpResponse.text) {
        return mcpResponse.text;
      }
      
      // Check for result field (tool responses)
      if (mcpResponse.result) {
        return this.formatMCPContent(mcpResponse.result);
      }
      
      // Fallback to JSON stringify
      return JSON.stringify(mcpResponse, null, 2);
    }
    
    return String(mcpResponse);
  }

  async insertIntoActiveDocument(content: string) {
    // Try to find the most recently active markdown editor
    const markdownLeaves = this.app.workspace.getLeavesOfType('markdown');
    let targetEditor = null;
    
    // First, try to get the current active markdown view
    const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (activeView && activeView.editor) {
      targetEditor = activeView.editor;
    } else if (markdownLeaves.length > 0) {
      // If no active markdown view, use the most recent one
      const mostRecentLeaf = markdownLeaves[markdownLeaves.length - 1];
      const markdownView = mostRecentLeaf.view as MarkdownView;
      if (markdownView && markdownView.editor) {
        targetEditor = markdownView.editor;
        // Focus this leaf to make it active
        this.app.workspace.setActiveLeaf(mostRecentLeaf, { focus: true });
      }
    }
    
    if (targetEditor) {
      const cursor = targetEditor.getCursor();
      targetEditor.replaceRange(content, cursor);
      targetEditor.setCursor(cursor.line + content.split('\n').length - 1, 0);
      new Notice('Content inserted into document');
    } else {
      // Create a new file if no markdown editor is found
      const fileName = `MCP Output ${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.md`;
      const newFile = await this.app.vault.create(fileName, content);
      const leaf = this.app.workspace.getLeaf(false);
      await leaf.openFile(newFile);
      new Notice(`Content inserted into new file: ${fileName}`);
    }
  }

  async onClose() {
    // Nothing to clean up
  }
}

class MCPSettingTab extends PluginSettingTab {
  plugin: MCPClientPlugin;

  constructor(app: App, plugin: MCPClientPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl('h2', { text: 'MCP Client Settings' });

    // Config file path setting
    new Setting(containerEl)
      .setName('Config File Path')
      .setDesc('Path to the MCP configuration JSON file (Claude Desktop compatible)')
      .addText(text => text
        .setValue(this.plugin.settings.configFilePath)
        .onChange(async (value) => {
          this.plugin.settings.configFilePath = value;
          await this.plugin.saveSettings();
        }))
      .addButton(button => button
        .setButtonText('Reload Config')
        .onClick(async () => {
          await this.plugin.loadSettings();
          this.plugin.initializeClients();
          this.display();
          new Notice('Config reloaded from file');
        }));

    // Add new server button
    new Setting(containerEl)
      .setName('Add Server')
      .setDesc('Add a new MCP server configuration')
      .addButton(button => button
        .setButtonText('Add Server')
        .onClick(() => this.addServer()))
      .addButton(button => button
        .setButtonText('Add Preset')
        .onClick(() => this.addPresetServer()));

    // Add preset configurations section
    const presetEl = containerEl.createDiv('preset-servers');
    presetEl.createEl('h4', { text: 'Common Presets' });
    presetEl.createEl('p', { text: 'Click "Add Preset" to quickly add common MCP server configurations.' });
    
    // Config file info
    const infoEl = containerEl.createDiv('config-info');
    infoEl.createEl('h4', { text: 'Config File Format' });
    infoEl.createEl('p', { text: 'The config file is compatible with Claude Desktop\'s format. STDIO servers are saved to the JSON file, while WebSocket and HTTP servers are Obsidian-specific extensions.' });

    containerEl.createEl('h3', { text: 'Configured Servers' });

    // List existing servers
    this.plugin.settings.servers.forEach((server, index) => {
      const serverEl = containerEl.createDiv('server-setting');
      
      new Setting(serverEl)
        .setName(`${server.name}`)
        .setDesc(`${server.url}`)
        .addToggle(toggle => toggle
          .setValue(server.enabled)
          .setTooltip('Enable/disable this server')
          .onChange(async (value) => {
            server.enabled = value;
            await this.plugin.saveSettings();
            // Reinitialize clients
            this.plugin.mcpClients.clear();
            this.plugin.initializeClients();
          }))
        .addButton(button => button
          .setButtonText('Edit')
          .onClick(() => this.editServer(index)))
        .addButton(button => button
          .setButtonText('Delete')
          .setWarning()
          .onClick(() => this.deleteServer(index)));

      // Server details
      const detailsEl = serverEl.createDiv('server-details');
      
      new Setting(detailsEl)
        .setName('Name')
        .addText(text => text
          .setValue(server.name)
          .onChange(async (value) => {
            server.name = value;
            await this.plugin.saveSettings();
            this.display(); // Refresh
          }));

      new Setting(detailsEl)
        .setName('Connection Type')
        .addDropdown(dropdown => dropdown
          .addOption('websocket', 'WebSocket')
          .addOption('stdio', 'STDIO (Command)')
          .setValue(server.connectionType)
          .onChange(async (value: 'websocket' | 'stdio') => {
            server.connectionType = value;
            await this.plugin.saveSettings();
            this.display(); // Refresh to show/hide fields
          }));

      if (server.connectionType === 'websocket') {
        new Setting(detailsEl)
          .setName('URL')
          .addText(text => text
            .setValue(server.url || '')
            .onChange(async (value) => {
              server.url = value;
              await this.plugin.saveSettings();
            }));
      }

      if (server.connectionType === 'stdio') {
        new Setting(detailsEl)
          .setName('Command')
          .addText(text => text
            .setValue(server.command || '')
            .onChange(async (value) => {
              server.command = value;
              await this.plugin.saveSettings();
            }));

        new Setting(detailsEl)
          .setName('Arguments')
          .setDesc('One argument per line')
          .addTextArea(text => text
            .setValue((server.args || []).join('\n'))
            .onChange(async (value) => {
              server.args = value.split('\n').filter(arg => arg.trim() !== '');
              await this.plugin.saveSettings();
            }));

        new Setting(detailsEl)
          .setName('Environment Variables')
          .setDesc('KEY=value format, one per line')
          .addTextArea(text => text
            .setValue(Object.entries(server.env || {}).map(([k, v]) => `${k}=${v}`).join('\n'))
            .onChange(async (value) => {
              server.env = {};
              value.split('\n').forEach(line => {
                const [key, ...rest] = line.split('=');
                if (key && rest.length > 0) {
                  server.env![key.trim()] = rest.join('=').trim();
                }
              });
              await this.plugin.saveSettings();
            }));

        new Setting(detailsEl)
          .setName('Working Directory')
          .addText(text => text
            .setValue(server.cwd || '')
            .onChange(async (value) => {
              server.cwd = value;
              await this.plugin.saveSettings();
            }));
      }

      new Setting(detailsEl)
        .setName('Auto-connect')
        .addToggle(toggle => toggle
          .setValue(server.autoConnect)
          .onChange(async (value) => {
            server.autoConnect = value;
            await this.plugin.saveSettings();
          }));
    });
  }

  addServer() {
    const newServer: MCPServer = {
      id: `server-${Date.now()}`,
      name: 'New Server',
      connectionType: 'websocket',
      url: 'ws://localhost:3000',
      autoConnect: false,
      enabled: true
    };
    
    this.plugin.settings.servers.push(newServer);
    this.plugin.saveSettings();
    this.display();
  }

  addPresetServer() {
    const presets = [
      {
        name: 'AI Humanizer',
        connectionType: 'stdio' as const,
        command: 'npx',
        args: ['-y', 'ai-humanizer-mcp-server']
      },
      {
        name: 'Sequential Thinking',
        connectionType: 'stdio' as const,
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-sequential-thinking']
      },
      {
        name: 'Sequential Thinking Tools',
        connectionType: 'stdio' as const,
        command: 'npx',
        args: ['-y', 'mcp-sequentialthinking-tools']
      },
      {
        name: 'Claude Code',
        connectionType: 'stdio' as const,
        command: 'claude',
        args: ['mcp', 'start']
      },
      {
        name: 'Memory (Docker)',
        connectionType: 'stdio' as const,
        command: 'docker',
        args: ['run', '-i', '-v', 'claude-memory:/app/dist', '--rm', 'mcp/memory']
      }
    ];

    // Create a modal to select preset
    const modal = new Modal(this.app);
    modal.titleEl.setText('Select Preset Server');
    
    presets.forEach(preset => {
      const button = modal.contentEl.createEl('button', {
        text: preset.name,
        cls: 'preset-button'
      });
      button.onclick = () => {
        const newServer: MCPServer = {
          id: `server-${Date.now()}`,
          name: preset.name,
          connectionType: preset.connectionType,
          command: preset.command,
          args: preset.args,
          autoConnect: false,
          enabled: true
        };
        
        this.plugin.settings.servers.push(newServer);
        this.plugin.saveSettings();
        this.display();
        modal.close();
      };
    });

    modal.open();
  }

  editServer(index: number) {
    // For now, just refresh to show inline editing
    this.display();
  }

  async deleteServer(index: number) {
    const server = this.plugin.settings.servers[index];
    
    // Disconnect if connected
    const client = this.plugin.mcpClients.get(server.id);
    if (client) {
      await client.disconnect();
      this.plugin.mcpClients.delete(server.id);
    }
    
    // Remove from settings
    this.plugin.settings.servers.splice(index, 1);
    await this.plugin.saveSettings();
    this.display();
  }
}