import React, { FunctionComponent } from 'react';
import loadable from 'multi-tenants/loadable';
import styles from './Other.scss';

const Lazy = loadable(() => import(/* webpackChunkName:"Lazy" */ './components/Lazy'));
const Other: FunctionComponent = () => (
  <>
    <Lazy />
    <div className={styles.bar}>other</div>
  </>
);

export default Other;
