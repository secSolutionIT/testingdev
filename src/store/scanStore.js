import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useScanStore = create(
  persist(
    (set, get) => ({
      scanHistory: [],
      addScan: (scan) => set((state) => ({
        scanHistory: [
          {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            ...scan
          },
          ...state.scanHistory
        ].slice(0, 100) // Keep last 100 scans
      })),
      removeScan: (scanId) => set((state) => ({
        scanHistory: state.scanHistory.filter((scan) => scan.id !== scanId)
      })),
      clearHistory: () => set({ scanHistory: [] }),
      getScansByType: (type) => get().scanHistory.filter((scan) => scan.type === type),
      getRecentScans: (limit = 10) => get().scanHistory.slice(0, limit)
    }),
    {
      name: 'scan-history',
    }
  )
);

export default useScanStore;