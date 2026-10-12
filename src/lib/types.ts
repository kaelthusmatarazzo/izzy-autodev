export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  toolCalls?: {
    name: string;
    args: Record<string, any>;
    result?: any;
    status: 'pending' | 'success' | 'error';
    mcpServer?: string;
  }[];
  deployStatus?: 'idle' | 'building' | 'ready' | 'error';
  deployUrl?: string;
}

export interface FileItem {
  path: string;
  type: 'file' | 'dir';
  size?: number;
}

export interface DeployInfo {
  state: 'INITIALIZING' | 'BUILDING' | 'READY' | 'ERROR' | 'CANCELED' | 'UNKNOWN';
  url?: string;
  createdAt?: number;
  errorMessage?: string;
}

export interface IzzyState {
  mood: 'happy' | 'coding' | 'thinking' | 'excited' | 'proud' | 'error';
  statusText: string;
}

export interface McpServerConfig {
  id: string;
  name: string;
  url: string;
  description?: string;
  token?: string;
  enabled: boolean;
  isBuiltin?: boolean;
}

export interface McpToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties?: Record<string, any>;
    required?: string[];
  };
  serverName?: string;
}
