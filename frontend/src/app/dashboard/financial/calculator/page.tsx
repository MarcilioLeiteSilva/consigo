'use client';

import { Calculator, Construction, Clock } from 'lucide-react';

export default function CalculatorPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-500">
      <div className="w-24 h-24 bg-indigo-50 rounded-[32px] flex items-center justify-center text-indigo-600 mb-8 border-2 border-indigo-100">
        <Calculator size={48} />
      </div>
      
      <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-100 mb-6">
        <Construction size={14} /> Em Desenvolvimento
      </div>

      <h1 className="text-3xl font-black text-slate-900 mb-4">Calculadora de Custos</h1>
      <p className="text-slate-500 max-w-md mx-auto leading-relaxed mb-10">
        Esta ferramenta permitirá calcular o custo real de produção das suas peças, considerando matéria-prima, tempo de impressão 3D e impostos.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-lg">
        <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase mb-2">Previsão</p>
          <p className="font-bold text-slate-700">Lançamento em Junho/2026</p>
        </div>
        <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase mb-2">Foco</p>
          <p className="font-bold text-slate-700">Margem de Lucro Real</p>
        </div>
      </div>
    </div>
  );
}
