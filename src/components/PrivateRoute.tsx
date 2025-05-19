import React from 'react'

import Landing from '../pages/Landing.tsx';

import { useAppContext } from '../app/appContext.tsx';


function PrivateRoute({ children }) {

    const { session }: any =  useAppContext()
 
    if (!session) {
       return <Landing title="Welcome - SeasonsViewer!"/>;
    }
    
    return children;
 };


export default PrivateRoute