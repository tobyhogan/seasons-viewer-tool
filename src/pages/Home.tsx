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
    <div className={`${darkThemeEnabled ? "dark" : "light"} min-h-screen transition-all duration-500`}>
      <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row justify-center items-start gap-8">
            <div className="container1 flex flex-col lg:flex-row justify-center items-start gap-6 bg-white/40 dark:bg-gray-800/40 backdrop-blur-lg rounded-3xl p-6 shadow-2xl border border-white/20 dark:border-gray-700/30">
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
              className="fixed top-6 right-6 w-14 h-14 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg text-gray-700 dark:text-gray-200 shadow-lg hover:shadow-xl border border-gray-200/50 dark:border-gray-600/50 transition-all duration-300 hover:scale-110 group z-50"
            >
              <div className="flex items-center justify-center w-full h-full">
                <div className="transition-transform duration-300 group-hover:rotate-12">
                  {darkThemeEnabled ? <IoMdMoon size={24}/> : <IoMdSunny size={26}/>}
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ViewerTool;