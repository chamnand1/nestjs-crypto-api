import { Module } from '@nestjs/common';
import { CryptoModule } from './crypto/crypto.module';
import { ConfigModule } from '@nestjs/config';
import cryptoConfig from './config/crypto.config';
import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        PUBLIC_KEY: Joi.string().required(),
        PRIVATE_KEY: Joi.string().required(),
      }),
      load: [cryptoConfig],
    }),
    CryptoModule,
  ],
})
export class AppModule {}
