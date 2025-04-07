import React, { FunctionComponent } from 'react';
interface HTMLIndexProps {
  lang: string;
  title: string;
}
const HTMLIndex: FunctionComponent<HTMLIndexProps> = ({ lang, title }) => (
  <html lang={lang}>
    <head>
      <title>{title}</title>
      @@head@@
    </head>
    <body>
      <div id="root">@@layout@@</div>
    </body>
  </html>
);

export default HTMLIndex;
