
import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
// Fallback key for local development, real key should be set in environment variables
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'abracadabra-secret-key-dont-tell-anyone-12345'; 
const IV_LENGTH = 16;

export const cryptoService = {
  /**
   * Encrypts a plain text string.
   * @param {string} text - The text to encrypt.
   * @returns {string|null} The encrypted text in 'iv:encryptedData' format, or null if input is empty.
   */
  encrypt(text) {
    if (!text) {
      return null;
    }
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
  },

  /**
   * Decrypts an encrypted text string.
   * @param {string} text - The encrypted text in 'iv:encryptedData' format.
   * @returns {string|null} The decrypted plain text, or null if input is invalid.
   */
  decrypt(text) {
    if (!text) {
      return null;
    }
    try {
        const textParts = text.split(':');
        if (textParts.length !== 2) {
            console.error("Invalid encrypted text format.");
            return null;
        }
        const iv = Buffer.from(textParts.shift(), 'hex');
        const encryptedText = Buffer.from(textParts.join(':'), 'hex');
        const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    } catch (error) {
        console.error("Decryption failed:", error);
        return null;
    }
  }
};
