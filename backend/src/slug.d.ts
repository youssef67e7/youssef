declare module 'slug' {
  function slug(value: string, options?: { lower?: boolean; replacement?: string; remove?: RegExp }): string;
  export default slug;
}
