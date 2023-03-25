declare module '*.svg' {
  interface Glyph {
    viewBox: string;
    width: string;
    height: string;
    url: string;
    id: string;
  }
  const svgGlyph: Glyph;
  export = svgGlyph;
}
