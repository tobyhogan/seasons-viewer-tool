import { useEffect, useState } from 'react'
import { createBrowserHistory } from 'history'
import React from "react";

import supabase from "../../supabaseClient.js";
import { useAppContext } from "../app/appContext.tsx";
import '../styles/App.css'


export default function LoginButton({ dataUpdate, setDataUpdate}) {

  const { session }: any = useAppContext();
  const history = createBrowserHistory()


  async function logIn() {


    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      /*options: {
        redirectTo: 'localhost:5173/home'
      }*/
    })
  }

  useEffect(() => {
    //console.log('hi')

    if (session) {

      //console.log(window.location.href)

      if (window.location.href == 'localhost:5173/landing') {
        //console.log("at landing page")
      }
    }
  })


  return (
    <>

      {session ? (
        <>
          <button
            className="py-1 px-2 border-none bg-gray-300 dark:text-grayNew-300 dark:bg-grayNew-650 dark:font-medium"
            onClick={() => {

              const { error }: any = supabase.auth.signOut();


              if (error) { 

                  return console.error("error signOut", error); 

                } else {

                  //setDataUpdate(dataUpdate => dataUpdate + 1)

                  //console.log("hey213")

                 // history.push("http://localhost:5173/landing")
                  //window.location.reload();
 
                }
            }}
          >
            Log out
          </button>
        </>
      ) : (
        <>
          <button
            className="py-1 px-2 border-none bg-[#d4d4d4] dark:text-grayNew-800 dark:font-medium"
            onClick={() => {

              //console.log('ok2')
              //history.push("/home")

              logIn().then(
                //console.log("login151")
              )
              /*.then(
                () => {
                  //history.push("http://localhost:5173/account")
                  //window.location.reload();
                }
              )*/
            }}
          >
            Sign Up / Login
          </button>
        </>
      )}
    </>
  );
}
