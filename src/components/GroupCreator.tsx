import { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL;

interface GroupCreatorProps {
  token: string;
  onClose: () => void;
  onCreated: () => void;
}

export default function GroupCreator({ token, onClose, onCreated }: GroupCreatorProps) {
  const [name, setName] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    const res = await axios.get(`${API_URL}/api/users/search?q=${searchQuery}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setSearchResults(res.data);
  };

  const toggleUser = (id: number) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const createGroup = async () => {
    if (!name.trim()) return alert('Введите название группы');
    try {
      await axios.post(
        `${API_URL}/api/groups`,
        { name, memberIds: selectedIds },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onCreated();
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
      }}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        style={{
          background: 'var(--sidebar-bg)',
          padding: 24,
          borderRadius: 24,
          width: '90%',
          maxWidth: 400,
          color: 'var(--text-primary)',
        }}
      >
        <h3>Создать группу</h3>
        <input
          style={{
            width: '100%',
            padding: 12,
            marginBottom: 12,
            borderRadius: 20,
            border: '1px solid var(--border-color)',
            backgroundColor: 'var(--input-bg)',
            color: 'var(--text-primary)',
          }}
          placeholder="Название группы"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <input
            style={{
              flex: 1,
              padding: 12,
              borderRadius: 20,
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--input-bg)',
              color: 'var(--text-primary)',
            }}
            placeholder="Поиск участников"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
          />
          <button
            onClick={handleSearch}
            style={{
              padding: '8px 16px',
              borderRadius: 20,
              border: 'none',
              background: 'var(--button-bg)',
              color: 'var(--button-text)',
              cursor: 'pointer',
            }}
          >
            Найти
          </button>
        </div>
        <div style={{ maxHeight: 200, overflowY: 'auto' }}>
          {searchResults.map(user => (
            <div key={user.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <input
                type="checkbox"
                checked={selectedIds.includes(user.id)}
                onChange={() => toggleUser(user.id)}
              />
              <span>{user.username}</span>
            </div>
          ))}
        </div>
        <button
          onClick={createGroup}
          style={{
            marginTop: 16,
            padding: '12px 24px',
            borderRadius: 20,
            border: 'none',
            background: '#0084ff',
            color: 'white',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          Создать
        </button>
        <button
          onClick={onClose}
          style={{
            marginLeft: 8,
            padding: '12px 24px',
            borderRadius: 20,
            border: 'none',
            background: 'gray',
            color: 'white',
            cursor: 'pointer',
          }}
        >
          Отмена
        </button>
      </motion.div>
    </motion.div>
  );
}