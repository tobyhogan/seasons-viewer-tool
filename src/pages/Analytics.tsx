import React, { useEffect, useState } from 'react'
import { useAppContext } from "../app/appContext.tsx";

import supabase from "../../supabaseClient.js";

import { Checkbox } from '@mantine/core';

import LoginButton from '../components/LoginButton.tsx';

import '../styles/App.css'



function Analytics({title, dataUpdate, setDataUpdate}) {

  return (
    <div className=''>
      Template Page 2
    </div>
  )
}

export default Analytics;