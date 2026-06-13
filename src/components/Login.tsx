import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL;

const styles: any = {
  container: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(145deg, #0F2027 0%, #203A43 50%, #2C5364 100%)', padding: 16 },
  card: { background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)', padding: '32px 24px', borderRadius: 32, boxShadow: '0 30px 50px rgba(0,0,0,0.2)', width: '100%', maxWidth: 400 },
  title: { fontSize: 36, fontWeight: 800, marginBottom: 24, textAlign: 'center', color: '#1F2A3E', letterSpacing: 2 },
  input: { width: '100%', padding: '16px 18px', marginBottom: 16, fontSize: 16, border: '1px solid rgba(255,255,255,0.3)', borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.7)', outline: 'none', transition: '0.2s' },
  button: { width: '100%', padding: 16, background: 'linear-gradient(135deg, #1F2A3E 0%, #2C3E50 100%)', color: 'white', border: 'none', borderRadius: 40, fontSize: 18, fontWeight: 700, cursor: 'pointer', boxShadow: '0 6px 12px rgba(0,0,0,0.1)' },
  link: { textAlign: 'center', marginTop: 20, color: '#2C3E50' },
  error: { color: '#d32f2f', textAlign: 'center', marginBottom: 12, fontWeight: 500 },
};

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) navigate('/chat', { replace: true });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API_URL}/api/login`, { username, password }, { timeout: 10000 });
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        if (res.data.user.avatar) localStorage.setItem('avatar', res.data.user.avatar);
        navigate('/chat', { replace: true });
      }
    } catch (err: any) {
      if (err.code === 'ECONNABORTED') {
        setError('Превышено время ожидания. Проверьте подключение.');
      } else if (!err.response) {
        setError('Нет соединения с сервером. Попробуйте позже.');
      } else if (err.response?.status === 401) {
        setError('Неверный логин или пароль');
      } else if (err.response?.status === 403) {
        setError('Ваш аккаунт заблокирован');
      } else {
        setError('Ошибка сервера. Попробуйте позже.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>CBEF</h2>
        {error && <div style={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <input style={styles.input} type="text" placeholder="Логин" value={username} onChange={e => setUsername(e.target.value)} required disabled={loading} />
          <input style={styles.input} type="password" placeholder="Пароль" value={password} onChange={e => setPassword(e.target.value)} required disabled={loading} />
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={styles.button} type="submit" disabled={loading}>
            {loading ? 'Вход...' : 'Войти'}
          </motion.button>
        </form>
        <div style={styles.link}>
          Нет аккаунта? <Link to="/register" style={{ color: '#1F2A3E', fontWeight: 600 }}>Создать</Link>
        </div>
      </div>
    </motion.div>
  );
}