declare module '*.svg' {
  type RawGlyph = [string, string, string];
  const svgGlyph: RawGlyph;
  export = svgGlyph;
}
