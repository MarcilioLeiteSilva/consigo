'use client';

import { useState, useEffect } from 'react';
import {
  Bell,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Loader2,
  Package,
  Store,
  TrendingDown,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

type Severity = 'critical' | 'warning';

interface Alert {
  type: string;
  severity: Severity;
  title: string;
  description: string;
  link: string;
}

const TYPE_ICON: Record<string, any> = {
  ESTOQUE_CRITICO: Package,
  PDV_INADIMPLENTE: Store,
  PDV_INATIVO: Store,
  DRE_NEGATIVA: TrendingDown,
  SEM_ACERTO: Clock,
};

const SEVERITY_CONFIG: Record<Severity, { badge: string; border: string; icon: string; dot: string }> = {
  critical: {
    badge: 'bg-rose-100 text-rose-700',
    border: 'border-l-rose-500',
    icon: 'text-rose-500',
    dot: 'bg-rose-500',
  },
  warning: {
    badge: 'bg-amber-100 text-amber-700',
    border: 'border-l-amber-400',
    icon: 'text-amber-500',
    dot: 'bg-amber-400',
  },
};

export default function AlertsPage() {
  const router = useRouter();
  const [data, setData] = useState<{ total: number; critical: number; warning: number; alerts: Alert[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'critical' | 'warning'>('all');

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/dashboard/alerts');
      setData(res.data.data || res.data);
    } catch (err) {
      console.error('Erro ao carregar alertas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAlerts(); }, []);

  const filtered = data?.alerts.filter((a) => filter === 'all' || a.severity === filter) ?? [];

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <Bell className="text-rose-500" size={28} /> Alertas Inteligentes
          </h1>
          <p className="text-slate-500 text-sm">Monitoramento automático de situações que requerem atenção.</p>
        </div>
        <button
          onClick={loadAlerts}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-all text-sm shadow-sm"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Atualizar
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-[40vh]">
          <Loader2 className="animate-spin text-rose-500" size={36} />
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div
              onClick={() => setFilter('all')}
              className={`p-8 rounded-3xl border cursor-pointer transition-all ${filter === 'all' ? 'bg-slate-900 border-slate-900 text-white shadow-xl' : 'bg-white border-slate-200 shadow-sm hover:shadow-md'}`}
            >
              <p className={`text-sm font-medium mb-1 ${filter === 'all' ? 'text-slate-300' : 'text-slate-500'}`}>Total de Alertas</p>
              <h2 className={`text-4xl font-bold ${filter === 'all' ? 'text-white' : 'text-slate-900'}`}>{data?.total ?? 0}</h2>
              <div className={`mt-6 flex items-center gap-2 text-sm font-bold ${filter === 'all' ? 'text-slate-400' : 'text-slate-400'}`}>
                <Bell size={16} /> <span>Todos os alertas</span>
              </div>
            </div>

            <div
              onClick={() => setFilter('critical')}
              className={`p-8 rounded-3xl border cursor-pointer transition-all ${filter === 'critical' ? 'bg-rose-600 border-rose-600 text-white shadow-xl shadow-rose-100' : 'bg-white border-slate-200 shadow-sm hover:shadow-md'}`}
            >
              <p className={`text-sm font-medium mb-1 ${filter === 'critical' ? 'text-rose-100' : 'text-slate-500'}`}>🔴 Críticos</p>
              <h2 className={`text-4xl font-bold ${filter === 'critical' ? 'text-white' : 'text-rose-600'}`}>{data?.critical ?? 0}</h2>
              <div className={`mt-6 flex items-center gap-2 text-sm font-bold ${filter === 'critical' ? 'text-rose-200' : 'text-rose-400'}`}>
                <AlertCircle size={16} /> <span>Ação imediata</span>
              </div>
            </div>

            <div
              onClick={() => setFilter('warning')}
              className={`p-8 rounded-3xl border cursor-pointer transition-all ${filter === 'warning' ? 'bg-amber-500 border-amber-500 text-white shadow-xl shadow-amber-100' : 'bg-white border-slate-200 shadow-sm hover:shadow-md'}`}
            >
              <p className={`text-sm font-medium mb-1 ${filter === 'warning' ? 'text-amber-100' : 'text-slate-500'}`}>🟡 Atenção</p>
              <h2 className={`text-4xl font-bold ${filter === 'warning' ? 'text-white' : 'text-amber-600'}`}>{data?.warning ?? 0}</h2>
              <div className={`mt-6 flex items-center gap-2 text-sm font-bold ${filter === 'warning' ? 'text-amber-100' : 'text-amber-500'}`}>
                <AlertTriangle size={16} /> <span>Monitorar</span>
              </div>
            </div>
          </div>

          {/* Lista de Alertas */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">
                {filter === 'all' ? 'Todos os Alertas' : filter === 'critical' ? 'Alertas Críticos' : 'Alertas de Atenção'}
              </h3>
              {data && data.total > 0 && (
                <span className="text-xs font-bold text-slate-400">{filtered.length} alertas</span>
              )}
            </div>

            <div className="divide-y divide-slate-100">
              {filtered.length > 0 ? filtered.map((alert, i) => {
                const cfg = SEVERITY_CONFIG[alert.severity];
                const Icon = TYPE_ICON[alert.type] || Bell;
                return (
                  <div
                    key={i}
                    onClick={() => router.push(alert.link)}
                    className={`px-6 py-5 flex items-start justify-between gap-4 hover:bg-slate-50/60 transition-all cursor-pointer border-l-4 ${cfg.border}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`mt-0.5 flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center ${alert.severity === 'critical' ? 'bg-rose-50' : 'bg-amber-50'}`}>
                        <Icon size={18} className={cfg.icon} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-black px-2 py-0.5 rounded-full ${cfg.badge}`}>
                            {alert.severity === 'critical' ? '● Crítico' : '● Atenção'}
                          </span>
                          <p className="text-sm font-bold text-slate-900">{alert.title}</p>
                        </div>
                        <p className="text-sm text-slate-500">{alert.description}</p>
                      </div>
                    </div>
                    <ArrowRight size={18} className="text-slate-300 flex-shrink-0 mt-1" />
                  </div>
                );
              }) : (
                <div className="p-20 text-center">
                  <CheckCircle2 className="mx-auto w-14 h-14 mb-4 text-emerald-200" />
                  <p className="font-bold text-slate-600 text-lg">
                    {filter === 'all' ? 'Nenhum alerta ativo!' : 'Nenhum alerta nesta categoria.'}
                  </p>
                  <p className="text-slate-400 text-sm mt-2">
                    {filter === 'all' ? 'Tudo funcionando normalmente. Continue monitorando.' : 'Tente outra categoria.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
