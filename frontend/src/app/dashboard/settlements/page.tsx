'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ClipboardList, 
  Search, 
  Filter, 
  ArrowRight, 
  Store, 
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Clock,
  Loader2,
  ChevronRight,
  X,
  History,
  FileText,
  MessageCircle,
  Zap
} from 'lucide-react';
import api from '@/lib/api';
import { CurrencyText } from '@/components/CurrencyText';
import { formatCurrency } from '@/utils/formatters';

export default function SettlementsPage() {
  const router = useRouter();
  const [pendingPOS, setPendingPOS] = useState<any[]>([]);
  const [settlementsHistory, setSettlementsHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPOS, setSelectedPOS] = useState<any>(null);
  const [pendingItems, setPendingItems] = useState<any[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInventoryModalOpen, setInventoryModalOpen] = useState(false);
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [allPOS, setAllPOS] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [notes, setNotes] = useState('');
  const [startingAutomation, setStartingAutomation] = useState<string | null>(null);

  const handleStartAutomation = async (posId: string) => {
    setStartingAutomation(posId);
    try {
      await api.post('/tenant/whatsapp/inventory/start', {
        posId,
        message: 'Olá! Sou o assistente virtual da Consigo. Gostaria de confirmar o que você ainda tem em estoque para realizarmos o acerto do período. Podemos começar?'
      });
      alert('Automação iniciada com sucesso! O Agente entrará em contato com o PDV.');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao iniciar automação. Verifique se o WhatsApp está conectado.');
    } finally {
      setStartingAutomation(null);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [pendingRes, historyRes, posRes] = await Promise.all([
        api.get('/settlements/pending-pos'),
        api.get('/settlements'),
        api.get('/pos')
      ]);
      setPendingPOS(pendingRes.data.data || pendingRes.data);
      setSettlementsHistory(historyRes.data.data || historyRes.data);
      setAllPOS(posRes.data.data || posRes.data);
    } catch (err) {
      console.error('Erro ao carregar dados de fechamento:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectPOSForInventory = async (posId: string) => {
    const pos = allPOS.find(p => p.id === posId);
    setSelectedPOS(pos);
    setLoadingItems(true);
    try {
      const res = await api.get(`/settlements/active-lots/${posId}`);
      const lots = res.data.data || res.data;
      setInventoryItems(lots.map((l: any) => ({
        ...l,
        remainingQuantity: Number(l.quantityReceived) - Number(l.quantitySold) - Number(l.quantityReturned)
      })));
    } catch (err) {
      console.error('Erro ao carregar lotes ativos:', err);
    } finally {
      setLoadingItems(false);
    }
  };

  const handleConfirmInventorySettlement = async () => {
    if (!selectedPOS) return;
    
    setSaving(true);
    try {
      await api.post('/settlements/inventory-based', {
        posId: selectedPOS.id,
        items: inventoryItems.map(item => ({
          lotId: item.id,
          remainingQuantity: Number(item.remainingQuantity)
        })),
        notes
      });
      setInventoryModalOpen(false);
      setSelectedPOS(null);
      setNotes('');
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao realizar fechamento por inventário');
    } finally {
      setSaving(false);
    }
  };

  const handleSelectPOS = async (pos: any) => {
    setSelectedPOS(pos);
    setLoadingItems(true);
    setIsModalOpen(true);
    try {
      const res = await api.get(`/settlements/pending-items/${pos.id}`);
      setPendingItems(res.data.data || res.data);
    } catch (err) {
      console.error('Erro ao carregar itens pendentes:', err);
    } finally {
      setLoadingItems(false);
    }
  };

  const handleConfirmSettlement = async () => {
    if (!selectedPOS) return;
    
    setSaving(true);
    try {
      await api.post('/settlements', {
        posId: selectedPOS.id,
        notes
      });
      setIsModalOpen(false);
      setSelectedPOS(null);
      setNotes('');
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao realizar fechamento');
    } finally {
      setSaving(false);
    }
  };

  const totalPendingAll = pendingPOS.reduce((acc, pos) => acc + Number(pos.totalPending), 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Prestação de Contas (Fechamento)</h1>
          <p className="text-slate-500 text-sm">Consolidação de vendas e acerto de contas com PDVs.</p>
        </div>
        <button 
          onClick={() => {
            setSelectedPOS(null);
            setInventoryModalOpen(true);
            setInventoryItems([]);
          }}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 px-8 rounded-2xl transition-all shadow-lg shadow-indigo-100"
        >
          <ClipboardList size={20} /> Novo Fechamento (Inventário)
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Aguardando Fechamento</p>
          <div className="text-3xl font-black text-slate-900">{pendingPOS.length} PDVs</div>
          <p className="text-slate-400 text-xs mt-1">Com vendas pendentes</p>
        </div>
        <div className="bg-indigo-600 p-8 rounded-[32px] text-white shadow-xl shadow-indigo-100">
          <p className="text-indigo-100 text-[10px] font-black uppercase tracking-widest mb-2">Total Líquido Pendente</p>
          <div className="text-3xl font-black"><CurrencyText value={totalPendingAll} /></div>
          <p className="text-indigo-200 text-xs mt-1">Valor a receber dos parceiros</p>
        </div>
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Último Fechamento</p>
          <div className="text-3xl font-black text-slate-900">
            {settlementsHistory.length > 0 
              ? new Date(settlementsHistory[0].settledAt).toLocaleDateString()
              : 'Nenhum'}
          </div>
          <p className="text-slate-400 text-xs mt-1">Histórico registrado</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* PDVs Pendentes */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50">
              <h3 className="font-bold text-slate-900">PDVs para Conciliação</h3>
            </div>
            
            <div className="divide-y divide-slate-50">
              {loading ? (
                <div className="p-20 text-center">
                  <Loader2 className="animate-spin mx-auto text-indigo-600" size={32} />
                </div>
              ) : pendingPOS.length > 0 ? (
                pendingPOS.map((pos) => (
                  <div key={pos.id} className="p-8 flex items-center justify-between hover:bg-slate-50/50 transition-all group">
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all border border-slate-100">
                        <Store size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-lg">{pos.name}</h4>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-xs text-slate-400 font-medium">{pos.pendingItemsCount} itens vendidos</span>
                          <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                          <span className="text-xs text-slate-400 font-medium">{pos.city || 'Cidade não inf.'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Valor do Acerto</p>
                        <div className="text-xl font-black text-indigo-600"><CurrencyText value={pos.totalPending} /></div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => handleStartAutomation(pos.id)}
                          disabled={startingAutomation === pos.id}
                          className={`p-4 rounded-2xl transition-all shadow-lg flex items-center justify-center ${
                            startingAutomation === pos.id 
                            ? 'bg-slate-100 text-slate-400' 
                            : 'bg-green-50 text-green-600 hover:bg-green-100 shadow-green-50'
                          }`}
                          title="Iniciar Agente de Acertos"
                        >
                          {startingAutomation === pos.id ? <Loader2 size={20} className="animate-spin" /> : <Zap size={20} />}
                        </button>
                        <button 
                          onClick={() => handleSelectPOS(pos)}
                          className="p-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-100"
                        >
                          <ChevronRight size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-20 text-center">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mx-auto mb-4">
                    <CheckCircle2 size={40} />
                  </div>
                  <h3 className="text-slate-900 font-black text-lg">Tudo em dia!</h3>
                  <p className="text-slate-500 text-sm max-w-sm mx-auto mt-2">
                    Não há vendas pendentes de fechamento no momento.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Histórico Recente */}
        <div className="space-y-6">
          <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-8">
            <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
              <History size={20} className="text-indigo-600" />
              Últimos Fechamentos
            </h3>
            <div className="space-y-4">
              {settlementsHistory.slice(0, 10).map((s) => (
                <div 
                  key={s.id} 
                  onClick={() => router.push(`/dashboard/settlements/${s.id}`)}
                  className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase">{new Date(s.settledAt).toLocaleDateString()}</span>
                    <FileText size={14} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
                  </div>
                  <p className="font-bold text-slate-900 text-sm mb-1">{s.pos?.name}</p>
                  <div className="flex justify-between items-end">
                    <p className="text-indigo-600 font-black text-sm"><CurrencyText value={s.totalAmount} /></p>
                    <span className="text-[8px] font-bold text-indigo-400 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all">Ver <ChevronRight size={10} /></span>
                  </div>
                </div>
              ))}
              {settlementsHistory.length === 0 && (
                <p className="text-slate-400 text-sm text-center py-8 italic">Nenhum histórico.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Fechamento */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-[40px] w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
              <div>
                <h3 className="text-2xl font-black text-slate-900">Realizar Fechamento</h3>
                <p className="text-slate-500 text-sm">Confirme as vendas do PDV {selectedPOS?.name}.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-12 h-12 flex items-center justify-center bg-white rounded-full text-slate-400 hover:text-slate-600 shadow-sm border border-slate-100">
                <X size={24} />
              </button>
            </div>

            <div className="p-8 max-h-[60vh] overflow-y-auto">
              {loadingItems ? (
                <div className="py-20 text-center">
                  <Loader2 className="animate-spin mx-auto text-indigo-600" size={32} />
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="p-6 bg-indigo-50 border border-indigo-100 rounded-3xl">
                    <p className="text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-1">Total da Prestação</p>
                    <div className="text-3xl font-black text-indigo-600"><CurrencyText value={selectedPOS?.totalPending} /></div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Itens Vendidos</h4>
                    {pendingItems.map((item) => (
                      <div key={item.id} className="flex justify-between items-center p-4 border border-slate-100 rounded-2xl">
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{item.product?.name}</p>
                          <p className="text-[10px] text-slate-400 uppercase font-medium">
                            {item.quantity} un • Venda em {new Date(item.sale?.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-slate-900 text-sm"><CurrencyText value={item.consignorAmount} /></p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Observações (Opcional)</label>
                    <textarea 
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Alguma nota sobre este acerto..."
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="p-8 border-t border-slate-50 bg-slate-50/30 flex gap-4">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="flex-1 px-8 py-4 bg-white border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-all"
              >
                Cancelar
              </button>
              <button 
                onClick={handleConfirmSettlement}
                disabled={saving || loadingItems}
                className="flex-[2] bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-2xl shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 className="animate-spin" /> : 'Confirmar Recebimento'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Inventário */}
      {isInventoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-[40px] w-full max-w-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 my-8">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
              <div>
                <h3 className="text-2xl font-black text-slate-900">Acerto por Inventário</h3>
                <p className="text-slate-500 text-sm">Informe o que sobrou no PDV para calcular o vendido.</p>
              </div>
              <button onClick={() => setInventoryModalOpen(false)} className="w-12 h-12 flex items-center justify-center bg-white rounded-full text-slate-400 hover:text-slate-600 shadow-sm border border-slate-100">
                <X size={24} />
              </button>
            </div>

            <div className="p-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Selecionar PDV</label>
                  <select 
                    value={selectedPOS?.id || ''}
                    onChange={(e) => handleSelectPOSForInventory(e.target.value)}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                  >
                    <option value="">Selecione um Ponto de Venda</option>
                    {allPOS.map(pos => (
                      <option key={pos.id} value={pos.id}>{pos.name}</option>
                    ))}
                  </select>
                </div>

                {loadingItems ? (
                  <div className="py-20 text-center">
                    <Loader2 className="animate-spin mx-auto text-indigo-600" size={32} />
                  </div>
                ) : inventoryItems.length > 0 ? (
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Lotes Ativos</h4>
                    <div className="space-y-3">
                      {inventoryItems.map((item, idx) => (
                        <div key={item.id} className="p-6 border border-slate-100 rounded-3xl bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div>
                            <p className="font-bold text-slate-900">{item.product?.name}</p>
                            <p className="text-[10px] text-slate-400 font-medium">Ref: {item.reference || 'N/D'} • Enviado: {item.quantityReceived} un</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right hidden sm:block">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Restante</p>
                            </div>
                            <input 
                              type="number"
                              value={item.remainingQuantity}
                              onChange={(e) => {
                                const newItems = [...inventoryItems];
                                newItems[idx].remainingQuantity = e.target.value;
                                setInventoryItems(newItems);
                              }}
                              className="w-24 px-4 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-center font-bold text-slate-900"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : selectedPOS && (
                  <div className="py-10 text-center text-slate-400 italic">
                    Nenhum lote ativo encontrado para este PDV.
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Observações</label>
                  <textarea 
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Notas sobre o inventário..."
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="p-8 border-t border-slate-50 bg-slate-50/30 flex gap-4">
              <button 
                onClick={() => setInventoryModalOpen(false)}
                className="flex-1 px-8 py-4 bg-white border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-all"
              >
                Cancelar
              </button>
              <button 
                onClick={handleConfirmInventorySettlement}
                disabled={saving || !selectedPOS || inventoryItems.length === 0}
                className="flex-[2] bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-2xl shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-2"
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

