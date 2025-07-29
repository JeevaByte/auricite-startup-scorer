import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = 'your-secret-key-here'; // In production, use environment variable

export const encryptSensitiveData = (data: string): string => {
  return CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString();
};

export const decryptSensitiveData = (encryptedData: string): string => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};

export const hashData = (data: string): string => {
  return CryptoJS.SHA256(data).toString();
};

// For revenue and financial data
export const encryptFinancialData = (amount: number): string => {
  return encryptSensitiveData(amount.toString());
};

export const decryptFinancialData = (encryptedAmount: string): number => {
  const decrypted = decryptSensitiveData(encryptedAmount);
  return parseFloat(decrypted) || 0;
};