import { MapPin } from 'lucide-react';

/**
 * Location block. When the owner has not opted into exact positioning the API
 * returns null coordinates, so only the neighbourhood line is rendered.
 */
export function PropertyMap({
  latitude,
  longitude,
  displayAddress,
}: {
  latitude: number | null;
  longitude: number | null;
  displayAddress: string;
}) {
  const hasCoordinates = latitude !== null && longitude !== null;
  const delta = 0.006;
  const bbox = hasCoordinates
    ? `${longitude - delta},${latitude - delta},${longitude + delta},${latitude + delta}`
    : '';

  return (
    <section className="surface overflow-hidden" aria-labelledby="location-heading">
      <div className="flex items-center justify-between gap-3 border-b border-line px-6 py-4">
        <h2 id="location-heading" className="text-lg font-bold text-brand">
          موقعیت ملک
        </h2>
        <p className="flex items-center gap-1.5 text-sm text-muted">
          <MapPin className="h-4 w-4 text-gold" />
          {displayAddress}
        </p>
      </div>

      {hasCoordinates ? (
        <iframe
          title="نقشه موقعیت ملک"
          loading="lazy"
          className="h-72 w-full border-0"
          src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${latitude},${longitude}`}
        />
      ) : (
        <div className="flex h-56 flex-col items-center justify-center gap-2 bg-cream-soft text-center">
          <MapPin className="h-8 w-8 text-gold" />
          <p className="text-[15px] font-medium text-brand">{displayAddress}</p>
          <p className="max-w-sm px-6 text-sm text-muted">
            موقعیت دقیق ملک برای حفظ حریم خصوصی نمایش داده نمی‌شود. برای هماهنگی بازدید با شرکت تماس
            بگیرید.
          </p>
        </div>
      )}
    </section>
  );
}
