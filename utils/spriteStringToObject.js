const spriteStringToObject = (spriteString) => {
  const [chunkName, hash, viewBox] = spriteString.split(/[#?]/);
  // TODO: read width & height from svg attribute instead
  const [,, width, height] = viewBox.split(' ');

  return {
    id: hash,
    url: 'assets/'+window.tenantName+'/svg/'+chunkName+'.svg#'+hash,
    viewBox,
    width,
    height,
  };
};

export default spriteStringToObject;