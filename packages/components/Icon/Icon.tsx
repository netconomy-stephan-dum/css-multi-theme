import React, { FunctionComponent } from "react";

interface IconProps {
  glyph: string;
}

const GLYPH_SEPARATOR = '|';
const Icon: FunctionComponent<IconProps> = ({ glyph }) => {
  const [href, width, height] = glyph.split(GLYPH_SEPARATOR);

  return (
    <svg width={width} height={height}><use xlinkHref={href}/></svg>
  )
};

export default Icon;
