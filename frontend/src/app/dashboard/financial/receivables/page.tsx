'use client';

import { useState, useEffect } from 'react';
import {
  DollarSign,
  Store,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronRight,
  Calendar,
  X,
  ClipboardList,
} from 'lucide-react';
import api from '@/lib/api';
import { CurrencyText } from '@/components/CurrencyText';

type StatusType = 'pendente' | 'atrasado' | 'pago';

function getStatus(pos: any): StatusType {
  if (!pos.billingDay) return 'pendente';
  const today = new Date().getDate();
  return today > pos.billingDay ? 'atrasado' : 'pendente';
}

const STATUS_CONFIG: Record<StatusType, { label: string; className: string }> = {
  pendente: {
    label: 'Pendente',
    className: 'bg-amber-50 text-amber-600',
  },
  atrasado: {
    label: 'Atrasado',
    className: 'bg-rose-50 text-rose-600',
  },
  pago: {
    label: 'Pago',
    className: 'bg-emerald-50 text-emerald-600',
  },
};

export default function ReceivablesPage() {
  const [pendingPOS, setPendingPOS] = useState<any[]>([]);
  const [settlementsHistory, setSettlementsHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [confirmPOS, setConfirmPOS] = useState<any>(null);
  const [notes, setNotes] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [pendingRes, historyRes] = await Promise.all([
        api.get('/settlements/pending-pos'),
        api.get('/settlements'),
      ]);
      setPendingPOS(pendingRes.data.data || pendingRes.data || []);
      setSettlementsHistory(historyRes.data.data || historyRes.data || []);
    } catch (err) {
      console.error('Erro ao carregar contas a receber:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleMarkAsReceived = async () => {
    if (!confirmPOS) return;
    setSaving(confirmPOS.id);
    try {
      await api.post('/settlements', {
        posId: confirmPOS.id,
        notes,
      });
      setConfirmPOS(null);
      setNotes('');
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao registrar recebimento.');
    } finally {
      setSaving(null);
    }
  };

  const totalPending = pendingPOS.reduce((acc, p) => acc + Number(p.totalPending || 0), 0);
  const overdueCount = pendingPOS.filter((p) => getStatus(p) === 'atrasado').length;

  // Recebido no mês corrente
  const now = new Date();
  const receivedThisMonth = settlementsHistory
    .filter((s) => {
      const d = new Date(s.settledAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((acc, s) => acc + Number(s.totalAmount || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Contas a Receber</h1>
        <p className="text-slate-500 text-sm">Acompanhe repasses pendentes e registre recebimentos dos PDVs.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-indigo-600 p-8 rounded-3xl text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-indigo-100 text-sm font-medium mb-1">Total Pendente</p>
            <h2 className="text-4xl font-bold"><CurrencyText value={totalPending} /></h2>
            <div className="mt-6 flex items-center gap-2 text-indigo-200 text-sm">
              <Clock size={16} />
              <span>{pendingPOS.length} PDVs aguardando</span>
            </div>
          </div>
          <DollarSign className="absolute -right-4 -bottom-4 w-32 h-32 text-indigo-500/20" />
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-sm font-medium mb-1">PDVs em Atraso</p>
          <h2 className="text-3xl font-bold text-rose-600">{overdueCount}</h2>
          <div className="mt-6 flex items-center gap-2 text-rose-400 text-sm font-bold">
            <AlertCircle size={16} />
            <span>Prazo de cobrança vencido</span>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-sm font-medium mb-1">Recebido no Mês</p>
          <h2 className="text-3xl font-bold text-emerald-600"><CurrencyText value={receivedThisMonth} /></h2>
          <div className="mt-6 flex items-center gap-2 text-emerald-500 text-sm font-bold">
            <CheckCircle2 size={16} />
            <span>Acertos concluídos</span>
          </div>
        </div>
      </div>

      {/* Tabela de PDVs Pendentes */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900">PDVs Pendentes de Repasse</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">PDV</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Itens</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Data Prevista</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Valor do Acerto</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pendingPOS.length > 0 ? pendingPOS.map((pos) => {
                const status = getStatus(pos);
                const cfg = STATUS_CONFIG[status];
                const billingDay = pos.billingDay
                  ? `Dia ${pos.billingDay} de cada mês`
                  : 'Não definido';

                return (
                  <tr key={pos.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500">
                          <Store size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{pos.name}</p>
                          <p className="text-xs text-slate-400">{pos.city || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {pos.pendingItemsCount} itens
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${cfg.className}`}>
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={14} className="text-slate-400" />
                        {billingDay}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-indigo-600">
                      <CurrencyText value={pos.totalPending} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setConfirmPOS(pos)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-sm shadow-indigo-100"
                      >
                        <CheckCircle2 size={14} /> Recebido
                      </button>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-slate-400">
                    <CheckCircle2 className="mx-auto w-12 h-12 mb-4 opacity-20" />
                    <p className="font-bold text-slate-500">Tudo em dia!</p>
                    <p className="text-sm mt-1">Não há repasses pendentes no momento.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Últimos Recebimentos */}
      {settlementsHistory.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-900">Últimos Recebimentos</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {settlementsHistory.slice(0, 8).map((s) => (
              <div key={s.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{s.pos?.name}</p>
                    <p className="text-xs text-slate-400">{new Date(s.settledAt).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
                <p className="text-sm font-bold text-emerald-600"><CurrencyText value={s.totalAmount} /></p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Confirmar Recebimento */}
      {confirmPOS && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[40px] w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
              <div>
                <h3 className="text-xl font-black text-slate-900">Confirmar Recebimento</h3>
                <p className="text-slate-500 text-sm mt-1">PDV: <strong>{confirmPOS.name}</strong></p>
              </div>
              <button
                onClick={() => { setConfirmPOS(null); setNotes(''); }}
                className="w-10 h-10 flex items-center justify-center bg-white rounded-full text-slate-400 hover:text-slate-600 shadow-sm border border-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div className="p-6 bg-indigo-50 border border-indigo-100 rounded-3xl">
                <p className="text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-1">Valor do Acerto</p>
                <div className="text-3xl font-black text-indigo-600">
                  <CurrencyText value={confirmPOS.totalPending} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Observações (Opcional)</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Pix recebido, comprovante enviado..."
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                />
              </div>
            </div>

            <div className="p-8 border-t border-slate-50 bg-slate-50/30 flex gap-4">
              <button
                onClick={() => { setConfirmPOS(null); setNotes(''); }}
                className="flex-1 px-6 py-4 bg-white border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleMarkAsReceived}
                disabled={saving === confirmPOS.id}
                className="flex-[2] bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-2xl shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-2"
              >
                {saving === confirmPOS.id ? <Loader2 className="animate-spin" size={20} /> : <><CheckCircle2 size={18} /> Confirmar Recebimento</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
