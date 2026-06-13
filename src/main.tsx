import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import axios from 'axios';
import './index.css';

const Login = lazy(() => import('./components/Login'));
const Register = lazy(() => import('./components/Register'));
const Chat = lazy(() => import('./components/Chat'));
const Settings = lazy(() => import('./components/Settings'));

function ChannelRedirect() {
  const { id } = useParams();
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" />;

  React.useEffect(() => {
    if (token && id) {
      axios.post(`${import.meta.env.VITE_API_URL}/api/channels/${id}/subscribe`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(() => {
        window.location.hash = `#/chat?channel=${id}`;
      }).catch(console.error);
    }
  }, [id, token]);

  return <div className="loading-screen">Подписываемся...</div>;
}

function App() {
  const token = localStorage.getItem('token');
  return (
    <HashRouter>
      <Suspense fallback={<div className="loading-screen">Загрузка...</div>}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/chat" element={token ? <Chat /> : <Navigate to="/login" />} />
          <Route path="/settings" element={token ? <Settings /> : <Navigate to="/login" />} />
          <Route path="/channel/:id" element={<ChannelRedirect />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Suspense>
    </HashRouter>
  );
}

const savedTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);