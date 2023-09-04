import React, { ReactNode, FunctionComponent } from 'react';
import classNames from 'classNames';

import styles from './Slider.scss';

interface SliderProps {
  className?: string;
  children: ReactNode;
}

const Slider: FunctionComponent<SliderProps> = ({ children, className }) => {
  return (
    <div className={classNames(className, styles.wrapper)}>
      {children}
    </div>
  )
};

export default Slider;
