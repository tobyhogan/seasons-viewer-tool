import React, { useState, useEffect, Suspense, useRef } from 'react';
import { createBrowserHistory } from 'history'
import { Panel, PanelGroup } from 'react-resizable-panels'
import '../styles/App.css'

import { useAppContext } from "../app/appContext.tsx";
import supabase from "../../supabaseClient.js";
import ResizeHandle from '../components/ResizeHandle.js';


import { NewHabitModal, Dropdown } from '../components/Popups.tsx'
import { MdMoreVert, MdClose, MdAdd } from "react-icons/md";

import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';



function Home({title, dataUpdate, setDataUpdate}) {


  return (

    <div>
      
      
    </div>


  );
}

export default Home

