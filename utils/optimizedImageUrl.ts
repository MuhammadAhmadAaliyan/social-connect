export const optimizeImageUrl = (url: string): string => {
  if (!url || !url.includes('cloudinary.com')) return url;
  return url.replace('/upload/', '/upload/w_800,q_auto,f_auto/');
};
