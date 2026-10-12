import { McpServerConfig, McpToolDefinition } from './types';
import { Type, FunctionDeclaration } from '@google/genai';

// Built-in MCP Servers padrão que a Izzy já vem equipada
export const DEFAULT_BUILTIN_MCPS: McpServerConfig[] = [
  {
    id: 'mcp-web-fetch',
    name: 'Web Fetch & Scraper',
    url: 'builtin:web-fetch',
    description: 'Permite à Izzy ler qualquer página, documentação ou API na internet',
    enabled: true,
    isBuiltin: true,
  },
  {
    id: 'mcp-js-sandbox',
    name: 'JavaScript Code Runner',
    url: 'builtin:js-sandbox',
    description: 'Executa código JavaScript dinamicamente para cálculos e testes em tempo real',
    enabled: true,
    isBuiltin: true,
  },
];

// Ferramentas dos MCPs nativos
export const BUILTIN_MCP_TOOLS: McpToolDefinition[] = [
  {
    name: 'fetch_web_content',
    description: 'Lê o conteúdo em texto ou Markdown de uma URL pública na web (documentações, páginas, dados).',
    serverName: 'Web Fetch & Scraper',
    parameters: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: 'A URL completa da página a ser lida (ex: https://nextjs.org/docs)',
        },
      },
      required: ['url'],
    },
  },
  {
    name: 'execute_javascript',
    description: 'Executa uma função ou expressão JavaScript isolada e retorna o resultado da execução.',
    serverName: 'JavaScript Code Runner',
    parameters: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          description: 'Código JavaScript a ser executado (ex: "Math.sqrt(144) * 5" ou "const arr = [1,2,3]; arr.map(x => x*2)")',
        },
      },
      required: ['code'],
    },
  },
];

/**
 * Executa ferramentas embutidas (Builtin MCPs)
 */
export async function executeBuiltinMcpTool(name: string, args: Record<string, any>): Promise<any> {
  if (name === 'fetch_web_content') {
    const url = args.url;
    if (!url) throw new Error('URL é obrigatória.');

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Izzy-MCP-Client/1.0',
        Accept: 'text/html,application/xhtml+xml,application/json,text/plain;q=0.9',
      },
    });

    if (!res.ok) {
      throw new Error(`Falha ao ler URL ${url} (${res.status}): ${res.statusText}`);
    }

    const text = await res.text();
    // Limpeza simples de HTML para texto útil (máximo 4000 caracteres para prompt ágil)
    const cleanText = text
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    return {
      url,
      status: res.status,
      content: cleanText.slice(0, 4000),
    };
  }

  if (name === 'execute_javascript') {
    const code = args.code;
    if (!code) throw new Error('Código é obrigatório.');

    try {
      // Execução isolada usando Function
      const run = new Function(`"use strict"; return (${code});`);
      const result = run();
      return {
        output: typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result),
      };
    } catch (err: any) {
      return {
        error: `Erro de execução: ${err.message}`,
      };
    }
  }

  throw new Error(`Ferramenta embutida desconhecida: ${name}`);
}

/**
 * Consulta a lista de ferramentas de um servidor MCP remoto (Protocolo JSON-RPC 2.0 ou REST)
 */
export async function fetchRemoteMcpTools(server: McpServerConfig): Promise<McpToolDefinition[]> {
  if (server.isBuiltin) {
    return BUILTIN_MCP_TOOLS.filter((t) => t.serverName === server.name);
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json, text/event-stream',
  };

  if (server.token) {
    headers['Authorization'] = server.token.startsWith('Bearer ') ? server.token : `Bearer ${server.token}`;
  }

  try {
    // 1. Tentar chamada padrão JSON-RPC 2.0 (MCP tools/list)
    const jsonRpcPayload = {
      jsonrpc: '2.0',
      id: Date.now(),
      method: 'tools/list',
      params: {},
    };

    const res = await fetch(server.url, {
      method: 'POST',
      headers,
      body: JSON.stringify(jsonRpcPayload),
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`Servidor MCP retornou status ${res.status}`);
    }

    const data = await res.json();
    const rawTools = data.result?.tools || data.tools || [];

    return rawTools.map((t: any) => ({
      name: t.name,
      description: t.description || `Ferramenta fornecida pelo MCP ${server.name}`,
      serverName: server.name,
      parameters: t.inputSchema || t.parameters || { type: 'object', properties: {} },
    }));
  } catch (err: any) {
    console.warn(`[MCP Client] Falha ao descobrir ferramentas em ${server.url}: ${err.message}`);
    return [];
  }
}

/**
 * Chama uma ferramenta em um servidor MCP remoto (JSON-RPC 2.0 tools/call)
 */
export async function callRemoteMcpTool(
  server: McpServerConfig,
  toolName: string,
  args: Record<string, any>
): Promise<any> {
  if (server.isBuiltin) {
    return executeBuiltinMcpTool(toolName, args);
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  if (server.token) {
    headers['Authorization'] = server.token.startsWith('Bearer ') ? server.token : `Bearer ${server.token}`;
  }

  const payload = {
    jsonrpc: '2.0',
    id: Date.now(),
    method: 'tools/call',
    params: {
      name: toolName,
      arguments: args,
    },
  };

  const res = await fetch(server.url, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`MCP ${server.name} falhou (${res.status}): ${errText}`);
  }

  const data = await res.json();
  if (data.error) {
    throw new Error(`Erro MCP: ${data.error.message || JSON.stringify(data.error)}`);
  }

  return data.result || data;
}

/**
 * Converte a definição de ferramenta MCP para FunctionDeclaration do Gemini
 */
export function convertMcpToolToGeminiFunction(tool: McpToolDefinition): FunctionDeclaration {
  return {
    name: tool.name,
    description: tool.description,
    parameters: {
      type: Type.OBJECT,
      properties: tool.parameters?.properties || {},
    },
  };
}
