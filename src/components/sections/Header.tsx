import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from "react-router-dom";

import { useAppContext } from "../../app/appContext.tsx";
import LoginButton from '../LoginButton.tsx'
import '../../styles/App.css'


import { MdOutlineCheckBox, MdCheckBox, MdOutlineAccountCircle, MdAccountCircle, MdSettings, MdOutlineSettings, MdOpenInNew } from "react-icons/md";
import { AiOutlineLineChart, AiOutlineAreaChart } from "react-icons/ai";
import { PiBookOpenText, PiBookOpenTextFill  } from "react-icons/pi";
import { IoMdInformationCircleOutline } from "react-icons/io";

function Header({ dataUpdate, setDataUpdate}) {

  let location = useLocation();

  const { session }: any = useAppContext();


  const wrapperRef = useRef(null);
  useOutsideAlerter(wrapperRef);

  const [pfpNavShown, setPfpNavShown] = useState(false)



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






  const ActiveAccountIcon = () => {
    return (
      <img src={avatarUrl} className='w-[2.2rem] h-[2.1rem] rounded-md outline outline-2 outline-grayNew-550 dark:outline-grayNew-300'></img>

    )
  }

  const InactiveAccountIcon = () => {

    return (
      <img src={avatarUrl} className='w-[2.2rem] h-[2.1rem] rounded-md outline outline-2 outline-grayNew-200 dark:outline-grayNew-700'></img>

    )
  }

  
  function useOutsideAlerter(ref: any) {

    useEffect(() => {

      function handleClickOutside(event: any) {

        if (ref.current && !ref.current.contains(event.target)) {
          
          setPfpNavShown(false)

        }}
  
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };

      
    }, [ref]);
  }
  

  

  
  return (
    <div className='bg-[#e7e7e7] dark:bg-grayNew-825 w-screen'>
      <nav
        className="flex justify-between px-3 py-3 border-b-2 border-gray-100 dark:border-grayNew-825 text-grayNew-550 dark:text-grayNew-200 w-full">
        { session ? 
          <>
            <Link to="/home" className='mr-6 ml-6 text-[30.5px]'>SeasonsViewer</Link>
            <div className='justify-end flex flex-row mt-1'>

              { location.pathname == '/home' ?
                <Link to="/home" className='mr-2 text-3xl flex mt-0.5'><MdCheckBox size={30} className='mr-1'/>
                <p className='MobileHidden text-[20px]'>Viewer Page</p><div className='MobileHidden mr-4' /></Link> :
                <Link to="/home" className='mr-2 text-3xl flex mt-0.5'><MdOutlineCheckBox size={30} className='mr-1'/>
                <p className='MobileHidden text-[20px]'>Viewer Page</p><div className='MobileHidden mr-4' /></Link> }

             
              { <button
                  onClick={() => {setPfpNavShown(pfpNavShown => !pfpNavShown)}}
                  className='colorOverride border-none mr-3 ml-3'
                >
                {pfpNavShown ? <ActiveAccountIcon/> : <InactiveAccountIcon />}
                
                </button> }

              <div className='MobileHidden mr-3'/>

              {pfpNavShown && 

                <div ref={wrapperRef} className='PfpNavPopup w-48 h-48 absolute mt-12 mr-[1.8vw] bg-grayNew-100 dark:bg-grayNew-800 rounded-md border-1 border-grayNew-400'>
                  <ul className='mt-6 ml-4 text-[16px] [&>li]:mt-2'>


                    <li className='text-grayNew-600 dark:text-grayNew-200 hover:underline'><Link
                      to="/account"
                      onClick={() => {setPfpNavShown(false)}} 
                      className='flex'
                    >

                      { location.pathname == '/account' ? <MdAccountCircle size={22} className='mr-1'/> :
                        <MdOutlineAccountCircle size={22} className='mr-1'/>
                      }
                      
                      Your Account</Link></li>

                    <li className='text-grayNew-600 dark:text-grayNew-200 hover:underline'><Link
                      to="/settings"
                      onClick={() => {setPfpNavShown(false)}} 
                      className='flex'
                    >

                    { location.pathname == '/settings' ? 
                      <MdSettings size={22} className='mr-1' /> :
                      <MdOutlineSettings size={22} className='mr-1'/>
                    }

                      Settings</Link></li>
                    
                    <div className='ml-1.5'>
                      <li className='text-grayNew-500 dark:text-grayNew-300 hover:underline flex pt-6 text-sm'>
                        <PiBookOpenText size={15} className='mr-1'/>
                        <a href="https://tobyhogan.github.io/habit-tracker-landing-page/documentation" target='_blank' className='flex'>Documentation
                          <MdOpenInNew size={11} className='mt-1 ml-1'/>
                        </a>
                      </li>
                      <li className='text-grayNew-500 dark:text-grayNew-300 hover:underline flex text-sm mt-1'>
                        <IoMdInformationCircleOutline size={15} className='mr-1'/>
                        <a href="https://tobyhogan.github.io/habit-tracker-landing-page/about" target='_blank' className='flex'>About
                          <MdOpenInNew size={11} className='mt-1 ml-1'/>
                        </a>
                      </li>
                    </div>

                  </ul>

                </div>}


            </div>
          </>
          : 
          <>
            <Link to="/home" className='mr-6 text-4xl'>SeasonsViewer</Link>
            <LoginButton dataUpdate={dataUpdate} setDataUpdate={setDataUpdate}/>
          </> 
        }
      </nav>
    </div>
  )
}

export default Header




/*





 {  location.pathname == '/analytics' ?
                <Link to="/analytics" className='mr-2 text-2xl flex mt-0.5'><AiOutlineAreaChart size={30} className='mr-1'/>
                <p className='MobileHidden'>Analytics</p><div className='MobileHidden mr-4' /></Link> :
                <Link to="/analytics" className='mr-2 text-2xl flex mt-0.5'><AiOutlineLineChart size={30} className='mr-1'/>
                <p className='MobileHidden'>Analytics</p><div className='MobileHidden mr-4' /></Link> }













*/