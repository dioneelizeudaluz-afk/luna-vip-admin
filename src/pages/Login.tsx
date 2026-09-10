import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError('Preenche todos os campos'); return; }
    const users = JSON.parse(localStorage.getItem('luna_users') || '[]');
    const user = users.find((u: any) => u.email === email && u.password === password);
    if (user) {
      localStorage.setItem('luna_auth', 'true');
      localStorage.setItem('luna_user', email);
      navigate('/dashboard');
    } else {
      setError('Email ou senha incorretos');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!name || !email || !password || !confirm) { setError('Preenche todos os campos'); return; }
    if (password !== confirm) { setError('As senhas não coincidem'); return; }
    if (password.length < 4) { setError('A senha deve ter pelo menos 4 caracteres'); return; }

    const users = JSON.parse(localStorage.getItem('luna_users') || '[]');
    if (users.find((u: any) => u.email === email)) { setError('Este email já está registado'); return; }

    users.push({ name, email, password, createdAt: new Date().toISOString() });
    localStorage.setItem('luna_users', JSON.stringify(users));
    setSuccess('Conta criada com sucesso! A entrar...');
    localStorage.setItem('luna_auth', 'true');
    localStorage.setItem('luna_user', email);
    setTimeout(() => navigate('/dashboard'), 1500);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a', padding: 16 }}>
      <div className="dh-card" style={{ padding: 32, width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <h1 style={{ color: '#00ff88', fontWeight: 900, fontSize: 26, letterSpacing: 2 }}>LUNA VIP</h1>
          <p style={{ color: '#666', fontSize: 12, marginTop: 4 }}>Painel Administrativo</p>
        </div>

        <div style={{ display: 'flex', background: '#0a0a0a', border: '1px solid #1f1f1f', borderRadius: 10, padding: 4, marginBottom: 20 }}>
          <button
            onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
            style={{
              flex: 1, padding: 10, background: mode === 'login' ? '#00ff88' : 'transparent',
              color: mode === 'login' ? '#0a0a0a' : '#9ca3af', border: 'none', borderRadius: 8,
              fontWeight: 700, fontSize: 13, cursor: 'pointer', transition: 'all 0.3s'
            }}
          >ENTRAR</button>
          <button
            onClick={() => { setMode('register'); setError(''); setSuccess(''); }}
            style={{
              flex: 1, padding: 10, background: mode === 'register' ? '#00ff88' : 'transparent',
              color: mode === 'register' ? '#0a0a0a' : '#9ca3af', border: 'none', borderRadius: 8,
              fontWeight: 700, fontSize: 13, cursor: 'pointer', transition: 'all 0.3s'
            }}
          >CRIAR CONTA</button>
        </div>

        {mode === 'login' ? (
          <form onSubmit={handleLogin}>
            <label style={{ fontSize: 11, color: '#666', display: 'block', marginBottom: 5, fontWeight: 600 }}>EMAIL</label>
            <input className="dh-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@luna.com" style={{ marginBottom: 14 }} />

            <label style={{ fontSize: 11, color: '#666', display: 'block', marginBottom: 5, fontWeight: 600 }}>SENHA</label>
            <div style={{ position: 'relative', marginBottom: 18 }}>
              <input
                className="dh-input"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ paddingRight: 44 }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  padding: 4, display: 'flex', alignItems: 'center', color: '#666'
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {error && <div style={{ background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.3)', color: '#ff6666', padding: 10, borderRadius: 8, fontSize: 13, marginBottom: 15 }}>{error}</div>}

            <button type="submit" className="dh-btn" style={{ width: '100%' }}>ENTRAR</button>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <label style={{ fontSize: 11, color: '#666', display: 'block', marginBottom: 5, fontWeight: 600 }}>NOME</label>
            <input className="dh-input" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Teu nome" style={{ marginBottom: 14 }} />

            <label style={{ fontSize: 11, color: '#666', display: 'block', marginBottom: 5, fontWeight: 600 }}>EMAIL</label>
            <input className="dh-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@exemplo.com" style={{ marginBottom: 14 }} />

            <label style={{ fontSize: 11, color: '#666', display: 'block', marginBottom: 5, fontWeight: 600 }}>SENHA</label>
            <div style={{ position: 'relative', marginBottom: 14 }}>
              <input
                className="dh-input"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 4 caracteres"
                style={{ paddingRight: 44 }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  padding: 4, display: 'flex', alignItems: 'center', color: '#666'
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <label style={{ fontSize: 11, color: '#666', display: 'block', marginBottom: 5, fontWeight: 600 }}>CONFIRMAR SENHA</label>
            <div style={{ position: 'relative', marginBottom: 18 }}>
              <input
                className="dh-input"
                type={showConfirm ? 'text' : 'password'}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Repete a senha"
                style={{ paddingRight: 44 }}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                style={{
                  position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  padding: 4, display: 'flex', alignItems: 'center', color: '#666'
                }}
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {error && <div style={{ background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.3)', color: '#ff6666', padding: 10, borderRadius: 8, fontSize: 13, marginBottom: 15 }}>{error}</div>}
            {success && <div style={{ background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.3)', color: '#00ff88', padding: 10, borderRadius: 8, fontSize: 13, marginBottom: 15 }}>{success}</div>}

            <button type="submit" className="dh-btn" style={{ width: '100%' }}>CRIAR CONTA</button>
          </form>
        )}

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 11, color: '#444' }}>
          {mode === 'login' ? 'Não tens conta? Clica em CRIAR CONTA' : 'Já tens conta? Clica em ENTRAR'}
        </p>
      </div>
    </div>
  );
}