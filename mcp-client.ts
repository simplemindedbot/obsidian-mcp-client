// Use native WebSocket API in browser environment

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

export interface MCPError extends Error {
  code?: number;
  data?: any;
}

export interface ConnectionOptions {
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
  maxRetryDelay?: number;
}

export interface ConnectionStatus {
  connected: boolean;
  url: string | null;
  connecting: boolean;
  lastError?: string;
  retryAttempt?: number;
}

export class MCPClient {
  private ws: WebSocket | null = null;
  private requestId = 0;
  private pendingRequests = new Map<string | number, {
    resolve: (value: any) => void;
    reject: (error: any) => void;
    timeout?: NodeJS.Timeout;
  }>();
  
  private connectionUrl: string | null = null;
  private isConnected = false;
  private isConnecting = false;
  private currentRetryAttempt = 0;
  private lastError: string | null = null;
  private connectionTimeout: NodeJS.Timeout | null = null;
  private retryTimeout: NodeJS.Timeout | null = null;

  private defaultOptions: ConnectionOptions = {
    timeout: 10000,
    retryAttempts: 3,
    retryDelay: 1000,
    maxRetryDelay: 10000
  };

  constructor(private onNotification?: (notification: MCPNotification) => void) {}

  async connect(url: string, options?: ConnectionOptions): Promise<void> {
    if (!this.isValidWebSocketUrl(url)) {
      throw new Error('Invalid WebSocket URL');
    }

    if (this.ws && this.isConnected) {
      await this.disconnect();
    }

    const opts = { ...this.defaultOptions, ...options };
    this.connectionUrl = url;
    this.currentRetryAttempt = 0;

    return this.attemptConnection(url, opts);
  }

  private isValidWebSocketUrl(url: string): boolean {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'ws:' || parsed.protocol === 'wss:';
    } catch {
      return false;
    }
  }

  private async attemptConnection(url: string, options: ConnectionOptions): Promise<void> {
    if (this.isConnecting) {
      throw new Error('Connection already in progress');
    }

    this.isConnecting = true;
    this.lastError = null;

    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(url);

      const cleanup = () => {
        if (this.connectionTimeout) {
          clearTimeout(this.connectionTimeout);
          this.connectionTimeout = null;
        }
        this.isConnecting = false;
      };

      this.connectionTimeout = setTimeout(() => {
        cleanup();
        this.ws?.close();
        const error = new Error(`Connection timeout after ${options.timeout}ms`) as MCPError;
        this.lastError = error.message;
        this.handleConnectionFailure(error, options, resolve, reject);
      }, options.timeout);

      this.ws.addEventListener('open', () => {
        cleanup();
        this.isConnected = true;
        this.currentRetryAttempt = 0;
        console.log('MCP Client connected to', url);
        resolve();
      });

      this.ws.addEventListener('close', () => {
        cleanup();
        this.isConnected = false;
        console.log('MCP Client disconnected');
      });

      this.ws.addEventListener('error', (event: Event) => {
        cleanup();
        console.error('MCP Client error:', event);
        const error = new Error('WebSocket connection error') as MCPError;
        this.lastError = error.message;
        this.handleConnectionFailure(error, options, resolve, reject);
      });

      this.ws.addEventListener('message', (event: MessageEvent) => {
        try {
          const message = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('Failed to parse MCP message:', error);
        }
      });
    });
  }

  private handleConnectionFailure(
    error: MCPError, 
    options: ConnectionOptions, 
    resolve: () => void, 
    reject: (error: MCPError) => void
  ): void {
    this.currentRetryAttempt++;
    
    if (this.currentRetryAttempt <= (options.retryAttempts || 0)) {
      const delay = Math.min(
        (options.retryDelay || 1000) * Math.pow(2, this.currentRetryAttempt - 1),
        options.maxRetryDelay || 10000
      );
      
      console.log(`Retrying connection in ${delay}ms (attempt ${this.currentRetryAttempt}/${options.retryAttempts})`);
      
      this.retryTimeout = setTimeout(() => {
        this.attemptConnection(this.connectionUrl!, options)
          .then(resolve)
          .catch(reject);
      }, delay);
    } else {
      reject(error);
    }
  }

  async disconnect(): Promise<void> {
    this.clearTimeouts();
    this.clearPendingRequests('Connection closed');
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    this.isConnected = false;
    this.isConnecting = false;
    this.connectionUrl = null;
    this.lastError = null;
    this.currentRetryAttempt = 0;
  }

  private clearTimeouts(): void {
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
    }
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
      this.retryTimeout = null;
    }
  }

  private clearPendingRequests(reason: string): void {
    for (const [id, { reject, timeout }] of this.pendingRequests) {
      if (timeout) clearTimeout(timeout);
      reject(new Error(reason));
    }
    this.pendingRequests.clear();
  }

  private handleMessage(message: MCPResponse | MCPNotification) {
    // Handle responses
    if ('id' in message) {
      const pending = this.pendingRequests.get(message.id);
      if (pending) {
        if (pending.timeout) clearTimeout(pending.timeout);
        this.pendingRequests.delete(message.id);
        
        if (message.error) {
          const error = new Error(message.error.message) as MCPError;
          error.code = message.error.code;
          error.data = message.error.data;
          pending.reject(error);
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

  private async sendRequest(method: string, params?: any, timeoutMs = 30000): Promise<any> {
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
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(id);
        reject(new Error(`Request timeout after ${timeoutMs}ms`));
      }, timeoutMs);

      this.pendingRequests.set(id, { resolve, reject, timeout });
      
      try {
        this.ws!.send(JSON.stringify(request));
      } catch (error) {
        clearTimeout(timeout);
        this.pendingRequests.delete(id);
        reject(error);
      }
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

  getConnectionStatus(): ConnectionStatus {
    return {
      connected: this.isConnected,
      url: this.connectionUrl,
      connecting: this.isConnecting,
      lastError: this.lastError,
      retryAttempt: this.currentRetryAttempt > 0 ? this.currentRetryAttempt : undefined
    };
  }
}