'use client';

import { useState, useEffect } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  ArrowUpDown,
  History,
  Archive
} from 'lucide-react';
import { motion } from 'framer-motion';
import api from '@/lib/api';

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/sales/stock');
        setProducts(response.data.data);
      } catch (err) {
        console.error('Falha ao buscar estoque', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="page-container">
      <style jsx>{`
        .page-container {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .actions-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
        }

        .search-wrapper {
          position: relative;
          flex: 1;
          max-width: 400px;
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--muted-foreground);
        }

        .search-input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 2.75rem;
          border-radius: 0.75rem;
          border: 1px solid var(--border);
          background: white;
          font-size: 0.95rem;
        }

        .data-table-container {
          background: white;
          border-radius: 1.25rem;
          border: 1px solid var(--border);
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .data-table th {
          padding: 1rem 1.5rem;
          background: #f8fafc;
          border-bottom: 1px solid var(--border);
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--muted-foreground);
          font-weight: 700;
        }

        .data-table td {
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid var(--border);
          font-size: 0.95rem;
          color: var(--foreground);
        }

        .data-table tr:last-child td {
          border-bottom: none;
        }

        .data-table tr:hover {
          background: #fcfdfe;
        }

        .product-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .product-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: var(--muted);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--primary);
        }

        .stock-badge {
          display: inline-flex;
          align-items: center;
          padding: 0.25rem 0.75rem;
          border-radius: 2rem;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .stock-high { background: #dcfce7; color: #166534; }
        .stock-low { background: #fee2e2; color: #991b1b; }
        .stock-empty { background: #f1f5f9; color: #475569; }

        .btn-outline {
          background: white;
          border: 1px solid var(--border);
          color: var(--foreground);
        }

        .btn-outline:hover {
          background: var(--muted);
        }
      `}</style>

      <div className="actions-bar">
        <div className="search-wrapper">
          <Search className="search-icon" size={18} />
          <input 
            type="text" 
            placeholder="Pesquisar por nome ou SKU..." 
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-outline">
            <Filter size={18} /> Filtrar
          </button>
          <button className="btn btn-primary">
            <Plus size={18} /> Novo Produto
          </button>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="data-table-container"
      >
        <table className="data-table">
          <thead>
            <tr>
              <th>Produto</th>
              <th>SKU</th>
              <th>Estoque Atual</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [1, 2, 3].map(i => (
                <tr key={i}>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted-foreground)' }}> Carregando... </td>
                </tr>
              ))
            ) : filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted-foreground)' }}> Nenhum produto encontrado. </td>
              </tr>
            ) : (
              filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td>
                    <div className="product-info">
                      <div className="product-icon">
                        <Package size={20} />
                      </div>
                      <div>
                        <p style={{ fontWeight: 600 }}>{product.name}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>ID: {product.id.slice(0,8)}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <code style={{ background: 'var(--muted)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                      {product.sku || '---'}
                    </code>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, fontSize: '1.125rem' }}>{product.totalStock}</span>
                    <span style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)', marginLeft: '0.25rem' }}>un</span>
                  </td>
                  <td>
                    <span className={`stock-badge ${
                      product.totalStock > 10 ? 'stock-high' : 
                      product.totalStock > 0 ? 'stock-low' : 'stock-empty'
                    }`}>
                      {product.totalStock > 10 ? 'Em dia' : 
                       product.totalStock > 0 ? 'Baixo' : 'Esgotado'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-outline" style={{ padding: '0.5rem' }} title="Histórico de Lotes">
                        <History size={16} />
                      </button>
                      <button className="btn btn-outline" style={{ padding: '0.5rem' }} title="Novo Lote">
                        <Plus size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
}
