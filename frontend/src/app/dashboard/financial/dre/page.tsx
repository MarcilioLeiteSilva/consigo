'use client';

import { useState, useEffect } from 'react';
import {
  FileText,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Loader2,
  BarChart3,
  CheckCircle2,
} from 'lucide-react';
import api from '@/lib/api';
import { CurrencyText } from '@/components/CurrencyText';

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

export default function DREPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [dre, setDre] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDRE() {
      setLoading(true);
      try {
        const res = await api.get(`/dashboard/dre?month=${month}&year=${year}`);
        setDre(res.data.data || res.data);
      } catch (err) {
        console.error('Erro ao carregar DRE:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDRE();
  }, [month, year]);

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const resultado = dre?.resultado ?? 0;
  const isPositive = resultado >= 0;

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <FileText className="text-indigo-600" size={28} /> DRE Simplificada
          </h1>
          <p className="text-slate-500 text-sm">Demonstração de Resultado do Exercício — visão mensal.</p>
        </div>

        {/* Seletor de mês */}
        <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl px-4 py-2 shadow-sm">
          <button onClick={prevMonth} className="p-1.5 hover:bg-slate-100 rounded-xl transition-colors">
            <ChevronLeft size={18} className="text-slate-500" />
          </button>
          <span className="text-sm font-bold text-slate-800 min-w-[140px] text-center">
            {MONTHS[month - 1]} / {year}
          </span>
          <button onClick={nextMonth} className="p-1.5 hover:bg-slate-100 rounded-xl transition-colors">
            <ChevronRight size={18} className="text-slate-500" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-[40vh]">
          <Loader2 className="animate-spin text-indigo-600" size={36} />
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-indigo-600 p-8 rounded-3xl text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
              <div className="relative z-10">
                <p className="text-indigo-200 text-sm font-medium mb-1">Receita Bruta</p>
                <h2 className="text-4xl font-bold"><CurrencyText value={dre?.receita ?? 0} /></h2>
                <div className="mt-6 flex items-center gap-2 text-indigo-200 text-sm">
                  <TrendingUp size={16} />
                  <span>Total de créditos no mês</span>
                </div>
              </div>
              <DollarSign className="absolute -right-4 -bottom-4 w-32 h-32 text-indigo-500/20" />
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <p className="text-slate-500 text-sm font-medium mb-1">Saídas / Débitos</p>
              <h2 className="text-3xl font-bold text-rose-600"><CurrencyText value={dre?.saidas ?? 0} /></h2>
              <div className="mt-6 flex items-center gap-2 text-rose-400 text-sm font-bold">
                <TrendingDown size={16} />
                <span>Total de débitos no mês</span>
              </div>
            </div>

            <div className={`p-8 rounded-3xl border shadow-sm ${isPositive ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
              <p className="text-slate-500 text-sm font-medium mb-1">Resultado Operacional</p>
              <h2 className={`text-3xl font-bold ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                <CurrencyText value={resultado} />
              </h2>
              <div className={`mt-6 flex items-center gap-2 text-sm font-bold ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                <span>{isPositive ? 'Resultado positivo' : 'Resultado negativo'}</span>
              </div>
            </div>
          </div>

          {/* Tabela DRE */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center gap-2">
              <BarChart3 size={18} className="text-indigo-600" />
              <h3 className="text-lg font-bold text-slate-900">
                Demonstração — {MONTHS[month - 1]} {year}
              </h3>
            </div>

            <div className="divide-y divide-slate-100">
              {/* Receita Bruta */}
              <div className="px-8 py-5 flex items-center justify-between bg-emerald-50/30">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center text-sm font-black">+</span>
                  <div>
                    <p className="font-bold text-slate-900">Receita Bruta</p>
                    <p className="text-xs text-slate-400">Créditos do período (acertos de PDVs)</p>
                  </div>
                </div>
                <span className="text-lg font-black text-emerald-600">
                  <CurrencyText value={dre?.receita ?? 0} />
                </span>
              </div>

              {/* Saídas */}
              <div className="px-8 py-5 flex items-center justify-between bg-rose-50/20">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 bg-rose-100 text-rose-700 rounded-lg flex items-center justify-center text-sm font-black">−</span>
                  <div>
                    <p className="font-bold text-slate-900">Saídas / Débitos</p>
                    <p className="text-xs text-slate-400">Débitos registrados no período</p>
                  </div>
                </div>
                <span className="text-lg font-black text-rose-600">
                  <CurrencyText value={dre?.saidas ?? 0} />
                </span>
              </div>

              {/* Resultado */}
              <div className={`px-8 py-5 flex items-center justify-between ${isPositive ? 'bg-emerald-50' : 'bg-rose-50'}`}>
                <div className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm font-black ${isPositive ? 'bg-emerald-200 text-emerald-800' : 'bg-rose-200 text-rose-800'}`}>=</span>
                  <div>
                    <p className="font-bold text-slate-900">Resultado Operacional</p>
                    <p className="text-xs text-slate-400">Receita − Saídas</p>
                  </div>
                </div>
                <span className={`text-xl font-black ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                  <CurrencyText value={resultado} />
                </span>
              </div>
            </div>
          </div>

          {/* Indicadores */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-indigo-600" />
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Acertos no Período</p>
              </div>
              <h2 className="text-4xl font-bold text-slate-900">{dre?.settlements ?? 0}</h2>
              <p className="text-slate-400 text-sm">Fechamentos concluídos em {MONTHS[month - 1]}</p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <BarChart3 size={16} className="text-emerald-600" />
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Ticket Médio por Acerto</p>
              </div>
              <h2 className="text-4xl font-bold text-slate-900">
                <CurrencyText value={dre?.ticketMedio ?? 0} />
              </h2>
              <p className="text-slate-400 text-sm">Receita bruta ÷ nº de acertos</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
