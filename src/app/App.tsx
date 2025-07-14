import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { AppContextProvider, useAppContext } from "./appContext.tsx";

import "@mantine/core/styles.css";
import { MantineProvider } from "@mantine/core";
import { theme } from "../theme.ts";

//import { ContextMenuProvider } from 'mantine-contextmenu';

import '../dist/output.css';
import '../styles/App.css'

import PrivateRoute from '../components/PrivateRoute.tsx';

import NavBar from '../components/sections/Header.tsx'

import Page404 from '../pages/Page404.tsx'
import Landing from '../pages/Landing.tsx'
import Home from '../pages/Home.tsx'
import Analytics from '../pages/Analytics.tsx';
import Account from '../pages/Account.tsx'
import Settings from '../pages/Settings.tsx';
import Page2 from '../pages/Page2.tsx';



function App() {

  const { session }: any = useAppContext()
  const [dataUpdate, setDataUpdate] = useState(1);

  const tabSuffix =  " - SeasonsViewer"

  return (
    <MantineProvider theme={theme}>
      <AppContextProvider>
        <Router>
          <NavBar dataUpdate={dataUpdate} setDataUpdate={setDataUpdate}></NavBar>
          <div className=''>
            <Routes>
              { session ? <Route path="/" element={<Home />} /> : 
                <Route path="/" element={<Home />} /> }

              <Route path="*" element={<Page404 title={"404 Page" + tabSuffix}></Page404>} /> 
              <Route path="/landing" element={<Landing title={"Welcome" + tabSuffix}></Landing>} />
              <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>}/>
              <Route path="/main-dashboard" element={<Home />}/>
              <Route path="/page2" element={<Page2 />}/>
              <Route path="/analytics" element={<PrivateRoute><Analytics title={"Analytics" + tabSuffix} dataUpdate={dataUpdate} setDataUpdate={setDataUpdate}></Analytics></PrivateRoute>} />
              <Route path="/account" element={<PrivateRoute><Account title={"Your Account" + tabSuffix} dataUpdate={dataUpdate} setDataUpdate={setDataUpdate}></Account></PrivateRoute>} />
              <Route path="/settings" element={<PrivateRoute><Settings title={"Settings" + tabSuffix} dataUpdate={dataUpdate} setDataUpdate={setDataUpdate}></Settings></PrivateRoute>}/>
              {/*<Route path="/login" element={<Login></Login>} />*/}

            </Routes>
          </div>
        </Router>
      </AppContextProvider>
    </MantineProvider>

  );
}

export default App;

