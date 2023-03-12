import React, { FunctionComponent } from "react";

import Slider from '@example/components/Slider';

import style from './Home.scss';
import Some from './Some'

const Home: FunctionComponent = () => {
  return (
    <>
      <Some />
      <Slider><div className={style.some}>i am a child</div></Slider>
    </>
  )
};

export default Home;
