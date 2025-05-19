import React, { useEffect, useState } from 'react';

import LoginButton from '../components/LoginButton'



function Landing({title}) {

  document.title = title
  
  return (
    <div className=''>
      <h1 className='text-center text-3xl mt-10'>Welcome to SeasonsViewer!</h1>
      <div className='w-fit mx-auto mt-10'><LoginButton dataUpdate={undefined} setDataUpdate={undefined}></LoginButton></div>
    </div>
  )
}

export default Landing