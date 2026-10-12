'use client';

import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6 text-slate-100 font-sans">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center shadow-2xl">
        <div className="w-12 h-12 bg-pink-500/10 border border-pink-500/30 rounded-full flex items-center justify-center mx-auto mb-4 text-pink-400">
          <AlertCircle size={24} />
        </div>
        <h2 className="text-lg font-bold text-white mb-2">Ops! A Izzy encontrou um erro</h2>
        <p className="text-xs text-slate-400 mb-4 break-words">
          {error?.message || 'Ocorreu uma falha inesperada na interface.'}
        </p>
        <button
          onClick={() => reset()}
          className="px-5 py-2.5 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-pink-500/20 transition flex items-center gap-2 mx-auto"
        >
          <RefreshCw size={14} /> Tentar Novamente
        </button>
      </div>
    </div>
  );
}
