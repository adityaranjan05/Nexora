import React from 'react';

export const SkeletonLoader = ({ rows = 4 }) => {
  return (
    <div className="w-full space-y-3 p-4 bg-[#151618] rounded-xl border border-[#232427]">
      {Array.from({ length: rows }).map((_, idx) => (
        <div key={idx} className="flex items-center space-x-4 animate-pulse">
          <div className="h-4 bg-[#1F2023] rounded w-1/4"></div>
          <div className="h-4 bg-[#1F2023] rounded w-1/3"></div>
          <div className="h-4 bg-[#1F2023] rounded w-1/6"></div>
          <div className="h-4 bg-[#1F2023] rounded w-1/5"></div>
        </div>
      ))}
    </div>
  );
};

export default SkeletonLoader;
