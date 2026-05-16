'use client';

import { useState, useEffect } from 'react';
import { 
  DollarSign, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Filter, 
  Download,
  Calendar,
  Search,
  MoreVertical,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  Package,
  Store
} from 'lucide-react';
import api from '@/lib/api';
import { CurrencyText } from '@/components/CurrencyText';

export default function FinancialPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState<string | number>(0);
  const [monthlyCredits, setMonthlyCredits] = useState<number>(0);
  const [monthlyDebits, setMonthlyDebits] = useState<number>(0);
  const [topPos, setTopPos] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [totalPending, setTotalPending] = useState<number>(0);
  const [pendingCount, setPendingCount] = useState<number>(0);

  const loadFinancialData = async () => {
    setLoading(true);
    try {
      const [tRes, mRes, posRes, prodRes, pendRes] = await Promise.all([
        api.get('/financial-transactions'),
        api.get('/dashboard/metrics'),
        api.get('/dashboard/top-pos'),
        api.get('/dashboard/top-products'),
        api.get('/settlements/pending-pos'),
      ]);
      
      const txData: any[] = tRes.data.data || tRes.data || [];
      setTransactions(txData);
      setBalance(mRes.data.data?.balance || mRes.data?.balance || 0);
      setTopPos(posRes.data.data || posRes.data || []);
      setTopProducts(prodRes.data.data || prodRes.data || []);
      const pending = pendRes.data.data || pendRes.data || [];
      setTotalPending(pending.reduce((acc: number, p: any) => acc + Number(p.totalPending || 0), 0));
      setPendingCount(pending.length);

      const now = new Date();
      const credits = txData
        .filter((tx) => {
          const d = new Date(tx.createdAt);
          return tx.type === 'CREDIT' && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        })
        .reduce((acc, tx) => acc + Number(tx.amount), 0);
      const debits = txData
        .filter((tx) => {
          const d = new Date(tx.createdAt);
          return tx.type === 'DEBIT' && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        })
        .reduce((acc, tx) => acc + Number(tx.amount), 0);
      setMonthlyCredits(credits);
      setMonthlyDebits(debits);
    } catch (err) {
      console.error('Erro ao carregar dados financeiros', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFinancialData();
  }, []);

  const handleExport = () => {
    if (transactions.length === 0) {
      alert('Não há transações para exportar.');
      return;
    }

    const headers = ['Data', 'Descricao', 'Tipo', 'Status', 'Valor'];
    const csvContent = [
      headers.join(','),
      ...transactions.map(tx => [
        new Date(tx.createdAt).toLocaleDateString('pt-BR'),
        `"${tx.description || 'Transação operacional'}"`,
        tx.type === 'CREDIT' ? 'Credito' : 'Debito',
        'Concluido',
        tx.amount
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `extrato_financeiro_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Financeiro</h1>
          <p className="text-slate-500">Acompanhe seu saldo, vendas e repasses.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleExport}
            className="flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 font-bold py-3 px-6 rounded-xl hover:bg-slate-50 transition-all shadow-sm"
          >
            <Download size={20} />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-600 p-8 rounded-3xl text-white shadow-xl shadow-blue-100 relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-blue-100 text-sm font-medium mb-1">Saldo Disponível</p>
            <h2 className="text-4xl font-bold"><CurrencyText value={balance} /></h2>
            <div className="mt-6 flex items-center gap-2 text-blue-100 text-sm">
              <CheckCircle2 size={16} />
              <span>Sincronizado com as vendas reais</span>
            </div>
          </div>
          <DollarSign className="absolute -right-4 -bottom-4 w-32 h-32 text-blue-500/20" />
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-sm font-medium mb-1">Total em Vendas (Mês)</p>
          <h2 className="text-3xl font-bold text-slate-900"><CurrencyText value={monthlyCredits} /></h2>
          <div className="mt-6 flex items-center gap-2 text-emerald-600 text-sm font-bold">
            <ArrowUpCircle size={16} />
            <span>Acumulado no mês corrente</span>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-sm font-medium mb-1">Débitos do Período</p>
          <h2 className="text-3xl font-bold text-slate-900"><CurrencyText value={monthlyDebits} /></h2>
          <div className="mt-6 flex items-center gap-2 text-slate-500 text-sm font-medium">
            <Clock size={16} />
            <span>Saídas registradas no mês</span>
          </div>
        </div>
      </div>

      {/* Painel Consolidado */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pendências */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">A Receber</p>
            <span className="text-[10px] font-bold bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full">
              {pendingCount} PDVs
            </span>
          </div>
          <h2 className="text-3xl font-bold text-amber-600"><CurrencyText value={totalPending} /></h2>
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <Clock size={14} />
            <span>Pendente de repasse</span>
          </div>
        </div>

        {/* Top PDVs */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={16} className="text-blue-600" />
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Top PDVs</p>
          </div>
          <div className="space-y-3">
            {topPos.slice(0, 3).map((pos, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 bg-slate-100 rounded-md text-slate-500 text-[10px] font-black flex items-center justify-center">{i + 1}</span>
                  <span className="text-sm font-bold text-slate-700 truncate max-w-[120px]">{pos.name}</span>
                </div>
                <span className="text-sm font-black text-slate-900"><CurrencyText value={pos.sales} /></span>
              </div>
            ))}
            {topPos.length === 0 && <p className="text-slate-400 text-xs italic">Sem dados de vendas</p>}
          </div>
        </div>

        {/* Top Produtos */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Package size={16} className="text-emerald-600" />
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Top Produtos</p>
          </div>
          <div className="space-y-3">
            {topProducts.slice(0, 3).map((prod, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 bg-slate-100 rounded-md text-slate-500 text-[10px] font-black flex items-center justify-center">{i + 1}</span>
                  <span className="text-sm font-bold text-slate-700 truncate max-w-[120px]">{prod.name}</span>
                </div>
                <span className="text-sm font-black text-slate-900">{prod.quantity} un.</span>
              </div>
            ))}
            {topProducts.length === 0 && <p className="text-slate-400 text-xs italic">Sem dados de produtos</p>}
          </div>
        </div>
      </div>

      {/* Transactions Section */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between gap-4">
          <h3 className="text-lg font-bold text-slate-900">Extrato de Transações</h3>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Buscar transação..." 
                className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50">
              <Filter size={16} />
              Filtros
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Data</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Descrição</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Tipo</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.length > 0 ? transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                    {new Date(tx.createdAt).toLocaleDateString('pt-BR')}
                    <span className="text-xs text-slate-400 ml-2">
                      {new Date(tx.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-slate-900">{tx.description || 'Transação operacional'}</p>
                    <p className="text-[10px] text-slate-400 font-mono uppercase">{tx.referenceType || 'OTHER'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      tx.type === 'CREDIT' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                    }`}>
                      {tx.type === 'CREDIT' ? 'Crédito' : 'Débito'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                      <CheckCircle2 size={14} />
                      Concluído
                    </div>
                  </td>
                  <td className={`px-6 py-4 text-sm font-bold text-right ${
                    tx.type === 'CREDIT' ? 'text-emerald-600' : 'text-rose-600'
                  }`}>
                    {tx.type === 'CREDIT' ? '+' : '-'} <CurrencyText value={tx.amount} />
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    <AlertCircle className="mx-auto w-12 h-12 mb-4 opacity-20" />
                    Nenhuma transação registrada até o momento.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
