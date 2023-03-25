import { TenantOptions, UseOption } from '../types';

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
    type: 'asset',
    use,
  },
];

export default getSVGRules;
