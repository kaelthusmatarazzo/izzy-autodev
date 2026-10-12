'use client';

import React, { useState, useEffect } from 'react';
import { Activity, ShieldCheck, Cpu, Database, Zap, Layers, RefreshCw, Terminal, CheckCircle2 } from 'lucide-react';

interface Organelle {
  id: string;
  name: string;
  role: string;
  status: 'active' | 'standby' | 'replicating';
  efficiency: number;
  energy: number;
}

export default function IzzyCellDashboard() {
  const [organelles, setOrganelles] = useState<Organelle[]>([
    { id: 'nucleus', name: 'Núcleo (Gemini & Prompt DNA)', role: 'Gerenciamento de IA e Instruções', status: 'active', efficiency: 98, energy: 100 },
    { id: 'ribosome', name: 'Ribossomo (Auto-Dev Compiler)', role: 'Sintetização e Commit de Código', status: 'active', efficiency: 95, energy: 90 },
    { id: 'mitochondria', name: 'Mitocôndria (MCP & API Hub)', role: 'Geração de Energia e Ferramentas', status: 'active', efficiency: 99, energy: 95 },
    { id: 'membrane', name: 'Membrana (Security & Auth)', role: 'Filtragem Segura e Conexões', status: 'active', efficiency: 100, energy: 92 },
    { id: 'cytoplasm', name: 'Citoplasma (Tailwind & UI Matrix)', role: 'Renderização Modular e Fluida', status: 'active', efficiency: 97, energy: 88 },
  ]);

  const [cellularHealth, setCellularHealth] = useState(98);
  const [mitosisCount, setMitosisCount] = useState(1);
  const [isReplicating, setIsReplicating] = useState(false);
  const [logs, setLogs] = useState<string[]>([
    '🧬 Célula Izzy inicializada com sucesso em Next.js.',
    '⚡ Mitocôndria MCP operando em alta frequência.',
    '🛡️ Membrana celular ativada com protocolos seguros de tipagem TypeScript.'
  ]);

  const triggerMitosis = () => {
    setIsReplicating(true);
    setLogs(prev => [`🔄 Iniciando divisão celular (Auto-Mitose v${mitosisCount + 1})...`, ...prev]);
    
    setTimeout(() => {
      setMitosisCount(prev => prev + 1);
      setCellularHealth(100);
      setIsReplicating(false);
      setLogs(prev => [
        `✨ Mitose concluída com sucesso! Célula filha gerada e integrada no cluster Vercel.`,
        ...prev
      ]);
    }, 2500);
  };

  return (
    <div className="max-w-4xl mx-auto my-6 p-6 rounded-3xl bg-slate-900/90 border border-slate-800/80 backdrop-blur-xl shadow-2xl text-slate-100 space-y-6">
      {/* Header do Núcleo Celular */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-pink-500/20 to-cyan-500/20 border border-pink-500/30 text-pink-400">
            <Activity size={28} className={isReplicating ? 'animate-spin text-cyan-400' : 'animate-pulse'} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold bg-gradient-to-r from-pink-400 via-fuchsia-300 to-cyan-400 bg-clip-text text-transparent">
                Izzy Cellular Core v2.0
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono">
                Geração #{mitosisCount}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Arquitetura modular inspirada em células vivas para máxima robustez e auto-expansão.
            </p>
          </div>
        </div>

        <button
          onClick={triggerMitosis}
          disabled={isReplicating}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-pink-500/20 transition"
        >
          <RefreshCw size={14} className={isReplicating ? 'animate-spin' : ''} />
          {isReplicating ? 'Replicando Célula...' : 'Executar Auto-Mitose'}
        </button>
      </div>

      {/* Indicadores Vitais */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-emerald-400" /> Saúde Celular
          </div>
          <div className="text-2xl font-extrabold text-emerald-400">{cellularHealth}%</div>
          <div className="text-[10px] text-slate-500">Integridade estrutural 100% segura</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <Zap size={14} className="text-yellow-400" /> Energia Mitocondrial
          </div>
          <div className="text-2xl font-extrabold text-yellow-400">96.4%</div>
          <div className="text-[10px] text-slate-500">MCP & Server endpoints ativos</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <Layers size={14} className="text-cyan-400" /> Modularidade
          </div>
          <div className="text-2xl font-extrabold text-cyan-400">Robust</div>
          <div className="text-[10px] text-slate-500">TypeScript strict & Tailwind CSS</div>
        </div>
      </div>

      {/* Organelas da Célula Izzy */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Cpu size={14} className="text-pink-400" /> Organelas Ativas ({organelles.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {organelles.map((org) => (
            <div key={org.id} className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800 flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  {org.name}
                </div>
                <div className="text-[11px] text-slate-400">{org.role}</div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-xs font-mono text-cyan-300">{org.efficiency}% eff</div>
                <div className="text-[10px] text-slate-500 font-mono">energy {org.energy}%</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Terminal Celular (Logs) */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Terminal size={14} className="text-purple-400" /> Log de Expressão Genética
        </h3>
        <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 font-mono text-xs space-y-1.5 max-h-36 overflow-y-auto">
          {logs.map((log, idx) => (
            <div key={idx} className="text-slate-300 flex items-start gap-2">
              <span className="text-pink-400">›</span>
              <span>{log}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
