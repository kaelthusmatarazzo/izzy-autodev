'use client';

import React from 'react';
import { Sparkles, Terminal, Cpu, GitCommit, FileCode, CheckCircle, RefreshCw } from 'lucide-react';

interface EvolutionSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPrompt: (prompt: string) => void;
  recentChanges: { path: string; message: string; timestamp: number }[];
}

export default function EvolutionSidebar({
  isOpen,
  onClose,
  onSelectPrompt,
  recentChanges,
}: EvolutionSidebarProps) {
  const suggestions = [
    {
      title: '🎶 Player de Sons Relaxantes',
      desc: 'Cria um tocador de chuva e ruído branco para focarmos.',
      prompt: 'Izzy, crie um componente de player de som ambiente (chuva, fogo, ondas) para ouvirmos enquanto conversamos!',
    },
    {
      title: '⏱️ Pomodoro Timer',
      desc: 'Adiciona um cronômetro de foco na barra superior.',
      prompt: 'Izzy, construa um widget de Pomodoro com som e contagem regressiva para eu organizar meu trabalho.',
    },
    {
      title: '📝 Bloco de Notas Integrado',
      desc: 'Um bloco de rascunhos para salvar ideias.',
      prompt: 'Izzy, crie uma barra retrátil ou modal de bloco de anotações rápidas que salve o texto automaticamente.',
    },
    {
      title: '🎮 Jogo da Velha contra Izzy',
      desc: 'Um mini-jogo interativo com placar.',
      prompt: 'Izzy, programe um mini-jogo da velha contra você diretamente na tela para jogarmos quando eu quiser relaxar!',
    },
    {
      title: '🎨 Tema Cyberpunk Neon',
      desc: 'Muda paletas e adiciona efeitos luminosos.',
      prompt: 'Izzy, adicione um seletor de temas visuais na interface com opções Synthwave e Cyberpunk Neon.',
    },
  ];

  if (!isOpen) return null;

  return (
    <aside className="fixed inset-y-0 right-0 z-40 w-80 md:w-96 bg-slate-950/95 border-l border-slate-800 backdrop-blur-md p-5 flex flex-col shadow-2xl animate-slideLeft">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-400">
            <Cpu size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              DNA & Evolução da Izzy
            </h3>
            <p className="text-[11px] text-slate-400">O ecossistema auto-construtivo</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded-lg hover:bg-slate-800 transition"
        >
          Fechar
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 py-4 pr-1 text-xs">
        {/* Ideias e Desafios para a Izzy */}
        <div>
          <div className="flex items-center gap-1.5 mb-2.5 text-pink-400 font-semibold uppercase tracking-wider text-[10px]">
            <Sparkles size={12} />
            <span>Peça para ela se auto-construir</span>
          </div>
          <div className="space-y-2">
            {suggestions.map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  onSelectPrompt(item.prompt);
                  onClose();
                }}
                className="w-full text-left p-3 rounded-xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-pink-500/40 transition group"
              >
                <div className="font-semibold text-slate-200 group-hover:text-pink-300 transition">
                  {item.title}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">{item.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Registro de Mutações de Código */}
        <div>
          <div className="flex items-center gap-1.5 mb-2.5 text-cyan-400 font-semibold uppercase tracking-wider text-[10px]">
            <GitCommit size={12} />
            <span>Últimas Modificações de Código</span>
          </div>

          {recentChanges.length === 0 ? (
            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 text-center text-slate-500 text-[11px]">
              Nenhum novo código gerado ainda nesta sessão. Peça algo à Izzy no chat!
            </div>
          ) : (
            <div className="space-y-2">
              {recentChanges.map((change, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-slate-900/90 border border-cyan-500/20 text-slate-300 space-y-1"
                >
                  <div className="flex items-center gap-1.5 text-cyan-300 font-mono text-[11px]">
                    <FileCode size={12} />
                    <span className="truncate">{change.path}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">{change.message}</p>
                  <div className="text-[9px] text-slate-500">
                    {new Date(change.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
