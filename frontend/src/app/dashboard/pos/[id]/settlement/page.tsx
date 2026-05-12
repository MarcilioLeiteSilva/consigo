'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  ClipboardList, 
  Store, 
  Package, 
  DollarSign, 
  Clock, 
  ChevronRight, 
  Loader2, 
  X,
  History,
  TrendingUp,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import api from '@/lib/api';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { CurrencyText } from '@/components/CurrencyText';

export default function POSSettlementPage() {
  const params = useParams();
  const router = useRouter();
  const [pos, setPos] = useState<any>(null);
  const [activeLots, setActiveLots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInventoryModalOpen, setInventoryModalOpen] = useState(false);
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [notes, setNotes] = useState('');
  const [pendingTotal, setPendingTotal] = useState(0);

  const loadData = async () => {
    setLoading(true);
    try {
      const [posRes, lotsRes, pendingRes] = await Promise.all([
        api.get(`/pos/${params.id}`),
        api.get(`/settlements/active-lots/${params.id}`),
        api.get(`/settlements/pending-items/${params.id}`)
      ]);
      
      setPos(posRes.data.data || posRes.data);
      setActiveLots(lotsRes.data.data || lotsRes.data);
      
      const pendingItems = pendingRes.data.data || pendingRes.data;
      const total = pendingItems.reduce((acc: number, item: any) => acc + Number(item.consignorAmount), 0);
      setPendingTotal(total);
      
    } catch (err) {
      console.error('Erro ao carregar dados do PDV para fechamento:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.id) loadData();
  }, [params.id]);

  const handleStartInventory = () => {
    setInventoryItems(activeLots.map((l: any) => ({
      ...l,
      remainingQuantity: Number(l.quantityReceived) - Number(l.quantitySold) - Number(l.quantityReturned)
    })));
    setInventoryModalOpen(true);
  };

  const handleConfirmInventorySettlement = async () => {
    setSaving(true);
    try {
      await api.post('/settlements/inventory-based', {
        posId: params.id,
        items: inventoryItems.map(item => ({
          lotId: item.id,
          remainingQuantity: Number(item.remainingQuantity)
        })),
        notes
      });
      setInventoryModalOpen(false);
      setNotes('');
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao realizar fechamento por inventário');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
      </div>
    );
  }

  if (!pos) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-slate-600 shadow-sm transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Acerto de Contas</h1>
            <p className="flex items-center gap-2 text-slate-500 font-bold">
              <Store size={16} className="text-indigo-500" /> {pos.name}
            </p>
          </div>
        </div>
        
        <button 
          onClick={handleStartInventory}
          className="flex items-center justify-center gap-2 bg-indigo-600 text-white font-bold py-3.5 px-8 rounded-2xl hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-100"
        >
          <ClipboardList size={20} /> Novo Fechamento (Inventário)
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Vendas a Liquidar</p>
          <div className="text-3xl font-black text-indigo-600"><CurrencyText value={pendingTotal} /></div>
          <p className="text-slate-400 text-xs mt-1 font-bold">Baseado em vendas já registradas</p>
        </div>

        <div className="bg-slate-900 p-8 rounded-[32px] shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full -mr-12 -mt-12 blur-xl" />
          <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1">Mercadoria no PDV</p>
          <div className="text-3xl font-black text-white">{activeLots.length} Lotes</div>
          <p className="text-indigo-400 text-xs mt-1 font-bold">Ativos no parceiro</p>
        </div>

        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Último Acerto</p>
          <div className="text-3xl font-black text-slate-900">
             {pos.settlements?.[0]?.settledAt ? formatDate(pos.settlements[0].settledAt) : 'N/A'}
          </div>
          <p className="text-slate-400 text-xs mt-1 font-bold">Consolidação física</p>
        </div>
      </div>

      {/* Mercadorias no PDV Table */}
      <div className="space-y-6">
        <h3 className="text-xl font-black text-slate-900 flex items-center gap-2 px-2 uppercase tracking-tighter">
          <Package className="text-indigo-600" /> Resumo das Mercadorias no PDV
        </h3>
        
        <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Produto</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Enviado</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Saldo Teórico</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Valor Unit.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {activeLots.map((lot) => {
                  const currentStock = lot.quantityReceived - lot.quantitySold - lot.quantityReturned;
                  return (
                    <tr key={lot.id} className="hover:bg-slate-50/30 transition-all">
                      <td className="px-8 py-6">
                        <div>
                          <p className="font-bold text-slate-900 leading-tight">{lot.product?.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">REF: {lot.reference || 'SEM REF'}</p>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center font-bold text-slate-600">{lot.quantityReceived}</td>
                      <td className="px-8 py-6 text-center">
                        <span className={`font-black px-3 py-1 rounded-full text-sm ${currentStock <= 5 ? 'bg-rose-50 text-rose-500' : 'bg-slate-50 text-slate-900'}`}>
                          {currentStock}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right font-black text-slate-900">
                        {formatCurrency(lot.unitPrice)}
                      </td>
                    </tr>
                  );
                })}
                {activeLots.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-8 py-20 text-center">
                       <div className="flex flex-col items-center gap-3">
                          <Package className="text-slate-200" size={48} />
                          <p className="text-slate-400 font-bold">Nenhum lote ativo encontrado.</p>
                       </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal de Inventário */}
      {isInventoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-[40px] w-full max-w-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 my-8">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
              <div>
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Realizar Contagem</h3>
                <p className="text-slate-500 text-sm font-bold flex items-center gap-2">
                   <Store size={14} /> {pos.name}
                </p>
              </div>
              <button onClick={() => setInventoryModalOpen(false)} className="w-12 h-12 flex items-center justify-center bg-white rounded-full text-slate-400 hover:text-slate-600 shadow-sm border border-slate-100">
                <X size={24} />
              </button>
            </div>

            <div className="p-8">
              <div className="space-y-6">
                <div className="bg-amber-50 border border-amber-100 p-6 rounded-3xl flex gap-4">
                  <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center shrink-0">
                    <TrendingUp size={24} />
                  </div>
                  <div>
                    <h4 className="text-amber-900 font-black text-sm uppercase">Instruções</h4>
                    <p className="text-amber-700 text-xs font-bold opacity-80 leading-relaxed">
                      Informe a quantidade que está **fisicamente** presente no PDV. O sistema calculará o vendido automaticamente.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Itens em Estoque</h4>
                  <div className="space-y-3">
                    {inventoryItems.map((item, idx) => (
                      <div key={item.id} className="p-6 border border-slate-100 rounded-3xl bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <p className="font-bold text-slate-900">{item.product?.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Ref: {item.reference || 'N/D'} • Enviado: {item.quantityReceived} un</p>
                        </div>
                        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
                          <span className="text-[10px] font-black text-slate-400 uppercase ml-2">Restante</span>
                          <input 
                            type="number"
                            value={item.remainingQuantity}
                            onChange={(e) => {
                              const newItems = [...inventoryItems];
                              newItems[idx].remainingQuantity = e.target.value;
                              setInventoryItems(newItems);
                            }}
                            className="w-24 px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-center font-black text-slate-900 text-lg"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Observações</label>
                  <textarea 
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Notas sobre o inventário de hoje..."
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm font-bold"
                  />
                </div>
              </div>
            </div>

            <div className="p-8 border-t border-slate-50 bg-slate-50/30 flex gap-4">
              <button 
                onClick={() => setInventoryModalOpen(false)}
                className="flex-1 px-8 py-4 bg-white border border-slate-200 text-slate-500 font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-slate-50 transition-all"
              >
                Cancelar
              </button>
              <button 
                onClick={handleConfirmInventorySettlement}
                disabled={saving || inventoryItems.length === 0}
                className="flex-[2] bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest text-xs py-4 rounded-2xl shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 className="animate-spin" /> : 'Processar Acerto'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
