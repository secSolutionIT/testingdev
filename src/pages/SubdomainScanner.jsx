import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaGlobe, FaServer, FaClock, FaShieldAlt } from 'react-icons/fa';
import PQueue from 'p-queue';
import { scanSubdomains } from '../services/scanner';
import ResultsList from '../components/ResultsList';
import SearchForm from '../components/SearchForm';
import StatsCard from '../components/StatsCard';
import DNSResults from '../components/DNSResults';
import useAuthStore from '../store/authStore';
import useScanStore from '../store/scanStore';
import toast from 'react-hot-toast';

// Skeleton loader component
const SkeletonLoader = () => (
  <div className="animate-pulse space-y-4">
    <div className="h-12 bg-gray-200 rounded w-1/2"></div>
    <div className="h-4 bg-gray-200 rounded w-full"></div>
    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
  </div>
);

const checkSSLCertificate = async (subdomain) => {
  try {
    const response = await fetch(`https://api.ssllabs.com/api/v3/analyze?host=${subdomain}`);
    const data = await response.json();
    const tlsVersion = data.endpoints?.[0]?.protocol;
    const certificate = data.endpoints?.[0]?.details?.cert?.notAfter;

    return {
      subdomain,
      sslGrade: data.grade,
      status: data.status,
      tlsVersion: tlsVersion || 'Unknown',
      certificateExpiry: certificate || 'Unknown'
    };
  } catch (error) {
    console.error("SSL certificate check failed", error);
    return { subdomain, sslGrade: "Unknown", status: "Failed", tlsVersion: "Unknown", certificateExpiry: "Unknown" };
  }
};

const queue = new PQueue({ concurrency: 5 });

export default function SubdomainScanner() {
  const [domain, setDomain] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dnsRecords, setDNSRecords] = useState({});
  const [sslCertificates, setSSLCertificates] = useState([]);
  const { isAuthenticated, isPro, credits, updateCredits } = useAuthStore();
  const { addScan } = useScanStore();
  const [scanStats, setScanStats] = useState({
    totalScanned: 0,
    uniqueFound: 0,
    scanTime: 0,
    dnsRecords: 0
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!domain.trim()) return;

    if (!isAuthenticated) {
      toast.error('Please sign in to use the scanner');
      return;
    }

    if (!isPro && credits <= 0) {
      toast.error('No credits left. Please upgrade to Pro!');
      return;
    }

    setLoading(true);
    setError('');
    setResults([]);
    setDNSRecords({});
    setScanStats({ totalScanned: 0, uniqueFound: 0, scanTime: 0, dnsRecords: 0 });
    setSSLCertificates([]);

    const startTime = performance.now();

    try {
      const { subdomains, dnsRecords: records } = await scanSubdomains(domain, { deep: isPro });
      
      const sslInfoPromises = subdomains.map(subdomain => checkSSLCertificate(subdomain));
      const sslResults = await Promise.all(sslInfoPromises);

      const endTime = performance.now();
      const scanTime = ((endTime - startTime) / 1000).toFixed(2);

      setResults(subdomains);
      setDNSRecords(records);
      setSSLCertificates(sslResults);

      const stats = {
        totalScanned: subdomains.length * 5,
        uniqueFound: subdomains.length,
        scanTime,
        dnsRecords: Object.values(records || {}).flat().length
      };

      setScanStats(stats);

      addScan({
        type: 'subdomain',
        domain,
        results: subdomains,
        dnsRecords: records,
        sslInfo: sslResults,
        stats,
        isPro
      });

      if (!isPro) {
        updateCredits(credits - 1);
      }
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Professional Security Scanner
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Advanced security analysis platform with DNS enumeration and subdomain discovery
          </p>
        </motion.div>

        <SearchForm
          domain={domain}
          setDomain={setDomain}
          onSubmit={handleSubmit}
          loading={loading}
        />

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl"
          >
            <p className="font-medium">{error}</p>
          </motion.div>
        )}

        {loading ? (
          <div className="space-y-8">
            {/* Skeleton Loader for the whole scan block */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="h-32 bg-gray-200 rounded-lg p-4">
                  <SkeletonLoader />
                </div>
              ))}
            </div>

            {/* Skeleton Loader for Results */}
            <div className="space-y-6 mt-8">
              <SkeletonLoader />
              <SkeletonLoader />
              <SkeletonLoader />
            </div>
          </div>
        ) : (
          results.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-12 space-y-8"
            >
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                  title="Subdomains"
                  value={scanStats.uniqueFound}
                  description="Unique subdomains found"
                  icon={FaGlobe}
                />
                <StatsCard
                  title="DNS Records"
                  value={scanStats.dnsRecords}
                  description="Total DNS records found"
                  icon={FaServer}
                />
                <StatsCard
                  title="Processed"
                  value={scanStats.totalScanned}
                  description="Total records processed"
                  icon={FaShieldAlt}
                />
                <StatsCard
                  title="Scan Time"
                  value={`${scanStats.scanTime}s`}
                  description="Total scan duration"
                  icon={FaClock}
                />
              </div>

              {/* DNS Records and Scan Results */}
              <div className="space-y-8">
                {/* Subdomains List */}
                <ResultsList results={results} />

                {/* DNS Records and SSL Certificates */}
                <DNSResults 
                  records={dnsRecords}
                  sslCertificates={sslCertificates}
                  scanType={isPro ? 'Deep' : 'Basic'}
                  features={{
                    dns: true,
                    ssl: true,
                    config: isPro,
                    transparency: isPro,
                    links: isPro,
                    search: isPro,
                    reverse: isPro,
                    alteration: isPro,
                    cname: true
                  }}
                />
              </div>
            </motion.div>
          )
        )}
      </div>
    </div>
  );
}
