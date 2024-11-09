import axios from 'axios';

const api = axios.create({
  timeout: 15000,
  headers: {
    'Accept': 'application/json',
    'User-Agent': 'SecurityScanner/1.0',
  }
});

export async function getDNSRecords(domain) {
  try {
    const response = await api.get(`https://dns.google/resolve?name=${domain}&type=ANY`);
    return response.data.Answer || [];
  } catch (error) {
    console.error('DNS lookup failed:', error.message);
    return [];
  }
}

export async function getCNAMERecords(domain) {
  try {
    const response = await api.get(`https://dns.google/resolve?name=${domain}&type=CNAME`);
    return response.data.Answer || [];
  } catch (error) {
    console.error('CNAME lookup failed:', error.message);
    return [];
  }
}

export async function getMXRecords(domain) {
  try {
    const response = await api.get(`https://dns.google/resolve?name=${domain}&type=MX`);
    return response.data.Answer || [];
  } catch (error) {
    console.error('MX lookup failed:', error.message);
    return [];
  }
}

export async function getTXTRecords(domain) {
  try {
    const response = await api.get(`https://dns.google/resolve?name=${domain}&type=TXT`);
    return response.data.Answer || [];
  } catch (error) {
    console.error('TXT lookup failed:', error.message);
    return [];
  }
}

export async function getNSRecords(domain) {
  try {
    const response = await api.get(`https://dns.google/resolve?name=${domain}&type=NS`);
    return response.data.Answer || [];
  } catch (error) {
    console.error('NS lookup failed:', error.message);
    return [];
  }
}