import React from 'react';
import { AdminPCData, Process } from '../types';

interface PCDetailsModalProps {
  pc: AdminPCData;
  onClose: () => void;
}

const PCDetailsModal: React.FC<PCDetailsModalProps> = ({ pc, onClose }) => {
  const formatTime = (totalSeconds: number | undefined): string => {
    if (totalSeconds === undefined || isNaN(totalSeconds) || totalSeconds < 0) return 'Н/Д';
    const hh = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    const mm = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    const ss = String(Math.floor(totalSeconds % 60)).padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-sky-800">{pc.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Закрыть"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mb-6 text-base">
            <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">ID:</span>
                <span className="font-semibold text-gray-800">{pc.id}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">IP-адрес:</span>
                <span className="font-semibold text-gray-800">{pc.ip}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Статус:</span>
                <span className={`font-semibold ${pc.status === 'Занят' ? 'text-amber-600' : 'text-green-600'}`}>{pc.status}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Пользователь:</span>
                <span className="font-semibold text-gray-800">{pc.user || 'Нет'}</span>
            </div>
             <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Нагрузка ЦП:</span>
                <span className="font-semibold text-gray-800">{pc.cpu}%</span>
            </div>
             <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Нагрузка RAM:</span>
                <span className="font-semibold text-gray-800">{pc.ram}%</span>
            </div>
             <div className="flex justify-between border-b pb-2 col-span-1 md:col-span-2">
                <span className="text-gray-600">Время сессии:</span>
                <span className="font-semibold text-gray-800">{formatTime(pc.session_seconds)}</span>
            </div>
        </div>

        <h3 className="text-xl font-bold text-sky-800 mb-4 mt-2">Активные процессы</h3>
        <div className="flex-grow overflow-y-auto pr-2 -mr-4" style={{ scrollbarGutter: 'stable' }}>
            {pc.processes && pc.processes.length > 0 ? (
                 <table className="w-full text-left text-sm">
                    <thead className="sticky top-0 bg-sky-50 z-10">
                        <tr>
                            <th className="p-2 font-semibold text-sky-700 rounded-l-lg">Имя процесса</th>
                            <th className="p-2 font-semibold text-sky-700 text-right">PID</th>
                            <th className="p-2 font-semibold text-sky-700 text-right">ЦП (%)</th>
                            <th className="p-2 font-semibold text-sky-700 text-right rounded-r-lg">RAM (%)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {pc.processes.sort((a,b) => b.cpu - a.cpu).map((process: Process) => (
                            <tr key={process.pid} className="hover:bg-sky-50">
                                <td className="p-2 text-gray-700 truncate max-w-xs">{process.name}</td>
                                <td className="p-2 text-gray-700 text-right font-mono">{process.pid}</td>
                                <td className="p-2 text-gray-700 text-right font-mono">{process.cpu.toFixed(2)}</td>
                                <td className="p-2 text-gray-700 text-right font-mono">{process.ram.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                 </table>
            ) : (
                <p className="text-center text-gray-500 py-6">Информация о процессах недоступна.</p>
            )}
        </div>
      </div>
    </div>
  );
};

export default PCDetailsModal;
