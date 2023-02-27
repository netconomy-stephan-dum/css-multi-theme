import React, {FunctionComponent, Suspense } from "react";
import styles from './Other.scss';

import createChunk from "@micro/utils/createChunk";

const Lazy = createChunk(() => import(/* webpackChunkName:"Lazy" */ './Lazy'), 'Lazy');
const Other: FunctionComponent = () => (
  <>
    <Suspense fallback="loading">
      <Lazy />
    </Suspense>
    <div className={styles.bar}>other</div>
  </>
);

export default Other;
