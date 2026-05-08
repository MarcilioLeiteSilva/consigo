'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Search, 
  Filter, 
  Package, 
  DollarSign, 
  Tag,
  MoreVertical,
  ChevronRight,
  Loader2,
  Box,
  Layers,
  X,
  Edit,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import api from '@/lib/api';

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [posList, setPosList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    categoryId: '',
    salePrice: '',
    commission: '',
    isActive: true,
    initialPosId: '',
    initialStock: '0'
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes, posRes] = await Promise.all([
        api.get('/products'),
        api.get('/categories'),
        api.get('/pos')
      ]);
      
      setProducts(Array.isArray(prodRes.data) ? prodRes.data : prodRes.data?.data || []);
      setCategories(Array.isArray(catRes.data) ? catRes.data : catRes.data?.data || []);
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
    setEditingProduct(null);
    setFormData({
      name: '',
      sku: '',
      description: '',
      categoryId: '',
      salePrice: '',
      commission: '',
      isActive: true,
      initialPosId: '',
      initialStock: '0'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product: any) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      sku: product.sku || '',
      description: product.description || '',
      categoryId: product.categoryId || '',
      salePrice: product.salePrice?.toString() || '',
      commission: product.commission?.toString() || '',
      isActive: product.isActive ?? true,
      initialPosId: '',
      initialStock: '0'
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...formData,
        salePrice: parseFloat(formData.salePrice),
        commission: parseFloat(formData.commission) || 0,
        initialStock: parseInt(formData.initialStock) || 0
      };

      if (editingProduct) {
        await api.patch(`/products/${editingProduct.id}`, payload);
      } else {
        await api.post('/products', payload);
      }
      
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao salvar produto');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este produto permanentemente?')) return;
    try {
      await api.delete(`/products/${id}`);
      loadData();
    } catch (err) {
      alert('Erro ao excluir produto');
    }
  };

  const filteredProducts = products.filter(p => 
    (p?.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (p?.sku || '').toLowerCase().includes(search.toLowerCase())
  );

  const formatCurrency = (value: any) => {
    const num = parseFloat(value);
    return isNaN(num) ? '0,00' : num.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Catálogo de Produtos</h1>
          <p className="text-slate-500 text-sm">Gestão centralizada de mercadorias e consignação.</p>
        </div>
        <button 
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 px-8 rounded-2xl transition-all shadow-lg shadow-blue-100"
        >
          <Plus size={20} /> Novo Produto
        </button>
      </div>

      {/* Modal de Produto */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-[40px] w-full max-w-4xl my-8 shadow-2xl animate-scale-in overflow-hidden">
            <div className="flex justify-between items-center p-8 border-b border-slate-50 bg-slate-50/30">
              <div>
                <h3 className="text-2xl font-black text-slate-900">{editingProduct ? 'Editar Produto' : 'Cadastrar Mercadoria'}</h3>
                <p className="text-slate-500 text-sm">Preencha os detalhes para consignação.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-12 h-12 flex items-center justify-center bg-white rounded-full text-slate-400 hover:text-slate-600 shadow-sm border border-slate-100 transition-all">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Coluna 1: Básico */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Informações Básicas</label>
                    <input 
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Nome do Produto (Ex: Batman Low Poly)"
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <input 
                        value={formData.sku}
                        onChange={(e) => setFormData({...formData, sku: e.target.value})}
                        placeholder="SKU (Opcional)"
                        className="px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                      />
                      <select 
                        required
                        value={formData.categoryId}
                        onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                        className="px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm appearance-none"
                      >
                        <option value="">Categoria...</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Descrição Detalhada</label>
                    <textarea 
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Detalhes técnicos ou de venda..."
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Preço de Venda</label>
                      <div className="relative">
                        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold">R$</span>
                        <input 
                          type="number" step="0.01" required
                          value={formData.salePrice}
                          onChange={(e) => setFormData({...formData, salePrice: e.target.value})}
                          className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold text-blue-600"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Comissão PDV (%)</label>
                      <input 
                        type="number" step="0.1"
                        value={formData.commission}
                        onChange={(e) => setFormData({...formData, commission: e.target.value})}
                        placeholder="Ex: 20"
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold text-amber-600"
                      />
                    </div>
                  </div>
                </div>

                {/* Coluna 2: Consignação e Mídia */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Foto do Produto</label>
                    <div className="h-48 border-2 border-dashed border-slate-200 rounded-[32px] flex flex-col items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer group">
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-slate-400 group-hover:text-blue-500 shadow-sm transition-all">
                        <ImageIcon size={24} />
                      </div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Upload de Imagem</span>
                    </div>
                  </div>

                  {!editingProduct && (
                    <div className="bg-blue-50/50 p-6 rounded-[32px] border border-blue-100 space-y-4">
                      <div className="flex items-center gap-2 text-blue-700">
                        <Box size={18} />
                        <span className="text-xs font-bold uppercase tracking-widest">Consignação Inicial</span>
                      </div>
                      <div className="grid grid-cols-1 gap-4">
                        <select 
                          value={formData.initialPosId}
                          onChange={(e) => setFormData({...formData, initialPosId: e.target.value})}
                          className="w-full px-6 py-4 bg-white border border-blue-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                        >
                          <option value="">Enviar para qual PDV?</option>
                          {posList.map(pos => (
                            <option key={pos.id} value={pos.id}>{pos.name}</option>
                          ))}
                        </select>
                        <div className="relative">
                          <input 
                            type="number"
                            value={formData.initialStock}
                            onChange={(e) => setFormData({...formData, initialStock: e.target.value})}
                            placeholder="Quantidade Inicial"
                            className="w-full px-6 py-4 bg-white border border-blue-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-sm font-bold"
                          />
                          <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-blue-400 uppercase">Unidades</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-900">Status do Produto</span>
                      <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">Visível no catálogo</span>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, isActive: !formData.isActive})}
                      className={`w-14 h-8 rounded-full p-1 transition-all duration-300 ${formData.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`}
                    >
                      <div className={`w-6 h-6 bg-white rounded-full shadow-sm transition-all duration-300 ${formData.isActive ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
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
                  className="flex-[2] bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl shadow-xl shadow-blue-100 transition-all flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 className="animate-spin" /> : (editingProduct ? 'Salvar Alterações' : 'Finalizar Cadastro')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tabela de Produtos */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por nome ou SKU..." 
              className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm font-medium"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total de Itens</p>
              <p className="text-lg font-black text-slate-900">{filteredProducts.length}</p>
            </div>
            <div className="w-px h-10 bg-slate-100"></div>
            <button className="p-3 bg-slate-50 text-slate-500 rounded-xl border border-slate-100 hover:bg-slate-100 transition-all">
              <Filter size={20} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Mercadoria</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Preço de Venda</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Comissão</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Estoque Total</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-32 text-center">
                    <Loader2 className="animate-spin mx-auto text-blue-600 mb-4" size={40} />
                    <p className="text-slate-500 font-bold">Sincronizando catálogo...</p>
                  </td>
                </tr>
              ) : filteredProducts.length > 0 ? (
                filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/30 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 border border-slate-200">
                          {p.imageUrl ? <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover rounded-2xl" /> : <Box size={24} />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-bold text-slate-900">{p.name}</p>
                            {!p.isActive && <span className="px-2 py-0.5 bg-rose-50 text-rose-500 text-[8px] font-black uppercase rounded">Inativo</span>}
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded uppercase tracking-tighter">{p.sku || 'Sem SKU'}</span>
                            <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">{p.category?.name || 'Geral'}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className="text-sm font-black text-slate-900">R$ {formatCurrency(p.salePrice)}</span>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
                        {p.commission || 0}%
                      </span>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-sm font-black text-slate-900">{p.stock || 0} un</span>
                        <div className="flex items-center gap-1 mt-1">
                          <CheckCircle2 size={10} className="text-emerald-500" />
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Consignado</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleOpenEdit(p)}
                          className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(p.id)}
                          className="p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-8 py-32 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                        <Package size={40} />
                      </div>
                      <div>
                        <p className="text-slate-900 font-black text-lg">Seu catálogo está vazio</p>
                        <p className="text-slate-500 text-sm">Comece cadastrando um produto e envie para um PDV.</p>
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
