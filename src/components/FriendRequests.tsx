import { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL;

interface FriendRequest {
  id: number;
  from_id: number;
  username: string;
  avatar?: string;
}

export default function FriendRequests({ token, onAccept }: { token: string; onAccept: () => void }) {
  const [requests, setRequests] = useState<FriendRequest[]>([]);

  const fetchRequests = () => {
    axios.get(`${API_URL}/api/friend-requests`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setRequests(res.data))
      .catch(console.error);
  };

  useEffect(fetchRequests, [token]);

  const handleAccept = async (id: number) => {
    await axios.put(`${API_URL}/api/friend-requests/${id}/accept`, {}, { headers: { Authorization: `Bearer ${token}` } });
    fetchRequests();
    onAccept();
  };

  const handleReject = async (id: number) => {
    await axios.put(`${API_URL}/api/friend-requests/${id}/reject`, {}, { headers: { Authorization: `Bearer ${token}` } });
    fetchRequests();
  };

  if (requests.length === 0) return null;

  return (
    <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--border-color)' }}>
      <h4 style={{ marginBottom: 8 }}>Входящие заявки ({requests.length})</h4>
      {requests.map(req => (
        <motion.div key={req.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <img src={req.avatar || 'https://via.placeholder.com/30?text=?'} style={{ width: 30, height: 30, borderRadius: '50%' }} />
            <span>{req.username}</span>
          </div>
          <div>
            <button onClick={() => handleAccept(req.id)} style={{ marginRight: 8, background: '#4caf50', color: 'white', border: 'none', borderRadius: 16, padding: '4px 12px' }}>✓</button>
            <button onClick={() => handleReject(req.id)} style={{ background: '#f44336', color: 'white', border: 'none', borderRadius: 16, padding: '4px 12px' }}>✕</button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}