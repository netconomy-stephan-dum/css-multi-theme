import React, { ReactNode } from 'react';
import LoadableContext, { ExtractorContext } from './LoadableContext';

type Stats = Record<string, string[]>;

const assetHandler: Record<string, (file: string, chunkName: string) => string> = {
  css: (file) => `<link rel="stylesheet" href="${file}"/>`,
  js: (file, chunkName) => `<script async src='${file}' data-chunk="${chunkName}"></script>`,
};

const createChunkExtractor = (stats: Stats, entry: string) => {
  const chunks = new Set<string>();
  const html: string[] = [];
  const extractorContext: ExtractorContext = {
    addChunk: (chunkName) => {
      html.push(
        stats[chunkName]
          .map((file) => {
            const ext = file.split('.').pop()?.split('?')[0] || '';

            if (ext in assetHandler) {
              return assetHandler[ext](file, chunkName);
            }

            return '';
          })
          .join(''),
      );

      chunks.add(chunkName);
    },
  };

  extractorContext.addChunk(entry);

  return {
    collectChunks: (children: ReactNode) => {
      return (
        <LoadableContext.Provider value={extractorContext}>{children}</LoadableContext.Provider>
      );
    },
    getHTML: () => {
      html.unshift(
        `<script>`,
        `window.__INITIAL_CHUNKS__ = ${JSON.stringify(Array.from(chunks))};`,
        `window.__PENDING_CHUNKS__ = [];`,
        `</script>`,
      );
      return html.join('');
    },
  };
};

export default createChunkExtractor;
