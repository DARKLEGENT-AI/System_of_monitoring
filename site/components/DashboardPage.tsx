import React, { useState, useEffect, useCallback } from 'react';
import { fetchSystemData } from '../services/api';
import { SystemData } from '../types';
import ProgressBar from './ProgressBar';

interface DashboardPageProps {
  username: string;
  onLogout: () => void;
}

const formatTime = (totalSeconds: number): string => {
  if (isNaN(totalSeconds) || totalSeconds < 0) return '00:00:00';
  const hh = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const mm = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const ss = String(Math.floor(totalSeconds % 60)).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
};

const DashboardPage: React.FC<DashboardPageProps> = ({ username, onLogout }) => {
  const [stats, setStats] = useState<SystemData | null>(null);
  const [sessionTime, setSessionTime] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Effect for fetching data periodically
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchSystemData(username);
        setStats(data);
        // Always sync session time with the server's response
        setSessionTime(data.session_seconds);
        setError(null);
      } catch (err) {
        console.error("Failed to load system data", err);
        setError("Не удалось загрузить данные о системе.");
      }
    };

    loadData();
    const dataInterval = setInterval(loadData, 5000);

    return () => {
      clearInterval(dataInterval);
    };
  }, [username]);

  // Effect for ticking the session timer every second
  useEffect(() => {
    if (stats) { // Only run timer if we have data
      const timerInterval = setInterval(() => {
        setSessionTime(prevTime => prevTime + 1);
      }, 1000);
      return () => clearInterval(timerInterval);
    }
  }, [stats]);
  
  if (error && !stats) {
    return (
        <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-4xl text-center">
            <header className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-2 border border-blue-200 rounded-md py-1 px-3">
                    <span className="text-sm text-gray-500">Имя:</span>
                    <span className="font-mono text-blue-700">{username}</span>
                </div>
                <button 
                    onClick={onLogout}
                    className="bg-[#F57A57] text-white font-bold py-2 px-6 rounded-md hover:bg-[#e46a46] transition-colors"
                >
                    Выйти
                </button>
            </header>
            <p className="text-xl text-red-500 py-10">{error}</p>
        </div>
    );
  }

  if (!stats) {
    return (
        <div className="text-center p-10">
            <p className="text-xl text-gray-600">Загрузка данных...</p>
        </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-4xl">
      <header className="flex justify-between items-center mb-10">
        <div className="flex items-center gap-2 border border-blue-200 rounded-md py-1 px-3">
            <span className="text-sm text-gray-500">Имя:</span>
            <span className="font-mono text-blue-700">{username}</span>
        </div>
        <button 
            onClick={onLogout}
            className="bg-[#F57A57] text-white font-bold py-2 px-6 rounded-md hover:bg-[#e46a46] transition-colors"
        >
            Выйти
        </button>
      </header>

      <main>
        <h1 className="text-3xl font-bold text-[#003B73] mb-8">Состояние системы</h1>
        {error && <p className="text-red-500 text-center mb-4 bg-red-100 p-3 rounded-lg">{error} Показываются последние известные данные.</p>}
        <div className="space-y-6">
          <ProgressBar label="ЦП" value={stats.cpu} />
          <ProgressBar label="Память" value={stats.ram} />
        </div>
        
        <div className="mt-12 pt-6 border-t border-gray-200 flex items-center justify-between">
            <p className="text-gray-600 text-lg">Длительность текущей сессии</p>
            <p className="font-mono text-xl text-gray-800 tracking-wider">{formatTime(sessionTime)}</p>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
