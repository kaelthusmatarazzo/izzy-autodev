'use client';

import React, { useState, useEffect } from 'react';
import { Database, Plus, Trash2, Sparkles, Brain, Check, X, ShieldCheck } from 'lucide-react';

interface MemoryItem {
  id: string;
  category: 'preference' | 'project' | 'fact' | 'code';
  key: string;
  value: string;
  updatedAt: number;
}

interface IzzyMemoryProps {
  isOpen: boolean;
  onClose: () => void;
  isMinimal: boolean;
}

export default function IzzyMemoryModal({ isOpen, onClose, isMinimal }: IzzyMemoryProps) {
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [newCategory, setNewCategory] = useState<'preference' | 'project' | 'fact' | 'code'>('project');
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [storageMode, setStorageMode] = useState<'localStorage' | 'neon-sql'>('localStorage');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('izzy_neural_memories');
        if (stored) {
          setMemories(JSON.parse(stored));
        } else {
          // Memórias iniciais padrão
          const initial: MemoryItem[] = [
            { id: '1', category: 'preference', key: 'Parceiro', value: 'Kaelzzo', updatedAt: Date.now() },
            { id: '2', category: 'project', key: 'Projeto Atual', value: 'Izzy Auto-Dev com Núcleo de Memória', updatedAt: Date.now() },
            { id: '3', category: 'fact', key: 'Estética', value: 'Minimalista Elegante e Néon Cyberpunk', updatedAt: Date.now() },
          ];
          setMemories(initial);
          localStorage.setItem('izzy_neural_memories', JSON.stringify(initial));
        }
      } catch {}
    }
  }, []);

  const saveToStorage = (updated: MemoryItem[]) => {
    setMemories(updated);
    try {
      localStorage.setItem('izzy_neural_memories', JSON.stringify(updated));
    } catch {}
  };

  const handleAddMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim() || !newValue.trim()) return;

    const newItem: MemoryItem = {
      id: `mem-${Date.now()}`,
      category: newCategory,
      key: newKey.trim(),
      value: newValue.trim(),
      updatedAt: Date.now(),
    };

    saveToStorage([newItem, ...memories]);
    setNewKey('');
    setNewValue('');
  };

  const handleDelete = (id: string) => {
    saveToStorage(memories.filter((m) => m.id !== id));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
      <div
        className={`w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[85vh] ${
          isMinimal
            ? 'bg-[#121216] border-neutral-800 text-neutral-100'
            : 'bg-slate-900 border-slate-800 text-slate-100'
        }`}
      >
        {/* Modal Header */}
        <div
          className={`px-6 py-4 border-b flex items-center justify-between ${
            isMinimal ? 'bg-[#18181c] border-neutral-800' : 'bg-slate-950 border-slate-800'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${isMinimal ? 'bg-neutral-800 text-white' : 'bg-pink-500/20 text-pink-400'}`}>
              <Brain size={20} />
            </div>
            <div>
              <h2 className="font-bold text-base flex items-center gap-2">
                Núcleo de Memória da Izzy
                <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  {storageMode === 'neon-sql' ? 'Neon DB / PostgreSQL' : 'LocalStorage Neural'}
                </span>
              </h2>
              <p className={`text-xs ${isMinimal ? 'text-neutral-400' : 'text-slate-400'}`}>
                Persistência de longo prazo para lembrar de você e dos nossos projetos.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition ${
              isMinimal ? 'hover:bg-neutral-800 text-neutral-400' : 'hover:bg-slate-800 text-slate-400'
            }`}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Seletor de Modo de Armazenamento */}
          <div className={`p-4 rounded-xl border flex items-center justify-between ${isMinimal ? 'bg-neutral-900 border-neutral-800' : 'bg-slate-950/60 border-slate-800'}`}>
            <div className="flex items-center gap-3">
              <Database size={18} className={isMinimal ? 'text-neutral-300' : 'text-pink-400'} />
              <div>
                <div className="text-xs font-semibold">Backend de Banco de Dados (Neon / Supabase)</div>
                <div className={`text-[11px] ${isMinimal ? 'text-neutral-400' : 'text-slate-400'}`}>
                  Atualmente operando em LocalStorage com schema SQL pronto para Neon PostgreSQL.
                </div>
              </div>
            </div>
            <button
              onClick={() => setStorageMode(storageMode === 'localStorage' ? 'neon-sql' : 'localStorage')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                isMinimal
                  ? 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-200'
                  : 'bg-pink-600/20 hover:bg-pink-600/30 border-pink-500/40 text-pink-200'
              }`}
            >
              {storageMode === 'localStorage' ? 'Ativar Schema Neon SQL' : 'Usar LocalStorage'}
            </button>
          </div>

          {/* Adicionar Nova Memória */}
          <form onSubmit={handleAddMemory} className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles size={14} className={isMinimal ? 'text-neutral-300' : 'text-cyan-400'} /> Ensinar Novo Fato à Izzy
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as any)}
                className={`px-3 py-2.5 rounded-xl text-xs border focus:outline-none ${
                  isMinimal
                    ? 'bg-neutral-950 border-neutral-800 text-neutral-200'
                    : 'bg-slate-950 border-slate-800 text-slate-200'
                }`}
              >
                <option value="project">Projeto</option>
                <option value="preference">Preferência</option>
                <option value="fact">Fato / Curiosidade</option>
                <option value="code">Snippets / Código</option>
              </select>

              <input
                type="text"
                placeholder="Chave (ex: Linguagem Favorita)"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                className={`px-3 py-2.5 rounded-xl text-xs border focus:outline-none ${
                  isMinimal
                    ? 'bg-neutral-950 border-neutral-800 text-neutral-200'
                    : 'bg-slate-950 border-slate-800 text-slate-200'
                }`}
              />

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Valor (ex: TypeScript & Next.js)"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  className={`flex-1 px-3 py-2.5 rounded-xl text-xs border focus:outline-none ${
                    isMinimal
                      ? 'bg-neutral-950 border-neutral-800 text-neutral-200'
                      : 'bg-slate-950 border-slate-800 text-slate-200'
                  }`}
                />
                <button
                  type="submit"
                  className={`px-4 py-2.5 rounded-xl font-bold transition flex items-center justify-center ${
                    isMinimal
                      ? 'bg-neutral-200 hover:bg-white text-neutral-900'
                      : 'bg-pink-600 hover:bg-pink-500 text-white'
                  }`}
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </form>

          {/* Lista de Memórias */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck size={14} className={isMinimal ? 'text-neutral-300' : 'text-emerald-400'} /> Registros na Memória Neural ({memories.length})
            </h3>

            {memories.length === 0 ? (
              <div className={`text-center py-8 text-xs ${isMinimal ? 'text-neutral-500' : 'text-slate-500'}`}>
                Nenhuma memória registrada ainda. Ensine algo à Izzy acima!
              </div>
            ) : (
              <div className="space-y-2">
                {memories.map((mem) => (
                  <div
                    key={mem.id}
                    className={`p-3 rounded-xl border flex items-center justify-between text-xs transition ${
                      isMinimal
                        ? 'bg-neutral-950 border-neutral-800/80 hover:border-neutral-700'
                        : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded uppercase font-mono ${
                            mem.category === 'project'
                              ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
                              : mem.category === 'preference'
                              ? 'bg-pink-500/10 text-pink-300 border border-pink-500/30'
                              : 'bg-purple-500/10 text-purple-300 border border-purple-500/30'
                          }`}
                        >
                          {mem.category}
                        </span>
                        <strong className={isMinimal ? 'text-neutral-200' : 'text-slate-200'}>{mem.key}</strong>
                      </div>
                      <div className={`font-mono text-[11px] ${isMinimal ? 'text-neutral-400' : 'text-slate-400'}`}>
                        {mem.value}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(mem.id)}
                      className={`p-2 rounded-lg transition ${
                        isMinimal ? 'hover:bg-neutral-900 text-neutral-500 hover:text-red-400' : 'hover:bg-slate-900 text-slate-500 hover:text-red-400'
                      }`}
                      title="Apagar memória"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div
          className={`px-6 py-4 border-v flex items-center justify-between text-xs ${
            isMinimal ? 'bg-[#18181c] border-neutral-800 text-neutral-400' : 'bg-slate-950 border-slate-800 text-slate-400'
          }`}
        >
          <span>💡 Memórias são injetadas automaticamente no contexto da Izzy.</span>
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-xl font-medium transition ${
              isMinimal ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
          >
            Concluído
          </button>
        </div>
      </div>
    </div>
  );
}
