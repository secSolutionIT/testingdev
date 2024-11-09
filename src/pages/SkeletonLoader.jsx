import React from 'react';

const SkeletonLoader = () => {
  return (
    <div className="animate-pulse space-y-4">
      {/* Skeleton for subdomains */}
      <div className="h-12 bg-gray-200 rounded w-1/2"></div>
      <div className="h-12 bg-gray-200 rounded w-1/3"></div>
      <div className="h-12 bg-gray-200 rounded w-2/3"></div>
    </div>
  );
};

export default SkeletonLoader;
