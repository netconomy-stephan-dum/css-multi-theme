import React, { FunctionComponent, useContext } from 'react';
import ConfigContext from '../../ConfigContext';

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

const spriteStringToObject = (tenantName: string, [chunkName, hash, viewBox]: RawGlyph): Glyph => {
  // TODO: read width & height from svg attribute instead?!
  const [, , width, height] = viewBox.split(' ');
  return {
    height,
    id: hash,
    url: `/assets/${tenantName}/svg/${chunkName}.svg#${hash}`,
    viewBox,
    width,
  };
};

const useTenant = () => useContext(ConfigContext).tenantName;
const Icon: FunctionComponent<IconProps> = ({ glyph }) => {
  const tenantName = useTenant();
  const { width, height, url } = spriteStringToObject(tenantName, glyph);

  return (
    <svg width={width} height={height}>
      <use xlinkHref={url} />
    </svg>
  );
};

export default Icon;
