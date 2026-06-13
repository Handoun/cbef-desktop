import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense, useEffect, useState } from 'react';

const Login = lazy(() => import('./components/Login'));
const Register = lazy(() => import('./components/Register'));
const Chat = lazy(() => import('./components/Chat'));
const Settings = lazy(() => import('./components/Settings'));

function App() {
  const [isAuth, setIsAuth] = useState<boolean>(() => !!localStorage.getItem('token'));

  useEffect(() => {
    const handleStorage = () => setIsAuth(!!localStorage.getItem('token'));
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return (
    <HashRouter>
      <Suspense fallback={<div className="loading-screen">Загрузка...</div>}>
        <Routes>
          <Route path="/login" element={<Login onLogin={() => setIsAuth(true)} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/chat" element={isAuth ? <Chat /> : <Navigate to="/login" replace />} />
          <Route path="/settings" element={isAuth ? <Settings /> : <Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    </HashRouter>
  );
}

export default App;