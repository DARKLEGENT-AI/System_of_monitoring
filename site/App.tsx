
import React, { useState, useEffect, useCallback } from 'react';
import LoginPage from './components/LoginPage';
import DashboardPage from './components/DashboardPage';
import AdminDashboardPage from './components/AdminDashboardPage';
import { loginUser } from './services/api';
import { LoginResponse } from './types';

const App: React.FC = () => {
  const [session, setSession] = useState<LoginResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    try {
      const storedSession = localStorage.getItem('session');
      if (storedSession) {
        setSession(JSON.parse(storedSession));
      }
    } catch (e) {
      console.error("Could not parse session from localStorage", e);
      localStorage.removeItem('session');
    }
    setLoading(false);
  }, []);

  const handleLogin = useCallback(async (login: string, pass: string) => {
    setError(null);
    try {
      const loginResult = await loginUser(login, pass);
      if (loginResult) {
        localStorage.setItem('session', JSON.stringify(loginResult));
        setSession(loginResult);
      } else {
        setError('Неверный логин или пароль');
      }
    } catch (err) {
      setError('Ошибка входа. Попробуйте снова.');
    }
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('session');
    setSession(null);
  }, []);

  if (loading) {
    return <div className="h-screen w-screen flex items-center justify-center bg-sky-50"></div>;
  }
  
  const renderPage = () => {
    if (!session) {
      return <LoginPage onLogin={handleLogin} error={error} />;
    }
    switch (session.role) {
      case 'admin':
        return <AdminDashboardPage username={session.login} onLogout={handleLogout} />;
      case 'user':
        return <DashboardPage username={session.login} onLogout={handleLogout} />;
      default:
        // Log out user with unknown role
        handleLogout();
        return <LoginPage onLogin={handleLogin} error={"Неизвестная роль пользователя."} />;
    }
  };

  return (
    <div className="min-h-screen bg-sky-50 flex items-start justify-center p-4 sm:p-6 lg:p-8">
      {renderPage()}
    </div>
  );
};

export default App;
