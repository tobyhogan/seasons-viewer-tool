import React, { useEffect, useRef, useState, useCallback } from 'react';
import InteractiveYearCircleV1 from './1-year-view/InteractiveYearCircleV1';

interface YearViewProps {
  currentDayOfYear: number;
  setCurrentDayOfYear: (day: number) => void;
  markerType: "timeBased" | "intensityBased" | "tempBased" | "tempAndIntensityBased";
  setMarkerType: (type: "timeBased" | "intensityBased" | "tempBased" | "tempAndIntensityBased") => void;
  darkThemeEnabled: boolean;
}

function YearView({ currentDayOfYear, setCurrentDayOfYear, markerType, setMarkerType, darkThemeEnabled }: YearViewProps) {
  const yellow1 = '#ffff00' // strong yellow
  const yellow2 = '#ffff99' // weaker yellow
  const blue1 = '#4444aa' //dark blue
  const blue2 = '#6666cc'// lighter blue

  /*

  const yellow1 = '#ffff00' // strong yellow
  const yellow2 = '#ffff99' // weaker yellow
  const blue1 = '#4444aa' //dark blue
  const blue2 = '#6666cc'// lighter blue

  */

  // Info divs
  const formattedDateRef = useRef<HTMLDivElement>(null);
  const sunlightPercentageRef = useRef<HTMLDivElement>(null);
  const avgSunlightPercentageRef = useRef<HTMLDivElement>(null);
  const temperaturePercentageRef = useRef<HTMLDivElement>(null);
  const daylightLengthRef = useRef<HTMLDivElement>(null);
  const daylightPercentageRef = useRef<HTMLDivElement>(null);
  const sunElevationAngleRef = useRef<HTMLDivElement>(null);

  // --- Helper functions ---
  function roundSpec(num: number, decimals: number) {
      const factor = Math.pow(10, decimals);
      return Math.round(num * factor) / factor;
  }

  function getTotalDaysInYear(date: Date) {
    const year = date.getFullYear();
    return (new Date(year, 11, 31).getDate() === 31) ? 366 : 365;
  }

  function getDayOfYear(date: Date) {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
  }

  function getJune21DayOfYear(year: number) {
    return getDayOfYear(new Date(year, 5, 21)); // June is month 5 (0-based)
  }

  function calculateSunlightPercentage(dayOfYear: number, totalDays: number) {
    const year = new Date().getFullYear();
    const june21 = getJune21DayOfYear(year);

    let offset = (dayOfYear - june21 + totalDays) % totalDays;

    const sunlight = Math.cos((offset / totalDays) * 2 * Math.PI);
    const sunlightCoeff = ((sunlight + 1) / 2);

    return sunlightCoeff;
    
  }

  function formatDate(dayOfYear: number, year: number) {
    const startOfYear = new Date(year, 0, 0);
    const date = new Date(startOfYear.getTime() + dayOfYear * 24 * 60 * 60 * 1000);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'long' });
    const daySuffix = (day % 10 === 1 && day !== 11) ? 'st' :
      (day % 10 === 2 && day !== 12) ? 'nd' :
      (day % 10 === 3 && day !== 13) ? 'rd' : 'th';
    return `${day}${daySuffix} of ${month} ${year}`;
  }

  // --- Update info display ---
  const updateDisplay = useCallback((dayOfYear: number, totalDays: number, year: number) => {

    if (formattedDateRef.current) formattedDateRef.current.textContent = `Day Selected: ${formatDate(dayOfYear, year)}`;
    if (sunlightPercentageRef.current) sunlightPercentageRef.current.textContent = `Daily Peak Sun Intensity: ${roundSpec((19.7 + ((100 - 19.7) * calculateSunlightPercentage(dayOfYear, totalDays))), 1)}%`;
    if (avgSunlightPercentageRef.current) avgSunlightPercentageRef.current.textContent = `24hr Average Sun Intensity: ${roundSpec((15.8 + ((100 - 15.8) * calculateSunlightPercentage(dayOfYear, totalDays))), 1)}%`;
    if (sunElevationAngleRef.current) sunElevationAngleRef.current.textContent = `Highest Sun Elevation: ${roundSpec((15.5 + calculateSunlightPercentage(dayOfYear, totalDays) * (61.5 - 15.5)), 1)}°`;
    if (daylightLengthRef.current) daylightLengthRef.current.textContent = `Daylight Time: ${roundSpec((6.5 + (calculateSunlightPercentage(dayOfYear, totalDays) * (16.5 - 6.5))), 1)} Hours`;
    if (temperaturePercentageRef.current) temperaturePercentageRef.current.textContent = `24hr Relative Temperature: ${roundSpec((15.8 + ((100 - 15.8) * calculateSunlightPercentage(dayOfYear - (365 * (5.5/52)), totalDays))), 1)}%`;
    if (daylightPercentageRef.current) daylightPercentageRef.current.textContent = `Daylight Percentage: ${roundSpec(calculateSunlightPercentage(dayOfYear, totalDays) * 100, 1)}%`;

  }, []);

  // --- Effect to update display when currentDayOfYear changes ---
  useEffect(() => {
    const totalDays = getTotalDaysInYear(new Date());
    updateDisplay(currentDayOfYear, totalDays, new Date().getFullYear());
  }, [currentDayOfYear, updateDisplay]);

  // --- Handlers for toggles and buttons ---
  const handleSetToToday = () => {
    const today = new Date();
    const totalDays = getTotalDaysInYear(today);
    setCurrentDayOfYear(Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)));
    updateDisplay(currentDayOfYear, totalDays, today.getFullYear());
  };

  return (
    <div id="column1" className="w-fit rounded-lg mx-auto mb-2">
      <div className="rounded-lg border-2">
        <h2 className="text-center text-[18px] mt-2 mb-[-9px] underline">Sun Info - Year View</h2>
        <InteractiveYearCircleV1 
          currentDayOfYear={currentDayOfYear}
          setCurrentDayOfYear={setCurrentDayOfYear}
          markerType={markerType}
          darkThemeEnabled={darkThemeEnabled}
          onDisplayUpdate={updateDisplay}
        />
        
        <hr className='border-[#444444]'/>

        <div className="flex flex-row border-none border-0">
          <div id="bottom-features" className="border-x-2 border-b-2 rounded-lg border-none w-full">
            <div id="formattedDate" className="info text-center mt-1 mb-0" ref={formattedDateRef}></div>
            <p className="text-center underline mt-[0px] mb-1 text-[16.2px]">Day Information:</p>
            <div id="sunlightPercentage" className="info text-center text-[14.8px]" ref={sunlightPercentageRef}></div>
            <div id="avgSunlightPercentage" className="info text-center text-[15px]" ref={avgSunlightPercentageRef}></div>
            <div id="sunElevationAngle" className="info text-center text-[15px]" ref={sunElevationAngleRef}></div>
            <div id="daylightPercentage" className="info text-center text-[15px]"></div>
            <div id="temperaturePercentage" className="info text-center text-[15px]" ref={temperaturePercentageRef}></div>
            <div id="daylightLength" className="info text-center text-[15px]" ref={daylightLengthRef}></div>
          
            <div className="mx-auto w-fit mt-[5px] mb-[7px]">
              <button
                id="setToTodayButton"
                className="color2Text px-4 py-[6px] bg-[#6a73d0] rounded-md text-white text-md cursor-pointer font-semibold text-[15px]"
                onClick={handleSetToToday}
              >
                Set to Today
              </button>
            </div>

            <hr className='border-t-1 border-[#888888] w-full'/>

            <p className='mx-auto pr-4 ml-7 pt-1'>Data View: </p>
            <div className='pl-8 pb-1'>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="markerType"
                  id="radioMarkers4"
                  checked={markerType === "tempAndIntensityBased"}
                  onChange={() => setMarkerType("tempAndIntensityBased")}
                />
                Tempertaure-Intensity-Average
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="markerType"
                  id="tempBasedMarkers"
                  checked={markerType === "tempBased"}
                  onChange={() => setMarkerType("tempBased")}
                />
                Temperature-based
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="markerType"
                  id="intensityBasedMarkers"
                  checked={markerType === "intensityBased"}
                  onChange={() => setMarkerType("intensityBased")}
                />
                Daily Peak Sun Intensity / Daylight Time
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="markerType"
                  id="timeBasedMarkers"
                  checked={markerType === "timeBased"}
                  onChange={() => setMarkerType("timeBased")}
                />
                Time-based
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default YearView;