/**
 * @deprecated Client-side encryption provides no real security
 * 
 * SECURITY WARNING: This file previously contained client-side encryption functions
 * that used session storage for key management. This approach is fundamentally insecure:
 * 
 * - Keys stored in session storage can be accessed by any JavaScript code
 * - XSS attacks can easily steal both keys and encrypted data
 * - Client-side encryption cannot protect against malicious frontend code
 * - It provides a false sense of security
 * 
 * For true security:
 * - Store sensitive data server-side only
 * - Use HTTPS for data in transit
 * - Implement proper server-side encryption at rest
 * - Use Row Level Security (RLS) policies in Supabase
 * 
 * This file is preserved only for reference. DO NOT USE these functions.
 */

import CryptoJS from 'crypto-js';

// Deprecated - DO NOT USE
export const hashData = (data: string): string => {
  console.warn('DEPRECATED: hashData() - Use server-side hashing instead');
  return CryptoJS.SHA256(data).toString();
};