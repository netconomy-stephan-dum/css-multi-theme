import React, {FunctionComponent, Suspense } from "react";
import loadable from "@example/engine-browser/loadable";
import styles from './Other.scss';

const Lazy = loadable(() => import(/* webpackChunkName:"Lazy" */ './Lazy'), 'Lazy');
const Other: FunctionComponent = () => (
  <>
    <Suspense fallback="loading">
      <Lazy />
    </Suspense>
    <div className={styles.bar}>other</div>
  </>
);

export default Other;
