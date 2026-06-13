import { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL;

interface AddFriendProps {
  token: string;
  onClose: () => void;
}

export default function AddFriend({ token, onClose }: AddFriendProps) {
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');

  const sendRequest = async () => {
    if (!username.trim()) return;
    try {
      const res = await axios.get(`${API_URL}/api/users/search?q=${encodeURIComponent(username)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const users = res.data;
      const user = users.find((u: any) => u.username.toLowerCase() === username.toLowerCase());
      if (!user) {
        setMessage('Пользователь не найден');
        return;
      }
      await axios.post(`${API_URL}/api/friend-requests`, { toId: user.id }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage('Заявка отправлена');
      setTimeout(() => {
        setMessage('');
        onClose();
      }, 1500);
    } catch (err: any) {
      if (err.response?.status === 409) setMessage('Заявка уже отправлена');
      else setMessage('Ошибка');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 100,
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        style={{
          backgroundColor: 'var(--sidebar-bg)', borderRadius: 24,
          padding: 24, width: '90%', maxWidth: 400,
          color: 'var(--text-primary)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <h3 style={{ marginBottom: 16 }}>Добавить в друзья</h3>
        <input
          style={{
            width: '100%', padding: 12, borderRadius: 20,
            border: '1px solid var(--border-color)',
            backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)',
            marginBottom: 12,
          }}
          placeholder="Введите точное имя пользователя"
          value={username}
          onChange={e => setUsername(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendRequest()}
        />
        {message && <p style={{ marginBottom: 12, color: message.includes('отправлена') ? 'green' : 'red' }}>{message}</p>}
        <button
          onClick={sendRequest}
          style={{
            width: '100%', padding: 12, borderRadius: 20,
            background: '#0084ff', color: 'white', border: 'none',
            fontWeight: 600, cursor: 'pointer',
          }}
        >
          Отправить заявку
        </button>
        <button
          onClick={onClose}
          style={{
            width: '100%', padding: 12, marginTop: 8,
            borderRadius: 20, background: 'var(--button-bg)',
            color: 'var(--button-text)', border: 'none', cursor: 'pointer',
          }}
        >
          Отмена
        </button>
      </motion.div>
    </motion.div>
  );
}