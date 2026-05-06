'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { LogIn, Lock, Mail, Loader2, Sparkles } from 'lucide-react';
import api from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', { email, password });
      const { accessToken, refreshToken, user } = response.data.data;

      localStorage.setItem('token', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Falha ao realizar login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <style jsx>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: radial-gradient(circle at top left, #6366f1 0%, transparent 40%),
                      radial-gradient(circle at bottom right, #a855f7 0%, transparent 40%),
                      #020617;
          overflow: hidden;
          position: relative;
        }

        .login-container::before {
          content: '';
          position: absolute;
          width: 150%;
          height: 150%;
          background: url('https://www.transparenttextures.com/patterns/carbon-fibre.png');
          opacity: 0.05;
          pointer-events: none;
        }

        .login-card {
          width: 100%;
          max-width: 420px;
          padding: 2.5rem;
          border-radius: 1.5rem;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          position: relative;
          z-index: 10;
        }

        .logo-area {
          text-align: center;
          margin-bottom: 2.5rem;
        }

        .logo-icon {
          background: var(--gradient-primary);
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
          box-shadow: 0 0 20px rgba(99, 102, 241, 0.5);
        }

        .logo-text {
          font-size: 2rem;
          font-weight: 800;
          color: white;
          letter-spacing: -1px;
        }

        .logo-subtitle {
          color: var(--muted-foreground);
          font-size: 0.875rem;
          margin-top: 0.25rem;
        }

        .error-message {
          background: rgba(239, 68, 68, 0.1);
          border-left: 4px solid #ef4444;
          color: #fca5a5;
          padding: 0.75rem;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .form-group {
          position: relative;
          margin-bottom: 1.25rem;
        }

        .form-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--muted-foreground);
          transition: color 0.2s;
        }

        .form-input {
          width: 100%;
          padding: 0.875rem 1rem 0.875rem 3rem;
          border-radius: 0.75rem;
          background: rgba(30, 41, 59, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
          font-size: 1rem;
          transition: all 0.3s ease;
        }

        .form-input:focus {
          outline: none;
          border-color: var(--primary);
          background: rgba(30, 41, 59, 0.8);
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.15);
        }

        .form-input:focus + .form-icon {
          color: var(--primary);
        }

        .submit-btn {
          width: 100%;
          margin-top: 1rem;
          padding: 0.875rem;
          font-size: 1rem;
        }
      `}</style>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="login-card"
      >
        <div className="logo-area">
          <div className="logo-icon">
            <Sparkles className="text-white" size={24} />
          </div>
          <h1 className="logo-text">Consigo</h1>
          <p className="logo-subtitle">Gestão Inteligente de Consignados</p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="error-message"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <Mail className="form-icon" size={18} />
            <input
              type="email"
              className="form-input"
              placeholder="Seu e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <Lock className="form-icon" size={18} />
            <input
              type="password"
              className="form-input"
              placeholder="Sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary submit-btn"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                Entrar <LogIn size={18} />
              </>
            )}
          </button>
        </form>

        <p style={{ 
          textAlign: 'center', 
          marginTop: '2rem', 
          fontSize: '0.875rem', 
          color: 'var(--muted-foreground)' 
        }}>
          Problemas no acesso? <a href="#" style={{ color: 'var(--primary)', fontWeight: 600 }}>Contate o suporte</a>
        </p>
      </motion.div>

      {/* Decorative Elements */}
      <div style={{
        position: 'absolute',
        top: '10%',
        right: '10%',
        width: '300px',
        height: '300px',
        background: 'rgba(99, 102, 241, 0.1)',
        filter: 'blur(100px)',
        borderRadius: '50%',
        zIndex: 1
      }} />
      <div style={{
        position: 'absolute',
        bottom: '10%',
        left: '10%',
        width: '400px',
        height: '400px',
        background: 'rgba(168, 85, 247, 0.1)',
        filter: 'blur(100px)',
        borderRadius: '50%',
        zIndex: 1
      }} />
    </div>
  );
}
