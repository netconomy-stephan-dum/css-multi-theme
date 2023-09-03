import React, { FunctionComponent } from 'react';

import Slider from '../../components/Slider';

import style from './Home.scss';
import Some from './Some';

const Home: FunctionComponent = () => {
  return (
    <>
      <Some />
      <Slider>
        <div className={style.some}>i am a child with text</div>
      </Slider>
    </>
  );
};

export default Home;
