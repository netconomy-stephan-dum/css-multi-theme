import React, { FunctionComponent, useEffect } from 'react';

import Slider from '../../components/Slider';
import Some from './components/Some';

import style from './styles/Home.scss';

const Home: FunctionComponent = () => {
  useEffect(() => {
    console.log('hello hydration');
  }, []);

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
