import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import sharp from 'sharp';

export interface UploadedImage {
  url: string;
  thumbUrl: string;
  width: number;
  height: number;
  sizeBytes: number;
  mimeType: string;
}

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

@Injectable()
export class UploadsService {
  constructor(private readonly config: ConfigService) {}

  /**
   * Validates, compresses and stores an uploaded property photo.
   * Everything is re-encoded to WebP, which strips EXIF (including GPS data
   * that could reveal a private address) as a side benefit.
   */
  async saveImage(file: Express.Multer.File): Promise<UploadedImage> {
    const maxSize = this.config.get<number>('uploads.maxImageSizeBytes') ?? 8 * 1024 * 1024;

    if (!file) throw new BadRequestException('فایلی ارسال نشده است.');
    if (!ALLOWED_MIME.includes(file.mimetype)) {
      throw new BadRequestException('فقط تصاویر JPG، PNG یا WebP قابل بارگذاری هستند.');
    }
    if (file.size > maxSize) {
      throw new BadRequestException(
        `حجم تصویر نباید بیشتر از ${Math.round(maxSize / (1024 * 1024))} مگابایت باشد.`,
      );
    }

    const root = this.config.get<string>('uploads.path') ?? './uploads';
    const folder = new Date().toISOString().slice(0, 7); // yyyy-mm
    const dir = join(process.cwd(), root, folder);
    await mkdir(dir, { recursive: true });

    const id = randomUUID();
    const pipeline = sharp(file.buffer, { failOn: 'none' }).rotate();
    const metadata = await pipeline.metadata();

    const full = await pipeline
      .clone()
      .resize({ width: 1920, height: 1440, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();

    const thumb = await pipeline
      .clone()
      .resize({ width: 640, height: 480, fit: 'cover' })
      .webp({ quality: 74 })
      .toBuffer();

    await writeFile(join(dir, `${id}.webp`), full);
    await writeFile(join(dir, `${id}-thumb.webp`), thumb);

    return {
      url: `/api/media/${folder}/${id}.webp`,
      thumbUrl: `/api/media/${folder}/${id}-thumb.webp`,
      width: metadata.width ?? 0,
      height: metadata.height ?? 0,
      sizeBytes: full.byteLength,
      mimeType: 'image/webp',
    };
  }
}
