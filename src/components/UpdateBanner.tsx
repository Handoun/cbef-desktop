import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL;
const CURRENT_VERSION = '2.1.0'; // должен совпадать с серверным

export default function UpdateBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const checkVersion = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/version`);
        if (res.data.version !== CURRENT_VERSION) {
          setShow(true);
        }
      } catch (err) {
        console.error('Update check failed:', err);
      }
    };
    const isCapacitor = !!(window as any).Capacitor;
    const isElectron = !!(window as any).electron;
    if (isCapacitor || isElectron) {
      checkVersion();
    }
  }, []);

  const handleUpdate = () => window.location.reload();

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0,
            background: '#0084ff', color: 'white',
            padding: '12px 20px', display: 'flex',
            justifyContent: 'space-between', alignItems: 'center',
            zIndex: 9999, fontWeight: 500,
          }}
        >
          <span>Доступна новая версия приложения</span>
          <button
            onClick={handleUpdate}
            style={{
              background: 'white', color: '#0084ff',
              border: 'none', borderRadius: 20,
              padding: '6px 16px', fontWeight: 600, cursor: 'pointer',
            }}
          >
            Обновить
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}