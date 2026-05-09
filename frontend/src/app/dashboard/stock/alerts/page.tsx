'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  AlertTriangle, 
  Store, 
  Package, 
  ArrowLeft, 
  Loader2, 
  MapPin,
  RefreshCw,
  TrendingDown,
  ArrowRight
} from 'lucide-react';
import api from '@/lib/api';

export default function StockAlertsPage() {
  const router = useRouter();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const response = await api.get('/sales/stock-alerts');
      // Acessa .data.data devido ao TransformInterceptor se necessário
      const data = response.data.data || response.data;
      setAlerts(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Erro ao carregar alertas de estoque:', err);
      if (err.response?.status === 401) router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, [router]);

  // Agrupar alertas por PDV
  const alertsByPos = alerts.reduce((acc: any, alert) => {
    const posName = alert.posName;
    if (!acc[posName]) acc[posName] = [];
    acc[posName].push(alert);
    return acc;
  }, {});

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => router.back()}
          className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-slate-600 hover:shadow-md transition-all"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-black text-slate-900">Alertas de Reposição</h1>
          <p className="text-slate-500 text-sm">Listagem detalhada de produtos com estoque crítico por PDV.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32">
          <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
          <p className="text-slate-500 font-bold tracking-widest uppercase text-xs">Analisando níveis de estoque...</p>
        </div>
      ) : Object.keys(alertsByPos).length > 0 ? (
        <div className="grid grid-cols-1 gap-8">
          {Object.entries(alertsByPos).map(([posName, posAlerts]: [string, any]) => (
            <div key={posName} className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden border-l-4 border-l-amber-500">
              {/* POS Header */}
              <div className="p-8 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 shadow-inner">
                    <Store size={24} />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">{posName}</h2>
                    <div className="flex items-center gap-2 text-slate-400">
                      <MapPin size={12} />
                      <span className="text-[10px] font-bold uppercase">{posAlerts[0].posCity || 'Localização Geral'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 rounded-full border border-rose-100">
                  <AlertTriangle size={14} />
                  <span className="text-xs font-black uppercase tracking-widest">{posAlerts.length} ITENS CRÍTICOS</span>
                </div>
              </div>

              {/* Items List */}
              <div className="divide-y divide-slate-50">
                {posAlerts.map((alert: any) => (
                  <div key={alert.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between hover:bg-slate-50/50 transition-colors gap-4">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-slate-400 border border-slate-100 shadow-sm">
                        <Package size={24} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{alert.productName}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">SKU: {alert.productSku || 'N/A'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-12 px-6">
                      <div className="text-center">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Restante</p>
                        <div className="flex items-center gap-1">
                          <TrendingDown className="text-rose-500" size={14} />
                          <span className="text-2xl font-black text-rose-600">{alert.available}</span>
                          <span className="text-[10px] font-black text-rose-400 uppercase">UN</span>
                        </div>
                      </div>

                      <div className="hidden sm:block h-8 w-[1px] bg-slate-100" />

                      <div className="text-center">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                        <span className="px-3 py-1 bg-rose-50 text-rose-600 text-[10px] font-black uppercase rounded-full border border-rose-100">
                          {alert.available === 0 ? 'Esgotado' : 'Abaixo do Mínimo'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => router.push(`/dashboard/lots?id=${alert.id}`)}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-blue-100 text-xs uppercase tracking-widest"
                      >
                        Repor Agora <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-[40px] border border-slate-100 p-20 shadow-sm flex flex-col items-center gap-6 text-center">
          <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 border border-emerald-100 shadow-inner">
            <RefreshCw size={48} className="animate-pulse" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900">Estoque 100% Estável</h3>
            <p className="text-slate-500 max-w-sm mx-auto mt-2">Parabéns! No momento não foram detectados produtos abaixo do limite crítico de reposição em nenhum PDV.</p>
          </div>
          <button 
            onClick={() => router.push('/dashboard')}
            className="mt-4 px-8 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all text-sm uppercase tracking-widest"
          >
            Voltar ao Dashboard
          </button>
        </div>
      )}
    </div>
  );
}
