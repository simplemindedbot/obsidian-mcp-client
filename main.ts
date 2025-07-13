import { App, Plugin, PluginSettingTab, Setting, Notice, ItemView, WorkspaceLeaf } from 'obsidian';
import { MCPClient, MCPResource, MCPTool } from './mcp-client';

interface MCPClientSettings {
  serverUrl: string;
  autoConnect: boolean;
}

const DEFAULT_SETTINGS: MCPClientSettings = {
  serverUrl: 'ws://localhost:3000',
  autoConnect: false
};

const VIEW_TYPE_MCP = 'mcp-view';

export default class MCPClientPlugin extends Plugin {
  settings: MCPClientSettings;
  mcpClient: MCPClient;

  async onload() {
    await this.loadSettings();

    this.mcpClient = new MCPClient((notification) => {
      console.log('MCP Notification:', notification);
    });

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
      id: 'connect-mcp',
      name: 'Connect to MCP Server',
      callback: () => this.connectToServer()
    });

    this.addCommand({
      id: 'disconnect-mcp',
      name: 'Disconnect from MCP Server',
      callback: () => this.disconnectFromServer()
    });

    // Add settings tab
    this.addSettingTab(new MCPSettingTab(this.app, this));

    // Auto-connect if enabled
    if (this.settings.autoConnect) {
      setTimeout(() => this.connectToServer(), 1000);
    }
  }

  async onunload() {
    await this.mcpClient.disconnect();
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
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

  async connectToServer() {
    try {
      await this.mcpClient.connect(this.settings.serverUrl);
      await this.mcpClient.initialize({
        name: 'Obsidian MCP Client',
        version: '0.1.0'
      });
      new Notice('Connected to MCP server');
      this.refreshView();
    } catch (error) {
      new Notice(`Failed to connect: ${error.message}`);
      console.error('MCP connection failed:', error);
    }
  }

  async disconnectFromServer() {
    await this.mcpClient.disconnect();
    new Notice('Disconnected from MCP server');
    this.refreshView();
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

    const status = this.plugin.mcpClient.getConnectionStatus();
    
    const statusEl = container.createDiv('mcp-status');
    statusEl.createEl('p', {
      text: `Status: ${status.connected ? 'Connected' : 'Disconnected'}`,
      cls: status.connected ? 'status-connected' : 'status-disconnected'
    });
    
    if (status.url) {
      statusEl.createEl('p', { text: `URL: ${status.url}` });
    }

    // Connection controls
    const controlsEl = container.createDiv('mcp-controls');
    
    const connectBtn = controlsEl.createEl('button', {
      text: status.connected ? 'Disconnect' : 'Connect'
    });
    connectBtn.onclick = () => {
      if (status.connected) {
        this.plugin.disconnectFromServer();
      } else {
        this.plugin.connectToServer();
      }
    };

    if (status.connected) {
      // Resources section
      const resourcesEl = container.createDiv('mcp-resources');
      resourcesEl.createEl('h3', { text: 'Resources' });
      
      const refreshResourcesBtn = resourcesEl.createEl('button', {
        text: 'Refresh Resources'
      });
      refreshResourcesBtn.onclick = () => this.loadResources(resourcesEl);

      this.loadResources(resourcesEl);

      // Tools section
      const toolsEl = container.createDiv('mcp-tools');
      toolsEl.createEl('h3', { text: 'Tools' });
      
      const refreshToolsBtn = toolsEl.createEl('button', {
        text: 'Refresh Tools'
      });
      refreshToolsBtn.onclick = () => this.loadTools(toolsEl);

      this.loadTools(toolsEl);
    }
  }

  async loadResources(container: HTMLElement) {
    const resourceListEl = container.querySelector('.resource-list') as HTMLElement;
    if (resourceListEl) {
      resourceListEl.remove();
    }

    try {
      const resources = await this.plugin.mcpClient.listResources();
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
        
        const readBtn = itemEl.createEl('button', { text: 'Read' });
        readBtn.onclick = async () => {
          try {
            const content = await this.plugin.mcpClient.readResource(resource.uri);
            console.log('Resource content:', content);
            new Notice('Resource content logged to console');
          } catch (error) {
            new Notice(`Failed to read resource: ${error.message}`);
          }
        };
      });
    } catch (error) {
      container.createEl('p', { text: `Error loading resources: ${error.message}` });
    }
  }

  async loadTools(container: HTMLElement) {
    const toolListEl = container.querySelector('.tool-list') as HTMLElement;
    if (toolListEl) {
      toolListEl.remove();
    }

    try {
      const tools = await this.plugin.mcpClient.listTools();
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
        
        const callBtn = itemEl.createEl('button', { text: 'Call' });
        callBtn.onclick = async () => {
          try {
            const result = await this.plugin.mcpClient.callTool(tool.name, {});
            console.log('Tool result:', result);
            new Notice('Tool result logged to console');
          } catch (error) {
            new Notice(`Failed to call tool: ${error.message}`);
          }
        };
      });
    } catch (error) {
      container.createEl('p', { text: `Error loading tools: ${error.message}` });
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

    new Setting(containerEl)
      .setName('Server URL')
      .setDesc('WebSocket URL of the MCP server')
      .addText(text => text
        .setPlaceholder('ws://localhost:3000')
        .setValue(this.plugin.settings.serverUrl)
        .onChange(async (value) => {
          this.plugin.settings.serverUrl = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Auto-connect')
      .setDesc('Automatically connect to server on startup')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.autoConnect)
        .onChange(async (value) => {
          this.plugin.settings.autoConnect = value;
          await this.plugin.saveSettings();
        }));
  }
}