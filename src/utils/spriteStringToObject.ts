const spriteStringToObject = (spriteString: string) => {
  const [chunkName, hash, viewBox] = spriteString.split(/[#?]/);
  // TODO: read width & height from svg attribute instead
  const [,, width, height] = viewBox.split(' ');

  return {
    height,
    id: hash,
    url: `assets/${window.tenantName}/svg/${chunkName}.svg#${hash}`,
    viewBox,
    width,
  };
};

export default spriteStringToObject;