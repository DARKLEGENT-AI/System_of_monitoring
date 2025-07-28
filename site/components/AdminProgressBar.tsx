
import React from 'react';

interface AdminProgressBarProps {
  label: string;
  value: number;
}

const AdminProgressBar: React.FC<AdminProgressBarProps> = ({ label, value }) => {
  const percentage = Math.max(0, Math.min(100, value));

  return (
    <div className="flex items-center gap-3">
      <span className="w-8 text-sm text-gray-500 font-medium">{label}</span>
      <div className="flex-grow bg-gray-200 rounded-full h-[7px]">
        <div
          className="bg-sky-400 h-[7px] rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${label} usage`}
        />
      </div>
      <span className="w-10 text-sm font-medium text-gray-700 text-right">{percentage}%</span>
    </div>
  );
};

export default AdminProgressBar;
