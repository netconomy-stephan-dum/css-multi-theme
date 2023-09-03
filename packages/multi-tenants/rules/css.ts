import { TenantOptions, UseOption } from '../types';
import { RuleSetRule } from 'webpack';

import createPostCSSOptions from '../utils/createPostCSSOptions';

/*
 * Scss imported by javascript from app logic
 * only keep css module interface
 * emit separate scss file for each tenant
 */
const getTenantEmitter = (options: TenantOptions, use: UseOption) => ({
  issuerLayer: '',
  layer: 'collect-css',
  test: /\.scss$/,
  type: 'javascript/auto',
  use: [
    {
      loader: require.resolve('../loaders/css'),
      options,
    },
    ...use,
  ],
});

/*
 * Takes all scss files emitted by collect-css layer
 * enforce that each style only applies possible styles
 * emit all assets from url found within css
 */
interface GeneratorRuleSetRule extends Exclude<RuleSetRule, 'generator'> {
  generator?: {
    filename?: string;
    outputPath?: string | ((pathData: { module: { rawRequest: string } }) => string);
  };
}

// caution don't use import! All dependencies must be inside the template function
// the arguments only highlight which props will be available later on global scope

const injectHotCSS = (linkPath: string) => {
  if (module.hot) {
    const getChangedElement = () => {
      const doc = document;
      const path = linkPath.replace(doc.location.origin, '').replace(/(_.*?)?\.css/, '');
      const elem = doc.querySelector<HTMLLinkElement>(`link[href^="${path}"]`);

      return elem || ({} as HTMLLinkElement);
    };
    // will be replaced later when used
    module.hot.accept('__module_path__', () => {
      if (typeof window !== 'undefined') {
        getChangedElement().href = linkPath;
      }
    });

    module.hot.dispose(() => {
      if (typeof window !== 'undefined') {
        const elem = getChangedElement();
        elem.parentElement?.removeChild(elem);
      }
    });
  }
};

// need to be hard coded values so that static code analyse can pick them up and make them hot.
const getInjectHotCSS = (modulePath: string) =>
  injectHotCSS
    .toString()
    .split('\n')
    .slice(1, -1)
    .join('\n')
    .replace(/__module_path__/g, modulePath);

const getStylePipeline = (options: TenantOptions, use: UseOption): GeneratorRuleSetRule => ({
  issuerLayer: 'collect-css',
  test: /\.scss$/,
  type: 'javascript/auto',
  use: [
    {
      loader: require.resolve('../loaders/hmr'),
      options: {
        injectHot: getInjectHotCSS,
      },
    },
    {
      loader: require.resolve('../loaders/tenantEmitter'),
      options,
    },
    {
      loader: require.resolve('postcss-loader'),
      options: {
        postcssOptions: createPostCSSOptions(options),
      },
    },
    ...use,
  ],
});

/*
 * All assets emit by tenant
 * if the file size is smaller than 5kb the request will return a data uri
 * otherwise a file will be emitted and the according url will be returned instead (similar to asset module)
 */

const getAssetPipelines = (options: TenantOptions) => [
  {
    issuerLayer: 'collect-css',
    test: /\.(tff|woff|woff2|otf|mp4|webm|ogg|mpe?g|avi|flv)$/,
    type: 'asset/resource',
  },
  {
    issuerLayer: 'collect-css',
    parser: { dataUrlCondition: { maxSize: options.maxInlineSize } },
    test: /\.(jpe?g|gif|png)$/,
    type: 'asset',
  },
];
const getCSSRules = (options: TenantOptions, use: UseOption) => [
  getTenantEmitter(options, use),
  getStylePipeline(options, use),
  ...getAssetPipelines(options),
];

export default getCSSRules;
