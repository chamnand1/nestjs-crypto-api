# NestJS Crypto API

Simple NestJS service providing AES‑GCM encryption with RSA‑OAEP key wrapping.

Quick start

```bash
npm install
# development
npm run start:dev

# run unit tests
npm run test

# run e2e tests
npm run test:e2e
```

Environment

Create a `.env` with PEM‑encoded RSA keys:

```dotenv
PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n...base64...\n-----END PUBLIC KEY-----"
PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...base64...\n-----END PRIVATE KEY-----"
AES_ALGORITHM=aes-256-gcm
AES_KEY_LENGTH=32
AES_IV_LENGTH=12
CRYPTO_ENCODING=base64
RSA_OAEP_HASH=sha256
```
