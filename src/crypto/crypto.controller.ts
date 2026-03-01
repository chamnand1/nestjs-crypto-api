import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CryptoService } from './crypto.service';
import { EncryptDto } from './dto/encrypt.dto';
import { DecryptDto } from './dto/decrypt.dto';

@ApiTags('')
@Controller()
export class CryptoController {
  constructor(private readonly cryptoService: CryptoService) { }

  @Post('get-encrypt-data')
  encrypt(@Body() body: EncryptDto) {
    try {
      const result = this.cryptoService.encrypt(body.payload);

      return {
        successful: true,
        error_code: '',
        data: result,
      };
    } catch (err) {
      return {
        successful: false,
        error_code: 'ENCRYPT_ERROR',
        message: err.message,
        data: null,
      };
    }
  }

  @Post('get-decrypt-data')
  decrypt(@Body() body: DecryptDto) {
    try {
      const payload = this.cryptoService.decrypt(
        body.data1,
        body.data2,
        body.iv,
        body.tag,
      );

      return {
        successful: true,
        error_code: '',
        data: { payload },
      };
    } catch (err) {
      return {
        successful: false,
        error_code: 'DECRYPT_ERROR',
        message: err.message,
        data: null,
      };
    }
  }
}
