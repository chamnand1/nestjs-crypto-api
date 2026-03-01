import { registerAs } from '@nestjs/config';
import * as crypto from 'crypto';

export interface CryptoConfig {
  aes: {
    algorithm: string;
    keyLength: number;
    ivLength: number;
    encoding: BufferEncoding;
  };
  rsa: {
    oaepHash: string;
    padding: number;
  };
  publicKey: crypto.KeyObject;
  privateKey: crypto.KeyObject;
}

export default registerAs('crypto', (): CryptoConfig => {
  const publicKey = process.env.PUBLIC_KEY;
  const privateKey = process.env.PRIVATE_KEY;

  if (!publicKey) {
    throw new Error('PUBLIC_KEY is not defined');
  }

  if (!privateKey) {
    throw new Error('PRIVATE_KEY is not defined');
  }

  const normalizedPublicKeyPem = publicKey.replace(/\\n/g, '\n');
  const normalizedPrivateKeyPem = privateKey.replace(/\\n/g, '\n');

  let publicKeyObj: crypto.KeyObject;
  try {
    publicKeyObj = crypto.createPublicKey(normalizedPublicKeyPem);
  } catch (err) {
    throw new Error(`PUBLIC_KEY is not a valid PEM key (${err.message})`);
  }

  let privateKeyObj: crypto.KeyObject;
  try {
    privateKeyObj = crypto.createPrivateKey(normalizedPrivateKeyPem);
  } catch (err) {
    throw new Error(`PRIVATE_KEY is not a valid PEM key (${err.message})`);
  }

  return {
    aes: {
      algorithm: process.env.AES_ALGORITHM ?? 'aes-256-gcm',
      keyLength: Number(process.env.AES_KEY_LENGTH ?? 32),
      ivLength: Number(process.env.AES_IV_LENGTH ?? 12),
      encoding: (process.env.CRYPTO_ENCODING ?? 'base64') as BufferEncoding,
    },
    rsa: {
      oaepHash: process.env.RSA_OAEP_HASH ?? 'sha256',
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
    },
    publicKey: publicKeyObj,
    privateKey: privateKeyObj,
  };
});
