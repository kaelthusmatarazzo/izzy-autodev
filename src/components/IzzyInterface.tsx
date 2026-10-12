'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Sparkles,
  Settings,
  Cpu,
  RefreshCw,
  Rocket,
  CheckCircle2,
  AlertTriangle,
  Code2,
  GitCommit,
  Terminal,
  ExternalLink,
} from 'lucide-react';
import IzzyAvatar from './IzzyAvatar';
import SettingsModal, { AppConfig } from './SettingsModal';
import EvolutionSidebar from './EvolutionSidebar';
import { ChatMessage } from '@/lib/types';

const INITIAL_WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content: `Olá! Eu sou a **Izzy**! ✨\n\nEu não sou apenas um chatbot comum: **eu sou o próprio código desta aplicação**! Se você me pedir algo que eu ainda não tenho (um bloco de notas, um tema neon, um tocador de música lo-fi, uma calculadora ou qualquer componente), eu vou abrir meu código, programar a mim mesma, fazer o commit no GitHub e mandar o Vercel compilar a novidade!\n\nComo posso evoluir ou ajudar você hoje?`,
  timestamp: 1728750000000,
};

export default function IzzyInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isEvolutionOpen, setIsEvolutionOpen] = useState(false);

  const [izzyMood, setIzzyMood] = useState<'idle' | 'thinking' | 'coding' | 'deploying' | 'proud'>('idle');
  const [recentChanges, setRecentChanges] = useState<{ path: string; message: string; timestamp: number }[]>([]);

  const [activeDeploy, setActiveDeploy] = useState<{
    status: 'building' | 'ready' | 'idle';
    path?: string;
    message?: string;
    timer?: number;
  }>({ status: 'idle' });

  const [config, setConfig] = useState<AppConfig>({
    geminiKey: '',
    githubToken: '',
    githubRepo: '',
    githubBranch: 'main',
    vercelToken: '',
    vercelProjectId: '',
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Carregar configurações locais
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('izzy_config');
      if (stored) {
        try {
          setConfig(JSON.parse(stored));
        } catch {}
      }
    }
  }, []);

  const triggerConfetti = async () => {
    try {
      const confettiModule = await import('canvas-confetti');
      const confetti = confettiModule.default || confettiModule;
      confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
    } catch {}
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, izzyMood]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    setIzzyMood('thinking');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          userApiKey: config.geminiKey,
          userGithubToken: config.githubToken,
          userRepo: config.githubRepo,
          userBranch: config.githubBranch,
          userVercelToken: config.vercelToken,
          userProjectId: config.vercelProjectId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erro na resposta do servidor.');
      }

      // Se a Izzy fez alterações de código
      if (data.hasModifiedCode) {
        setIzzyMood('coding');
        setTimeout(() => setIzzyMood('deploying'), 1500);

        // Registrar mudanças recentes
        const modifiedFiles = data.toolCalls
          ?.filter((tc: any) => tc.name === 'write_repository_file' && tc.status === 'success')
          .map((tc: any) => ({
            path: tc.args.path,
            message: tc.args.commitMessage,
            timestamp: Date.now(),
          })) || [];

        if (modifiedFiles.length > 0) {
          setRecentChanges((prev) => [...modifiedFiles, ...prev]);
          setActiveDeploy({
            status: 'building',
            path: modifiedFiles[0].path,
            message: modifiedFiles[0].message,
          });

          // Disparar timer simulado de compilação da Vercel (geralmente 40s)
          setTimeout(() => {
            setActiveDeploy((prev) => ({ ...prev, status: 'ready' }));
            setIzzyMood('proud');
            triggerConfetti();
          }, 40000);
        }
      } else {
        setIzzyMood('idle');
      }

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.reply,
        timestamp: Date.now(),
        toolCalls: data.toolCalls,
        deployStatus: data.hasModifiedCode ? 'building' : undefined,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setIzzyMood('idle');
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: `⚠️ Ops! Tive um problema ao processar seu pedido:\n\n\`${err.message}\`\n\nCertifique-se de configurar a **Gemini API Key** e o **GitHub Token** no botão de engrenagem ⚙️ no topo!`,
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const triggerReload = () => {
    triggerConfetti();
    window.location.reload();
  };

  return (
    <div className="flex flex-col min-h-[100dvh] h-[100dvh] max-h-[100dvh] bg-slate-950 text-slate-100 font-sans selection:bg-pink-500 selection:text-white">
      {/* Top Header */}
      <header className="h-16 px-4 md:px-8 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center gap-3">
          <IzzyAvatar mood={izzyMood} size="sm" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-base md:text-lg tracking-tight bg-gradient-to-r from-pink-400 via-fuchsia-300 to-cyan-400 bg-clip-text text-transparent">
                Izzy Auto-Dev
              </h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-300 font-mono">
                v1.0 • Gemini Pro
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {izzyMood === 'coding'
                ? '🛠️ Programando novas funcionalidades...'
                : izzyMood === 'deploying'
                ? '🚀 Vercel compilando nova versão...'
                : izzyMood === 'thinking'
                ? '💭 Pensando no projeto...'
                : izzyMood === 'proud'
                ? '✨ Nova funcionalidade no ar!'
                : 'A IA que constrói a si mesma'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Botão DNA & Evolução */}
          <button
            onClick={() => setIsEvolutionOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/70 hover:bg-slate-700/80 border border-slate-700 text-xs text-slate-300 hover:text-white transition shadow-sm"
            title="Ver ideias e histórico de modificações da Izzy"
          >
            <Cpu size={14} className="text-cyan-400" />
            <span className="hidden sm:inline">Evolução ({recentChanges.length})</span>
          </button>

          {/* Botão Configurações */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/70 hover:bg-slate-700/80 border border-slate-700 text-xs text-slate-300 hover:text-white transition shadow-sm"
            title="Configurar Chaves do Gemini e GitHub"
          >
            <Settings size={14} className="text-pink-400" />
            <span className="hidden sm:inline">Conexões</span>
          </button>
        </div>
      </header>

      {/* Banner de Deploy Ativo do Vercel */}
      {activeDeploy.status === 'building' && (
        <div className="bg-gradient-to-r from-cyan-950 via-slate-900 to-pink-950 border-b border-cyan-500/30 px-4 py-2.5 flex items-center justify-between text-xs text-cyan-200 animate-pulse shrink-0">
          <div className="flex items-center gap-2">
            <Rocket size={16} className="text-cyan-400 animate-spin" />
            <span>
              <strong>Izzy comitou no GitHub!</strong> O Vercel está compilando a nova versão... (aguarde ~40s)
            </span>
          </div>
          <button
            onClick={triggerReload}
            className="px-2.5 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 rounded-lg text-cyan-200 text-[11px] font-semibold flex items-center gap-1"
          >
            <RefreshCw size={12} /> Recarregar agora
          </button>
        </div>
      )}

      {activeDeploy.status === 'ready' && (
        <div className="bg-emerald-950/80 border-b border-emerald-500/40 px-4 py-2.5 flex items-center justify-between text-xs text-emerald-200 shrink-0">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-400" />
            <span>
              <strong>Deploy Concluído!</strong> A nova versão da Izzy já está pronta na Vercel.
            </span>
          </div>
          <button
            onClick={triggerReload}
            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-bold flex items-center gap-1.5 shadow-md shadow-emerald-900/50"
          >
            <RefreshCw size={12} /> Ver Atualização
          </button>
        </div>
      )}

      {/* Chat Messages Body */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5 max-w-4xl mx-auto w-full">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} space-y-2`}
          >
            <div className="flex items-start gap-2.5 max-w-[92%] sm:max-w-[85%]">
              {msg.role === 'assistant' && (
                <div className="shrink-0 mt-1">
                  <IzzyAvatar mood="idle" size="sm" />
                </div>
              )}

              <div
                className={`p-4 rounded-2xl text-sm leading-relaxed shadow-lg ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-tr-sm'
                    : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-tl-sm backdrop-blur-sm'
                }`}
              >
                <div className="whitespace-pre-wrap font-sans">{msg.content}</div>

                {/* Exibição de Tool Calls (Auto-Dev em Ação) */}
                {msg.toolCalls && msg.toolCalls.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-2">
                    <div className="text-[10px] uppercase font-bold tracking-wider text-pink-400 flex items-center gap-1">
                      <Terminal size={12} /> Ações da Izzy no Repositório
                    </div>

                    {msg.toolCalls.map((tc, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono space-y-1"
                      >
                        <div className="flex items-center justify-between text-slate-300">
                          <span className="flex items-center gap-1.5 text-cyan-400">
                            {tc.name === 'write_repository_file' ? (
                              <GitCommit size={14} className="text-pink-400" />
                            ) : tc.name === 'read_repository_file' ? (
                              <Code2 size={14} className="text-cyan-400" />
                            ) : (
                              <Cpu size={14} className="text-purple-400" />
                            )}
                            <strong>{tc.name}</strong>
                          </span>
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded ${
                              tc.status === 'success'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : 'bg-red-950 text-red-400 border border-red-800'
                            }`}
                          >
                            {tc.status}
                          </span>
                        </div>

                        {tc.args?.path && (
                          <div className="text-[11px] text-slate-400 truncate">
                            Arquivo: <code className="text-pink-300">{tc.args.path}</code>
                          </div>
                        )}

                        {tc.args?.commitMessage && (
                          <div className="text-[11px] text-slate-400">
                            Commit: &quot;{tc.args.commitMessage}&quot;
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <span className="text-[10px] text-slate-500 px-1">
              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-3 text-slate-400 text-xs">
            <IzzyAvatar mood={izzyMood} size="sm" />
            <div className="flex items-center gap-2 p-3 bg-slate-900 border border-slate-800 rounded-2xl">
              <span className="w-2 h-2 rounded-full bg-pink-400 animate-ping" />
              <span>
                {izzyMood === 'coding'
                  ? 'Izzy está escrevendo novo código para si mesma...'
                  : 'Izzy está pensando...'}
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </main>

      {/* Input Bar & Sugestões */}
      <footer className="p-4 border-t border-slate-800/80 bg-slate-900/60 backdrop-blur-md shrink-0">
        <div className="max-w-4xl mx-auto space-y-2.5">
          {/* Sugestões Rápidas de Auto-Construção */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
            <span className="text-[11px] text-slate-500 shrink-0 flex items-center gap-1">
              <Sparkles size={12} className="text-pink-400" /> Sugestões:
            </span>
            <button
              onClick={() => handleSendMessage('Izzy, crie um tocador de música lo-fi / ruído de chuva para nós!')}
              className="px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 text-slate-300 hover:text-white shrink-0 transition"
            >
              🎵 Tocador Lo-Fi
            </button>
            <button
              onClick={() => handleSendMessage('Izzy, adicione um widget de Pomodoro de foco na barra superior!')}
              className="px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 text-slate-300 hover:text-white shrink-0 transition"
            >
              ⏱️ Pomodoro
            </button>
            <button
              onClick={() => handleSendMessage('Izzy, crie um bloco de anotações rápidas com salvamento local!')}
              className="px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 text-slate-300 hover:text-white shrink-0 transition"
            >
              📝 Bloco de Notas
            </button>
            <button
              onClick={() => handleSendMessage('Izzy, crie um mini-jogo da velha contra você aqui na tela!')}
              className="px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 text-slate-300 hover:text-white shrink-0 transition"
            >
              🎮 Jogo da Velha
            </button>
          </div>

          {/* Campo de Envio */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Converse com a Izzy ou peça para ela criar uma nova funcionalidade..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-slate-950/90 border border-slate-800 focus:border-pink-500 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none text-sm transition shadow-inner"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-white shadow-lg shadow-pink-500/20 transition shrink-0"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </footer>

      {/* Modais */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={(newCfg) => setConfig(newCfg)}
      />

      <EvolutionSidebar
        isOpen={isEvolutionOpen}
        onClose={() => setIsEvolutionOpen(false)}
        onSelectPrompt={(prompt) => handleSendMessage(prompt)}
        recentChanges={recentChanges}
      />
    </div>
  );
}
