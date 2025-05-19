import React, { useEffect, useState } from 'react';


function Page404({title}) {

  document.title = title
  
  return (
    <div className=''>
        <h1 className='text-3xl text-center mt-10'>404 Page Not Found</h1>
        <h1 className='text-1xl text-center mt-10'>Try another WA-T-1 page</h1>
    </div>
  )
}

export default Page404