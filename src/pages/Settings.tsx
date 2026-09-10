import { Bot, CreditCard } from 'lucide-react';

export default function Settings() {
  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 900, color: '#fff', marginBottom: 20 }}>Configurações</h1>

      <div className="dh-card" style={{ padding: 20, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <Bot size={20} color="#00ff88" />
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>Bot Telegram</h3>
        </div>
        <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: 8 }}>Token configurado via Vercel</p>
        <p style={{ fontSize: 11, color: '#666' }}>Grupo VIP: -1004463213854</p>
      </div>

      <div className="dh-card" style={{ padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <CreditCard size={20} color="#00ff88" />
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>EscalePay</h3>
        </div>
        <p style={{ fontSize: 13, color: '#9ca3af' }}>Webhook: /api/escale-webhook</p>
      </div>
    </div>
  );
}