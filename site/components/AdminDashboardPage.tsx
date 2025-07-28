import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { fetchAdminPCs } from '../services/api';
import { AdminPCSummaryData, AdminPCData } from '../types';
import PCStatusCard from './PCStatusCard';
import AddPCModal from './AddPCModal';
import PCDetailsModal from './PCDetailsModal';

interface AdminDashboardPageProps {
  username: string;
  onLogout: () => void;
}

const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ username, onLogout }) => {
  const [pcs, setPcs] = useState<AdminPCSummaryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Все' | 'Занят' | 'Свободен'>('Все');
  const [selectedPc, setSelectedPc] = useState<AdminPCData | null>(null);

  const loadPcs = useCallback(async () => {
    try {
      const data = await fetchAdminPCs();
      setPcs(data);
      setError(null);
    } catch (err) {
      setError('Не удалось загрузить данные о ПК.');
      console.error(err);
    }
  }, []);

  useEffect(() => {
    // Initial load with loading indicator
    loadPcs().finally(() => setLoading(false));

    // Set up polling for background updates
    const intervalId = setInterval(loadPcs, 5000);

    return () => clearInterval(intervalId);
  }, [loadPcs]);

  const handlePCAdded = () => {
    setIsModalOpen(false);
    setLoading(true); 
    loadPcs().finally(() => setLoading(false));
  };
  
  const handleShowDetails = (pc: AdminPCData) => {
    setSelectedPc(pc);
  };

  const handleCloseDetails = () => {
    setSelectedPc(null);
  };

  const filteredPcs = useMemo(() => {
    return pcs.filter(pc => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = String(pc.id).toLowerCase().includes(searchLower) || pc.name.toLowerCase().includes(searchLower);
      const matchesStatus = statusFilter === 'Все' || pc.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [pcs, searchQuery, statusFilter]);

  return (
    <div className="w-full max-w-screen-xl mx-auto">
        <header className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 w-full">
            <div className="flex items-center gap-2 border border-blue-200 rounded-md py-1 px-3 bg-white shadow-sm">
                <span className="text-sm text-gray-500">Имя:</span>
                <span className="font-semibold text-sky-800">{username}</span>
            </div>
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-[#D3E9FA] text-[#005A9C] font-bold py-2 px-5 rounded-lg hover:bg-sky-200 transition-colors shadow-sm border border-sky-300">
                    Добавить ПК
                </button>
                 <button 
                    onClick={onLogout}
                    className="bg-[#F57A57] text-white font-bold py-2 px-5 rounded-lg hover:bg-[#e46a46] transition-colors shadow-sm"
                >
                    Выйти
                </button>
            </div>
        </header>
        
        <div className="mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col sm:flex-row items-center gap-4">
            <div className="w-full sm:flex-1">
                 <input
                    type="text"
                    placeholder="Поиск по ID или имени..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 bg-sky-50 border border-sky-300 rounded-lg text-sky-800 placeholder:text-sky-600/70 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    aria-label="Поиск компьютеров"
                />
            </div>
            <div className="w-full sm:w-auto">
                 <label htmlFor="status-filter" className="sr-only">Фильтр по статусу</label>
                 <select
                    id="status-filter"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as 'Все' | 'Занят' | 'Свободен')}
                    className="w-full sm:w-48 px-4 py-2 bg-sky-50 border border-sky-300 rounded-lg text-sky-800 focus:outline-none focus:ring-2 focus:ring-sky-500 appearance-none cursor-pointer"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%230c4a6e' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                >
                    <option value="Все">Все статусы</option>
                    <option value="Занят">Занят</option>
                    <option value="Свободен">Свободен</option>
                </select>
            </div>
        </div>

        {loading && <div className="text-center p-10"><p className="text-xl text-gray-600">Загрузка данных...</p></div>}
        {error && <div className="text-center p-10"><p className="text-xl text-red-600">{error}</p></div>}

        {!loading && !error && (
        <main>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                {filteredPcs.map((pc) => (
                   <PCStatusCard key={pc.id} pcSummary={pc} onShowDetails={handleShowDetails} />
                ))}
                 {filteredPcs.length === 0 && (
                    <div className="col-span-full text-center py-12">
                        <p className="text-lg text-gray-500">Компьютеры с заданными параметрами не найдены.</p>
                    </div>
                )}
            </div>
        </main>
        )}
        {isModalOpen && <AddPCModal onClose={() => setIsModalOpen(false)} onPCAdded={handlePCAdded} />}
        {selectedPc && <PCDetailsModal pc={selectedPc} onClose={handleCloseDetails} />}
    </div>
  );
};

export default AdminDashboardPage;