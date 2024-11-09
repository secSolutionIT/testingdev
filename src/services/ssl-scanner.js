import axios from 'axios';
import { parse as parseX509 } from 'x509';

const api = axios.create({
  timeout: 30000,
  headers: {
    'Accept': 'application/json',
    'User-Agent': 'HawkScan/1.0',
  }
});

export async function validateSSL(domain) {
  try {
    const response = await axios.get(`https://${domain}`, {
      httpsAgent: new (require('https').Agent)({
        rejectUnauthorized: false,
        requestCert: true
      })
    });

    const cert = response.request.res.socket.getPeerCertificate();
    
    return {
      valid: true,
      issuer: cert.issuer.CN,
      subject: cert.subject.CN,
      validFrom: new Date(cert.valid_from),
      validTo: new Date(cert.valid_to),
      serialNumber: cert.serialNumber,
      fingerprint: cert.fingerprint,
      version: cert.version,
      dnsNames: cert.subjectaltname
        ? cert.subjectaltname.split(', ').map(name => name.replace('DNS:', ''))
        : [],
      isExpired: new Date() > new Date(cert.valid_to),
      daysUntilExpiration: Math.floor(
        (new Date(cert.valid_to) - new Date()) / (1000 * 60 * 60 * 24)
      )
    };
  } catch (error) {
    return {
      valid: false,
      error: error.message,
      errorCode: error.code
    };
  }
}

export async function analyzeCertificateTransparency(domain) {
  try {
    const response = await api.get(`https://crt.sh/?q=${domain}&output=json`);
    return response.data.map(cert => ({
      issuer: cert.issuer_name,
      notBefore: new Date(cert.not_before),
      notAfter: new Date(cert.not_after),
      serialNumber: cert.serial_number,
      dnsNames: cert.name_value.split('\n')
    }));
  } catch (error) {
    console.error('CT log analysis failed:', error);
    return [];
  }
}

export async function checkSSLGrade(domain) {
  try {
    const response = await api.get(`https://api.ssllabs.com/api/v3/analyze`, {
      params: {
        host: domain,
        publish: 'off',
        startNew: 'on',
        all: 'done'
      }
    });

    return {
      grade: response.data.endpoints[0].grade,
      protocols: response.data.endpoints[0].details.protocols,
      vulnerabilities: response.data.endpoints[0].details.vulnerabilities,
      supportsHSTS: response.data.endpoints[0].details.hstsPolicy?.status === "present",
      supportsTLS13: response.data.endpoints[0].details.protocols.some(p => p.version === '1.3')
    };
  } catch (error) {
    console.error('SSL grade check failed:', error);
    return null;
  }
}