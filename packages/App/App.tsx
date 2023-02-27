import React, {createContext, FunctionComponent, Suspense, useMemo,} from 'react';
import style from './App.scss';
import createChunk, {AssetsByChunkName} from "@micro/utils/createChunk";

const Home = createChunk(() => import(/* webpackChunkName:"Home" */ './pages/Home'), 'Home');

interface AppProps {
  assetsByChunkName: AssetsByChunkName,
}
const AppContextSymbol = createContext({});
const App: FunctionComponent<AppProps> = ({ assetsByChunkName }) => {
  const appContextValue = useMemo((() => ({
    assetsByChunkName
  })), [assetsByChunkName]);

  return (
    <AppContextSymbol.Provider value={appContextValue}>
      <section className={style.section}>
        <div className={style.sub}>sub</div>
        <Suspense fallback={'loading'}>
          <Home />
        </Suspense>
      </section>
    </AppContextSymbol.Provider>
  )
};


export default App;