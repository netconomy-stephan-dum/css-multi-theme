import browserConfig from './browser.mjs';
import serverConfig from './server.mjs';
import devServerConfig from './devServer.mjs';
import runServer from './runServer.mjs';

const rspackConfig = async (env, options) => {
  const isDev = options.mode === 'development';

  return [
    isDev && devServerConfig(env, options),
    await browserConfig(env, options),
    await serverConfig(env, options),
    runServer(),
  ].filter(Boolean);
}

export default rspackConfig;