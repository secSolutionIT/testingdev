import axios from 'axios';

// API Configuration with Vite environment variables
const API_KEYS = {
  securityTrails: import.meta.env.VITE_SECURITYTRAILS_API_KEY || 'demo',
  urlscan: import.meta.env.VITE_URLSCAN_API_KEY || 'demo',
  threatCrowd: import.meta.env.VITE_THREATCROWD_API_KEY || 'demo'
};

// Create axios instance with default config
const api = axios.create({
  timeout: 30000,
  headers: {
    'Accept': 'application/json',
    'User-Agent': 'HawkScan/1.0'
  }
});

// Scanner engines with proper error handling
const scanners = {
  // Certificate Transparency logs
  async scanCrtSh(domain) {
    try {
      const response = await axios.get(`https://crt.sh/?q=%25.${domain}&output=json`, {
        timeout: 10000,
        headers: {
          'Accept': 'application/json'
        }
      });
      return new Set(response.data.map(entry => entry.name_value.toLowerCase()));
    } catch (error) {
      console.warn('crt.sh scan failed:', error.message);
      return new Set();
    }
  },

  // DNS enumeration
  async scanDNS(domain) {
    try {
      const records = ['A', 'AAAA', 'CNAME', 'MX', 'NS', 'TXT'];
      const results = await Promise.all(
        records.map(type =>
          axios.get(`https://dns.google/resolve?name=${domain}&type=${type}`, {
            timeout: 5000
          })
        )
      );

      const dnsRecords = {};
      const subdomains = new Set();

      results.forEach((response, index) => {
        const type = records[index];
        if (response.data.Answer) {
          dnsRecords[type] = response.data.Answer.map(record => ({
            data: record.data,
            TTL: record.TTL,
            type: record.type
          }));

          response.data.Answer.forEach(record => {
            if (record.name.endsWith(domain)) {
              subdomains.add(record.name.toLowerCase());
            }
          });
        }
      });

      return { records: dnsRecords, subdomains };
    } catch (error) {
      console.warn('DNS scan failed:', error.message);
      return { records: {}, subdomains: new Set() };
    }
  },

  // SecurityTrails API
  async scanSecurityTrails(domain) {
    if (!API_KEYS.securityTrails || API_KEYS.securityTrails === 'demo') {
      console.warn('SecurityTrails API key not configured');
      return new Set();
    }

    try {
      const response = await axios.get(
        `https://api.securitytrails.com/v1/domain/${domain}/subdomains`,
        {
          headers: {
            'apikey': API_KEYS.securityTrails
          },
          timeout: 10000
        }
      );
      return new Set(response.data.subdomains.map(sub => `${sub}.${domain}`));
    } catch (error) {
      console.warn('SecurityTrails scan failed:', error.message);
      return new Set();
    }
  },

  // URLScan.io
  async scanUrlscan(domain) {
    try {
      const headers = API_KEYS.urlscan !== 'demo' ? 
        { 'API-Key': API_KEYS.urlscan } : {};

      const response = await axios.get(
        `https://urlscan.io/api/v1/search/?q=domain:${domain}`,
        {
          headers,
          timeout: 10000
        }
      );

      return new Set(
        response.data.results
          .filter(result => result.page?.domain)
          .map(result => result.page.domain.toLowerCase())
          .filter(subdomain => subdomain.endsWith(domain))
      );
    } catch (error) {
      console.warn('Urlscan scan failed:', error.message);
      return new Set();
    }
  },

  // ThreatCrowd
  async scanThreatCrowd(domain) {
    try {
      const response = await axios.get(
        `https://www.threatcrowd.org/searchApi/v2/domain/report/?domain=${domain}`,
        { timeout: 10000 }
      );

      if (!response.data.subdomains) {
        return new Set();
      }

      return new Set(
        response.data.subdomains
          .map(subdomain => subdomain.toLowerCase())
          .filter(subdomain => subdomain.endsWith(domain))
      );
    } catch (error) {
      console.warn('ThreatCrowd scan failed:', error.message);
      return new Set();
    }
  },

  // AlienVault OTX
  async scanAlienVault(domain) {
    try {
      const response = await axios.get(
        `https://otx.alienvault.com/api/v1/indicators/domain/${domain}/passive_dns`,
        { timeout: 10000 }
      );

      return new Set(
        response.data.passive_dns
          .map(entry => entry.hostname.toLowerCase())
          .filter(hostname => hostname.endsWith(domain))
      );
    } catch (error) {
      console.warn('AlienVault scan failed:', error.message);
      return new Set();
    }
  }
};

// Main scanning function
export async function scanSubdomains(domain, options = { deep: false }) {
  if (!domain) {
    throw new Error('Please provide a valid domain');
  }

  if (!domain.match(/^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/)) {
    throw new Error('Please provide a valid domain name (e.g., example.com)');
  }

  // Basic scanners that don't require API keys
  const basicScanners = [
    scanners.scanCrtSh(domain),
    scanners.scanDNS(domain),
    scanners.scanAlienVault(domain)
  ];

  // Add URLScan if API key is available
  if (API_KEYS.urlscan !== 'demo') {
    basicScanners.push(scanners.scanUrlscan(domain));
  }

  // Deep scan scanners that require API keys
  const deepScanners = options.deep ? [
    API_KEYS.securityTrails !== 'demo' ? scanners.scanSecurityTrails(domain) : null,
    scanners.scanThreatCrowd(domain)
  ].filter(Boolean) : [];

  try {
    const results = await Promise.allSettled([...basicScanners, ...deepScanners]);
    
    const allSubdomains = new Set();
    let dnsRecords = {};

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        if (index === 1) { // DNS results
          const { records, subdomains } = result.value;
          dnsRecords = records;
          subdomains.forEach(sub => allSubdomains.add(sub));
        } else if (result.value instanceof Set) {
          result.value.forEach(subdomain => allSubdomains.add(subdomain));
        }
      }
    });

    return {
      subdomains: Array.from(allSubdomains).sort(),
      dnsRecords,
      total: allSubdomains.size,
      scanType: options.deep ? 'Deep' : 'Light',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    throw new Error(error.message || 'Failed to scan subdomains. Please try again later.');
  }
}