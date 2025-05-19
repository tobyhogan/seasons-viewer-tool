import { createContext, useContext, useEffect, useRef, useState } from "react";
import supabase from "../../supabaseClient";

import React from 'react'

//import { dataUpdate, setDataUpdate } from './App'

const AppContext = createContext({});

const AppContextProvider = ({ children }) => {
  
  const [session, setSession] = useState(null);
  const [darkThemeEnabled, setDarkThemeEnabled] = useState(false)

  useEffect(() => {

    const { data: { subscription: authSubscription }, } = 
      supabase.auth.onAuthStateChange((event, newSession: any) =>

        { if ((event == 'SIGNED_OUT') || (event == 'INITIAL_SESSION')) { 

          setSession(newSession)
          //console.log(event)
          //console.log(session)

          if (event == 'SIGNED_OUT') {
            //setDataUpdate(dataUpdate => dataUpdate + 1)
            window.location.reload()

          }}});

    return () => { authSubscription.unsubscribe(); };

  }, []);

  useEffect(() => {

    if (session) {

      //console.log(session)
      const initializeTheme = async function () {
        const { data, error } = await supabase
          .from('profiles')    
          .select()
          .eq('id', session!.user.id)


        var darkThemeEnabledDb = data![0].dark_theme_enabled

        if (darkThemeEnabledDb) {
          document.body.classList.add('dark');
          setDarkThemeEnabled(true)

  
        } else if (!darkThemeEnabledDb) {
          document.body.classList.add('light');
          setDarkThemeEnabled(false)
        }
      }
      initializeTheme()
    }

  }, [session])

  useEffect(() => {
    async function updateTheme() {

      if (session) {

      if (darkThemeEnabled) {
        document.body.classList.remove('light');
        document.body.classList.add('dark');

        const { error } = await supabase
          .from('profiles')        
          .update({dark_theme_enabled: 'TRUE'})
          .eq('id', session.user.id)
        
  
      } else if (!darkThemeEnabled) {
        document.body.classList.remove('dark');
        document.body.classList.add('light');

        const { error } = await supabase
          .from('profiles')        
          .update({dark_theme_enabled: 'FALSE'})
          .eq('id', session.user.id)
      }
      }

    }

  updateTheme()

  }, [darkThemeEnabled])

  return (
    <AppContext.Provider value={{ session, darkThemeEnabled, setDarkThemeEnabled }}>
      {children}
    </AppContext.Provider>
  )

};

const useAppContext = () => useContext(AppContext);

export { AppContextProvider, useAppContext };
