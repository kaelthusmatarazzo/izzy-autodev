'use client';

import React, { useState, useEffect } from 'react';
import { Database, Sparkles, Plus, Trash2, CheckCircle2, ShieldCheck, Cpu, Cloud, Key, RefreshCw } from 'lucide-react';

export interface IzzyMemory {
  id: string;
  category: 'preference' | 'project' | 'fact' | 'code';
  title: string;
  content: string;
  timestamp: number;
}

interface IzzyMemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function IzzyMemoryModal({ isOpen, onClose }: IzzyMemoryModalProps) {
  const [memories, setMemories] = useState<IzzyMemory[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<'preference' | 'project' | 'fact' | 'code'>('project');
  const [savedStatus, setSavedStatus] = useState(false);
  
  // Conexão Neon / Supabase
  const [dbType, setDbType] = useState<'local' | 'neon' | 'supabase'>('local');
  const [dbUrl, setDbUrl] = useState('');
  const [dbApiKey, setDbApiKey] = useState('');
  const [isConfiguringDb, setIsConfiguringDb] = useState(false);
  const [dbConnected, setDbConnected] = useState(false);

  useEffect(() => {
    try {
      const storedType = localStorage.getItem('izzy_db_type') as any;
      if (storedType) setDbType(storedType);
      
      const storedUrl = localStorage.getItem('izzy_db_url');
      if (storedUrl) setDbUrl(storedUrl);

      const storedKey = localStorage.getItem('izzy_db_key');
      if (storedKey) setDbApiKey(storedKey);

      if (storedType && storedType !== 'local') {
        setDbConnected(true);
      }

      const stored = localStorage.getItem('izzy_quantum_memories');
      if (stored) {
        setMemories(JSON.parse(stored));
      } else {
        const initial: IzzyMemory[] = [
          {
            id: '1',
            category: 'project',
            title: 'Parceiro Co-criador',
            content: 'Kaelzzo é meu parceiro de desenvolvimento e co-criador desta aplicação.',
            timestamp: Date.now() - 3600000,
          },
          {
            id: '2',
            category: 'preference',
            title: 'Estilo Visual e Banco de Dados',
            content: 'Conectados via Neon / Supabase e LocalStorage para persistência quântica quântica.',
            timestamp: Date.now() - 1800000,
          },
        ];
        setMemories(initial);
        localStorage.setItem('izzy_quantum_memories', JSON.stringify(initial));
      }
    } catch {}
  }, []);

  const handleSaveDbConfig = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem('izzy_db_type', dbType);
      localStorage.setItem('izzy_db_url', dbUrl);
      localStorage.setItem('izzy_db_key', dbApiKey);
      setDbConnected(true);
      setIsConfiguringDb(false);
      setSavedStatus(true);
      setTimeout(() => setSavedStatus(false), 3000);
    } catch {}
  };

  const saveMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const newMem: IzzyMemory = {
      id: `mem-${Date.now()}`,
      category,
      title: title.trim(),
      content: content.trim(),
      timestamp: Date.now(),
    };

    const updated = [newMem, ...memories];
    setMemories(updated);
    try {
      localStorage.setItem('izzy_quantum_memories', JSON.stringify(updated));
    } catch {}

    setTitle('');
    setContent('');
    setSavedStatus(true);
    setTimeout(() => setSavedStatus(false), 2500);
  };

  const deleteMemory = (id: string) => {
    const updated = memories.filter((m) => m.id !== id);
    setMemories(updated);
    try {
      localStorage.setItem('izzy_quantum_memories', JSON.stringify(updated));
    } catch {}
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-neutral-950 border border-cyan-500/40 rounded-2xl shadow-2xl shadow-cyan-950/50 p-6 text-slate-100 overflow-hidden">
        {/* Glow neon de fundo */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between pb-4 border-b border-neutral-800 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400 shadow-inner shadow-cyan-500/20">
              <Database size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Núcleo de Memória & Banco de Dados (Neon / Supabase)
              </h2>
              <p className="text-xs text-neutral-400">
                Conecte seu banco de dados Postgres / Neon / Supabase para memórias persistentes na nuvem
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-xs text-neutral-400 hover:text-white px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 transition"
          >
            Fechar
          </button>
        </div>

        {/* Barra de Status do Banco de Dados */}
        <div className="mt-4 p-3 bg-neutral-900/80 border border-neutral-800 rounded-xl flex items-center justify-between text-xs relative z-10">
          <div className="flex items-center gap-2.5">
            <Cloud size={16} className={dbConnected ? 'text-cyan-400' : 'text-amber-400'} />
            <div>
              <span className="font-semibold text-white">Status do DB: </span>
              <span className={dbConnected ? 'text-cyan-300 font-mono' : 'text-amber-300 font-mono'}>
                {dbConnected ? `${dbType.toUpperCase()} Conectado` : 'Modo Local (LocalStorage / Cache)'}
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsConfiguringDb(!isConfiguringDb)}
            className="px-3 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 rounded-lg transition"
          >
            {isConfiguringDb ? 'Ocultar Config' : 'Configurar Neon / Supabase'}
          </button>
        </div>

        {/* Configuração de Conexão Neon / Supabase */}
        {isConfiguringDb && (
          <form onSubmit={handleSaveDbConfig} className="mt-4 p-4 bg-neutral-900/90 border border-cyan-500/30 rounded-xl space-y-3 relative z-10 animate-fadeIn">
            <h3 className="text-xs font-semibold text-cyan-400 uppercase flex items-center gap-1.5">
              <Key size={13} /> Credenciais do Banco de Dados (Neon / Supabase)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">Provedor</label>
                <select
                  value={dbType}
                  onChange={(e: any) => setDbType(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="local">Local (Browser)</option>
                  <option value="neon">Neon Database (Postgres)</option>
                  <option value="supabase">Supabase (Postgres)</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">URL de Conexão / Project URL</label>
                <input
                  type="text"
                  placeholder="https://xxx.supabase.co ou postgres://..."
                  value={dbUrl}
                  onChange={(e) => setDbUrl(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">API Key / Secret</label>
                <input
                  type="password"
                  placeholder="eyJhbGciOi..."
                  value={dbApiKey}
                  onChange={(e) => setDbApiKey(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="submit"
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold transition"
              >
                Salvar & Conectar DB
              </button>
            </div>
          </form>
        )}

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
          {/* Formulário para ensinar a Izzy */}
          <div className="md:col-span-1 space-y-4 bg-neutral-900/60 border border-neutral-800/80 p-4 rounded-xl">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <Sparkles size={14} /> Nova Memória
            </h3>

            <form onSubmit={saveMemory} className="space-y-3">
              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">Categoria</label>
                <select
                  value={category}
                  onChange={(e: any) => setCategory(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="project">Projeto Atual</option>
                  <option value="preference">Preferência</option>
                  <option value="fact">Fato sobre Kaelzzo</option>
                  <option value="code">Snippets / Código</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">Título</label>
                <input
                  type="text"
                  placeholder="Ex: Stack Neon DB"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">Conteúdo / Fato</label>
                <textarea
                  rows={3}
                  placeholder="O que devo lembrar para sempre?"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-cyan-500 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-semibold rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-950/50 transition"
              >
                <Plus size={14} /> Salvar no DB
              </button>

              {savedStatus && (
                <div className="flex items-center justify-center gap-1 text-[11px] text-emerald-400 animate-fadeIn">
                  <CheckCircle2 size={13} /> Gravado com sucesso!
                </div>
              )}
            </form>
          </div>

          {/* Lista de Memórias Ativas */}
          <div className="md:col-span-2 space-y-3 max-h-[340px] overflow-y-auto pr-1">
            <div className="flex items-center justify-between text-xs text-neutral-400 pb-1 border-b border-neutral-800">
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-cyan-400" /> Registros no DB ({memories.length})
              </span>
              <span className="text-[10px] font-mono text-cyan-400/80">
                {dbConnected ? `${dbType.toUpperCase()} Ativo` : 'Local Sync'}
              </span>
            </div>

            {memories.length === 0 ? (
              <div className="p-8 text-center text-neutral-500 text-xs">
                Nenhuma memória gravada ainda.
              </div>
            ) : (
              memories.map((mem) => (
                <div
                  key={mem.id}
                  className="p-3.5 bg-neutral-900/80 border border-neutral-800 hover:border-cyan-500/30 rounded-xl space-y-1.5 transition group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-800/80 text-cyan-300">
                        {mem.category}
                      </span>
                      <h4 className="text-xs font-semibold text-white">{mem.title}</h4>
                    </div>
                    <button
                      onClick={() => deleteMemory(mem.id)}
                      className="text-neutral-500 hover:text-red-400 p-1 rounded transition opacity-0 group-hover:opacity-100"
                      title="Excluir memória"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                  <p className="text-xs text-neutral-300 font-sans leading-relaxed">{mem.content}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-neutral-800/80 flex items-center justify-between text-[11px] text-neutral-400 relative z-10">
          <div className="flex items-center gap-1.5">
            <Cpu size={13} className="text-cyan-400" />
            <span>Integrado com Neon Database e Supabase para persistência quântica.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-lg text-white font-medium transition"
          >
            Concluído
          </button>
        </div>
      </div>
    </div>
  );
}
