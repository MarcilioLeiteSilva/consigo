'use client';

import Sidebar from "@/components/Sidebar";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="layout-container">
      <style jsx>{`
        .layout-container {
          display: flex;
          min-height: 100vh;
          background: #f8fafc;
        }

        [data-theme='dark'] .layout-container {
          background: #020617;
        }

        .main-content {
          flex: 1;
          padding: 2rem 3rem;
          max-width: 1600px;
          margin: 0 auto;
          width: 100%;
        }

        .top-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 3rem;
        }

        .user-profile {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .user-info {
          text-align: right;
        }

        .user-name {
          font-weight: 700;
          font-size: 0.95rem;
        }

        .user-role {
          font-size: 0.75rem;
          color: var(--muted-foreground);
        }

        .avatar {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: var(--gradient-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          border: 3px solid white;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        }
      `}</style>

      <Sidebar />
      
      <main className="main-content">
        <header className="top-bar">
          <div>
            <h2 style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)', fontWeight: 500 }}>Bom dia, bem-vindo de volta!</h2>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Visão Geral</h1>
          </div>

          <div className="user-profile">
            <div className="user-info">
              <p className="user-name">Lojista Admin</p>
              <p className="user-role">Administrador</p>
            </div>
            <div className="avatar">LA</div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
