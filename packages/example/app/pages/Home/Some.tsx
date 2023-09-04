import React, { FunctionComponent } from 'react';
import styles from './Some.scss';
import Other from './components/Other';

const Some: FunctionComponent = () => (
  <>
    <Other />
    <div className={styles.fu}>some</div>
  </>
);

export default Some;
