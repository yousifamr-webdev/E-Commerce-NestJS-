import slugify from 'slugify';

export function customSlugify(text: string) {
  const slug = slugify(text, {
    lower: true,
    strict: true,
  });

  return slug;
}
