import { Test, TestingModule } from '@nestjs/testing';
import * as crypto from 'crypto';
import { CryptoController } from './crypto.controller';
import { CryptoService } from './crypto.service';
import cryptoConfig from '../config/crypto.config';
import { ConfigType } from '@nestjs/config';

function makeRsaKeys() {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
  });
  return { publicKey, privateKey };
}

describe('CryptoController', () => {
  let controller: CryptoController;

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
      controllers: [CryptoController],
      providers: [
        CryptoService,
        {
          provide: cryptoConfig.KEY,
          useValue: configValue,
        },
      ],
    }).compile();

    controller = module.get<CryptoController>(CryptoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
