import localByDefault from 'postcss-modules-local-by-default';
import { LoaderContext } from 'webpack';
import { TenantOptions } from '../types';
import postcssExport from './postcssExport';
import getPostcssURL from './getPostcssURL';
import getModulesScope from './getModulesScrope';

const createPostCSSOptions =
  (options: TenantOptions) => (context: LoaderContext<TenantOptions>) => {
    return {
      plugins: [
        localByDefault(),
        getModulesScope(context),
        postcssExport(),
        getPostcssURL(context, options),
      ],
    };
  };

export default createPostCSSOptions;
