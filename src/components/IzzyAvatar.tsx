'use client';

import React from 'react';
import { Sparkles, Code2, Rocket, Brain, CheckCircle2 } from 'lucide-react';

interface IzzyAvatarProps {
  mood?: 'idle' | 'thinking' | 'coding' | 'deploying' | 'proud';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function IzzyAvatar({ mood = 'idle', size = 'md' }: IzzyAvatarProps) {
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32',
  }[size || 'md'] || 'w-16 h-16';

  const iconSizes = {
    sm: 14,
    md: 20,
    lg: 28,
    xl: 36,
  }[size || 'md'] || 20;

  return (
    <div className="relative inline-flex items-center justify-center select-none group">
      {/* Halo de energia animado */}
      <div
        className={`absolute inset-0 rounded-full blur-md transition-all duration-700 ${
          mood === 'coding'
            ? 'bg-gradient-to-tr from-cyan-500 via-pink-500 to-amber-400 opacity-90 animate-spin'
            : mood === 'deploying'
            ? 'bg-gradient-to-r from-emerald-400 to-cyan-500 opacity-90 animate-pulse'
            : mood === 'thinking'
            ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 opacity-80 animate-pulse'
            : 'bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 opacity-70 animate-glow'
        }`}
      />

      {/* Círculo Principal do Avatar */}
      <div
        className={`relative ${sizeClasses} rounded-full bg-slate-950 border-2 transition-all duration-300 flex items-center justify-center overflow-hidden shadow-2xl ${
          mood === 'coding'
            ? 'border-cyan-400 ring-2 ring-cyan-400/50'
            : mood === 'deploying'
            ? 'border-emerald-400 ring-2 ring-emerald-400/50'
            : mood === 'thinking'
            ? 'border-purple-400 ring-2 ring-purple-400/50'
            : 'border-pink-400 ring-2 ring-pink-400/40'
        }`}
      >
        {/* Fundo Cibernético com grid sutil */}
        <div className="absolute inset-0 bg-[radial-gradient(#ec4899_1px,transparent_1px)] [background-size:8px_8px] opacity-20" />

        {/* Rosto / Ícone da Izzy */}
        <div className="relative z-10 flex flex-col items-center justify-center">
          {mood === 'coding' ? (
            <div className="flex flex-col items-center animate-bounce">
              <Code2 size={iconSizes} className="text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
            </div>
          ) : mood === 'deploying' ? (
            <div className="flex flex-col items-center animate-pulse">
              <Rocket size={iconSizes} className="text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            </div>
          ) : mood === 'thinking' ? (
            <div className="flex flex-col items-center animate-pulse">
              <Brain size={iconSizes} className="text-purple-300 drop-shadow-[0_0_8px_rgba(216,180,254,0.8)]" />
            </div>
          ) : mood === 'proud' ? (
            <div className="flex flex-col items-center">
              <CheckCircle2 size={iconSizes} className="text-pink-400 drop-shadow-[0_0_8px_rgba(244,114,182,0.8)]" />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center">
              {/* Olhos cibernéticos expressivos da Izzy */}
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] animate-pulse" />
                <span className="w-2.5 h-2.5 rounded-full bg-pink-400 shadow-[0_0_8px_#f472b6] animate-pulse" />
              </div>
              <Sparkles size={iconSizes * 0.7} className="text-pink-300 opacity-90 animate-float" />
            </div>
          )}
        </div>
      </div>

      {/* Badge de status flutuante */}
      <span
        className={`absolute -bottom-1 -right-1 px-1.5 py-0.5 text-[9px] font-bold rounded-full uppercase tracking-wider shadow-lg border ${
          mood === 'coding'
            ? 'bg-cyan-950 text-cyan-300 border-cyan-500 animate-pulse'
            : mood === 'deploying'
            ? 'bg-emerald-950 text-emerald-300 border-emerald-500'
            : mood === 'thinking'
            ? 'bg-purple-950 text-purple-300 border-purple-500'
            : 'bg-pink-950 text-pink-300 border-pink-500'
        }`}
      >
        {mood === 'coding'
          ? 'DEV'
          : mood === 'deploying'
          ? 'VERCEL'
          : mood === 'thinking'
          ? 'PENSANDO'
          : 'IZZY'}
      </span>
    </div>
  );
}
