// caution don't use import! All dependencies must be inside the template function
// the arguments only highlight which props will be available later on global scope

const getChangedElement = (linkPath: string) => {
  const doc = document;
  const segments = linkPath.replace(doc.location.origin, '').split('/');
  const path = segments
    .slice(3)
    .join('/')
    .replace(/_.+?\.css$/, '');

  const elem = doc.querySelector<HTMLLinkElement>(`link[href*="${path}"]`);

  if (elem && elem.href.replace(doc.location.origin, '').startsWith(`/${segments[1]}`)) {
    return elem;
  }

  return {} as HTMLLinkElement;
};
const injectHot = (linkPath: string) => {
  if (module.hot) {
    // will be replaced later when used
    module.hot.accept('__module_path__', () => {
      getChangedElement(linkPath).href = linkPath;
    });

    module.hot.dispose(() => {
      const elem = getChangedElement(linkPath);
      elem.parentElement?.removeChild(elem);
    });
  }
};

const injectHotTemplate = injectHot.toString().split('\n').slice(1, -1).join('\n');

// need to be hard coded values so that static code analyse can pick them up and make them hot.
export const getInjectHot = (modulePath: string, valueName = 'linkPath') =>
  injectHotTemplate.replace(/__module_path__/g, modulePath).replace(/\blinkPath\b/g, valueName);

export const setupTemplate = `const getChangedElement = ${getChangedElement.toString()};`;
