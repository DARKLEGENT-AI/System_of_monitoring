import React, { useState, useEffect } from 'react';
import { AdminPCSummaryData, AdminPCData } from '../types';
import { fetchPCDetails } from '../services/api';
import AdminProgressBar from './AdminProgressBar';

interface PCStatusCardProps {
  pcSummary: AdminPCSummaryData;
  onShowDetails: (pc: AdminPCData) => void;
}

const PCStatusCard: React.FC<PCStatusCardProps> = ({ pcSummary, onShowDetails }) => {
  const [details, setDetails] = useState<AdminPCData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDetails = async () => {
      try {
        const data = await fetchPCDetails(pcSummary.id);
        setDetails(data);
        setError(null);
      } catch (e) {
        setError('Не удалось загрузить детали.');
        console.error(e);
      }
    };

    // Initial load with skeleton
    loadDetails().finally(() => setIsLoading(false));

    // Set up interval for background refresh
    const intervalId = setInterval(loadDetails, 5000);

    return () => clearInterval(intervalId);
  }, [pcSummary.id]);


  const handleDetailsClick = () => {
    if (details) {
      onShowDetails(details);
    }
  };

  const statusColor = pcSummary.status === 'Занят' ? 'bg-amber-100 border-amber-300' : 'bg-green-100 border-green-300';
  const statusTextColor = pcSummary.status === 'Занят' ? 'text-amber-800' : 'text-green-800';

  return (
    <div className={`bg-white rounded-xl shadow-md p-4 flex flex-col justify-between border-l-4 ${pcSummary.status === 'Занят' ? 'border-amber-400' : 'border-green-400'}`}>
      <div>
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-lg text-sky-900">{pcSummary.name}</h3>
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColor} ${statusTextColor}`}>{pcSummary.status}</span>
        </div>
        <p className="text-sm text-gray-500 mb-4">ID: {pcSummary.id}</p>
        
        {isLoading && (
          <div className="space-y-3 mt-2 animate-pulse">
             <div className="h-4 bg-gray-200 rounded w-5/6"></div>
             <div className="h-4 bg-gray-200 rounded w-4/6"></div>
             <div className="pt-2 space-y-3">
                <div className="h-2.5 bg-gray-200 rounded-full w-full"></div>
                <div className="h-2.5 bg-gray-200 rounded-full w-full"></div>
             </div>
          </div>
        )}
        {error && !isLoading && <p className="text-red-500 text-sm mt-2">{error}</p>}
        {details && !isLoading && (
          <div className="space-y-2 text-sm">
             <p className="text-gray-600"><span className="font-semibold">Пользователь:</span> {details.user || 'Нет'}</p>
             <div className="pt-2 space-y-2">
                <AdminProgressBar label="ЦП" value={details.cpu} />
                <AdminProgressBar label="RAM" value={details.ram} />
             </div>
          </div>
        )}
      </div>
      <div className="mt-4 flex justify-end">
        <button
          onClick={handleDetailsClick}
          disabled={!details || isLoading}
          className="bg-sky-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-sky-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Подробнее
        </button>
      </div>
    </div>
  );
};

export default PCStatusCard;