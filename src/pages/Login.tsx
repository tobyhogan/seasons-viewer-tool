import React, { useEffect, useState } from 'react';


import LoginButton from '../components/LoginButton'



function Login() {
  
  return (
    <div className=''>
      <h1>Login</h1>
      <LoginButton dataUpdate={undefined} setDataUpdate={undefined}></LoginButton>

    </div>
  )
}

export default Login