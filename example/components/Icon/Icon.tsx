import React, { FunctionComponent } from "react";

interface Glyph {
  viewBox: string;
  width: string;
  height: string;
  url: string;
  id: string;
}

type RawGlyph = [string, string, string];
interface IconProps {
  glyph: RawGlyph;
}


const spriteStringToObject = ([basePath, hash, viewBox]: RawGlyph): Glyph => {
  // TODO: read width & height from svg attribute instead
  // TODO: use React context instead of window.tenantName
  const [, , width, height] = viewBox.split(' ');
  return {
    height,
    id: hash,
    url: `/assets/${window.tenantName}/svg/${basePath}#${hash}`,
    viewBox,
    width,
  };
};

const Icon: FunctionComponent<IconProps> = ({ glyph }) => {
  const { width, height, url } = spriteStringToObject(glyph);
  console.log(url, height, width);

  return (
    <svg width={width} height={height}><use xlinkHref={url}/></svg>
  )
};

export default Icon;
