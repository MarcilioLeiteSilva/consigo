'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function AdminDashboardPage() {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const isAdmin = localStorage.getItem('isAdmin');
    if (!isAdmin) {
      router.push('/admin/login');
      return;
    }

    const fetchTenants = async () => {
      try {
        const response = await api.get('/platform/tenants');
        setTenants(response.data);
      } catch (err) {
        console.error('Erro ao buscar tenants', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTenants();
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <header className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-bold mb-2">Painel Global SaaS</h1>
          <p className="text-slate-400">Gerencie todos os consignadores (tenants)</p>
        </div>
        <button 
          onClick={() => {
            localStorage.clear();
            router.push('/admin/login');
          }}
          className="bg-slate-800 hover:bg-slate-700 px-6 py-2 rounded-lg border border-slate-700 transition-colors"
        >
          Sair
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
          <p className="text-slate-400 mb-1">Tenants Ativos</p>
          <h2 className="text-3xl font-bold">{tenants.length}</h2>
        </div>
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
          <p className="text-slate-400 mb-1">Assinaturas Ativas</p>
          <h2 className="text-3xl font-bold text-green-500">--</h2>
        </div>
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
          <p className="text-slate-400 mb-1">MRR Estimado</p>
          <h2 className="text-3xl font-bold text-blue-500">R$ 0,00</h2>
        </div>
      </div>

      <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-700 flex justify-between items-center">
          <h3 className="text-xl font-bold">Consignadores (Tenants)</h3>
          <button className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-sm font-bold transition-colors">
            Novo Tenant
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-700/50 text-slate-400 text-sm">
              <tr>
                <th className="p-4">Empresa</th>
                <th className="p-4">Slug</th>
                <th className="p-4">Status</th>
                <th className="p-4">Criado em</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center text-slate-500">Carregando...</td></tr>
              ) : tenants.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-slate-500">Nenhum tenant cadastrado.</td></tr>
              ) : (
                tenants.map((tenant: any) => (
                  <tr key={tenant.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="p-4 font-medium">{tenant.companyName}</td>
                    <td className="p-4 text-slate-400">{tenant.slug}</td>
                    <td className="p-4">
                      <span className="bg-green-500/10 text-green-500 px-2 py-1 rounded-md text-xs border border-green-500/20">
                        {tenant.status}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400 text-sm">
                      {new Date(tenant.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="p-4 text-right">
                      <button className="text-blue-400 hover:text-blue-300 mr-4">Ver Planos</button>
                      <button className="text-slate-400 hover:text-white">Editar</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
