export const CALL_PHOTO_URL = '/call-photo.jpeg';

export function CallPhoto({ className, alt = '' }) {
  return (
    <img
      className={className}
      src={CALL_PHOTO_URL}
      alt={alt}
      onError={(event) => {
        const img = event.currentTarget;
        if (!img.src.endsWith('/call-photo.jpeg')) {
          img.onerror = null;
          img.src = CALL_PHOTO_URL;
        }
      }}
    />
  );
}
