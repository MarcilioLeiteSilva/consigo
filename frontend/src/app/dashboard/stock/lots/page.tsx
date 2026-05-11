'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Search, 
  Layers, 
  Package, 
  Calendar, 
  MoreVertical, 
  X, 
  Edit, 
  Trash2, 
  Loader2, 
  Filter,
  ArrowRight,
  Eye,
  PlusCircle,
  Database
} from 'lucide-react';
import api from '@/lib/api';
import { CurrencyText } from '@/components/CurrencyText';
import { formatCurrency, formatPercent } from '@/utils/formatters';

export default function CentralLotsPage() {
  const router = useRouter();
  const [lots, setLots] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLot, setEditingLot] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    productId: '',
    quantityReceived: '',
    unitPrice: '',
    commissionPercent: '0',
    reference: '',
    notes: ''
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [lotsRes, productsRes] = await Promise.all([
        api.get('/consignment-lots'),
        api.get('/products')
      ]);

      // Filtrar apenas lotes do estoque central (posId é null)
      const centralLots = (lotsRes.data.data || []).filter((l: any) => l.posId === null);
      setLots(centralLots);
      setProducts(productsRes.data.data || []);
    } catch (err: any) {
      console.error('Erro ao carregar dados:', err);
      if (err.response?.status === 401) router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    
    // Verificar se há filtro de produto na URL
    const urlParams = new URLSearchParams(window.location.search);
    const prodId = urlParams.get('product');
    if (prodId) {
      setSearch(prodId); // Simplificação: a busca vai filtrar pelo ID se for UUID
    }
  }, [router]);

  const handleOpenCreate = () => {
    setEditingLot(null);
    setFormData({
      productId: '',
      quantityReceived: '',
      unitPrice: '',
      commissionPercent: '0',
      reference: '',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...formData,
        quantityReceived: parseInt(formData.quantityReceived),
        posId: null
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
    if (!confirm('Excluir este lote do estoque central?')) return;
    try {
      await api.delete(`/consignment-lots/${id}`);
      loadData();
    } catch (err) {
      alert('Erro ao excluir lote');
    }
  };

  const filteredLots = lots.filter(l => 
    (l?.product?.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (l?.productId || '').toLowerCase().includes(search.toLowerCase()) ||
    (l?.reference || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Lotes em Estoque Central</h1>
          <p className="text-slate-500 text-sm">Histórico de entradas e saldos no armazém central.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => router.push('/dashboard/stock')}
            className="px-6 py-3.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-all text-sm"
          >
            Voltar ao Estoque
          </button>
          <button 
            onClick={handleOpenCreate}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 px-8 rounded-2xl transition-all shadow-lg shadow-blue-100"
          >
            <PlusCircle size={20} /> Incluir Produtos
          </button>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[40px] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">{editingLot ? 'Editar Entrada' : 'Nova Entrada de Estoque'}</h2>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Estoque Central</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Produto</label>
                <select 
                  required
                  value={formData.productId}
                  onChange={(e) => setFormData({...formData, productId: e.target.value})}
                  className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm font-medium appearance-none"
                >
                  <option value="">Selecione um produto...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.sku || 'S/ SKU'})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Quantidade</label>
                  <input 
                    required type="number" min="1"
                    value={formData.quantityReceived}
                    onChange={(e) => setFormData({...formData, quantityReceived: e.target.value})}
                    className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm font-black"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Preço de Custo (Un)</label>
                  <input 
                    required type="text"
                    value={formData.unitPrice}
                    onChange={(e) => setFormData({...formData, unitPrice: e.target.value})}
                    className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm font-black text-emerald-600"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Referência (Opcional)</label>
                <input 
                  type="text"
                  placeholder="Ex: Lote Junho/26"
                  value={formData.reference}
                  onChange={(e) => setFormData({...formData, reference: e.target.value})}
                  className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm font-medium"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-slate-200 transition-all">Cancelar</button>
                <button type="submit" disabled={saving} className="flex-[2] py-4 bg-blue-600 text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-blue-700 transition-all shadow-lg flex items-center justify-center gap-2">
                  {saving ? <Loader2 className="animate-spin" size={18} /> : 'Salvar Entrada'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tabela */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por produto ou referência..." 
              className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm font-medium"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Produto</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Custo Unit.</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-8 py-32 text-center">
                    <Loader2 className="animate-spin mx-auto text-blue-600 mb-4" size={40} />
                    <p className="text-slate-500 font-bold">Buscando histórico...</p>
                  </td>
                </tr>
              ) : filteredLots.length > 0 ? (
                filteredLots.map((lot) => {
                  const available = lot.quantityReceived - lot.quantitySold - lot.quantityReturned;
                  return (
                    <tr key={lot.id} className="hover:bg-slate-50/30 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-5">
                          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 border border-blue-100">
                            <Layers size={24} />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 mb-1">{lot.product?.name}</p>
                            <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase">
                              <span className="flex items-center gap-1"><Calendar size={10}/> {new Date(lot.receivedAt).toLocaleDateString()}</span>
                              {lot.reference && <span className="text-blue-500">REF: {lot.reference}</span>}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <div className="flex flex-col items-center">
                          <span className="text-lg font-black text-slate-900">{available} / {lot.quantityReceived}</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Unidades Disponíveis</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <CurrencyText value={lot.unitPrice} className="font-bold text-emerald-600" />
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => {
                              setEditingLot(lot);
                              setFormData({
                                productId: lot.productId,
                                quantityReceived: lot.quantityReceived.toString(),
                                unitPrice: (lot.unitPrice || '').toString(),
                                commissionPercent: '0',
                                reference: lot.reference || '',
                                notes: lot.notes || ''
                              });
                              setIsModalOpen(true);
                            }}
                            className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
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
                        <Database size={40} />
                      </div>
                      <p className="text-slate-900 font-black text-lg">Nenhum lote central encontrado</p>
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
