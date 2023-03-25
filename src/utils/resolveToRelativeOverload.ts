import { LoaderContext, NormalModule } from "webpack";
import {TenantOptions} from "../types";

import path from "node:path";

const isInternalRequestReg = /^\.?\//,

 resolveToRelativeOverload = (context: LoaderContext<TenantOptions>, { appDir }: TenantOptions) => {
  const { resourcePath, _module: mod } = context;
  const { rawRequest } = mod as NormalModule;

  // Requested internal file
  if (isInternalRequestReg.test(rawRequest)) {
    const overloadPath = path
      .relative(appDir, resourcePath)
      .replace(/\\\\?/g, '/');

    return {
      dest: overloadPath,
      src: overloadPath,
    };
  }

  // Requested file from package.json
  return {
    dest: rawRequest,
    // Add modules directory to avoid naming conclusions
    src: `modules/${rawRequest}`,
  }
}

export default resolveToRelativeOverload;
