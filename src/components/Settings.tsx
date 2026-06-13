import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Avatar from './Avatar';

const API_URL = import.meta.env.VITE_API_URL;

const styles: any = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #0F2027 0%, #2C5364 100%)',
    padding: 16,
  },
  card: {
    background: 'rgba(255,255,255,0.9)',
    backdropFilter: 'blur(12px)',
    padding: 32,
    borderRadius: 32,
    boxShadow: '0 30px 50px rgba(0,0,0,0.2)',
    width: '100%',
    maxWidth: 500,
    color: '#1a1a1a',
  },
  title: {
    fontSize: 28,
    fontWeight: 700,
    marginBottom: 24,
    textAlign: 'center',
    color: '#1F2A3E',
  },
  avatarSection: {
    display: 'flex',
    alignItems: 'center',
    gap: 24,
    marginBottom: 28,
  },
  fileInput: { display: 'none' },
  uploadButton: {
    padding: '10px 18px',
    background: '#2C3E50',
    color: 'white',
    border: 'none',
    borderRadius: 30,
    cursor: 'pointer',
    fontWeight: 500,
  },
  inputGroup: { marginBottom: 20 },
  label: { display: 'block', marginBottom: 6, fontWeight: 500, color: '#2C3E50' },
  input: {
    width: '100%',
    padding: 14,
    border: '1px solid #ddd',
    borderRadius: 40,
    fontSize: 16,
    backgroundColor: 'white',
  },
  themeToggle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  themeButton: {
    padding: '10px 20px',
    backgroundColor: '#2C3E50',
    color: 'white',
    border: 'none',
    borderRadius: 30,
    cursor: 'pointer',
  },
  buttonGroup: { display: 'flex', gap: 12, marginTop: 30 },
  saveButton: {
    flex: 1,
    padding: 14,
    backgroundColor: '#0084ff',
    color: 'white',
    border: 'none',
    borderRadius: 40,
    fontWeight: 600,
    cursor: 'pointer',
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    backgroundColor: '#e0e0e0',
    color: '#333',
    border: 'none',
    borderRadius: 40,
    fontWeight: 600,
    cursor: 'pointer',
  },
  logoutButton: {
    width: '100%',
    padding: 14,
    marginTop: 20,
    backgroundColor: '#ff4d4f',
    color: 'white',
    border: 'none',
    borderRadius: 40,
    fontWeight: 600,
    cursor: 'pointer',
  },
};

export default function Settings() {
  const [username, setUsername] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setUsername(user.username);
    }
    const savedAvatar = localStorage.getItem('avatar');
    if (savedAvatar) setAvatar(savedAvatar);
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    if (savedTheme) setTheme(savedTheme);
  }, []);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setAvatar(base64);
        localStorage.setItem('avatar', base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const handleSave = async () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    user.username = username;
    localStorage.setItem('user', JSON.stringify(user));

    // Отправляем аватар на сервер
    const avatarBase64 = localStorage.getItem('avatar');
    if (avatarBase64 && token) {
      try {
        await axios.post(
          `${API_URL}/api/user/avatar`,
          { avatar: avatarBase64 },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        // Обновляем user в localStorage, чтобы Chat сразу подхватил аватар
        user.avatar = avatarBase64;
        localStorage.setItem('user', JSON.stringify(user));
      } catch (err) {
        console.error('Ошибка сохранения аватара:', err);
      }
    }
    alert('Настройки сохранены');
    navigate('/chat');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={styles.container}
    >
      <div style={styles.card}>
        <h2 style={styles.title}>⚙️ Настройки</h2>

        <div style={styles.avatarSection}>
          {avatar ? (
            <img src={avatar} alt="avatar" style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            <Avatar name={username} size={100} />
          )}
          <div>
            <input
              type="file"
              accept="image/*"
              id="avatarUpload"
              style={styles.fileInput}
              onChange={handleAvatarChange}
            />
            <label htmlFor="avatarUpload" style={styles.uploadButton}>
              Загрузить фото
            </label>
          </div>
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Имя пользователя</label>
          <input
            style={styles.input}
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
        </div>

        <div style={styles.themeToggle}>
          <span>Тема</span>
          <button style={styles.themeButton} onClick={toggleTheme}>
            {theme === 'light' ? '☀️ Светлая' : '🌙 Тёмная'}
          </button>
        </div>

        <div style={styles.buttonGroup}>
          <button style={styles.saveButton} onClick={handleSave}>
            Сохранить
          </button>
          <button style={styles.cancelButton} onClick={() => navigate('/chat')}>
            Отмена
          </button>
        </div>

        <button style={styles.logoutButton} onClick={handleLogout}>
          Выйти
        </button>
      </div>
    </motion.div>
  );
}