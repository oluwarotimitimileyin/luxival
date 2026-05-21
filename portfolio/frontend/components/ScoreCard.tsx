import React from 'react';

interface ScoreCardProps {
  title: string;
  score: number;
}

export const ScoreCard: React.FC<ScoreCardProps> = ({ title, score }) => {
  return (
    <div className="border-2 border-black dark:border-white p-6 flex flex-col justify-between bg-white dark:bg-black transition-colors hover:bg-gray-100 dark:hover:bg-neutral-900">
      <div className="flex justify-between items-start mb-8">
        <h3 className="text-black dark:text-white font-mono text-sm uppercase tracking-widest font-bold">
          [{title}]
        </h3>
        <div className="w-3 h-3 bg-black dark:bg-white"></div>
      </div>
      <div className="text-6xl font-mono font-black text-black dark:text-white tracking-tighter">
        {score.toString().padStart(3, '0')}
      </div>
    </div>
  );
};
