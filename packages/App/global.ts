// this import will be replaced with a function that dynamic looks up the glyph
// the app build provides sprites containing all the files that should be included
// when building a theme all these assets can get overloaded
declare module "@glyph/*" {
  const glyph: string;
  export = glyph;
}
