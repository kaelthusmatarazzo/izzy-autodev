'use client';

import React, { useState, useEffect } from 'react';
import { X, Key, GitBranch, Github, Triangle, Check, AlertCircle } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: AppConfig) => void;
}

export interface AppConfig {
  geminiKey: string;
  githubToken: string;
  githubRepo: string;
  githubBranch: string;
  vercelToken: string;
  vercelProjectId: string;
}

export default function SettingsModal({ isOpen, onClose, onSave }: SettingsModalProps) {
  const [config, setConfig] = useState<AppConfig>({
    geminiKey: '',
    githubToken: '',
    githubRepo: '',
    githubBranch: 'main',
    vercelToken: '',
    vercelProjectId: '',
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    // Carregar configurações do localStorage se existirem
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = localStorage.getItem('izzy_config');
        if (stored) {
          setConfig(JSON.parse(stored));
        }
      }
    } catch {
      // ignore storage access error
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('izzy_config', JSON.stringify(config));
      }
    } catch {
      // ignore storage error
    }
    onSave(config);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden p-6 text-slate-100">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-pink-500/10 rounded-xl border border-pink-500/30 text-pink-400">
              <Key size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Conexões & Credenciais da Izzy
              </h2>
              <p className="text-xs text-slate-400">
                Configure as chaves para que a Izzy possa modificar o código e falar com você
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

        {/* Formulário */}
        <div className="mt-5 space-y-4 text-sm max-h-[68vh] overflow-y-auto pr-1">
          {/* Gemini API Key */}
          <div className="space-y-1.5">
            <label className="flex items-center justify-between text-xs font-semibold text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-pink-400" />
                Google Gemini API Key (Obrigatório)
              </span>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-pink-400 hover:underline"
              >
                Obter no AI Studio ↗
              </a>
            </label>
            <input
              type="password"
              placeholder="AIzaSy..."
              value={config.geminiKey}
              onChange={(e) => setConfig({ ...config, geminiKey: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl focus:border-pink-500 focus:outline-none text-slate-200 placeholder-slate-600 text-xs font-mono"
            />
          </div>

          {/* GitHub Token */}
          <div className="space-y-1.5">
            <label className="flex items-center justify-between text-xs font-semibold text-slate-300">
              <span className="flex items-center gap-1.5">
                <Github size={14} className="text-slate-400" />
                GitHub Personal Access Token (PAT)
              </span>
              <a
                href="https://github.com/settings/tokens/new?scopes=repo"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-cyan-400 hover:underline"
              >
                Gerar token (escopo 'repo') ↗
              </a>
            </label>
            <input
              type="password"
              placeholder="ghp_... ou github_pat_..."
              value={config.githubToken}
              onChange={(e) => setConfig({ ...config, githubToken: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl focus:border-cyan-500 focus:outline-none text-slate-200 placeholder-slate-600 text-xs font-mono"
            />
            <p className="text-[11px] text-slate-500">
              Permite que a Izzy inspecione e faça commit dos novos componentes diretamente no repositório.
            </p>
          </div>

          {/* GitHub Repo & Branch */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <GitBranch size={14} className="text-slate-400" />
                Repositório GitHub
              </label>
              <input
                type="text"
                placeholder="seu-usuario/izzy-autodev"
                value={config.githubRepo}
                onChange={(e) => setConfig({ ...config, githubRepo: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl focus:border-cyan-500 focus:outline-none text-slate-200 placeholder-slate-600 text-xs font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Branch</label>
              <input
                type="text"
                placeholder="main"
                value={config.githubBranch}
                onChange={(e) => setConfig({ ...config, githubBranch: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl focus:border-cyan-500 focus:outline-none text-slate-200 placeholder-slate-600 text-xs font-mono"
              />
            </div>
          </div>

          {/* Vercel API (Opcional) */}
          <div className="pt-2 border-t border-slate-800 space-y-3">
            <div className="flex items-center gap-2">
              <Triangle size={14} className="text-white fill-white" />
              <span className="text-xs font-semibold text-slate-300">Vercel (Opcional para status de build em tempo real)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="password"
                placeholder="Vercel Token (opcional)"
                value={config.vercelToken}
                onChange={(e) => setConfig({ ...config, vercelToken: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl focus:border-slate-500 focus:outline-none text-slate-200 placeholder-slate-600 text-xs font-mono"
              />
              <input
                type="text"
                placeholder="Project ID (opcional)"
                value={config.vercelProjectId}
                onChange={(e) => setConfig({ ...config, vercelProjectId: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl focus:border-slate-500 focus:outline-none text-slate-200 placeholder-slate-600 text-xs font-mono"
              />
            </div>
          </div>

          <div className="p-3 bg-pink-500/10 border border-pink-500/20 rounded-xl flex items-start gap-2 text-xs text-pink-300">
            <AlertCircle size={16} className="shrink-0 mt-0.5 text-pink-400" />
            <p>
              Você também pode definir essas mesmas variáveis no arquivo <code className="bg-black/40 px-1 py-0.5 rounded text-pink-200">.env.local</code> ou no painel de <strong>Environment Variables</strong> da Vercel!
            </p>
          </div>
        </div>

        {/* Rodapé com botão Salvar */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className={`px-5 py-2.5 text-xs font-semibold rounded-xl flex items-center gap-2 shadow-lg transition-all ${
              savedSuccess
                ? 'bg-emerald-600 text-white'
                : 'bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white shadow-pink-500/20'
            }`}
          >
            {savedSuccess ? (
              <>
                <Check size={16} /> Salvo com Sucesso!
              </>
            ) : (
              'Salvar Configurações'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
