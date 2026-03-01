import { Test, TestingModule } from '@nestjs/testing';
import * as crypto from 'crypto';
import { CryptoService } from './crypto.service';
import cryptoConfig from '../config/crypto.config';
import { ConfigType } from '@nestjs/config';

function makeRsaKeys() {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
  });
  return { publicKey, privateKey };
}

describe('CryptoService', () => {
  let service: CryptoService;

  beforeEach(async () => {
    const { publicKey, privateKey } = makeRsaKeys();

    const configValue: ConfigType<typeof cryptoConfig> = {
      aes: {
        algorithm: 'aes-256-gcm',
        keyLength: 32,
        ivLength: 12,
        encoding: 'base64' as BufferEncoding,
      },
      rsa: {
        oaepHash: 'sha256',
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      },
      publicKey,
      privateKey,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: cryptoConfig.KEY,
          useValue: configValue,
        },
        CryptoService,
      ],
    }).compile();

    service = module.get<CryptoService>(CryptoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should encrypt and decrypt a string correctly', () => {
    const plaintext = 'the quick brown fox jumps over the lazy dog';
    const { data1, data2, iv, tag } = service.encrypt(plaintext);
    const decrypted = service.decrypt(data1, data2, iv, tag);
    expect(decrypted).toBe(plaintext);
  });

  it('constructor throws when keys are invalid', async () => {
    const badConfig = {
      aes: {
        algorithm: 'aes-256-gcm',
        keyLength: 32,
        ivLength: 12,
        encoding: 'base64' as BufferEncoding,
      },
      rsa: {
        oaepHash: 'sha256',
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      },
      publicKey: {} as crypto.KeyObject,
      privateKey: {} as crypto.KeyObject,
    } as ConfigType<typeof cryptoConfig>;

    const badModuleBuilder = Test.createTestingModule({
      providers: [
        {
          provide: cryptoConfig.KEY,
          useValue: badConfig,
        },
        CryptoService,
      ],
    });

    await expect(badModuleBuilder.compile()).rejects.toThrow();
  });
});
