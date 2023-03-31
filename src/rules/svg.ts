import { TenantOptions, UseOption } from '../types';

const injectHot = (linkPath: string) => {
  if (module.hot) {
    module.hot.accept('__module_path__', () => {
      // const selectorPath = linkPath.split('_').slice(0, -1).join('_').split('/').pop();
      // const match = linkPath.replace(/_.*?\.svg(#.*)$/, '$1');
      const [selectorPath] = (linkPath.split('/').pop() as string).split('.');
      // const match = basename.match(/(.*)\.svg$/);
      // if (match) {
      //   const [, selectorPath] = match;
      console.log(selectorPath);
      console.log(`[*|href$="#${selectorPath}"]:not([href])`);
      console.log(`[src$="#${selectorPath}"])`);
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
        // elem.setAttribute('src', linkPath);
      });
      // }
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

const getSVGRules = (options: TenantOptions, use: UseOption) => [
  /*
   * Svg imported by javascript from app logic
   * emit separate svg file for each tenant
   * insert symbol #id and viewport
   * sprite_name handled in plugin
   */
  {
    issuer: /\.[jt]sx?$/,
    issuerLayer: '',
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
    test: /svg$/,
    type: 'javascript/auto',
    use: [
      {
        loader: require.resolve('../loaders/hmr'),
        options: {
          injectHot: getInjectHot,
        },
      },
      {
        loader: require.resolve('../loaders/tenantEmitter'),
        options,
      },
      ...use,
    ],
  },
];

export default getSVGRules;
