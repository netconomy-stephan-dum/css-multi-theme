import { createContext } from 'react';
export interface ExtractorContext {
  addChunk: (chunkName: string) => void;
}

const LoadableContext = createContext<ExtractorContext | null>(null);

export default LoadableContext;
