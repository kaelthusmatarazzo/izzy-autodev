'use client';

import React, { useState } from 'react';
import { X, Plug, Plus, Trash2, Power, Globe, Terminal, CheckCircle2, AlertCircle, Sparkles, ExternalLink } from 'lucide-react';
import { McpServerConfig } from '@/lib/types';
import { DEFAULT_BUILTIN_MCPS } from '@/lib/mcp';

interface McpModalProps {
  isOpen: boolean;
  onClose: () => void;
  servers: McpServerConfig[];
  onUpdateServers: (servers: McpServerConfig[]) => void;
}

export default function McpModal({ isOpen, onClose, servers, onUpdateServers }: McpModalProps) {
  const [activeTab, setActiveTab] = useState<'installed' | 'add' | 'catalog'>('installed');
  const [newName, setNewName] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newToken, setNewToken] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');

  if (!isOpen) return null;

  const handleToggleServer = (id: string) => {
    const updated = servers.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s));
    onUpdateServers(updated);
  };

  const handleDeleteServer = (id: string) => {
    const updated = servers.filter((s) => s.id !== id);
    onUpdateServers(updated);
  };

  const handleAddCustomServer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newUrl.trim()) return;

    setTestStatus('testing');
    setTestMessage('Testando conexão com o servidor MCP...');

    try {
      // Teste leve de ping no endpoint
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (newToken.trim()) {
        headers['Authorization'] = newToken.startsWith('Bearer ') ? newToken : `Bearer ${newToken}`;
      }

      const res = await fetch(newUrl.trim(), {
        method: 'POST',
        headers,
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/list', params: {} }),
      }).catch(() => null);

      const newServer: McpServerConfig = {
        id: `mcp-${Date.now()}`,
        name: newName.trim(),
        url: newUrl.trim(),
        description: newDescription.trim() || 'Servidor MCP customizado',
        token: newToken.trim() || undefined,
        enabled: true,
        isBuiltin: false,
      };

      const updated = [...servers, newServer];
      onUpdateServers(updated);

      setTestStatus('success');
      setTestMessage(
        res && res.ok
          ? 'Servidor MCP validado e conectado com sucesso!'
          : 'Servidor adicionado! A Izzy tentará se comunicar com ele via JSON-RPC.'
      );

      setTimeout(() => {
        setNewName('');
        setNewUrl('');
        setNewToken('');
        setNewDescription('');
        setTestStatus('idle');
        setActiveTab('installed');
      }, 1200);
    } catch (err: any) {
      setTestStatus('error');
      setTestMessage(`Erro ao conectar: ${err.message}`);
    }
  };

  const catalogPresets = [
    {
      name: 'Brave Search MCP',
      desc: 'Pesquisa na web e índices de notícias em tempo real via Brave Search API.',
      url: 'https://api.brave.com/res/v1/web/search',
      tokenNote: 'Requer Brave API Key',
    },
    {
      name: 'PostgreSQL Database MCP',
      desc: 'Executa queries, lê esquemas e gerencia tabelas em bancos de dados remotos.',
      url: 'https://mcp.neondb.com/v1',
      tokenNote: 'Requer Neon / Postgres Connection String',
    },
    {
      name: 'Render Cloud MCP',
      desc: 'Gerencia deploys, serviços em nuvem, cron jobs e instâncias na Render.',
      url: 'https://api.render.com/v1/mcp',
      tokenNote: 'Requer Render API Token',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] text-slate-100">
        {/* Cabeçalho */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-500/10 rounded-xl border border-cyan-500/30 text-cyan-400">
              <Plug size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Central de Protocolos MCP
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono">
                  100% Livre
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Conecte servidores MCP externos para dar superpoderes ilimitados à Izzy
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Abas */}
        <div className="flex items-center gap-2 px-5 pt-3 border-b border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('installed')}
            className={`pb-3 font-semibold transition border-b-2 ${
              activeTab === 'installed'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Instalados ({servers.length})
          </button>
          <button
            onClick={() => setActiveTab('add')}
            className={`pb-3 font-semibold transition border-b-2 ${
              activeTab === 'add'
                ? 'border-pink-400 text-pink-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            + Conectar Novo Servidor
          </button>
          <button
            onClick={() => setActiveTab('catalog')}
            className={`pb-3 font-semibold transition border-b-2 ${
              activeTab === 'catalog'
                ? 'border-purple-400 text-purple-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Catálogo & Ideias
          </button>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {activeTab === 'installed' && (
            <div className="space-y-3">
              {servers.map((server) => (
                <div
                  key={server.id}
                  className={`p-4 rounded-xl border transition-all ${
                    server.enabled
                      ? 'bg-slate-950/70 border-slate-700/80'
                      : 'bg-slate-950/30 border-slate-850 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          server.enabled ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'
                        }`}
                      />
                      <span className="font-bold text-slate-200 text-sm">{server.name}</span>
                      {server.isBuiltin && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-pink-500/10 text-pink-300 border border-pink-500/20 font-mono">
                          Nativo
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleServer(server.id)}
                        className={`p-1.5 rounded-lg border transition ${
                          server.enabled
                            ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
                            : 'bg-slate-800 border-slate-700 text-slate-400'
                        }`}
                        title={server.enabled ? 'Desativar MCP' : 'Ativar MCP'}
                      >
                        <Power size={14} />
                      </button>
                      {!server.isBuiltin && (
                        <button
                          onClick={() => handleDeleteServer(server.id)}
                          className="p-1.5 rounded-lg bg-red-950/50 hover:bg-red-900/50 border border-red-800/40 text-red-300 transition"
                          title="Remover Servidor"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-slate-400 mb-2">{server.description}</p>
                  <div className="font-mono text-[11px] text-cyan-400/80 bg-slate-900 px-2 py-1 rounded truncate">
                    Endpoint: {server.url}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'add' && (
            <form onSubmit={handleAddCustomServer} className="space-y-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nome do Servidor MCP</label>
                <input
                  type="text"
                  placeholder="Ex: Busca na Web, Banco de Dados, etc."
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-pink-500 focus:outline-none text-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  URL do Endpoint MCP (JSON-RPC 2.0 / SSE / REST)
                </label>
                <input
                  type="url"
                  placeholder="https://meu-servidor-mcp.com/sse ou /tools"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-cyan-500 focus:outline-none text-slate-200 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Token de Autorização / API Key (Opcional)
                </label>
                <input
                  type="password"
                  placeholder="Bearer token ou chave de autenticação do servidor"
                  value={newToken}
                  onChange={(e) => setNewToken(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-cyan-500 focus:outline-none text-slate-200 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Descrição</label>
                <input
                  type="text"
                  placeholder="Ex: Dá à Izzy a capacidade de consultar cotações e preços"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-pink-500 focus:outline-none text-slate-200 text-xs"
                />
              </div>

              {testStatus !== 'idle' && (
                <div
                  className={`p-3 rounded-xl border flex items-center gap-2 ${
                    testStatus === 'success'
                      ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                      : testStatus === 'error'
                      ? 'bg-red-950/60 border-red-500/40 text-red-300'
                      : 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300'
                  }`}
                >
                  {testStatus === 'success' ? (
                    <CheckCircle2 size={16} />
                  ) : testStatus === 'error' ? (
                    <AlertCircle size={16} />
                  ) : (
                    <Sparkles size={16} className="animate-spin" />
                  )}
                  <span>{testMessage}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={testStatus === 'testing'}
                className="w-full py-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 disabled:opacity-50 text-white font-semibold rounded-xl shadow-lg transition flex items-center justify-center gap-2"
              >
                <Plus size={16} /> Conectar Servidor MCP
              </button>
            </form>
          )}

          {activeTab === 'catalog' && (
            <div className="space-y-3">
              <p className="text-slate-400">
                Você pode conectar qualquer servidor compatível com o padrão open-source do <strong>Model Context Protocol</strong>:
              </p>
              {catalogPresets.map((preset, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-purple-500/40 transition"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-200 text-sm">{preset.name}</span>
                    <button
                      onClick={() => {
                        setNewName(preset.name);
                        setNewUrl(preset.url);
                        setNewDescription(preset.desc);
                        setActiveTab('add');
                      }}
                      className="px-2.5 py-1 bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 rounded-lg text-[11px] font-semibold transition"
                    >
                      Preencher
                    </button>
                  </div>
                  <p className="text-slate-400 mb-1">{preset.desc}</p>
                  <div className="text-[10px] text-purple-400/80">{preset.tokenNote}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
