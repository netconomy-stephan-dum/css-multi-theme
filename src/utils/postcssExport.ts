import { PluginCreator } from 'postcss';
interface ObjectNode {
  prop: string;
  value: string;
}
type PostcssExportOptions = Record<string, string>;
const postcssExport: PluginCreator<PostcssExportOptions> = (moduleMap) => ({
  Once(root) {
    root.walkRules(':export', (rule) => {
      if (moduleMap) {
        rule.each((node) => {
          const { prop, value } = node as ObjectNode;
          moduleMap[prop] = value;
        });
      }

      rule.remove();
    });
  },
  postcssPlugin: 'extract-export',
});

postcssExport.postcss = true;

export default postcssExport;
