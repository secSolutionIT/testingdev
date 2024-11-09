import React from 'react';
import { motion } from 'framer-motion';
import { FaGlobe, FaNetworkWired, FaClock, FaTrash } from 'react-icons/fa';
import useScanStore from '../store/scanStore';

export default function RecentScans() {
  const { scanHistory, removeScan } = useScanStore();

  const getScanIcon = (type) => {
    switch (type) {
      case 'subdomain':
        return FaGlobe;
      case 'network':
        return FaNetworkWired;
      default:
        return FaGlobe;
    }
  };

  const getScanSummary = (scan) => {
    switch (scan.type) {
      case 'subdomain':
        return `Found ${scan.results.length} subdomains`;
      case 'network':
        return `Found ${scan.results.length} open ports`;
      default:
        return 'Scan completed';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Scans</h2>
      
      {scanHistory.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No scans performed yet</p>
      ) : (
        <div className="space-y-4">
          {scanHistory.map((scan) => {
            const Icon = getScanIcon(scan.type);
            
            return (
              <motion.div
                key={scan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {scan.type === 'subdomain' ? scan.domain : scan.target}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <FaClock className="w-4 h-4" />
                        <span>{formatDate(scan.timestamp)}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {getScanSummary(scan)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeScan(scan.id)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    title="Remove scan"
                  >
                    <FaTrash className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}