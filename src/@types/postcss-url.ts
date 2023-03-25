// TODO: upstream repo doesnt wrap in promise as the implementation does

declare module 'postcss-url' {
  import { PluginCreator } from 'postcss';
  interface Asset {
    /**
     * Original URL.
     */
    url: string;

    /**
     * URL pathname.
     */
    pathname?: string | undefined;

    /**
     * Absolute path to asset.
     */
    absolutePath?: string | undefined;

    /**
     * Current relative path to asset.
     */
    relativePath?: string | undefined;

    /**
     * Querystring from URL.
     */
    search?: string | undefined;

    /**
     * Hash from URL.
     */
    hash?: string | undefined;
  }
  interface Dir {
    /**
     * PostCSS from option.
     */
    from?: string | undefined;

    /**
     * PostCSS to option.
     */
    to?: string | undefined;

    /**
     * File path.
     */
    file?: string | undefined;
  }
  type CustomTransformFunction = (asset: Asset, dir: Dir) => string | Promise<string>;
  type CustomHashFunction = (file: Buffer) => string;
  type CustomFilterFunction = (file: string) => boolean;

  interface PostCSSURLOptions {
    /**
     * URL rewriting mechanism.
     *
     * @default 'rebase'
     */
    url?: 'copy' | 'inline' | 'rebase' | CustomTransformFunction | undefined;

    /**
     * Specify the maximum file size to inline (in kilobytes).
     */
    maxSize?: number | undefined;

    /**
     * Do not warn when an SVG URL with a fragment is inlined.
     * PostCSS-URL does not support partial inlining.
     * The entire SVG file will be inlined.
     * By default, a warning will be issued when this occurs.
     *
     * @default false
     */
    ignoreFragmentWarning?: boolean;

    /**
     * Reduce size of inlined svg (IE9+, Android 3+)
     *
     * @default false
     */
    optimizeSvgEncode?: boolean;
    filter?: RegExp | CustomFilterFunction | string;

    /**
     * Specifies whether the URLs fragment identifier value, if present, will be added to the inlined data URI.
     *
     * @default false
     */
    includeUriFragment?: boolean;

    /**
     * The fallback method to use if the maximum size is exceeded or the URL contains a hash.
     */
    fallback?: CustomTransformFunction;

    /**
     * Specify the base path or list of base paths where to search images from.
     */
    basePath?: string | string[];

    /**
     * The assets files will be copied in that destination.
     *
     * @default false
     */
    assetsPath?: boolean | string;

    /**
     * Rename the path of the files by a hash name.
     *
     * @default false
     */
    useHash?: boolean;

    /**
     * Hash options
     */
    hashOptions?: {
      /**
       * Hashing method or custom function.
       */
      method?: 'xxhash32' | 'xxhash64' | CustomHashFunction;

      /**
       * Shrink hast to certain length.
       */
      shrink?: number | undefined;

      /**
       * Append the original filename in resulting filename.
       */
      append?: boolean | undefined;
    };
  }

  const plugin: PluginCreator<PostCSSURLOptions>;
  export default plugin;
}
