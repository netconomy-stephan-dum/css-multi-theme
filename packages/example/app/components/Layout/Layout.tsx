import React, { FunctionComponent, ReactElement, useContext } from 'react';
import Icon from '../Icon';
import logo from './images/logo.svg';
import './styles/variables.scss';
import styles from './styles/Layout.scss';
import { Link } from 'react-router-dom';
import ConfigContext from '../../ConfigContext';

interface LayoutProps {
  children: ReactElement;
}
const Layout: FunctionComponent<LayoutProps> = ({ children }) => {
  const { port } = useContext(ConfigContext);

  const naviData = [
    {
      href: `http://base.localhost:${port}`,
      text: 'base',
    },
    {
      href: `http://light.localhost:${port}`,
      text: 'light',
    },
    {
      href: `http://dark.localhost:${port}`,
      text: 'dark',
    },
  ];
  return (
    <>
      <header className={`${styles.header}`}>
        <nav>
          <ul>
            <li className={styles.logo}>
              <Link to="/">
                <Icon glyph={logo} />
              </Link>
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
            <Link to="/imprint">Imprint</Link>
          </li>
        </ul>
      </footer>
    </>
  );
};

export default Layout;
