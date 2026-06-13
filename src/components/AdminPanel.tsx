import { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL;

export default function AdminPanel({ token, onClose }: { token: string; onClose: () => void }) {
  const [users, setUsers] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [tab, setTab] = useState<'users' | 'reports'>('users');

  useEffect(() => {
    if (!token) return;
    axios.get(`${API_URL}/api/admin/users`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setUsers(r.data)).catch(console.error);
    axios.get(`${API_URL}/api/admin/reports`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setReports(r.data)).catch(console.error);
  }, [token]);

  const banUser = async (id: number) => {
    await axios.put(`${API_URL}/api/admin/ban/${id}`, {}, { headers: { Authorization: `Bearer ${token}` } });
    setUsers(prev => prev.map(u => u.id === id ? { ...u, banned: true } : u));
  };
  const unbanUser = async (id: number) => {
    await axios.put(`${API_URL}/api/admin/unban/${id}`, {}, { headers: { Authorization: `Bearer ${token}` } });
    setUsers(prev => prev.map(u => u.id === id ? { ...u, banned: false } : u));
  };
  const makeAdmin = async (id: number) => {
    await axios.put(`${API_URL}/api/admin/make-admin/${id}`, {}, { headers: { Authorization: `Bearer ${token}` } });
    setUsers(prev => prev.map(u => u.id === id ? { ...u, is_admin: true } : u));
  };

  const containerStyle: React.CSSProperties = {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000,
  };
  const panelStyle: React.CSSProperties = {
    backgroundColor: 'var(--sidebar-bg)', borderRadius: 24, padding: 24,
    width: '90%', maxWidth: 700, maxHeight: '80vh', overflow: 'auto',
    color: 'var(--text-primary)',
  };
  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: '8px 16px', borderRadius: 20, border: 'none', cursor: 'pointer',
    background: active ? 'var(--button-bg)' : 'transparent',
    color: 'var(--text-primary)', fontWeight: active ? 600 : 400,
  });
  const actionBtn: React.CSSProperties = {
    padding: '4px 12px', borderRadius: 12, border: 'none', cursor: 'pointer',
    fontSize: 13, fontWeight: 500, marginRight: 6,
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={containerStyle} onClick={onClose}>
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} style={panelStyle} onClick={e => e.stopPropagation()}>
        <h3 style={{ marginBottom: 16 }}>🛡️ Админ-панель</h3>
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          <button style={tabStyle(tab === 'users')} onClick={() => setTab('users')}>Пользователи</button>
          <button style={tabStyle(tab === 'reports')} onClick={() => setTab('reports')}>Жалобы</button>
        </div>
        {tab === 'users' && (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr><th>ID</th><th>Имя</th><th>Админ</th><th>Бан</th><th>Действия</th></tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td>{u.id}</td>
                  <td>{u.username}</td>
                  <td>{u.is_admin ? '✅' : '❌'}</td>
                  <td>{u.banned ? '🚫' : '✅'}</td>
                  <td>
                    {!u.is_admin && <button style={{ ...actionBtn, background: '#4caf50', color: 'white' }} onClick={() => makeAdmin(u.id)}>Админ</button>}
                    {u.banned ? <button style={{ ...actionBtn, background: '#ff9800', color: 'white' }} onClick={() => unbanUser(u.id)}>Разбан</button> :
                    <button style={{ ...actionBtn, background: '#f44336', color: 'white' }} onClick={() => banUser(u.id)}>Бан</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {tab === 'reports' && (
          <div>
            {reports.length === 0 && <p>Нет жалоб</p>}
            {reports.map(r => (
              <div key={r.id} style={{ borderBottom: '1px solid var(--border-color)', padding: '8px 0' }}>
                <strong>{r.reporter_name}</strong> пожаловался на <strong>{r.reported_name}</strong><br />
                Причина: {r.reason || 'не указана'}<br />
                <small>{new Date(r.created_at).toLocaleString()}</small>
              </div>
            ))}
          </div>
        )}
        <button onClick={onClose} style={{ marginTop: 20, width: '100%', padding: 12, borderRadius: 20, border: 'none', background: 'var(--button-bg)', color: 'var(--button-text)', cursor: 'pointer', fontWeight: 600 }}>Закрыть</button>
      </motion.div>
    </motion.div>
  );
}