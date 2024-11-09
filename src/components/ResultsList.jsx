import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaCopy, FaCheck, FaExternalLinkAlt } from 'react-icons/fa';
import useAuthStore from '../store/authStore';

export default function ResultsList({ results = [] }) {
  const [copiedIndex, setCopiedIndex] = useState(null);
  const { isPro } = useAuthStore();
  const visibleResults = results.slice(0, isPro ? results.length : 5);
  const hasHiddenResults = results.length > visibleResults.length;

  const copyToClipboard = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (!results || results.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Discovered Subdomains
          <span className="text-sm font-normal text-gray-500 ml-2">
            ({results.length} total)
          </span>
        </h2>
      </div>

      <div className="space-y-2">
        {visibleResults.map((subdomain, index) => (
          <motion.div
            key={subdomain}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <span className="font-mono text-gray-700">{subdomain}</span>
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => copyToClipboard(subdomain, index)}
                className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                title="Copy to clipboard"
              >
                {copiedIndex === index ? (
                  <FaCheck className="w-4 h-4 text-green-500" />
                ) : (
                  <FaCopy className="w-4 h-4" />
                )}
              </button>
              <a
                href={`https://${subdomain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                title="Open in new tab"
              >
                <FaExternalLinkAlt className="w-4 h-4" />
              </a>
            </div>
          </motion.div>
        ))}
      </div>

      {hasHiddenResults && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-blue-600 text-center">
            {results.length - visibleResults.length} more subdomains available in Pro version
          </p>
        </div>
      )}
    </div>
  );
}