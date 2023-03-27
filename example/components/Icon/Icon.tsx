import React, { FunctionComponent } from "react";

interface Glyph {
  viewBox: string;
  width: string;
  height: string;
  url: string;
  id: string;
}

interface IconProps {
  glyph: Glyph;
}

const Icon: FunctionComponent<IconProps> = ({ glyph }) => {
  const { width, height, url } = glyph;

  return (
    <svg width={width} height={height}><use xlinkHref={url}/></svg>
  )
};

export default Icon;
