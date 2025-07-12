import React, { useState } from 'react';
import { useAppContext } from "../app/appContext";
import { IoMdMoon, IoMdSunny } from "react-icons/io";
import YearView from '../components/home-page/1-YearView';
import DayView from '../components/home-page/2-DayView';
import SunInformation from '../components/home-page/3-SunInformation';

function ViewerTool() {
  // Add context for dark mode
  const { darkThemeEnabled, setDarkThemeEnabled }: any = useAppContext();

  // Add this function to toggle dark mode
  function toggleTheme() {
    setDarkThemeEnabled(!darkThemeEnabled);
  }

  // Toggles
  type MarkerType = "timeBased" | "intensityBased" | "tempBased" | "tempAndIntensityBased";
  const [markerType, setMarkerType] = useState<MarkerType>("tempAndIntensityBased");

  // Main state
  const [currentDayOfYear, setCurrentDayOfYear] = useState(() => {
    const today = new Date();
    const start = new Date(today.getFullYear(), 0, 0);
    return Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  });
  const [sunCurveHour, setSunCurveHour] = useState(12); // default to noon

  // --- Render ---
  return (
    <div className={`${darkThemeEnabled ? "dark" : "light"} mx-auto bg-gray-50`}>
      <div className="w-min flex flex-row mx-auto">
        <div className="container1 w-max justify-center mt-2 flex h-max">
          <YearView 
            currentDayOfYear={currentDayOfYear}
            setCurrentDayOfYear={setCurrentDayOfYear}
            markerType={markerType}
            setMarkerType={setMarkerType}
            darkThemeEnabled={darkThemeEnabled}
          />
          <DayView 
            sunCurveHour={sunCurveHour}
            setSunCurveHour={setSunCurveHour}
            darkThemeEnabled={darkThemeEnabled}
          />
          <SunInformation />
        </div>
        <button
          onClick={toggleTheme}
          aria-label="Toggle dark mode"
          className="w-14 h-14 mt-2.5 rounded-md bg-gray-circCenterY ml-2 text-gray-800 shadow hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700 transition"
          style={{ fontSize: 24 }}
        >
          <div className='mx-auto w-fit'>
            {darkThemeEnabled ? <IoMdMoon size={24}/> : <IoMdSunny size={28}/>}
          </div>
        </button>
      </div>
    </div>
  );
}

export default ViewerTool;