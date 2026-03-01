import { Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import * as crypto from 'crypto';
import cryptoConfig from '../config/crypto.config';
import { createGcmCipher, createGcmDecipher } from './utils/crypto-gcm.helper';

@Injectable()
export class CryptoService {
  private readonly publicKeyObj: crypto.KeyObject;
  private readonly privateKeyObj: crypto.KeyObject;

  constructor(
    @Inject(cryptoConfig.KEY)
    private readonly config: ConfigType<typeof cryptoConfig>,
  ) {
    if (!(this.config.publicKey instanceof crypto.KeyObject)) {
      throw new Error('publicKey value in CryptoConfig is not a KeyObject');
    }
    if (!(this.config.privateKey instanceof crypto.KeyObject)) {
      throw new Error('privateKey value in CryptoConfig is not a KeyObject');
    }
    this.publicKeyObj = this.config.publicKey;
    this.privateKeyObj = this.config.privateKey;
  }

  encrypt(payload: string) {
    const { aes, rsa } = this.config;

    const aesKey = crypto.randomBytes(aes.keyLength);
    const iv = crypto.randomBytes(aes.ivLength);

    const cipher = createGcmCipher(aes.algorithm, aesKey, iv);

    const encrypted = Buffer.concat([
      cipher.update(payload, 'utf8'),
      cipher.final(),
    ]);

    const tag = cipher.getAuthTag();

    let encryptedKey: Buffer;
    try {
      encryptedKey = crypto.publicEncrypt(
        {
          key: this.publicKeyObj,
          padding: rsa.padding,
          oaepHash: rsa.oaepHash,
        },
        aesKey,
      );
    } catch (err) {
      throw new Error(`RSA public key encryption failed: ${err.message}`);
    }

    return {
      data1: encryptedKey.toString(aes.encoding),
      data2: encrypted.toString(aes.encoding),
      iv: iv.toString(aes.encoding),
      tag: tag.toString(aes.encoding),
    };
  }

  decrypt(data1: string, data2: string, iv: string, tag: string) {
    const { aes, rsa } = this.config;

    const aesKey = crypto.privateDecrypt(
      {
        key: this.privateKeyObj,
        padding: rsa.padding,
        oaepHash: rsa.oaepHash,
      },
      Buffer.from(data1, aes.encoding),
    );

    const decipher = createGcmDecipher(
      aes.algorithm,
      aesKey,
      Buffer.from(iv, aes.encoding),
    );

    decipher.setAuthTag(Buffer.from(tag, aes.encoding));

    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(data2, aes.encoding)),
      decipher.final(),
    ]);

    return decrypted.toString('utf8');
  }
}
