import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function Cashout() {
  const [cashouts, setCashouts] = useState<any[]>([]);

  useEffect(() => {
    supabase.from('cashouts').select('*').order('created_at', { ascending: false }).then(({ data }) => setCashouts(data || []));
  }, []);

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 900, color: '#fff', marginBottom: 20 }}>Cashout</h1>
      <div className="dh-card" style={{ overflowX: 'auto' }}>
        {cashouts.length === 0 ? (
          <p style={{ padding: 40, textAlign: 'center', color: '#666' }}>Nenhuma retirada</p>
        ) : (
          <table className="dh-table">
            <thead><tr><th>Valor</th><th>Estado</th><th>Data</th></tr></thead>
            <tbody>
              {cashouts.map(c => (
                <tr key={c.id}>
                  <td style={{ color: '#00ff88', fontWeight: 700 }}>{Number(c.amount).toFixed(2)} MT</td>
                  <td><span className="dh-badge dh-badge-yellow">{c.status}</span></td>
                  <td style={{ color: '#9ca3af', fontSize: 12 }}>{new Date(c.created_at).toLocaleDateString('pt-BR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}