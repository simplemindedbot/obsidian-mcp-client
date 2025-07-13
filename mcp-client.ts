import WebSocket from 'ws';

export interface MCPRequest {
  jsonrpc: '2.0';
  id: string | number;
  method: string;
  params?: any;
}

export interface MCPResponse {
  jsonrpc: '2.0';
  id: string | number;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

export interface MCPNotification {
  jsonrpc: '2.0';
  method: string;
  params?: any;
}

export interface MCPResource {
  uri: string;
  name: string;
  description?: string;
  mimeType?: string;
}

export interface MCPTool {
  name: string;
  description?: string;
  inputSchema: any;
}

export class MCPClient {
  private ws: WebSocket | null = null;
  private requestId = 0;
  private pendingRequests = new Map<string | number, {
    resolve: (value: any) => void;
    reject: (error: any) => void;
  }>();
  
  private connectionUrl: string | null = null;
  private isConnected = false;

  constructor(private onNotification?: (notification: MCPNotification) => void) {}

  async connect(url: string): Promise<void> {
    if (this.ws && this.isConnected) {
      await this.disconnect();
    }

    return new Promise((resolve, reject) => {
      this.connectionUrl = url;
      this.ws = new WebSocket(url);

      this.ws.on('open', () => {
        this.isConnected = true;
        console.log('MCP Client connected to', url);
        resolve();
      });

      this.ws.on('close', () => {
        this.isConnected = false;
        console.log('MCP Client disconnected');
      });

      this.ws.on('error', (error) => {
        console.error('MCP Client error:', error);
        reject(error);
      });

      this.ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleMessage(message);
        } catch (error) {
          console.error('Failed to parse MCP message:', error);
        }
      });
    });
  }

  async disconnect(): Promise<void> {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.isConnected = false;
    }
  }

  private handleMessage(message: MCPResponse | MCPNotification) {
    // Handle responses
    if ('id' in message) {
      const pending = this.pendingRequests.get(message.id);
      if (pending) {
        this.pendingRequests.delete(message.id);
        if (message.error) {
          pending.reject(new Error(message.error.message));
        } else {
          pending.resolve(message.result);
        }
      }
    } else {
      // Handle notifications
      if (this.onNotification) {
        this.onNotification(message);
      }
    }
  }

  private async sendRequest(method: string, params?: any): Promise<any> {
    if (!this.ws || !this.isConnected) {
      throw new Error('Not connected to MCP server');
    }

    const id = ++this.requestId;
    const request: MCPRequest = {
      jsonrpc: '2.0',
      id,
      method,
      params
    };

    return new Promise((resolve, reject) => {
      this.pendingRequests.set(id, { resolve, reject });
      this.ws!.send(JSON.stringify(request));
    });
  }

  async initialize(clientInfo: { name: string; version: string }): Promise<any> {
    return this.sendRequest('initialize', {
      protocolVersion: '2024-11-05',
      capabilities: {
        roots: { listChanged: true },
        sampling: {}
      },
      clientInfo
    });
  }

  async listResources(): Promise<MCPResource[]> {
    const response = await this.sendRequest('resources/list');
    return response.resources || [];
  }

  async readResource(uri: string): Promise<any> {
    return this.sendRequest('resources/read', { uri });
  }

  async listTools(): Promise<MCPTool[]> {
    const response = await this.sendRequest('tools/list');
    return response.tools || [];
  }

  async callTool(name: string, arguments_?: any): Promise<any> {
    return this.sendRequest('tools/call', {
      name,
      arguments: arguments_
    });
  }

  getConnectionStatus(): { connected: boolean; url: string | null } {
    return {
      connected: this.isConnected,
      url: this.connectionUrl
    };
  }
}