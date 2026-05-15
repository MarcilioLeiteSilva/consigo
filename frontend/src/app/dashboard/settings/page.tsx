'use client';

import { useState, useEffect } from 'react';
import { 
  Settings, 
  User, 
  Building2, 
  Bell, 
  Shield, 
  CreditCard,
  Mail,
  Phone,
  Save,
  CheckCircle2,
  Users,
  RefreshCw
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [tenant, setTenant] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('perfil');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));
    fetchTenant();
  }, []);

  const fetchTenant = async () => {
    setLoading(true);
    try {
      const res = await api.get('/tenant/profile');
      setTenant(res.data.data || res.data);
    } catch (e) {
      console.error('Error fetching tenant', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch('/tenant/profile', tenant);
      alert('Dados da empresa atualizados com sucesso!');
    } catch (e) {
      alert('Erro ao salvar dados da empresa');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
          <Settings className="text-blue-600" size={32} /> Configurações
        </h1>
        <p className="text-slate-500 font-medium mt-1">Gerencie seu perfil, equipe e preferências da plataforma.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar de Configs */}
        <div className="w-full md:w-64 space-y-2">
          <button 
            onClick={() => setActiveTab('perfil')}
            className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold text-sm transition-all ${activeTab === 'perfil' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            <User size={18} /> Meu Perfil
          </button>
          <button 
            onClick={() => router.push('/dashboard/users')}
            className="w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold text-sm text-slate-500 hover:bg-slate-100 transition-all"
          >
            <Users size={18} /> Gerenciar Equipe
          </button>
          <button 
            onClick={() => setActiveTab('tenant')}
            className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold text-sm transition-all ${activeTab === 'tenant' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            <Building2 size={18} /> Dados da Empresa
          </button>
          <button 
            onClick={() => setActiveTab('notifications')}
            className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold text-sm transition-all ${activeTab === 'notifications' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            <Bell size={18} /> Notificações
          </button>
          <button 
            onClick={() => setActiveTab('security')}
            className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold text-sm transition-all ${activeTab === 'security' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            <Shield size={18} /> Segurança
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          {activeTab === 'perfil' && (
            <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm space-y-8">
              <div className="flex items-center gap-6 pb-8 border-b border-slate-50">
                <div className="w-24 h-24 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-3xl font-black shadow-xl">
                  {user?.name?.substring(0, 1) || 'U'}
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">{user?.name}</h3>
                  <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">{user?.role || 'Usuário'}</p>
                  <button className="text-blue-600 text-xs font-black mt-3 hover:underline">Alterar Foto</button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome Completo</label>
                  <input 
                    type="text" defaultValue={user?.name}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold text-slate-900"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail</label>
                  <input 
                    type="email" defaultValue={user?.email}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold text-slate-900"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">WhatsApp</label>
                  <input 
                    type="text" placeholder="(00) 00000-0000"
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold text-slate-900"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cargo / Função</label>
                  <input 
                    type="text" defaultValue={user?.role} readOnly
                    className="w-full px-6 py-4 bg-slate-100 border border-slate-100 rounded-2xl outline-none font-bold text-slate-500 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="pt-8 border-t border-slate-50 flex justify-end">
                <button className="flex items-center gap-2 px-8 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-500 transition-all shadow-lg shadow-blue-100 uppercase tracking-widest text-xs">
                  <Save size={18} /> Salvar Alterações
                </button>
              </div>
            </div>
          )}

          {activeTab === 'tenant' && (
            <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm space-y-8 animate-in fade-in duration-500">
              <div className="pb-8 border-b border-slate-50">
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <Building2 size={24} className="text-blue-600" /> Dados da Empresa
                </h3>
                <p className="text-slate-400 font-medium text-sm mt-1">Essas informações serão usadas pelo Agente de WhatsApp e nos relatórios.</p>
              </div>

              {loading ? (
                <div className="py-20 flex justify-center">
                  <RefreshCw className="animate-spin text-blue-600" size={40} />
                </div>
              ) : (
                <form onSubmit={handleSaveTenant} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome Fantasia / Empresa</label>
                      <input 
                        type="text" 
                        value={tenant?.companyName || ''}
                        onChange={(e) => setTenant({...tenant, companyName: e.target.value})}
                        placeholder="Ex: Consignados Brasil"
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold text-slate-900"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">CNPJ / CPF</label>
                      <input 
                        type="text"
                        value={tenant?.document || ''}
                        onChange={(e) => setTenant({...tenant, document: e.target.value})}
                        placeholder="00.000.000/0000-00"
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold text-slate-900"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail Corporativo</label>
                      <input 
                        type="email"
                        value={tenant?.email || ''}
                        onChange={(e) => setTenant({...tenant, email: e.target.value})}
                        placeholder="empresa@email.com"
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold text-slate-900"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Telefone / WhatsApp</label>
                      <input 
                        type="text"
                        value={tenant?.phone || ''}
                        onChange={(e) => setTenant({...tenant, phone: e.target.value})}
                        placeholder="(00) 00000-0000"
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold text-slate-900"
                      />
                    </div>
                  </div>

                  <div className="pt-8 border-t border-slate-50 flex justify-end">
                    <button 
                      type="submit"
                      disabled={saving}
                      className="flex items-center gap-2 px-8 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-500 transition-all shadow-lg shadow-blue-100 uppercase tracking-widest text-xs disabled:opacity-50"
                    >
                      {saving ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
                      {saving ? 'Salvando...' : 'Atualizar Empresa'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {activeTab !== 'perfil' && activeTab !== 'tenant' && (
            <div className="bg-white p-20 rounded-[40px] border border-slate-100 shadow-sm text-center space-y-6">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
                <Settings size={40} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Em Breve</h3>
                <p className="text-slate-500 font-medium">Esta funcionalidade está sendo preparada para o seu painel.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
