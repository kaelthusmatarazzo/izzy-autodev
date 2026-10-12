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
