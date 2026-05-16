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
  AlertCircle
} from 'lucide-react';
import api from '@/lib/api';
import { CurrencyText } from '@/components/CurrencyText';

export default function FinancialPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState<string | number>(0);
  const [monthlyCredits, setMonthlyCredits] = useState<number>(0);
  const [monthlyDebits, setMonthlyDebits] = useState<number>(0);

  useEffect(() => {
    async function loadFinancialData() {
      try {
        const [tRes, mRes] = await Promise.all([
          api.get('/financial-transactions'),
          api.get('/dashboard/metrics')
        ]);
        const txData: any[] = tRes.data.data || [];
        setTransactions(txData);
        setBalance(mRes.data.data?.balance || 0);

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
    }
    loadFinancialData();
  }, []);

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
          <button className="flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 font-bold py-3 px-6 rounded-xl hover:bg-slate-50 transition-all shadow-sm">
            <Download size={20} />
            Exportar
          </button>
          <button className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-blue-200">
            <DollarSign size={20} />
            Solicitar Saque
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
