// Cloudflare Images Loader for Next.js
export default function cloudflareImageLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) {
  // 개발 환경에서는 기본 로더 사용
  if (process.env.NODE_ENV === 'development') {
    return src;
  }

  // Cloudflare Images를 사용하는 경우
  if (process.env.NEXT_PUBLIC_CLOUDFLARE_IMAGES_ACCOUNT) {
    const params = [`width=${width}`];
    if (quality) {
      params.push(`quality=${quality}`);
    }
    const paramsString = params.join(',');
    return `https://imagedelivery.net/${process.env.NEXT_PUBLIC_CLOUDFLARE_IMAGES_ACCOUNT}/${src}/${paramsString}`;
  }

  // 기본 이미지 URL 반환
  return src;
}
