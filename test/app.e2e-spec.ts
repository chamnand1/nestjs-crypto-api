import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import * as crypto from 'crypto';
import { AppModule } from './../src/app.module';

function seedCryptoEnv() {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
  });
  process.env.PUBLIC_KEY = publicKey
    .export({ type: 'spki', format: 'pem' })
    .toString();
  process.env.PRIVATE_KEY = privateKey
    .export({ type: 'pkcs8', format: 'pem' })
    .toString();
  process.env.AES_ALGORITHM = 'aes-256-gcm';
  process.env.AES_KEY_LENGTH = '32';
  process.env.AES_IV_LENGTH = '12';
  process.env.CRYPTO_ENCODING = 'base64';
  process.env.RSA_OAEP_HASH = 'sha256';
}

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    seedCryptoEnv();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  interface EncryptResponse {
    successful: boolean;
    error_code: string;
    message?: string;
    data: { data1: string; data2: string; iv: string; tag: string };
  }
  interface DecryptResponse {
    successful: boolean;
    error_code: string;
    message?: string;
    data: { payload: string };
  }

  it('encrypt then decrypt should return original payload', async () => {
    const payload = 'integration-test';

    const encRes = await request(app.getHttpServer())
      .post('/get-encrypt-data')
      .send({ payload })
      .expect(201)
      .expect('Content-Type', /json/);

    const encBody = encRes.body as EncryptResponse;
    expect(encBody.successful).toBe(true);
    const { data1, data2, iv, tag } = encBody.data;

    const decRes = await request(app.getHttpServer())
      .post('/get-decrypt-data')
      .send({ data1, data2, iv, tag })
      .expect(201)
      .expect('Content-Type', /json/);

    const decBody = decRes.body as DecryptResponse;
    expect(decBody.successful).toBe(true);
    expect(decBody.data.payload).toBe(payload);
  });
});
