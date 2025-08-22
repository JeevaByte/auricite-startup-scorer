import CryptoJS from 'crypto-js';

// Ephemeral, per-session encryption key (frontend-only, NOT for true security)
// We intentionally avoid any hardcoded keys in the repository.
const KEY_STORAGE = 'APP_ENC_KEY_V1';

const getSessionKey = (): string => {
  if (typeof window === 'undefined') return 'server-side-noop';
  let key = sessionStorage.getItem(KEY_STORAGE);
  if (!key) {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    key = Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
    sessionStorage.setItem(KEY_STORAGE, key);
  }
  return key;
};

export const encryptSensitiveData = (data: string): string => {
  const key = getSessionKey();
  return CryptoJS.AES.encrypt(data, key).toString();
};

export const decryptSensitiveData = (encryptedData: string): string => {
  try {
    const key = getSessionKey();
    const bytes = CryptoJS.AES.decrypt(encryptedData, key);
    const result = bytes.toString(CryptoJS.enc.Utf8);
    return result || '';
  } catch {
    return '';
  }
};

export const hashData = (data: string): string => {
  return CryptoJS.SHA256(data).toString();
};

// For revenue and financial data (transient, client-side only)
export const encryptFinancialData = (amount: number): string => {
  return encryptSensitiveData(amount.toString());
};

export const decryptFinancialData = (encryptedAmount: string): number => {
  const decrypted = decryptSensitiveData(encryptedAmount);
  return parseFloat(decrypted) || 0;
};