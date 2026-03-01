import * as crypto from 'crypto';

export function createGcmCipher(
  algorithm: string,
  key: Buffer,
  iv: Buffer,
): crypto.CipherGCM {
  return crypto.createCipheriv(algorithm, key, iv) as crypto.CipherGCM;
}

export function createGcmDecipher(
  algorithm: string,
  key: Buffer,
  iv: Buffer,
): crypto.DecipherGCM {
  return crypto.createDecipheriv(algorithm, key, iv) as crypto.DecipherGCM;
}
