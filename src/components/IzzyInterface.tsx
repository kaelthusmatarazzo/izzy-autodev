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
  Code2,
  GitCommit,
  Terminal,
  Palette,
} from 'lucide-react';
import IzzyAvatar from './IzzyAvatar';
import SettingsModal, { AppConfig } from './SettingsModal';
import EvolutionSidebar from './EvolutionSidebar';
import { ChatMessage } from '@/lib/types';

const INITIAL_WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content: `Olá! Eu sou a **Izzy**! ✨\n\nEu não sou apenas um chatbot comum: **eu sou o próprio código desta aplicação**! Se você me pedir algo que eu ainda não tenho (um bloco de notas, um tema neon, um tocador de música lo-fi, uma calculadora ou qualquer componente), eu vou abrir meu código, programar a mim mesma, fazer o commit no GitHub e mandar o Vercel compilar a novidade!\n\nAgora estou com o **Tema Minimalista Elegante** ativo! Como posso evoluir ou ajudar você hoje?`,
  timestamp: 1728750000000,
};

export default function IzzyInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isEvolutionOpen, setIsEvolutionOpen] = useState(false);
  const [themeMode, setThemeMode] = useState<'minimalist' | 'cyberpunk'>('minimalist');

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

  const [isMounted, setIsMounted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Carregar configurações locais de forma segura
  useEffect(() => {
    setIsMounted(true);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = localStorage.getItem('izzy_config');
        if (stored) {
          setConfig(JSON.parse(stored));
        }
        const storedTheme = localStorage.getItem('izzy_theme');
        if (storedTheme === 'cyberpunk' || storedTheme === 'minimalist') {
          setThemeMode(storedTheme);
        }
      }
    } catch {
      // ignore storage access error
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = themeMode === 'minimalist' ? 'cyberpunk' : 'minimalist';
    setThemeMode(nextTheme);
    try {
      localStorage.setItem('izzy_theme', nextTheme);
    } catch {}
  };

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

  // Cores dinâmicas baseadas no tema
  const isMinimal = themeMode === 'minimalist';

  return (
    <div
      className={`flex flex-col min-h-screen h-screen md:h-[100dvh] font-sans transition-colors duration-300 ${
        isMinimal
          ? 'bg-[#0a0a0c] text-[#f4f4f6] selection:bg-neutral-700 selection:text-white'
          : 'bg-slate-950 text-slate-100 selection:bg-pink-500 selection:text-white'
      }`}
    >
      {/* Top Header */}
      <header
        className={`h-16 px-4 md:px-8 border-b flex items-center justify-between shrink-0 z-30 backdrop-blur-md transition-colors ${
          isMinimal
            ? 'bg-[#0f0f13]/80 border-neutral-800/80'
            : 'bg-slate-900/60 border-slate-800/80'
        }`}
      >
        <div className="flex items-center gap-3">
          <IzzyAvatar mood={izzyMood} size="sm" />
          <div>
            <div className="flex items-center gap-2">
              <h1
                className={`font-semibold text-base md:text-lg tracking-tight ${
                  isMinimal
                    ? 'text-white'
                    : 'bg-gradient-to-r from-pink-400 via-fuchsia-300 to-cyan-400 bg-clip-text text-transparent font-extrabold'
                }`}
              >
                Izzy Auto-Dev
              </h1>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                  isMinimal
                    ? 'bg-neutral-800 text-neutral-300 border border-neutral-700'
                    : 'bg-pink-500/10 border border-pink-500/30 text-pink-300'
                }`}
              >
                {isMinimal ? 'Elegant Minimal' : 'v1.0 • Gemini'}
              </span>
            </div>
            <p className={`text-[11px] ${isMinimal ? 'text-neutral-400' : 'text-slate-400'}`}>
              {izzyMood === 'coding'
                ? '🛠️ Programando novas funcionalidades...'
                : izzyMood === 'deploying'
                ? '🚀 Vercel compilando nova versão...'
                : izzyMood === 'thinking'
                ? '💭 Pensando no projeto...'
                : izzyMood === 'proud'
                ? '✨ Nova funcionalidade no ar!'
                : isMinimal
                ? 'Minimalismo & Inteligência Artificial'
                : 'A IA que constrói a si mesma'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Botão Alternar Tema */}
          <button
            onClick={toggleTheme}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs transition shadow-sm border ${
              isMinimal
                ? 'bg-neutral-900 hover:bg-neutral-800 border-neutral-700 text-neutral-200'
                : 'bg-slate-800/70 hover:bg-slate-700/80 border-slate-700 text-slate-300'
            }`}
            title="Alternar entre Minimalista Elegante e Cyberpunk"
          >
            <Palette size={14} className={isMinimal ? 'text-neutral-300' : 'text-pink-400'} />
            <span className="hidden sm:inline">{isMinimal ? 'Minimalista' : 'Cyberpunk'}</span>
          </button>

          {/* Botão DNA & Evolução */}
          <button
            onClick={() => setIsEvolutionOpen(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs transition shadow-sm border ${
              isMinimal
                ? 'bg-neutral-900 hover:bg-neutral-800 border-neutral-700 text-neutral-200'
                : 'bg-slate-800/70 hover:bg-slate-700/80 border-slate-700 text-slate-300'
            }`}
            title="Ver ideias e histórico de modificações da Izzy"
          >
            <Cpu size={14} className={isMinimal ? 'text-neutral-400' : 'text-cyan-400'} />
            <span className="hidden sm:inline">Evolução ({recentChanges.length})</span>
          </button>

          {/* Botão Configurações */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs transition shadow-sm border ${
              isMinimal
                ? 'bg-neutral-900 hover:bg-neutral-800 border-neutral-700 text-neutral-200'
                : 'bg-slate-800/70 hover:bg-slate-700/80 border-slate-700 text-slate-300'
            }`}
            title="Configurar Chaves do Gemini e GitHub"
          >
            <Settings size={14} className={isMinimal ? 'text-neutral-400' : 'text-pink-400'} />
            <span className="hidden sm:inline">Conexões</span>
          </button>
        </div>
      </header>

      {/* Banner de Deploy Ativo do Vercel */}
      {activeDeploy.status === 'building' && (
        <div
          className={`border-b px-4 py-2.5 flex items-center justify-between text-xs animate-pulse shrink-0 ${
            isMinimal
              ? 'bg-neutral-900 border-neutral-800 text-neutral-300'
              : 'bg-gradient-to-r from-cyan-950 via-slate-900 to-pink-950 border-cyan-500/30 text-cyan-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <Rocket size={16} className={isMinimal ? 'text-neutral-400 animate-spin' : 'text-cyan-400 animate-spin'} />
            <span>
              <strong>Izzy comitou no GitHub!</strong> O Vercel está compilando a nova versão... (aguarde ~40s)
            </span>
          </div>
          <button
            onClick={triggerReload}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 border ${
              isMinimal
                ? 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-200'
                : 'bg-cyan-500/20 hover:bg-cyan-500/30 border-cyan-400/40 text-cyan-200'
            }`}
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
      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 max-w-4xl mx-auto w-full">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} space-y-2`}
          >
            <div className="flex items-start gap-3 max-w-[92%] sm:max-w-[85%]">
              {msg.role === 'assistant' && (
                <div className="shrink-0 mt-1">
                  <IzzyAvatar mood="idle" size="sm" />
                </div>
              )}

              <div
                className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  msg.role === 'user'
                    ? isMinimal
                      ? 'bg-neutral-200 text-neutral-900 rounded-tr-sm font-medium'
                      : 'bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-tr-sm'
                    : isMinimal
                    ? 'bg-[#141418] border border-neutral-800 text-neutral-200 rounded-tl-sm'
                    : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-tl-sm backdrop-blur-sm'
                }`}
              >
                <div className="whitespace-pre-wrap font-sans">{msg.content}</div>

                {/* Exibição de Tool Calls (Auto-Dev em Ação) */}
                {msg.toolCalls && msg.toolCalls.length > 0 && (
                  <div className={`mt-3 pt-3 border-t space-y-2 ${isMinimal ? 'border-neutral-800' : 'border-slate-800/80'}`}>
                    <div className={`text-[10px] uppercase font-bold tracking-wider flex items-center gap-1 ${isMinimal ? 'text-neutral-400' : 'text-pink-400'}`}>
                      <Terminal size={12} /> Ações da Izzy no Repositório
                    </div>

                    {msg.toolCalls.map((tc, idx) => (
                      <div
                        key={idx}
                        className={`p-2.5 rounded-xl border text-xs font-mono space-y-1 ${
                          isMinimal
                            ? 'bg-neutral-950 border-neutral-800 text-neutral-300'
                            : 'bg-slate-950/80 border border-slate-800 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`flex items-center gap-1.5 ${isMinimal ? 'text-neutral-200' : 'text-cyan-400'}`}>
                            {tc.name === 'write_repository_file' ? (
                              <GitCommit size={14} className={isMinimal ? 'text-neutral-400' : 'text-pink-400'} />
                            ) : tc.name === 'read_repository_file' ? (
                              <Code2 size={14} className={isMinimal ? 'text-neutral-400' : 'text-cyan-400'} />
                            ) : (
                              <Cpu size={14} className={isMinimal ? 'text-neutral-400' : 'text-purple-400'} />
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
                          <div className={`text-[11px] truncate ${isMinimal ? 'text-neutral-400' : 'text-slate-400'}`}>
                            Arquivo: <code className={isMinimal ? 'text-neutral-200' : 'text-pink-300'}>{tc.args.path}</code>
                          </div>
                        )}

                        {tc.args?.commitMessage && (
                          <div className={`text-[11px] ${isMinimal ? 'text-neutral-400' : 'text-slate-400'}`}>
                            Commit: &quot;{tc.args.commitMessage}&quot;
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <span className={`text-[10px] px-1 ${isMinimal ? 'text-neutral-500' : 'text-slate-500'}`} suppressHydrationWarning>
              {isMounted
                ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : ''}
            </span>
          </div>
        ))}

        {isLoading && (
          <div className={`flex items-center gap-3 text-xs ${isMinimal ? 'text-neutral-400' : 'text-slate-400'}`}>
            <IzzyAvatar mood={izzyMood} size="sm" />
            <div className={`flex items-center gap-2 p-3 border rounded-2xl ${isMinimal ? 'bg-[#141418] border-neutral-800' : 'bg-slate-900 border-slate-800'}`}>
              <span className={`w-2 h-2 rounded-full animate-ping ${isMinimal ? 'bg-neutral-300' : 'bg-pink-400'}`} />
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
      <footer className={`p-4 border-t backdrop-blur-md shrink-0 transition-colors ${isMinimal ? 'bg-[#0f0f13]/80 border-neutral-800' : 'bg-slate-900/60 border-slate-800/80'}`}>
        <div className="max-w-4xl mx-auto space-y-2.5">
          {/* Sugestões Rápidas de Auto-Construção */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
            <span className={`text-[11px] shrink-0 flex items-center gap-1 ${isMinimal ? 'text-neutral-400' : 'text-slate-500'}`}>
              <Sparkles size={12} className={isMinimal ? 'text-neutral-300' : 'text-pink-400'} /> Sugestões:
            </span>
            <button
              onClick={() => handleSendMessage('Izzy, crie um tocador de música lo-fi / ruído de chuva para nós!')}
              className={`px-2.5 py-1 rounded-full border text-xs shrink-0 transition ${
                isMinimal
                  ? 'bg-neutral-900 hover:bg-neutral-800 border-neutral-800 text-neutral-300'
                  : 'bg-slate-800/80 hover:bg-slate-700/80 border-slate-700/80 text-slate-300'
              }`}
            >
              🎵 Tocador Lo-Fi
            </button>
            <button
              onClick={() => handleSendMessage('Izzy, adicione um widget de Pomodoro de foco na barra superior!')}
              className={`px-2.5 py-1 rounded-full border text-xs shrink-0 transition ${
                isMinimal
                  ? 'bg-neutral-900 hover:bg-neutral-800 border-neutral-800 text-neutral-300'
                  : 'bg-slate-800/80 hover:bg-slate-700/80 border-slate-700/80 text-slate-300'
              }`}
            >
              ⏱️ Pomodoro
            </button>
            <button
              onClick={() => handleSendMessage('Izzy, crie um bloco de anotações rápidas com salvamento local!')}
              className={`px-2.5 py-1 rounded-full border text-xs shrink-0 transition ${
                isMinimal
                  ? 'bg-neutral-900 hover:bg-neutral-800 border-neutral-800 text-neutral-300'
                  : 'bg-slate-800/80 hover:bg-slate-700/80 border-slate-700/80 text-slate-300'
              }`}
            >
              📝 Bloco de Notas
            </button>
            <button
              onClick={() => handleSendMessage('Izzy, crie um mini-jogo da velha contra você aqui na tela!')}
              className={`px-2.5 py-1 rounded-full border text-xs shrink-0 transition ${
                isMinimal
                  ? 'bg-neutral-900 hover:bg-neutral-800 border-neutral-800 text-neutral-300'
                  : 'bg-slate-800/80 hover:bg-slate-700/80 border-slate-700/80 text-slate-300'
              }`}
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
              className={`flex-1 px-4 py-3 border rounded-xl text-sm transition shadow-inner focus:outline-none ${
                isMinimal
                  ? 'bg-neutral-950 border-neutral-800 focus:border-neutral-500 text-neutral-100 placeholder-neutral-500'
                  : 'bg-slate-950/90 border-slate-800 focus:border-pink-500 text-slate-200 placeholder-slate-500'
              }`}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className={`p-3 rounded-xl text-white transition shrink-0 disabled:opacity-40 disabled:cursor-not-allowed ${
                isMinimal
                  ? 'bg-neutral-200 hover:bg-white text-neutral-900 shadow-md'
                  : 'bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 shadow-lg shadow-pink-500/20'
              }`}
            >
              <Send size={18} className={isMinimal ? 'text-neutral-900' : 'text-white'} />
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
