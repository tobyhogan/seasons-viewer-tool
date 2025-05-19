import React, { useEffect } from 'react'
import { useAppContext } from "../app/appContext.tsx";

import supabase from "../../supabaseClient.js";

import { Checkbox } from '@mantine/core';

import LoginButton from '../components/LoginButton.tsx';

import '../styles/App.css'



function Account({title, dataUpdate, setDataUpdate}) {
  document.title = title


  const { session, darkThemeEnabled, setDarkThemeEnabled }: any = useAppContext();

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

  async function toggleTheme() {

    if (darkThemeEnabled) {
 

      setDarkThemeEnabled(false)

    } else if (!darkThemeEnabled) {


      setDarkThemeEnabled(true)

    }

    //console.log(data[0].dark_theme_enabled)

    //if 

    //var darkThemeEnabled = data[0][day]

    /*if (habitsIsCompleted) {
      
      const { error } = await supabase
        .from('habit_histories')        
        .update({ [day]: 'FALSE' })
        .eq('id', habits.id)


    } else if (!habitsIsCompleted) {

      const { error } = await supabase
        .from('habit_histories')        
        .update({ [day]: 'TRUE' })
        .eq('id', habits.id)
    }
    */
 }

  return (
      <div className='w-fit flex-row m-auto'>
        <h1 className='text-2xl text-center mt-12 underline'>Settings</h1>

        <div className='mt-16 flex'>
          <h2 className='text-center'>Dark Theme: </h2>
          <Checkbox checked={darkThemeEnabled} onChange={() => toggleTheme()} className='ml-3 mt-0.5' color="black" iconColor="white" radius="4px" />
        </div>


      </div>
  )
}

export default Account;