import crypto from 'crypto';

const getSecretKey = () => {
  const key = process.env.ENCRYPTION_KEY || 'default_secret_key_for_development_32_bytes_long!'; 
  // Ensure it's exactly 32 bytes for AES-256
  return crypto.createHash('sha256').update(key).digest();
};

export const encryptPII = (text: string): string => {
  if (!text) return text;
  try {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', getSecretKey(), iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    return `${iv.toString('hex')}:${encrypted}:${authTag}`;
  } catch (error) {
    console.error('Encryption error:', error);
    return text; // Fail safe (should ideally throw, but maintaining availability)
  }
};

export const decryptPII = (encryptedData: string): string => {
  if (!encryptedData) return encryptedData;
  try {
    const parts = encryptedData.split(':');
    if (parts.length !== 3) return encryptedData; // Not encrypted or old format
    
    const [ivHex, encrypted, authTagHex] = parts;
    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      getSecretKey(),
      Buffer.from(ivHex, 'hex')
    );
    decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    return encryptedData; 
  }
};

export const hashEmail = (email: string): string => {
  return crypto.createHmac('sha256', getSecretKey()).update(email.toLowerCase().trim()).digest('hex');
};
