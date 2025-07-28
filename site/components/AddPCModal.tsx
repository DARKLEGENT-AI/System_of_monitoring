import React, { useState } from 'react';
import { addPC } from '../services/api';

interface AddPCModalProps {
  onClose: () => void;
  onPCAdded: () => void;
}

const AddPCModal: React.FC<AddPCModalProps> = ({ onClose, onPCAdded }) => {
  const [pcId, setPcId] = useState('');
  const [pcName, setPcName] = useState('');
  const [ip, setIp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pcId) return; // Should not happen with required attribute, but good practice
    setError(null);
    setLoading(true);
    try {
      await addPC({ pc_id: parseInt(pcId, 10), pc_name: pcName, ip });
      onPCAdded();
    } catch (err: any) {
      setError(err.message || 'Произошла неизвестная ошибка');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4"
        onClick={onClose}
        aria-modal="true"
        role="dialog"
    >
      <div 
        className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md"
        onClick={e => e.stopPropagation()} // Prevent closing modal when clicking inside
      >
        <h2 className="text-2xl font-bold text-sky-800 mb-6 text-center">Добавить новый ПК</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="pcId" className="block text-sm font-medium text-gray-700 mb-1">ID ПК</label>
            <input
              type="number"
              id="pcId"
              value={pcId}
              onChange={(e) => setPcId(e.target.value)}
              placeholder="например, 5"
              required
              className="w-full px-4 py-2 bg-sky-50 border border-sky-300 rounded-lg text-sky-800 placeholder:text-sky-600/70 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="pcName" className="block text-sm font-medium text-gray-700 mb-1">Сетевое имя</label>
            <input
              type="text"
              id="pcName"
              value={pcName}
              onChange={(e) => setPcName(e.target.value)}
              placeholder="например, WS-202"
              required
              className="w-full px-4 py-2 bg-sky-50 border border-sky-300 rounded-lg text-sky-800 placeholder:text-sky-600/70 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <div className="mb-6">
            <label htmlFor="ip" className="block text-sm font-medium text-gray-700 mb-1">IP-адрес</label>
            <input
              type="text"
              id="ip"
              value={ip}
              onChange={(e) => setIp(e.target.value)}
              placeholder="например, 192.168.1.55"
              required
              pattern="^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$"
              title="Введите корректный IP-адрес"
              className="w-full px-4 py-2 bg-sky-50 border border-sky-300 rounded-lg text-sky-800 placeholder:text-sky-600/70 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
          
          {error && <p className="text-red-500 text-center mb-4 bg-red-100 p-3 rounded-lg">{error}</p>}
          
          <div className="flex justify-end gap-4 mt-8">
            <button
                type="button"
                onClick={onClose}
                className="py-2 px-6 rounded-lg text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors font-semibold"
            >
                Отмена
            </button>
            <button
                type="submit"
                disabled={loading || !pcId || !pcName || !ip}
                className="py-2 px-6 rounded-lg bg-sky-600 text-white font-semibold hover:bg-sky-700 transition-colors disabled:bg-sky-300 disabled:cursor-not-allowed"
            >
                {loading ? 'Проверка...' : 'Добавить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPCModal;