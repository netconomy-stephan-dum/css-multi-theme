import React, { FunctionComponent, ReactElement } from 'react';
import Icon from '@example/components/Icon';
import logo from './logo.svg';
import './variables.scss';
import styles from './Layout.scss';
import overloadStyle from './overloaderStyle.scss';

const naviData = [
  {
    href: 'http://base.localhost:8080',
    text: 'base',
  },
  {
    href: 'http://light.localhost:8080',
    text: 'light',
  },
  {
    href: 'http://dark.localhost:8080',
    text: 'dark',
  },
];
interface LayoutProps {
  children: ReactElement;
}
const Layout: FunctionComponent<LayoutProps> = ({ children }) => {
  return (
    <>
      <header className={`${styles.header} ${overloadStyle.header}`}>
        <nav>
          <ul>
            <li className={styles.logo}>
              <a href="/">
                <Icon glyph={logo} />
              </a>
            </li>
            {naviData.map(({ href, text }) => (
              <li key={href}>
                <a href={href}>{text}</a>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      <main className={styles.main}>{children}</main>
      <footer className={styles.footer}>
        <ul>
          <li>
            <a href="https://icons8.com">All icons from Icons8.com</a>
          </li>
          <li>
            <a href="/imprint">Imprint</a>
          </li>
        </ul>
      </footer>
    </>
  );
};

export default Layout;
