// import { ColorModeScript } from "@chakra-ui/react";

//import AppContext from './appContext.tsx'
import ReactDOM from "react-dom/client";
import App from "./App";

import './dist/output.css';
import React from "react";


const root = document.getElementById("root")!;
const reactRoot = ReactDOM.createRoot(root);


reactRoot.render(
    <App></App>
);


