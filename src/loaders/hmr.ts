import { LoaderContext } from 'webpack';

interface HMRLoaderOptions {
  injectHot: (modulePath: string) => string;
}
const hmrLoader = {
  pitch(this: LoaderContext<HMRLoaderOptions>, remainingRequests: string) {
    const modulePath = this.utils.contextify(this.context, `!!${remainingRequests}`);
    const { injectHot = () => '' } = this.getOptions();
    return [
      `import linkPath from '${modulePath}';`,
      injectHot(modulePath),
      `export default linkPath;`,
    ].join('\n');
  },
};

module.exports = hmrLoader;
