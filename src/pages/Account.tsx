import React, { useEffect } from 'react'
import { useAppContext } from "../app/appContext.tsx";

import supabase from "../../supabaseClient.js";

import { Checkbox } from '@mantine/core';

import LoginButton from '../components/LoginButton.tsx';

import '../styles/App.css'



function Account({title, dataUpdate, setDataUpdate}) {

  document.title = title

  const { session }: any = useAppContext();

  //console.log(session)
  try {

    var displayEmail = session.user.email
    var displayName = session.user.user_metadata.name
    var avatarUrl = session.user.user_metadata.avatar_url


  } catch (e) {
    //console.log(e)
    var displayEmail: any = "'Cannot get email'"
    var displayName: any = "-"
    var avatarUrl: any = ""
  }


  return (
    <div className={session?.user ? (session.darkThemeEnabled ? "dark" : "light") : ""}>
      <div className='w-fit flex-row m-auto'>
        <h1 className='text-2xl text-center mt-16 underline'>Your Account</h1>
        <img src={avatarUrl} className='w-16 rounded-lg m-auto mt-12 outline outline-1 outline-grayNew-200'></img>
        <h2 className='text-center mt-8'><b>Name</b>: {displayName}</h2>
        <h2 className='text-center mt-2'><b>Email</b>: {displayEmail}</h2>
        <h2 className='text-center mt-2'><b>Account Type</b>: Full</h2>
        <div className='w-fit mx-auto mt-12'>
          <LoginButton dataUpdate={dataUpdate} setDataUpdate={setDataUpdate}/>
        </div>
        {/*<button onClick={toggleTheme}>hi</button>*/}
      </div>
    </div>
  )
}

export default Account;