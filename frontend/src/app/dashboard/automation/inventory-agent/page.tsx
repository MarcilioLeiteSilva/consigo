'use client';

import { useState, useEffect } from 'react';
import { 
  Bot, 
  RefreshCw, 
  Power, 
  MessageSquare, 
  CheckCircle2, 
  AlertCircle,
  QrCode,
  ArrowRight
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
    const interval = setInterval(fetchStatus, 10000); // Check status every 10s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container">
      <style jsx>{`
        .container {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }
        .header {
          margin-bottom: 2rem;
        }
        .title {
          font-size: 2rem;
          font-weight: 800;
          font-family: 'Outfit', sans-serif;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: var(--foreground);
        }
        .grid {
          display: grid;
          grid-template-columns: 1fr 350px;
          gap: 2rem;
        }
        .card {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 1rem;
          padding: 1.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 2rem;
          font-weight: 600;
          font-size: 0.875rem;
          margin-bottom: 1rem;
        }
        .status-connected {
          background: rgba(34, 197, 94, 0.1);
          color: #16a34a;
        }
        .status-disconnected {
          background: rgba(239, 68, 68, 0.1);
          color: #dc2626;
        }
        .qr-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: white;
          padding: 2rem;
          border-radius: 1rem;
          margin-top: 1rem;
        }
        .qr-image {
          width: 250px;
          height: 250px;
        }
        .btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          border-radius: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }
        .btn-primary {
          background: var(--primary);
          color: white;
        }
        .btn-outline {
          background: transparent;
          border: 1px solid var(--border);
          color: var(--foreground);
        }
        .btn-danger {
          background: rgba(239, 68, 68, 0.1);
          color: #dc2626;
        }
        .log-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-top: 1.5rem;
        }
        .log-item {
          padding: 1rem;
          border-radius: 0.75rem;
          background: rgba(var(--primary-rgb), 0.05);
          border-left: 4px solid var(--primary);
          font-size: 0.875rem;
        }
      `}</style>

      <div className="header">
        <h1 className="title">
          <Bot size={32} color="var(--primary)" />
          Agente de Acertos
        </h1>
        <p style={{ color: 'var(--muted-foreground)', marginTop: '0.5rem' }}>
          Automação de conferência de inventário via WhatsApp.
        </p>
      </div>

      <div className="grid">
        <div className="main-content">
          <div className="card">
            <div className={`status-badge ${status?.status === 'connected' ? 'status-connected' : 'status-disconnected'}`}>
              {status?.status === 'connected' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              {status?.status === 'connected' ? 'Conectado' : 'Desconectado'}
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>
              Configuração da Instância
            </h3>
            
            {status?.status === 'connected' ? (
              <div>
                <p style={{ marginBottom: '1.5rem' }}>
                  O agente está ativo e pronto para realizar acertos de inventário com seus PDVs.
                </p>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button onClick={handleDisconnect} className="btn btn-danger">
                    <Power size={18} /> Desconectar
                  </button>
                  <button onClick={fetchStatus} className="btn btn-outline">
                    <RefreshCw size={18} className={loading ? 'animate-spin' : ''} /> Atualizar
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p style={{ marginBottom: '1.5rem' }}>
                  Conecte um número de WhatsApp para que a IA possa entrar em contato com os lojistas automaticamente.
                </p>
                {!qrCode && (
                  <button onClick={handleConnect} className="btn btn-primary" disabled={loading}>
                    <MessageSquare size={18} /> 
                    {loading ? 'Preparando...' : 'Configurar WhatsApp'}
                  </button>
                )}
                
                {qrCode && (
                  <div className="qr-container">
                    <img src={qrCode} alt="WhatsApp QR Code" className="qr-image" />
                    <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '1rem', textAlign: 'center' }}>
                      Abra o WhatsApp no seu celular, vá em Aparelhos Conectados e escaneie o código acima.
                    </p>
                    <button onClick={() => setQrCode(null)} className="btn btn-outline" style={{marginTop: '1rem'}}>
                      Cancelar
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="card" style={{ marginTop: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <RefreshCw size={20} /> Atividade Recente
            </h3>
            <div className="log-list">
              <div className="log-item">
                <strong>Configuração inicial concluída.</strong><br/>
                <span style={{opacity: 0.6, fontSize: '0.75rem'}}>Agora você pode disparar acertos a partir da tela de Fechamento.</span>
              </div>
            </div>
          </div>
        </div>

        <div className="sidebar-content">
          <div className="card" style={{ background: 'var(--gradient-primary)', color: 'white', border: 'none' }}>
            <h4 style={{ fontWeight: 700, marginBottom: '1rem' }}>Como funciona?</h4>
            <ul style={{ fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <li style={{ display: 'flex', gap: '0.5rem' }}><ArrowRight size={14} /> Você inicia o acerto no sistema.</li>
              <li style={{ display: 'flex', gap: '0.5rem' }}><ArrowRight size={14} /> O robô envia mensagem ao lojista.</li>
              <li style={{ display: 'flex', gap: '0.5rem' }}><ArrowRight size={14} /> O lojista responde a contagem.</li>
              <li style={{ display: 'flex', gap: '0.5rem' }}><ArrowRight size={14} /> A IA interpreta e sugere o fechamento.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
