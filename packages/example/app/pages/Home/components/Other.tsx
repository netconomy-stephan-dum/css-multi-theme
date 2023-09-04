import React, { FunctionComponent } from 'react';
import loadable from '@example/engine-browser/loadable';
import styles from './Other.scss';

const Lazy = loadable(() => import(/* webpackChunkName:"Lazy" */ './Lazy'));
const Other: FunctionComponent = () => (
  <>
    <Lazy />
    <div className={styles.bar}>other</div>
  </>
);

export default Other;
