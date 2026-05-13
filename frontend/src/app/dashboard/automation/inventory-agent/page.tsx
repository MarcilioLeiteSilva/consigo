'use client';

import { useState, useEffect } from 'react';
import { 
  Bot, 
  RefreshCw, 
  Power, 
  MessageSquare, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export default function InventoryAgentPage() {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [qrCode, setQrCode] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/tenant/whatsapp/status');
      const data = await res.json();
      setStatus(data);
      if (data.status === 'connecting' && !qrCode) {
        getQr();
      }
    } catch (e) {
      console.error('Error fetching status', e);
    } finally {
      setLoading(false);
    }
  };

  const getQr = async () => {
    try {
      const res = await fetch('/api/tenant/whatsapp/qr');
      const data = await res.json();
      if (data.qrcode?.base64) {
        setQrCode(data.qrcode.base64);
      }
    } catch (e) {
      console.error('Error fetching QR', e);
    }
  };

  const handleConnect = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/tenant/whatsapp/connect', { method: 'POST' });
      const data = await res.json();
      setStatus(data);
      if (data.qrcode) {
        setQrCode(data.qrcode);
      }
    } catch (e) {
      alert('Erro ao conectar');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Tem certeza que deseja desconectar o WhatsApp?')) return;
    setLoading(true);
    try {
      await fetch('/api/tenant/whatsapp/disconnect', { method: 'DELETE' });
      setStatus(null);
      setQrCode(null);
      fetchStatus();
    } catch (e) {
      alert('Erro ao desconectar');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-600 rounded-lg text-white">
            <Bot size={24} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Agente de Acertos</h1>
        </div>
        <p className="text-slate-500 max-w-2xl">
          Automação de conferência de inventário via WhatsApp. Configure o agente para entrar em contato com os lojistas e interpretar as respostas automaticamente.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Control Card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Status da Conexão</h3>
                <p className="text-sm text-slate-500">Gerencie a instância do WhatsApp vinculada à sua conta</p>
              </div>
              <div className={`px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 ${
                status?.status === 'connected' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                <div className={`w-2 h-2 rounded-full ${status?.status === 'connected' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                {status?.status === 'connected' ? 'CONECTADO' : 'DESCONECTADO'}
              </div>
            </div>

            {status?.status === 'connected' ? (
              <div className="space-y-6">
                <div className="p-6 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">WhatsApp Ativo</h4>
                    <p className="text-sm text-slate-500">Sua conta está conectada e pronta para automação.</p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-4 pt-4">
                  <button 
                    onClick={handleDisconnect}
                    className="flex items-center gap-2 px-6 py-2.5 bg-red-50 text-red-600 rounded-xl font-bold text-sm hover:bg-red-100 transition-colors"
                  >
                    <Power size={18} />
                    Desconectar Aparelho
                  </button>
                  <button 
                    onClick={fetchStatus}
                    className="flex items-center gap-2 px-6 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors"
                  >
                    <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    Atualizar Status
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {!qrCode ? (
                  <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageSquare size={32} />
                    </div>
                    <h4 className="text-lg font-bold text-slate-900 mb-2">Conectar WhatsApp</h4>
                    <p className="text-sm text-slate-500 max-w-xs mx-auto mb-8">
                      Para começar a usar a automação, você precisa conectar seu número de WhatsApp corporativo.
                    </p>
                    <button 
                      onClick={handleConnect}
                      disabled={loading}
                      className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all disabled:opacity-50"
                    >
                      {loading ? <RefreshCw size={20} className="animate-spin" /> : <MessageSquare size={20} />}
                      {loading ? 'Preparando...' : 'Gerar QR Code de Conexão'}
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center animate-in zoom-in-95 duration-300">
                    <div className="p-4 bg-white border-4 border-slate-100 rounded-3xl shadow-xl mb-6">
                      <img src={qrCode} alt="WhatsApp QR Code" className="w-64 h-64" />
                    </div>
                    <div className="text-center space-y-3">
                      <h4 className="font-bold text-slate-900">Escaneie o código</h4>
                      <p className="text-sm text-slate-500 max-w-xs mx-auto leading-relaxed">
                        Abra o WhatsApp no seu celular {'>'} Configurações {'>'} Aparelhos Conectados {'>'} Conectar um Aparelho.
                      </p>
                      <button 
                        onClick={() => setQrCode(null)}
                        className="text-sm text-blue-600 font-bold hover:underline pt-2"
                      >
                        Cancelar e tentar novamente
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Activity Feed */}
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <RefreshCw size={20} className="text-blue-600" />
              Atividade Recente
            </h3>
            <div className="space-y-4">
              <div className="flex gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center shrink-0">
                  <Sparkles size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Sistema Pronto</p>
                  <p className="text-xs text-slate-500 mt-1">O módulo de automação foi inicializado. Conecte seu WhatsApp para começar.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-lg shadow-blue-200">
            <h4 className="font-bold text-lg mb-6">Como funciona?</h4>
            <div className="space-y-6">
              {[
                { title: 'Inicie o Acerto', desc: 'No menu de Fechamentos, clique no ícone do WhatsApp para iniciar.' },
                { title: 'IA entra em contato', desc: 'O robô envia uma mensagem personalizada solicitando o inventário.' },
                { title: 'Coleta de Dados', desc: 'O lojista responde e nossa IA interpreta as quantidades vendidas.' },
                { title: 'Pronto!', desc: 'Você recebe o fechamento mastigado para apenas conferir e aprovar.' }
              ].map((step, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold shrink-0">
                    {idx + 1}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold leading-none">{step.title}</p>
                    <p className="text-xs text-blue-100 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6">
            <div className="flex items-center gap-2 text-amber-700 font-bold text-sm mb-2">
              <AlertCircle size={18} />
              Dica de Uso
            </div>
            <p className="text-xs text-amber-600 leading-relaxed">
              Mantenha seu celular conectado à internet para garantir que o agente consiga enviar mensagens instantaneamente.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
