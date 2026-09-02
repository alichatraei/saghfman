import { Controller, Post, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UploadsService, UploadedImage } from './uploads.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('uploads')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploads: UploadsService) {}

  @Post('images')
  @UseInterceptors(FilesInterceptor('files', 20))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'بارگذاری تصاویر ملک (خروجی WebP فشرده)' })
  async uploadImages(@UploadedFiles() files: Express.Multer.File[]): Promise<UploadedImage[]> {
    return Promise.all(files.map((file) => this.uploads.saveImage(file)));
  }
}
