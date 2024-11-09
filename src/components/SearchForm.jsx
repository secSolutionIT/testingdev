import React from 'react';
import { motion } from 'framer-motion';
import { FaSearch, FaSpinner } from 'react-icons/fa';

export default function SearchForm({ domain, setDomain, onSubmit, loading }) {
  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={onSubmit}
      className="max-w-3xl mx-auto"
    >
      <div className="relative">
        <input
          type="text"
          value={domain}
          onChange={(e) => setDomain(e.target.value.toLowerCase())}
          placeholder="Enter domain to analyze (e.g., example.com)"
          className="w-full px-6 py-4 text-lg bg-white rounded-full border border-gray-300 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading}
          className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-all duration-200 flex items-center gap-2"
        >
          {loading ? (
            <>
              <FaSpinner className="w-5 h-5 animate-spin" />
              <span>Scanning...</span>
            </>
          ) : (
            <>
              <FaSearch className="w-5 h-5" />
              <span>Analyze</span>
            </>
          )}
        </button>
      </div>
    </motion.form>
  );
}