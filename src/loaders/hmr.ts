import { LoaderContext } from 'webpack';
import { getInjectHot, setupTemplate } from '../runtime/setupCSSHMR';

const hmrLoader = {
  pitch(this: LoaderContext<unknown>, remainingRequests: string) {
    const modulePath = this.utils.contextify(this.context, `!!${remainingRequests}`);

    return [
      `import linkPath from '${modulePath}';`,
      setupTemplate,
      getInjectHot(modulePath),
      `export default linkPath;`,
    ].join('\n');
  },
};

module.exports = hmrLoader;
