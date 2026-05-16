'use client';

import { useState, useEffect } from 'react';
import {
  ArrowUpCircle,
  ArrowDownCircle,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Plus,
  X,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import api from '@/lib/api';
import { CurrencyText } from '@/components/CurrencyText';

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

const CATEGORIES = ['Produção', 'Logística', 'Operacional', 'Pessoal', 'Taxas', 'Outros'];

const CATEGORY_COLORS: Record<string, string> = {
  'Produção': 'bg-blue-50 text-blue-700',
  'Logística': 'bg-amber-50 text-amber-700',
  'Operacional': 'bg-indigo-50 text-indigo-700',
  'Pessoal': 'bg-purple-50 text-purple-700',
  'Taxas': 'bg-rose-50 text-rose-700',
  'Outros': 'bg-slate-100 text-slate-600',
};

export default function CashFlowPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ amount: '', description: '', category: 'Operacional' });

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/transactions/cash-flow?month=${month}&year=${year}`);
      setData(res.data.data || res.data);
    } catch (err) {
      console.error('Erro ao carregar fluxo de caixa:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [month, year]);

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const handleSaveExpense = async () => {
    if (!form.amount || !form.description) return;
    setSaving(true);
    try {
      await api.post('/transactions/expense', {
        amount: parseFloat(form.amount),
        description: form.description,
        category: form.category,
      });
      setIsModalOpen(false);
      setForm({ amount: '', description: '', category: 'Operacional' });
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao registrar despesa.');
    } finally {
      setSaving(false);
    }
  };

  const saldo = data?.saldo ?? 0;
  const isPositive = saldo >= 0;

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <DollarSign className="text-emerald-600" size={28} /> Fluxo de Caixa
          </h1>
          <p className="text-slate-500 text-sm">Entradas e saídas categorizadas do período.</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Seletor de mês */}
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-2xl px-4 py-2 shadow-sm">
            <button onClick={prevMonth} className="p-1.5 hover:bg-slate-100 rounded-xl transition-colors">
              <ChevronLeft size={18} className="text-slate-500" />
            </button>
            <span className="text-sm font-bold text-slate-800 min-w-[130px] text-center">
              {MONTHS[month - 1]} / {year}
            </span>
            <button onClick={nextMonth} className="p-1.5 hover:bg-slate-100 rounded-xl transition-colors">
              <ChevronRight size={18} className="text-slate-500" />
            </button>
          </div>

          {/* Botão registrar despesa */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-2xl shadow-sm shadow-rose-100 transition-all text-sm"
          >
            <Plus size={18} /> Registrar Despesa
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-[40vh]">
          <Loader2 className="animate-spin text-emerald-600" size={36} />
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-emerald-600 p-8 rounded-3xl text-white shadow-xl shadow-emerald-100 relative overflow-hidden">
              <div className="relative z-10">
                <p className="text-emerald-100 text-sm font-medium mb-1">Total de Entradas</p>
                <h2 className="text-4xl font-bold"><CurrencyText value={data?.totalEntradas ?? 0} /></h2>
                <div className="mt-6 flex items-center gap-2 text-emerald-200 text-sm">
                  <TrendingUp size={16} />
                  <span>Créditos no período</span>
                </div>
              </div>
              <ArrowUpCircle className="absolute -right-4 -bottom-4 w-32 h-32 text-emerald-500/20" />
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <p className="text-slate-500 text-sm font-medium mb-1">Total de Saídas</p>
              <h2 className="text-3xl font-bold text-rose-600"><CurrencyText value={data?.totalSaidas ?? 0} /></h2>
              <div className="mt-6 flex items-center gap-2 text-rose-400 text-sm font-bold">
                <TrendingDown size={16} />
                <span>Débitos no período</span>
              </div>
            </div>

            <div className={`p-8 rounded-3xl border shadow-sm ${isPositive ? 'bg-blue-50 border-blue-100' : 'bg-rose-50 border-rose-100'}`}>
              <p className="text-slate-500 text-sm font-medium mb-1">Saldo do Período</p>
              <h2 className={`text-3xl font-bold ${isPositive ? 'text-blue-700' : 'text-rose-600'}`}>
                <CurrencyText value={saldo} />
              </h2>
              <div className={`mt-6 flex items-center gap-2 text-sm font-bold ${isPositive ? 'text-blue-500' : 'text-rose-500'}`}>
                {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                <span>{isPositive ? 'Saldo positivo' : 'Saldo negativo'}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Saídas por Categoria */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <ArrowDownCircle size={18} className="text-rose-500" /> Saídas por Categoria
                </h3>
              </div>
              <div className="p-6 space-y-4">
                {data?.saidasPorCategoria?.length > 0 ? data.saidasPorCategoria.map((cat: any, i: number) => {
                  const pct = data.totalSaidas > 0 ? Math.round((cat.value / data.totalSaidas) * 100) : 0;
                  return (
                    <div key={i}>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${CATEGORY_COLORS[cat.name] || CATEGORY_COLORS['Outros']}`}>
                          {cat.name}
                        </span>
                        <span className="text-sm font-black text-slate-900"><CurrencyText value={cat.value} /></span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-2 bg-rose-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                }) : (
                  <p className="text-slate-400 text-sm text-center py-8 italic">Nenhuma saída registrada.</p>
                )}
              </div>
            </div>

            {/* Lista de Saídas */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <ArrowDownCircle size={18} className="text-slate-400" /> Lançamentos de Despesas
                </h3>
              </div>
              <div className="divide-y divide-slate-100 max-h-[320px] overflow-y-auto">
                {data?.saidas?.length > 0 ? data.saidas.map((s: any) => (
                  <div key={s.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{s.description}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${CATEGORY_COLORS[s.category] || CATEGORY_COLORS['Outros']}`}>
                          {s.category}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(s.createdAt).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                    <span className="text-sm font-black text-rose-600"><CurrencyText value={s.amount} /></span>
                  </div>
                )) : (
                  <p className="text-slate-400 text-sm text-center py-8 italic">Nenhum lançamento de despesa.</p>
                )}
              </div>
            </div>
          </div>

          {/* Entradas */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <ArrowUpCircle size={18} className="text-emerald-500" /> Entradas do Período
              </h3>
            </div>
            <div className="divide-y divide-slate-100 max-h-[300px] overflow-y-auto">
              {data?.entradas?.length > 0 ? data.entradas.map((e: any) => (
                <div key={e.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{e.description || 'Crédito operacional'}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {new Date(e.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <span className="text-sm font-black text-emerald-600"><CurrencyText value={e.amount} /></span>
                </div>
              )) : (
                <p className="text-slate-400 text-sm text-center py-8 italic">Nenhuma entrada no período.</p>
              )}
            </div>
          </div>
        </>
      )}

      {/* Modal Registrar Despesa */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[40px] w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
              <h3 className="text-xl font-black text-slate-900">Registrar Despesa</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-10 h-10 flex items-center justify-center bg-white rounded-full text-slate-400 hover:text-slate-600 shadow-sm border border-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-8 space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Categoria</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-rose-400 transition-all font-medium text-sm"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Valor (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  value={form.amount}
                  onChange={(e) => setForm(f => ({ ...f, amount: e.target.value }))}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-rose-400 transition-all font-medium text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Descrição</label>
                <input
                  type="text"
                  placeholder="Ex: Compra de filamento PLA..."
                  value={form.description}
                  onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-rose-400 transition-all font-medium text-sm"
                />
              </div>
            </div>

            <div className="p-8 border-t border-slate-50 bg-slate-50/30 flex gap-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 px-6 py-4 bg-white border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveExpense}
                disabled={saving || !form.amount || !form.description}
                className="flex-[2] bg-rose-600 hover:bg-rose-500 text-white font-bold py-4 rounded-2xl shadow-xl shadow-rose-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {saving ? <Loader2 className="animate-spin" size={20} /> : <><Plus size={18} /> Registrar</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
