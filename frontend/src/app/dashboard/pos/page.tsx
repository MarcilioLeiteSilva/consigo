'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Search, 
  Store, 
  MapPin, 
  Phone, 
  User, 
  MoreVertical, 
  ChevronRight, 
  Loader2, 
  X, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  Mail,
  Filter
} from 'lucide-react';
import api from '@/lib/api';
import { formatPercent, safeNumber } from '@/utils/formatters';
import { CurrencyText } from '@/components/CurrencyText';

export default function POSPage() {
  const router = useRouter();
  const [posList, setPosList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPos, setEditingPos] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    responsibleName: '',
    document: '',
    whatsapp: '',
    email: '',
    city: '',
    state: '',
    location: '',
    defaultCommission: '',
    isActive: true,
    openingDate: '',
    billingDay: '',
    isRecurring: false
  });

  const loadPos = async () => {
    setLoading(true);
    try {
      const response = await api.get('/pos');
      setPosList(response.data.data || []);
    } catch (err: any) {
      console.error('Erro ao carregar PDVs:', err);
      if (err.response?.status === 401) router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPos();
  }, [router]);

  const handleOpenCreate = () => {
    setEditingPos(null);
    setFormData({
      name: '',
      responsibleName: '',
      document: '',
      whatsapp: '',
      email: '',
      city: '',
      state: '',
      location: '',
      defaultCommission: '',
      isActive: true,
      openingDate: '',
      billingDay: '',
      isRecurring: false
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (pos: any) => {
    setEditingPos(pos);
    setFormData({
      name: pos.name || '',
      responsibleName: pos.responsibleName || '',
      document: pos.document || '',
      whatsapp: pos.whatsapp || '',
      email: pos.email || '',
      city: pos.city || '',
      state: pos.state || '',
      location: pos.location || '',
      defaultCommission: (pos.defaultCommission || '').toString(),
      isActive: pos.isActive ?? true,
      openingDate: pos.openingDate ? pos.openingDate.split('T')[0] : '',
      billingDay: pos.billingDay ? pos.billingDay.toString() : '',
      isRecurring: pos.isRecurring ?? false
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...formData,
        defaultCommission: formData.defaultCommission, // Enviando como string
        billingDay: formData.billingDay ? parseInt(formData.billingDay) : null,
      };

      if (editingPos) {
        await api.patch(`/pos/${editingPos.id}`, payload);
      } else {
        await api.post('/pos', payload);
      }
      
      setIsModalOpen(false);
      loadPos();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao salvar PDV');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este Ponto de Venda permanentemente?')) return;
    try {
      await api.delete(`/pos/${id}`);
      loadPos();
    } catch (err) {
      alert('Erro ao excluir PDV');
    }
  };

  const filteredPos = posList.filter(p => 
    (p?.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (p?.city || '').toLowerCase().includes(search.toLowerCase()) ||
    (p?.responsibleName || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pontos de Venda (PDV)</h1>
          <p className="text-slate-500 text-sm">Gerencie os locais onde suas mercadorias estão consignadas.</p>
        </div>
        <button 
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 px-8 rounded-2xl transition-all shadow-lg shadow-blue-100"
        >
          <Plus size={20} /> Novo PDV
        </button>
      </div>

      {/* Modal de PDV */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-[40px] w-full max-w-4xl my-8 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-8 border-b border-slate-50 bg-slate-50/30">
              <div>
                <h3 className="text-2xl font-black text-slate-900">{editingPos ? 'Editar PDV' : 'Novo Ponto de Venda'}</h3>
                <p className="text-slate-500 text-sm">Cadastre os dados da loja parceira.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-12 h-12 flex items-center justify-center bg-white rounded-full text-slate-400 hover:text-slate-600 shadow-sm border border-slate-100 transition-all">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Coluna 1: Identificação */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Dados da Loja</label>
                    <input 
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Nome Fantasia do PDV"
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <input 
                        value={formData.responsibleName}
                        onChange={(e) => setFormData({...formData, responsibleName: e.target.value})}
                        placeholder="Responsável"
                        className="px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                      />
                      <input 
                        value={formData.document}
                        onChange={(e) => setFormData({...formData, document: e.target.value})}
                        placeholder="CPF/CNPJ"
                        className="px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Contato</label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input 
                          value={formData.whatsapp}
                          onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                          placeholder="WhatsApp"
                          className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                        />
                      </div>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input 
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          placeholder="E-mail"
                          className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Comissão Padrão do PDV (%)</label>
                    <input 
                      type="number" step="0.1"
                      value={formData.defaultCommission}
                      onChange={(e) => setFormData({...formData, defaultCommission: e.target.value})}
                      placeholder="Ex: 30"
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold text-amber-600"
                    />
                    <p className="text-[10px] text-slate-400 font-medium ml-1 italic">* Esta comissão será sugerida automaticamente em novos lotes para este PDV.</p>
                  </div>
                </div>

                {/* Coluna 2: Localização e Status */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Localização</label>
                    <div className="grid grid-cols-3 gap-4">
                      <input 
                        value={formData.city}
                        onChange={(e) => setFormData({...formData, city: e.target.value})}
                        placeholder="Cidade"
                        className="col-span-2 px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                      />
                      <input 
                        value={formData.state}
                        onChange={(e) => setFormData({...formData, state: e.target.value})}
                        placeholder="UF"
                        maxLength={2}
                        className="px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm text-center uppercase"
                      />
                    </div>
                    <textarea 
                      rows={3}
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      placeholder="Endereço completo (Rua, Número, Bairro)..."
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                    />
                  </div>

                  <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-900">PDV Ativo</span>
                      <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">Habilitado para consignação</span>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, isActive: !formData.isActive})}
                      className={`w-14 h-8 rounded-full p-1 transition-all duration-300 ${formData.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`}
                    >
                      <div className={`w-6 h-6 bg-white rounded-full shadow-sm transition-all duration-300 ${formData.isActive ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                        Data de Abertura
                      </label>
                      <input 
                        type="date"
                        value={formData.openingDate}
                        onChange={(e) => setFormData({...formData, openingDate: e.target.value})}
                        className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm font-medium"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ciclo de Acerto</label>
                      <div className="flex gap-2">
                        <input 
                          type="number" min="1" max="31"
                          value={formData.billingDay}
                          onChange={(e) => setFormData({...formData, billingDay: e.target.value})}
                          placeholder="Dia"
                          className="w-20 px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm font-black text-center"
                        />
                        <div className="flex-1 flex items-center justify-between px-4 py-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recorrente</span>
                          <button 
                            type="button"
                            onClick={() => setFormData({...formData, isRecurring: !formData.isRecurring})}
                            className={`w-10 h-6 rounded-full p-1 transition-all duration-300 ${formData.isRecurring ? 'bg-blue-500' : 'bg-slate-200'}`}
                          >
                            <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-300 ${formData.isRecurring ? 'translate-x-4' : 'translate-x-0'}`} />
                          </button>
                        </div>
                      </div>
                    </div>
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
                  {saving ? <Loader2 className="animate-spin" /> : (editingPos ? 'Salvar Alterações' : 'Cadastrar PDV')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tabela de PDVs */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por nome, cidade ou responsável..." 
              className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm font-medium"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="p-3 bg-slate-50 text-slate-500 rounded-xl border border-slate-100 hover:bg-slate-100 transition-all">
            <Filter size={20} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Estabelecimento</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Localização</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Comissão</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-8 py-32 text-center">
                    <Loader2 className="animate-spin mx-auto text-blue-600 mb-4" size={40} />
                    <p className="text-slate-500 font-bold">Buscando pontos de venda...</p>
                  </td>
                </tr>
              ) : filteredPos.length > 0 ? (
                filteredPos.map((pos) => (
                  <tr key={pos.id} className="hover:bg-slate-50/30 transition-colors group">
                    <td className="px-8 py-6">
                      <div 
                        className="flex items-center gap-5 cursor-pointer group/item"
                        onClick={() => router.push(`/dashboard/pos/${pos.id}`)}
                      >
                        <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 border border-slate-200 group-hover/item:bg-blue-50 group-hover/item:text-blue-600 group-hover/item:border-blue-100 transition-all">
                          <Store size={24} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-bold text-slate-900 group-hover/item:text-blue-600 transition-colors">{pos.name}</p>
                            {!pos.isActive && <span className="px-2 py-0.5 bg-rose-50 text-rose-500 text-[8px] font-black uppercase rounded">Inativo</span>}
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
                              <User size={10} /> {pos.responsibleName || 'N/D'}
                            </span>
                            {pos.whatsapp && (
                              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 uppercase">
                                <Phone size={10} /> {pos.whatsapp}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-600 flex items-center gap-1">
                          <MapPin size={14} className="text-blue-400" />
                          {pos.city || 'Cidade não inf.'} - {pos.state || 'UF'}
                        </span>
                        <span className="text-[10px] text-slate-400 truncate max-w-[200px]">{pos.location || 'Sem endereço detalhado'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                        {formatPercent(pos.defaultCommission)}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleOpenEdit(pos)}
                          className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(pos.id)}
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
                  <td colSpan={4} className="px-8 py-32 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                        <Store size={40} />
                      </div>
                      <div>
                        <p className="text-slate-900 font-black text-lg">Nenhum PDV cadastrado</p>
                        <p className="text-slate-500 text-sm">Clique em Novo PDV para registrar sua primeira parceria.</p>
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
