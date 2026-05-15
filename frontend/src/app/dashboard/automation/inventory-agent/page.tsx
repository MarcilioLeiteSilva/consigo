'use client';

import { useState, useEffect } from 'react';
import { 
  Bot, 
  RefreshCw, 
  Power, 
  MessageSquare, 
  CheckCircle2, 
  AlertCircle,
  X,
  Sparkles,
  ExternalLink,
  Settings,
  Save,
  MessageSquarePlus,
  BrainCircuit
} from 'lucide-react';
import api from '@/lib/api';

export default function InventoryAgentPage() {
  const [status, setStatus] = useState<any>(null);
  const [tenant, setTenant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  // Form states for settings
  const [greeting, setGreeting] = useState('');
  const [instructions, setInstructions] = useState('');

  const fetchStatus = async () => {
    try {
      const res = await api.get('/tenant/whatsapp/status');
      const data = res.data.data || res.data;
      setStatus(data);
      
      // Carregar configurações salvas se existirem e o formulário estiver vazio
      if (data.greetingMessage && !greeting) setGreeting(data.greetingMessage);
      if (data.aiInstructions && !instructions) setInstructions(data.aiInstructions);

      // Se estiver na modal e o status mudar para conectado, fecha a modal
      if (data.status === 'connected' && isModalOpen) {
        setIsModalOpen(false);
        setQrCode(null);
      }
    } catch (e) {
      console.error('Error fetching status', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchTenant = async () => {
    try {
      const res = await api.get('/tenant/profile');
      const data = res.data.data || res.data;
      setTenant(data);
      
      // Se não houver saudação salva, define a padrão com o nome da empresa
      if (!greeting && !status?.greetingMessage) {
        const companyName = data?.companyName || 'nossa empresa';
        setGreeting(`Olá! Sou o assistente virtual da ${companyName}. Gostaria de confirmar o que você ainda tem em estoque para realizarmos o acerto do período. Podemos começar?`);
      }
    } catch (e) {
      console.error('Error fetching tenant', e);
    }
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      await api.post('/tenant/whatsapp/settings', {
        greetingMessage: greeting,
        aiInstructions: instructions
      });
      alert('Configurações salvas com sucesso!');
      setIsSettingsModalOpen(false);
      fetchStatus();
    } catch (e) {
      alert('Erro ao salvar configurações');
    } finally {
      setSavingSettings(false);
    }
  };

  const getQr = async () => {
    setLoading(true);
    try {
      console.log('🔄 Buscando QR Code...');
      const res = await api.get('/tenant/whatsapp/qr');
      console.log('✅ Resposta do QR:', res.data);
      
      // Detecção agressiva (agora incluindo o campo 'data' extra do NestJS)
      const data = res.data.data || res.data;
      const qrData = data.base64 || data.qrcode?.base64 || data.qrcode || (typeof data === 'string' && data.includes('base64') ? data : null);
      
      if (qrData) {
        console.log('📱 QR Code detectado com sucesso');
        setQrCode(qrData);
      } else {
        console.warn('⚠️ QR Data não encontrado no JSON:', data);
        const fallback = Object.values(data).find(v => typeof v === 'string' && v.startsWith('data:image'));
        if (fallback) setQrCode(fallback as string);
      }
    } catch (e) {
      console.error('❌ Erro ao buscar QR:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenConnect = async () => {
    setIsModalOpen(true);
    setLoading(true);
    try {
      console.log('🚀 Iniciando conexão...');
      const res = await api.post('/tenant/whatsapp/connect');
      setStatus(res.data.data || res.data);
      
      const data = res.data.data || res.data;
      const qrData = data.base64 || data.qrcode?.base64 || data.qrcode;
      
      if (qrData) {
        console.log('📱 QR recebido no connect');
        setQrCode(qrData);
      } else {
        console.log('⌛ QR não veio no connect, buscando no endpoint dedicado...');
        await getQr();
      }
    } catch (e: any) {
      console.error('⚠️ Erro no connect, tentando buscar QR existente:', e);
      await getQr();
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Tem certeza que deseja desconectar o WhatsApp?')) return;
    setLoading(true);
    try {
      await api.delete('/tenant/whatsapp/disconnect');
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
    fetchTenant();
    const interval = setInterval(fetchStatus, 5000); // Mais frequente para detectar conexão
    return () => clearInterval(interval);
  }, [isModalOpen]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-600 rounded-lg text-white">
              <Bot size={24} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Agente de Acertos</h1>
          </div>
          <p className="text-slate-500 max-w-2xl">
            Automação de conferência de inventário via WhatsApp.
          </p>
        </div>
        <button 
          onClick={() => setShowDebug(!showDebug)}
          className="text-xs text-slate-400 hover:text-slate-600 underline"
        >
          {showDebug ? 'Esconder Debug' : 'Mostrar Debug'}
        </button>
      </div>

      {showDebug && (
        <div className="p-4 bg-slate-900 text-green-400 font-mono text-xs rounded-xl overflow-auto max-h-40">
          <pre>{JSON.stringify(status, null, 2)}</pre>
          <div className="mt-2 text-white">QR Code Status: {qrCode ? 'Presente' : 'Ausente'}</div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Status da Conexão</h3>
                <p className="text-sm text-slate-500">Vincule seu WhatsApp para iniciar as automações</p>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsSettingsModalOpen(true)}
                  className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all border border-slate-200"
                  title="Configurações do Agente"
                >
                  <Settings size={20} />
                </button>
                <div className={`px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 ${
                  status?.status === 'connected' 
                    ? 'bg-green-100 text-green-700' 
                    : status?.status === 'connecting'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-slate-100 text-slate-600'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    status?.status === 'connected' ? 'bg-green-500 animate-pulse' : 
                    status?.status === 'connecting' ? 'bg-amber-500 animate-bounce' : 'bg-slate-400'
                  }`} />
                  {status?.status === 'connected' ? 'CONECTADO' : 
                   status?.status === 'connecting' ? 'CONECTANDO...' : 'DESCONECTADO'}
                </div>
              </div>
            </div>

            {status?.status === 'connected' ? (
              <div className="space-y-6">
                <div className="p-6 bg-green-50 rounded-xl border border-green-100 flex items-center gap-4 text-green-700">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold">WhatsApp Ativo</h4>
                    <p className="text-sm opacity-90">Sua conta está conectada e pronta para o trabalho.</p>
                  </div>
                </div>

                {status?.instanceName && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-1">ID da Instância</p>
                      <p className="text-sm font-bold text-slate-700">{status.instanceName}</p>
                    </div>
                    {status.instance?.owner && (
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Número Conectado</p>
                        <p className="text-sm font-bold text-slate-700">+{status.instance.owner.split('@')[0]}</p>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="flex flex-wrap gap-4 pt-4">
                  <button 
                    onClick={handleDisconnect}
                    className="flex items-center gap-2 px-6 py-2.5 bg-red-50 text-red-600 rounded-xl font-bold text-sm hover:bg-red-100 transition-colors"
                  >
                    <Power size={18} />
                    Desconectar WhatsApp
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare size={32} />
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-2">
                  {status?.status === 'connecting' ? 'Conexão em Andamento' : 'Conectar Novo Aparelho'}
                </h4>
                <p className="text-sm text-slate-500 max-w-xs mx-auto mb-8">
                  {status?.status === 'connecting' 
                    ? `O agente "${status.instanceName}" está aguardando a leitura do QR Code.`
                    : 'Clique no botão abaixo para gerar um código de conexão.'}
                </p>
                <button 
                  onClick={handleOpenConnect}
                  disabled={status?.status === 'connecting'}
                  className={`inline-flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all ${
                    status?.status === 'connecting'
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white shadow-lg shadow-blue-200 hover:bg-blue-700'
                  }`}
                >
                  <Sparkles size={20} />
                  {status?.status === 'connecting' ? 'Agente já Iniciado' : 'Conectar WhatsApp'}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-lg shadow-blue-200">
            <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Bot size={20} />
              Próximos Passos
            </h4>
            <p className="text-sm text-blue-100 mb-6 leading-relaxed">
              Após conectar, o agente ficará disponível no menu de <strong>Prestação de Contas</strong> para automatizar seus acertos.
            </p>
            <div className="p-4 bg-white/10 rounded-xl border border-white/20">
              <p className="text-xs font-bold mb-2 uppercase tracking-wider text-blue-200">Status da IA</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-xs font-medium">Pronta para conferência</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                  <Settings size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Configurações</h2>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Personalize seu Agente</p>
                </div>
              </div>
              <button onClick={() => setIsSettingsModalOpen(false)} className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all">✕</button>
            </div>

            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                  <MessageSquarePlus size={14} /> Mensagem de Saudação
                </label>
                <textarea 
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm text-slate-600 focus:ring-2 focus:ring-blue-500 outline-none transition-all h-24"
                  value={greeting}
                  onChange={(e) => setGreeting(e.target.value)}
                  placeholder="Mensagem inicial do robô..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                  <BrainCircuit size={14} /> Instruções da IA
                </label>
                <textarea 
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm text-slate-600 focus:ring-2 focus:ring-blue-500 outline-none transition-all h-32"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Como o robô deve se comportar..."
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  onClick={() => setIsSettingsModalOpen(false)} 
                  className="flex-1 py-4 bg-slate-100 text-slate-600 font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-slate-200 transition-all"
                >
                  Fechar
                </button>
                <button 
                  onClick={handleSaveSettings}
                  disabled={savingSettings}
                  className="flex-[2] py-4 bg-slate-900 text-white font-black uppercase tracking-widest text-xs rounded-2xl flex items-center justify-center gap-2 shadow-lg hover:bg-slate-800 transition-all disabled:opacity-50"
                >
                  {savingSettings ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
                  {savingSettings ? 'Salvando...' : 'Salvar Configurações'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Connection Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900">Escaneie o QR Code</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-8 flex flex-col items-center">
              {loading ? (
                <div className="py-20 flex flex-col items-center gap-4">
                  <RefreshCw size={48} className="text-blue-600 animate-spin" />
                  <p className="text-sm text-slate-500 font-medium">Gerando código seguro...</p>
                </div>
              ) : qrCode ? (
                <>
                  <div className="p-4 bg-white border-4 border-slate-50 rounded-3xl shadow-lg mb-8">
                    <img src={qrCode} alt="WhatsApp QR Code" className="w-64 h-64" />
                  </div>
                  <div className="space-y-4 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold">
                      <ExternalLink size={12} />
                      Passo a Passo
                    </div>
                    <ol className="text-sm text-slate-500 text-left space-y-2 list-decimal pl-4">
                      <li>Abra o WhatsApp no seu celular</li>
                      <li>Toque em <strong>Aparelhos Conectados</strong></li>
                      <li>Toque em <strong>Conectar um Aparelho</strong></li>
                      <li>Aponte a câmera para este código</li>
                    </ol>
                  </div>
                </>
              ) : (
                <div className="py-12 text-center">
                  <AlertCircle size={48} className="text-amber-500 mx-auto mb-4" />
                  <h4 className="font-bold text-slate-900 mb-2">Ops! Falha ao carregar</h4>
                  <p className="text-sm text-slate-500 mb-6">Não conseguimos obter o código da Evolution API.</p>
                  <button 
                    onClick={getQr}
                    className="px-6 py-2 bg-slate-100 text-slate-900 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors"
                  >
                    Tentar Novamente
                  </button>
                </div>
              )}
            </div>
            
            <div className="p-6 bg-slate-50 border-t border-slate-100 text-center">
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">
                Segurança ponta-a-ponta via Evolution API
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
