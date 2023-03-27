type AssetHandler = (asset: string) => HTMLMetaElement | HTMLScriptElement | HTMLLinkElement;

const assetTypes: Record<string, AssetHandler> = {
  css: (href) => {
    return Object.assign(document.createElement('link'), {
      rel: 'stylesheet',
      href: '/' + href,
    });
  },
  // mjs: (src) => {
  //   return Object.assign(document.createElement('script'), {
  //     type: 'module',
  //     src: '/' + src,
  //   });
  // },
  // js: (src) => {
  //   return Object.assign(document.createElement('script'), {
  //     async: true,
  //     src: '/' + src.replace(/\.mjs$/, '.js'),
  //   });
  // },
  // jsm: (src) => {
  //   return assetTypes.mjs(src.replace(/\.jsm$/, '.mjs'),)
  // },
  // svg: (href) => {
  //   return Object.assign(document.createElement('link'), {
  //     href,
  //     rel: 'preload',
  //     as: 'image',
  //     type: 'image/svg+xml'
  //   })
  // },
};

const createAsset = (asset: string) => {
  const lastIndex = asset.lastIndexOf('.');
  if (lastIndex >= 0) {
    const extension = asset.slice(lastIndex + 1);
    if (extension in assetTypes) {
      return assetTypes[extension](asset);
    }
  }
  return null;
  // throw new ReferenceError(`No file extension given for ${asset}`);
};


export default createAsset;
