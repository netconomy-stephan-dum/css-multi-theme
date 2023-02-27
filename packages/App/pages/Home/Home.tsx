import React, { FunctionComponent } from "react";

import Slider from '@micro/components/Slider';
import Icon from '@micro/components/Icon';
// import heartGlyph from '@glyph/heart';
import style from './Home.scss';
import Some from './Some'

const Home: FunctionComponent = () => {
  return (
    <>
      <Icon glyph="heart" />
      <Some />
      <Slider><div className={style.some}>i am a child</div></Slider>
    </>
  )
};

export default Home;
