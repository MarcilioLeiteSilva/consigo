import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  color?: string;
}

export default function StatCard({ title, value, icon: Icon, trend, color = 'var(--primary)' }: StatCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="stat-card glass"
    >
      <style jsx>{`
        .stat-card {
          padding: 1.5rem;
          border-radius: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          position: relative;
          overflow: hidden;
        }

        .icon-container {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: ${color}20;
          color: ${color};
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .value {
          font-size: 1.75rem;
          font-weight: 800;
          color: var(--foreground);
          font-family: 'Outfit', sans-serif;
        }

        .title {
          font-size: 0.875rem;
          color: var(--muted-foreground);
          font-weight: 500;
        }

        .trend {
          font-size: 0.75rem;
          font-weight: 600;
          color: #10b981;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }
      `}</style>
      
      <div className="icon-container">
        <Icon size={22} />
      </div>

      <div>
        <div className="title">{title}</div>
        <div className="value">{value}</div>
      </div>

      {trend && (
        <div className="trend">
          <span>↑</span> {trend}
        </div>
      )}
    </motion.div>
  );
}
