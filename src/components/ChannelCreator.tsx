import { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL;

export default function ChannelCreator({ token, onClose, onCreated }: { token: string; onClose: () => void; onCreated: () => void }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const create = async () => {
    if (!name.trim()) return alert('Введите название канала');
    try {
      await axios.post(`${API_URL}/api/channels`, { name, description }, { headers: { Authorization: `Bearer ${token}` } });
      onCreated();
      onClose();
    } catch (err) { console.error(err); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
    }}>
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} style={{
        background: 'var(--sidebar-bg)', padding: 24, borderRadius: 24, width: '90%', maxWidth: 400
      }}>
        <h3>📢 Создать канал</h3>
        <input style={{ width: '100%', padding: 12, borderRadius: 20, border: '1px solid var(--border-color)', backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)', marginBottom: 12 }} placeholder="Название канала" value={name} onChange={e => setName(e.target.value)} />
        <textarea style={{ width: '100%', padding: 12, borderRadius: 20, border: '1px solid var(--border-color)', backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)', marginBottom: 12 }} placeholder="Описание" value={description} onChange={e => setDescription(e.target.value)} rows={3} />
        <button onClick={create} style={{ padding: '10px 24px', borderRadius: 20, background: '#0084ff', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600, marginRight: 8 }}>Создать</button>
        <button onClick={onClose} style={{ padding: '10px 24px', borderRadius: 20, background: 'var(--button-bg)', color: 'var(--button-text)', border: 'none', cursor: 'pointer' }}>Отмена</button>
      </motion.div>
    </motion.div>
  );
}