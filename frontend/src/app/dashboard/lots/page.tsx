'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Search, 
  Layers, 
  Package, 
  Store, 
  Calendar, 
  MoreVertical, 
  ChevronRight, 
  Loader2, 
  X, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  Filter,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import api from '@/lib/api';

export default function LotsPage() {
  const router = useRouter();
  const [lots, setLots] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [posList, setPosList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLot, setEditingLot] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    productId: '',
    posId: '',
    quantityReceived: '',
    unitPrice: '',
    commissionPercent: '',
    notes: ''
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [lotsRes, productsRes, posRes] = await Promise.all([
        api.get('/consignment-lots'),
        api.get('/products'),
        api.get('/pos')
      ]);

      setLots(Array.isArray(lotsRes.data) ? lotsRes.data : lotsRes.data?.data || []);
      setProducts(Array.isArray(productsRes.data) ? productsRes.data : productsRes.data?.data || []);
      setPosList(Array.isArray(posRes.data) ? posRes.data : posRes.data?.data || []);
    } catch (err: any) {
      console.error('Erro ao carregar dados:', err);
      if (err.response?.status === 401) router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [router]);

  const handleOpenCreate = () => {
    setEditingLot(null);
    setFormData({
      productId: '',
      posId: '',
      quantityReceived: '',
      unitPrice: '',
      commissionPercent: '',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handlePosChange = (posId: string) => {
    const selectedPos = posList.find(p => p.id === posId);
    setFormData(prev => ({
      ...prev,
      posId,
      commissionPercent: selectedPos?.defaultCommission?.toString() || prev.commissionPercent
    }));
  };

  const handleProductChange = (productId: string) => {
    const selectedProduct = products.find(p => p.id === productId);
    setFormData(prev => ({
      ...prev,
      productId,
      unitPrice: selectedProduct?.salePrice?.toString() || prev.unitPrice,
      // Se o produto tiver comissão específica, sobrepõe a do PDV
      commissionPercent: selectedProduct?.commission?.toString() || prev.commissionPercent
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...formData,
        quantityReceived: parseInt(formData.quantityReceived),
        unitPrice: parseFloat(formData.unitPrice),
        commissionPercent: parseFloat(formData.commissionPercent)
      };

      if (editingLot) {
        await api.patch(`/consignment-lots/${editingLot.id}`, payload);
      } else {
        await api.post('/consignment-lots', payload);
      }
      
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao salvar lote');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este lote permanentemente? Isso pode afetar o estoque e histórico de vendas.')) return;
    try {
      await api.delete(`/consignment-lots/${id}`);
      loadData();
    } catch (err) {
      alert('Erro ao excluir lote');
    }
  };

  const filteredLots = lots.filter(l => 
    (l?.product?.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (l?.pos?.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (l?.notes || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Lotes de Consignação</h1>
          <p className="text-slate-500 text-sm">Gerencie o envio de mercadorias para seus parceiros.</p>
        </div>
        <button 
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 px-8 rounded-2xl transition-all shadow-lg shadow-indigo-100"
        >
          <Plus size={20} /> Novo Lote (Envio)
        </button>
      </div>

      {/* Modal de Lote */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-[40px] w-full max-w-4xl my-8 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-8 border-b border-slate-50 bg-slate-50/30">
              <div>
                <h3 className="text-2xl font-black text-slate-900">{editingLot ? 'Editar Lote' : 'Novo Lote de Consignação'}</h3>
                <p className="text-slate-500 text-sm">Preencha os dados do envio de mercadoria.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-12 h-12 flex items-center justify-center bg-white rounded-full text-slate-400 hover:text-slate-600 shadow-sm border border-slate-100 transition-all">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Coluna 1: Destino e Produto */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Destino (PDV)</label>
                    <div className="relative">
                      <Store className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <select 
                        required
                        value={formData.posId}
                        onChange={(e) => handlePosChange(e.target.value)}
                        className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium appearance-none"
                      >
                        <option value="">Selecione um Ponto de Venda</option>
                        {posList.map(pos => (
                          <option key={pos.id} value={pos.id}>{pos.name} ({pos.city})</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Produto</label>
                    <div className="relative">
                      <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <select 
                        required
                        value={formData.productId}
                        onChange={(e) => handleProductChange(e.target.value)}
                        className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium appearance-none"
                      >
                        <option value="">Selecione um Produto</option>
                        {products.map(prod => (
                          <option key={prod.id} value={prod.id}>{prod.name} (SKU: {prod.sku || 'N/D'})</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Quantidade</label>
                      <input 
                        type="number" required min="1"
                        value={formData.quantityReceived}
                        onChange={(e) => setFormData({...formData, quantityReceived: e.target.value})}
                        placeholder="Ex: 50"
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-slate-900"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Preço Unitário (R$)</label>
                      <input 
                        type="number" step="0.01" required
                        value={formData.unitPrice}
                        onChange={(e) => setFormData({...formData, unitPrice: e.target.value})}
                        placeholder="0,00"
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-emerald-600"
                      />
                    </div>
                  </div>
                </div>

                {/* Coluna 2: Regras e Notas */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Comissão deste Lote (%)</label>
                    <input 
                      type="number" step="0.1" required
                      value={formData.commissionPercent}
                      onChange={(e) => setFormData({...formData, commissionPercent: e.target.value})}
                      placeholder="Ex: 30"
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-amber-600"
                    />
                    <p className="text-[10px] text-slate-400 font-medium ml-1 italic">* Esta comissão será aplicada apenas para as vendas deste lote.</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Observações / Notas</label>
                    <textarea 
                      rows={5}
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      placeholder="Identificação do lote, condições especiais, etc..."
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-12 flex gap-4">
                <button 
                  type="button" onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-8 py-4 border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" disabled={saving}
                  className="flex-[2] bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-2xl shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 className="animate-spin" /> : (editingLot ? 'Salvar Alterações' : 'Confirmar Envio')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lista de Lotes */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por produto, PDV ou notas..." 
              className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm font-medium"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button className="p-3 bg-slate-50 text-slate-500 rounded-xl border border-slate-100 hover:bg-slate-100 transition-all">
              <Filter size={20} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Produto / PDV</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status Estoque</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Valores</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-8 py-32 text-center">
                    <Loader2 className="animate-spin mx-auto text-indigo-600 mb-4" size={40} />
                    <p className="text-slate-500 font-bold">Buscando lotes...</p>
                  </td>
                </tr>
              ) : filteredLots.length > 0 ? (
                filteredLots.map((lot) => {
                  const available = lot.quantityReceived - lot.quantitySold - lot.quantityReturned;
                  const sellPercent = Math.round((lot.quantitySold / lot.quantityReceived) * 100);
                  
                  return (
                    <tr key={lot.id} className="hover:bg-slate-50/30 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-5">
                          <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 border border-indigo-100">
                            <Layers size={24} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-bold text-slate-900">{lot.product?.name || 'Produto Removido'}</p>
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[8px] font-black uppercase rounded">
                                SKU: {lot.product?.sku || 'N/D'}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
                                <Store size={10} /> {lot.pos?.name || 'Estoque Global'}
                              </span>
                              <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
                                <Calendar size={10} /> {new Date(lot.receivedAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col items-center gap-2 max-w-[200px] mx-auto">
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all ${sellPercent > 80 ? 'bg-emerald-500' : 'bg-indigo-500'}`} 
                              style={{ width: `${sellPercent}%` }}
                            />
                          </div>
                          <div className="flex justify-between w-full text-[10px] font-black uppercase tracking-tighter">
                            <span className="text-slate-400">Restam: <span className="text-slate-900">{available}</span></span>
                            <span className={sellPercent > 80 ? 'text-emerald-500' : 'text-indigo-500'}>{sellPercent}% Vendido</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col items-center">
                          <span className="text-sm font-bold text-slate-900">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(lot.unitPrice || 0)}
                          </span>
                          <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">
                            {lot.commissionPercent}% Comis.
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => {
                              setEditingLot(lot);
                              setFormData({
                                productId: lot.productId,
                                posId: lot.posId || '',
                                quantityReceived: lot.quantityReceived.toString(),
                                unitPrice: (lot.unitPrice || 0).toString(),
                                commissionPercent: (lot.commissionPercent || 0).toString(),
                                notes: lot.notes || ''
                              });
                              setIsModalOpen(true);
                            }}
                            className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                          >
                            <Edit size={18} />
                          </button>
                          <button 
                            onClick={() => handleDelete(lot.id)}
                            className="p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="px-8 py-32 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                        <Layers size={40} />
                      </div>
                      <div>
                        <p className="text-slate-900 font-black text-lg">Nenhum lote registrado</p>
                        <p className="text-slate-500 text-sm">Inicie um novo envio de mercadoria para começar.</p>
                      </div>
                    </div>
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
