
import React from 'react';

interface ProgressBarProps {
  label: string;
  value: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ label, value }) => {
  const percentage = Math.max(0, Math.min(100, value));

  return (
    <div className="flex items-center gap-4 w-full">
      <span className="w-24 text-lg text-gray-700 font-medium">{label}</span>
      <div className="flex-grow bg-[#E0F2FE] rounded-full h-6 overflow-hidden">
        <div
          className="bg-[#A5D8FA] h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="w-16 text-lg font-semibold text-gray-800 text-right">{percentage}%</span>
    </div>
  );
};

export default ProgressBar;
