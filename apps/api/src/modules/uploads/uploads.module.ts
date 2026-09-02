import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { UploadsService } from './uploads.service';
import { UploadsController } from './uploads.controller';

@Module({
  imports: [MulterModule.register({ storage: memoryStorage(), limits: { fileSize: 12 * 1024 * 1024 } })],
  controllers: [UploadsController],
  providers: [UploadsService],
})
export class UploadsModule {}
