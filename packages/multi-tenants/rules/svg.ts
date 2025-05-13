import { TenantOptions, UseOption } from '../types';

const injectHot = (linkPath: string) => {
  if (module.hot) {
    module.hot.accept('__module_path__', () => {
      if (typeof window !== 'undefined') {
        const [selectorPath] = (linkPath.split('/').pop() as string).split('.');

        const updateProp = (elem: Element, prop: string) => {
          elem.setAttribute(
            prop,
            (elem.getAttribute(prop) as string).replace(
              /(?:\?.*?)?(#.+)$/,
              `?${new Date().getTime()}$1`,
            ),
          );
        };
        document.querySelectorAll(`[*|href$="#${selectorPath}"]:not([href])`).forEach((elem) => {
          updateProp(elem, 'xlink:href');
        });

        document.querySelectorAll(`[src$="#${selectorPath}"]`).forEach((elem) => {
          updateProp(elem, 'src');
        });
      }
    });
  }
};

const getInjectHot = (modulePath: string) =>
  injectHot
    .toString()
    .split('\n')
    .slice(1, -1)
    .join('\n')
    .replace(/__module_path__/g, modulePath);

const getSVGRules = (options: TenantOptions, use: UseOption, issuerLayer: string) => [
  /*
   * Svg imported by javascript from app logic
   * emit separate svg file for each tenant
   * insert symbol #id and viewport
   * __sprite_name__ handled in plugin
   */
  {
    issuer: /\.[jt]sx?$/,
    issuerLayer,
    layer: 'svg-collect',
    test: /svg$/,
    type: 'javascript/auto',
    use: [
      {
        loader: require.resolve('../loaders/svg'),
        options,
      },
    ],
  },
  /*
   * Parse all svg symbols for each tenant
   * output is concatenated to chunk sprite
   */
  {
    issuerLayer: 'svg-collect',
    test: /\.svg$/,
    type: 'javascript/auto',
    use: [
      {
        loader: require.resolve('../loaders/hmr'),
        options: {
          injectHot: getInjectHot,
        },
      },
      {
        loader: require.resolve('../loaders/assetEmitter'),
        options,
      },
      ...use,
    ],
  },
];

export default getSVGRules;
