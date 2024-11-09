import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaCopy, FaCheck, FaShieldAlt, FaLock, FaGlobe, FaServer, FaSearch, FaLink } from 'react-icons/fa';
import useAuthStore from '../store/authStore';

const recordTypes = [
  { type: 'NS', title: 'Nameservers', icon: FaServer, description: 'DNS Nameserver records' },
  { type: 'MX', title: 'Mail Servers', icon: FaServer, description: 'Mail exchanger records' },
  { type: 'TXT', title: 'Text Records', icon: FaShieldAlt, description: 'Text records including SPF and DKIM' },
  { type: 'A', title: 'IPv4 Addresses', icon: FaGlobe, description: 'IPv4 address records' },
  { type: 'AAAA', title: 'IPv6 Addresses', icon: FaGlobe, description: 'IPv6 address records' },
  { type: 'CNAME', title: 'Canonical Names', icon: FaLink, description: 'Canonical name records' },
  { type: 'AXFR', title: 'Zone Transfer', icon: FaServer, description: 'DNS zone transfer records' }
];

const scanTypes = [
  { title: 'DNS Enumeration', icon: FaServer, description: 'Advanced DNS record discovery' },
  { title: 'External APIs', icon: FaGlobe, description: 'Third-party intelligence sources' },
  { title: 'SSL Certificates', icon: FaLock, description: 'SSL/TLS certificate analysis' },
  { title: 'Configuration Issues', icon: FaShieldAlt, description: 'Security configuration analysis', pro: true },
  { title: 'Certificate Transparency', icon: FaLock, description: 'Certificate transparency logs', pro: true },
  { title: 'HTML Links', icon: FaLink, description: 'Web crawling and link analysis', pro: true },
  { title: 'Search Engine Discovery', icon: FaSearch, description: 'Google and Bing search results', pro: true },
  { title: 'Reverse DNS', icon: FaServer, description: 'Reverse DNS enumeration', pro: true },
  { title: 'Alteration Search', icon: FaSearch, description: 'Domain alteration patterns', pro: true },
  { title: 'CNAME Chain', icon: FaLink, description: 'CNAME record chain analysis', pro: true }
];

export default function DNSResults({ records = {}, sslInfo = [], deepScanResults = null }) {
  const [copiedIndex, setCopiedIndex] = useState(null);
  const { isPro } = useAuthStore();

  const copyToClipboard = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Scan Parameters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
      >
        <div className="flex items-center gap-3 mb-6">
          <FaSearch className="w-6 h-6 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Scan Parameters</h2>
            <p className="text-gray-600">Current scan configuration and settings</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {scanTypes.map((scan) => (
            <div
              key={scan.title}
              className={`p-4 rounded-lg ${
                scan.pro && !isPro
                  ? 'bg-gray-50 opacity-60'
                  : 'bg-blue-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <scan.icon className={`w-5 h-5 ${
                  scan.pro && !isPro ? 'text-gray-400' : 'text-blue-600'
                }`} />
                <div>
                  <p className={`font-medium ${
                    scan.pro && !isPro ? 'text-gray-400' : 'text-gray-900'
                  }`}>
                    {scan.title}
                  </p>
                  <p className={`text-sm ${
                    scan.pro && !isPro ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {scan.pro && !isPro ? 'Pro Feature' : scan.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* DNS Records Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
      >
        <div className="flex items-center gap-3 mb-6">
          <FaServer className="w-6 h-6 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-800">DNS Records</h2>
            <p className="text-gray-600">Comprehensive DNS record analysis</p>
          </div>
        </div>

        <div className="grid gap-6">
          {recordTypes.map(({ type, title, icon: Icon, description }) => (
            records[type]?.length > 0 && (
              <motion.div
                key={type}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <Icon className="w-5 h-5 text-blue-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
                    <p className="text-sm text-gray-600">{description}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  {records[type].map((record, index) => (
                    <div
                      key={index}
                      className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all flex items-center justify-between"
                    >
                      <div>
                        <span className="font-mono text-gray-700">{record.data}</span>
                        <div className="text-sm text-gray-500 mt-1">
                          TTL: {record.TTL}s | Priority: {record.priority || 'N/A'}
                        </div>
                      </div>
                      <button
                        onClick={() => copyToClipboard(record.data, `${type}-${index}`)}
                        className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                      >
                        {copiedIndex === `${type}-${index}` ? (
                          <FaCheck className="w-4 h-4 text-green-500" />
                        ) : (
                          <FaCopy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )
          ))}
        </div>
      </motion.div>

      {/* SSL Certificates Section */}
      {sslInfo?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
        >
          <div className="flex items-center gap-3 mb-6">
            <FaLock className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-800">SSL Certificates</h2>
              <p className="text-gray-600">SSL/TLS certificate analysis</p>
            </div>
          </div>

          <div className="space-y-4">
            {sslInfo.map((cert, index) => (
              <div
                key={index}
                className="p-4 bg-gray-50 rounded-lg"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Issuer</p>
                    <p className="font-mono text-gray-700">{cert.issuer}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Valid Until</p>
                    <p className="font-mono text-gray-700">
                      {new Date(cert.notAfter).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-sm font-medium text-gray-500">Subject Alternative Names</p>
                  <div className="mt-1 space-y-1">
                    {cert.dnsNames.map((name, idx) => (
                      <p key={idx} className="font-mono text-sm text-gray-700">{name}</p>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Pro Features Section */}
      {!isPro && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100"
        >
          <div className="flex items-center gap-3 mb-6">
            <FaShieldAlt className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-800">Pro Features Available</h2>
              <p className="text-gray-600">Unlock advanced security analysis tools</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {scanTypes.filter(scan => scan.pro).map((feature, index) => (
              <div
                key={index}
                className="p-4 bg-white/50 rounded-lg backdrop-blur-sm border border-blue-100"
              >
                <div className="flex items-center gap-3">
                  <feature.icon className="w-5 h-5 text-blue-600" />
                  <div>
                    <h3 className="font-medium text-gray-900">{feature.title}</h3>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}