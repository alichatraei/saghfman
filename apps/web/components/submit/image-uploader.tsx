'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import { ImagePlus, Star, Trash2 } from 'lucide-react';
import { API_URL } from '@/lib/api';
import { useToken } from '@/lib/hooks';
import { cn } from '@/lib/cn';
import { toPersianDigits } from '@/lib/format';

export interface UploadedImage {
  url: string;
  width?: number;
  height?: number;
  isCover?: boolean;
}

const MAX_IMAGES = 15;

export function ImageUploader({
  images,
  onChange,
}: {
  images: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
}) {
  const token = useToken();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setError(undefined);

    const remaining = MAX_IMAGES - images.length;
    if (remaining <= 0) {
      setError(`حداکثر ${toPersianDigits(MAX_IMAGES)} تصویر می‌توانید بارگذاری کنید.`);
      return;
    }

    const form = new FormData();
    Array.from(files)
      .slice(0, remaining)
      .forEach((file) => form.append('files', file));

    setUploading(true);
    try {
      const response = await fetch(`${API_URL}/uploads/images`, {
        method: 'POST',
        body: form,
        credentials: 'include',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const payload = (await response.json()) as UploadedImage[] | { message?: string };
      if (!response.ok) {
        throw new Error((payload as { message?: string }).message ?? 'بارگذاری تصویر ناموفق بود.');
      }
      const uploaded = payload as UploadedImage[];
      onChange(
        [...images, ...uploaded].map((image, index) => ({ ...image, isCover: index === 0 })),
      );
    } catch (uploadError) {
      setError((uploadError as Error).message);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const remove = (url: string) => {
    const next = images.filter((image) => image.url !== url);
    onChange(next.map((image, index) => ({ ...image, isCover: index === 0 })));
  };

  const setCover = (url: string) => {
    const cover = images.find((image) => image.url === url);
    if (!cover) return;
    const rest = images.filter((image) => image.url !== url);
    onChange([{ ...cover, isCover: true }, ...rest.map((image) => ({ ...image, isCover: false }))]);
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="flex w-full flex-col items-center gap-2 rounded border-2 border-dashed border-line bg-cream-soft px-6 py-10 text-center transition-colors hover:border-gold"
      >
        <ImagePlus className="h-8 w-8 text-gold" />
        <span className="font-medium text-brand">
          {uploading ? 'در حال بارگذاری…' : 'افزودن تصویر ملک'}
        </span>
        <span className="text-sm text-muted">
          فرمت JPG یا PNG، حداکثر ۸ مگابایت برای هر تصویر و حداکثر ۱۵ تصویر — تصاویر به‌صورت خودکار
          فشرده می‌شوند.
        </span>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={(event) => void upload(event.target.files)}
      />

      {error && <p className="mt-2 text-sm text-danger">{error}</p>}

      {images.length > 0 && (
        <>
          <p className="num mt-4 text-sm text-muted">
            {toPersianDigits(images.length)} تصویر — اولین تصویر به‌عنوان کاور نمایش داده می‌شود.
          </p>
          <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {images.map((image) => (
              <li
                key={image.url}
                className="group relative overflow-hidden rounded border border-line"
              >
                <div className="relative aspect-[4/3]">
                  <Image src={image.url} alt="" fill sizes="200px" className="object-cover" />
                </div>
                {image.isCover && (
                  <span className="absolute right-2 top-2 rounded-sm bg-gold px-2 py-1 text-xs font-medium text-brand">
                    کاور
                  </span>
                )}
                <div className="absolute inset-x-0 bottom-0 flex justify-between bg-brand/80 p-1.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                  <button
                    type="button"
                    onClick={() => setCover(image.url)}
                    aria-label="انتخاب به‌عنوان کاور"
                    className={cn(
                      'rounded p-1.5 text-white hover:bg-white/15',
                      image.isCover && 'text-gold',
                    )}
                  >
                    <Star className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(image.url)}
                    aria-label="حذف تصویر"
                    className="rounded p-1.5 text-white hover:bg-white/15"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
