import React, { useEffect, useRef, useState, useCallback } from 'react';

interface DayViewProps {
  sunCurveHour: number;
  setSunCurveHour: (hour: number) => void;
  darkThemeEnabled: boolean;
}

function DayView({ sunCurveHour, setSunCurveHour, darkThemeEnabled }: DayViewProps) {
  // --- State and refs ---
  const sunAngleCanvasRef = useRef<HTMLCanvasElement>(null);
  
  // Selected date state - defaults to today
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Day view info
  const dayViewTimeSelectedRef = useRef<HTMLDivElement>(null);
  const dayViewCurrentSunAngleRef = useRef<HTMLDivElement>(null);
  const dayViewCurrentSunRelIntensityRef = useRef<HTMLDivElement>(null);

  // Drag state
  const draggingSunDot = useRef(false);

  // --- Helper functions ---
  function roundSpec(num: number, decimals: number) {
      const factor = Math.pow(10, decimals);
      return Math.round(num * factor) / factor;
  }

  function getCanvasColors() {
    const isDark = document.documentElement.classList.contains('dark');
    return {
      circle: isDark ? '#e0e6f0' : '#23272f',
      label: isDark ? '#e0e6f0' : '#23272f',
      blue: isDark ? '#7ecbff' : '#0074d9',
      blueLight: isDark ? '#b3e0ff' : '#7ecbff',
      red: isDark ? '#ff8a80' : '#e53935',
      yellow: isDark ? '#20e648' : '#4444cc',
      green: isDark ? '#7fff9f' : '#09bb4b',
      axis: isDark ? '#e0e6f0' : '#23272f',
      axisLabel: isDark ? '#e0e6f0' : 'black',
      axisDotted: isDark ? '#b3b3b3' : '#888',
      dotOutline: isDark ? '#e0e6f0' : 'black',
      bg: isDark ? '#23272f' : '#fff'
    };
  }

  function formatHourDecimal(hour: number) {
    const h = Math.floor(hour);
    const m = Math.round((hour - h) * 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  }

  // Draw Sun Angle Graph is here

  const drawSunAngleGraph = useCallback(() => {
    const radius = 180;

    const canvas = sunAngleCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // --- ADD THIS LINE: clear the canvas before drawing ---
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const colors = getCanvasColors();

    // --- CHANGED: Increase left margin from 40 to 80 ---
    const leftMargin = 95;
    const rightMargin = 40;
    const graphWidth = 380; // was 340, now 380 for similar right margin
    // Axes
    ctx.strokeStyle = colors.axis;
    ctx.lineWidth = 1;
    // X-axis (time)
    ctx.beginPath();
    ctx.moveTo(leftMargin, radius);
    ctx.lineTo(leftMargin + graphWidth, radius);
    ctx.stroke();
    // Y-axis (angle)
    ctx.beginPath();
    ctx.moveTo(leftMargin, radius);
    ctx.lineTo(leftMargin, 20);
    ctx.stroke();

    // Labels
    ctx.fillStyle = colors.axisLabel;
    ctx.font = '12px sans-serif';

    // X-axis ticks (hours)

    for (let h = 0; h <= 24; h += 1) {
        const x = leftMargin + (h / 24) * graphWidth;
        ctx.beginPath();
        ctx.moveTo(x, radius);
        ctx.lineTo(x, 185);
        ctx.stroke();
        ctx.fillText(h.toString(), x - 6, 195);
    }

    // Move "Time" label below the numbers
    ctx.fillText('Hour of Day', (leftMargin + graphWidth / 2) - 30, 212);

    // Y-axis ticks (intensity percentage)
    for (let i = 0; i <= 100; i += 20) {
        const y = radius - (i / 100) * 160;
        ctx.beginPath();
        ctx.moveTo(leftMargin - 5, y);
        ctx.lineTo(leftMargin, y);
        ctx.stroke();
        ctx.fillText(i.toString() + '%', leftMargin - 35, y + 4);
    }

    // --- Add horizontal y-axis title "Sun Intensity" ---
    ctx.save();
    ctx.font = '14px sans-serif';
    ctx.fillStyle = colors.axisLabel;
    ctx.textAlign = 'center';
    // Place the label horizontally, left of the y-axis, vertically centered
    ctx.fillText('Sun', leftMargin - 63, 95);
    ctx.restore();

    ctx.save();
    ctx.font = '14px sans-serif';
    ctx.fillStyle = colors.axisLabel;
    ctx.textAlign = 'center';
    // Place the label horizontally, left of the y-axis, vertically centered
    ctx.fillText('Intensity', leftMargin - 63, 110);
    ctx.restore();

    // Draw dotted line at zero intensity
    const zeroY = radius;
    ctx.save();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = colors.axisDotted;
    ctx.beginPath();
    ctx.moveTo(leftMargin, zeroY);
    ctx.lineTo(leftMargin + graphWidth, zeroY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // Sun position calculation for London
    // London: lat 51.5074, lon -0.1278

    // We'll use a simple solar position formula for demonstration (not precise for all cases)

    // this is within drawSunAngleGraph
    
    function solarElevationAngle(date: Date, lat: number, lon: number) {
      // Simple calculation without timezone complications
      const hours = date.getUTCHours() + date.getUTCMinutes() / 60;
      
      // Day of year
      const start = new Date(Date.UTC(date.getUTCFullYear(), 0, 0));
      const diff = date.getTime() - start.getTime();
      const oneDay = 1000 * 60 * 60 * 24;
      const dayOfYear = Math.floor(diff / oneDay);

      // Declination of the sun
      const decl = 23.44 * Math.sin((2 * Math.PI / 365) * (dayOfYear - 81));
      
      // Simple solar time calculation
      const solarTime = hours;
      
      // Hour angle
      const hourAngle = (solarTime - 12) * 15;
      // Convert degrees to radians
      const toRad = Math.PI / 180;
      // Calculate elevation
      const elevation = Math.asin(
          Math.sin(lat * toRad) * Math.sin(decl * toRad) +
          Math.cos(lat * toRad) * Math.cos(decl * toRad) * Math.cos(hourAngle * toRad)
      ) * (180 / Math.PI); // Convert back to degrees

      return elevation;
    }

    function sunIntensityAtTime(date: Date, lat: number, lon: number) {
        // For London, we need to convert from the hour input (which represents local time) to solar time
        const hours = date.getUTCHours() + date.getUTCMinutes() / 60;

        // Day of year
        const start = new Date(Date.UTC(date.getUTCFullYear(), 0, 0));
        const diff = date.getTime() - start.getTime();
        const oneDay = 1000 * 60 * 60 * 24;
        const dayOfYear = Math.floor(diff / oneDay);

        // Declination of the sun
        const decl = 23.44 * Math.sin((2 * Math.PI / 365) * (dayOfYear - 81));

        // For London: longitude correction only (no timezone offset since we want local solar time)
        // London is at 0° longitude, so no longitude correction needed
        const solarTime = hours; // Keep it simple for now

        // Hour angle (degrees from solar noon)
        const hourAngle = (solarTime - 12) * 15;

        // Convert degrees to radians
        const toRad = Math.PI / 180;

        // Calculate elevation angle in radians
        const elevationRad = Math.asin(
            Math.sin(lat * toRad) * Math.sin(decl * toRad) +
            Math.cos(lat * toRad) * Math.cos(decl * toRad) * Math.cos(hourAngle * toRad)
        );

        // Solar constant (W/m^2)
        const I0 = 1000;
        // Atmospheric extinction coefficient (typical clear sky)
        const k = 0.18;

        // If sun is below horizon, intensity is zero
        if (elevationRad <= 0) return 0;

        // Air mass effect: intensity = I0 * sin(elevation) * exp(-k / sin(elevation))
        const intensityWm2 = I0 * Math.sin(elevationRad) * Math.exp(-k / Math.sin(elevationRad));

        // Calculate maximum possible intensity for this location (summer solstice at solar noon)
        const maxDecl = 23.44; // Maximum declination on June 21st
        const maxElevationRad = Math.asin(
            Math.sin(lat * toRad) * Math.sin(maxDecl * toRad) +
            Math.cos(lat * toRad) * Math.cos(maxDecl * toRad)
        );
        const maxIntensityWm2 = I0 * Math.sin(maxElevationRad) * Math.exp(-k / Math.sin(maxElevationRad));

        // Normalize to get percentage relative to location's maximum
        const intensity = intensityWm2 / maxIntensityWm2;

        return intensity;
    }



    // Plot sun intensity CURVE for each hour (use small step for smooth curve)


    ctx.strokeStyle = colors.yellow;
    ctx.lineWidth = 2;
    ctx.beginPath();
    let first = true;
    
    for (let h = 0; h <= 24; h += 0.01) { // Much smaller increment for smooth curve
        // Construct date in local time (not UTC)
        const date = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), Math.floor(h), (h % 1) * 60, 0);
        const intensity = sunIntensityAtTime(date, 51.5074, -0.1278) * 100; // Convert to percentage
        
        const x = leftMargin + (h / 24) * graphWidth;
        const y = radius - (intensity / 100) * 160; // Map 0-100% to graph height
        
        // Ensure y coordinates are within bounds
        const clampedY = Math.max(20, Math.min(radius, y));
        
        if (first) {
            ctx.moveTo(x, clampedY);
            first = false;
        } else {
            ctx.lineTo(x, clampedY);
        }
    }
    ctx.stroke();

    // Draw draggable dot on the curve
    const dotHour = sunCurveHour;
    // Construct date in local time (not UTC)
    const dotDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), Math.floor(dotHour), (dotHour % 1) * 60, 0);
    const dotIntensity = sunIntensityAtTime(dotDate, 51.5074, -0.1278) * 100; // Convert to percentage
    const dotX = leftMargin + (dotHour / 24) * graphWidth;
    const dotY = radius - (dotIntensity / 100) * 160;

    // --- NEW: Draw horizontal dotted line at dotY ---
    ctx.save();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = "blue";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(leftMargin, dotY);
    ctx.lineTo(leftMargin + graphWidth, dotY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.arc(dotX, dotY, 6, 0, 2 * Math.PI);
    ctx.fillStyle = "#6a6aff"
    ctx.strokeStyle = colors.dotOutline;
    ctx.lineWidth = 2;
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // --- NEW: Update the time selected text in the day view ---
    if (dayViewTimeSelectedRef.current) {
        dayViewTimeSelectedRef.current.textContent = `Time Selected: ${formatHourDecimal(sunCurveHour)}`;
    }
    // --- NEW: Update the current sun angle text in the day view ---
    if (dayViewCurrentSunAngleRef.current) {
        var angle = solarElevationAngle(dotDate, 51.5074, -0.1278);
        angle = Math.max(-90, Math.min(90, angle)); // Clamp to reasonable angle range
        
        dayViewCurrentSunAngleRef.current.textContent = `Sun Angle: ${roundSpec(angle, 1)}°`;
    }

    // 

    if (dayViewCurrentSunRelIntensityRef.current) {
        var relIntensity = sunIntensityAtTime(dotDate, 51.5074, -0.1278);
        
        relIntensity = Math.max(0, roundSpec(relIntensity * 100, 1));


        dayViewCurrentSunRelIntensityRef.current.textContent = `Relative Sun Intensity: ${relIntensity}%`;
    }

  }, [sunCurveHour, selectedDate]); // Add selectedDate to dependencies

  // --- Effect for sun intensity graph ---
  useEffect(() => {
    drawSunAngleGraph();

    // --- Add drag functionality for the sun intensity dot ---
    const canvas = sunAngleCanvasRef.current;
    if (!canvas) return;

    // Helper: get dot position for current sunCurveHour
    function getDotPos(hour: number) {
      const leftMargin = 80;
      const graphWidth = 380;
      const radius = 180;
      
      // Calculate sun intensity for the given hour
      function calculateSunIntensity(date: Date, lat: number, lon: number) {
        // Simplified calculation matching the main functions
        const hours = date.getUTCHours() + date.getUTCMinutes() / 60;
        
        const start = new Date(Date.UTC(date.getUTCFullYear(), 0, 0));
        const diff = date.getTime() - start.getTime();
        const oneDay = 1000 * 60 * 60 * 24;
        const dayOfYear = Math.floor(diff / oneDay);
        const decl = 23.44 * Math.sin((2 * Math.PI / 365) * (dayOfYear - 81));
        
        const solarTime = hours;
        const hourAngle = (solarTime - 12) * 15;
        const toRad = Math.PI / 180;
        const elevationRad = Math.asin(
            Math.sin(lat * toRad) * Math.sin(decl * toRad) +
            Math.cos(lat * toRad) * Math.cos(decl * toRad) * Math.cos(hourAngle * toRad)
        );
        const elevationDeg = elevationRad * (180 / Math.PI);
        const rawIntensity = elevationDeg > 0 ? Math.sin(elevationRad) : 0;
        const maxDecl = 23.44;
        const maxElevationRad = Math.asin(
            Math.sin(lat * toRad) * Math.sin(maxDecl * toRad) +
            Math.cos(lat * toRad) * Math.cos(maxDecl * toRad)
        );
        const maxIntensity = Math.sin(maxElevationRad);
        return rawIntensity / maxIntensity;
      }
      
      const date = new Date(Date.UTC(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 0, hour * 60, 0));
      const intensity = calculateSunIntensity(date, 51.5074, -0.1278) * 100; // Convert to percentage
      const x = leftMargin + (hour / 24) * graphWidth;
      const y = radius - (intensity / 100) * 160; // Map 0-100% to graph height
      return { x, y };
    }

    function isOverSunDot(mouseX: number, mouseY: number) {
      const { x, y } = getDotPos(sunCurveHour);
      const dist = Math.sqrt((mouseX - x) ** 2 + (mouseY - y) ** 2);
      return dist < 10;
    }

    function handleMouseDown(event: MouseEvent) {
      const rect = canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;
      if (isOverSunDot(mouseX, mouseY)) {
        draggingSunDot.current = true;
        canvas.style.cursor = 'grabbing';
      }
    }

    function handleMouseMove(event: MouseEvent) {
      const rect = canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;
      if (draggingSunDot.current) {
        // Find the closest hour for the mouseX position
        const leftMargin = 80;
        const graphWidth = 380;
        let hour = ((mouseX - leftMargin) / graphWidth) * 24;
        hour = Math.max(0, Math.min(24, hour));
        setSunCurveHour(hour);
      } else {
        if (isOverSunDot(mouseX, mouseY)) {
          canvas.style.cursor = 'pointer';
        } else {
          canvas.style.cursor = 'default';
        }
      }
    }

    function handleMouseUp() {
      draggingSunDot.current = false;
      canvas.style.cursor = 'default';
    }
    function handleMouseLeave() {
      draggingSunDot.current = false;
      canvas.style.cursor = 'default';
    }

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [sunCurveHour, drawSunAngleGraph, setSunCurveHour, selectedDate]); // Add selectedDate and setSunCurveHour to dependencies

  // --- Effect for dark mode toggle ---
  useEffect(() => {
    const htmlEl = document.documentElement;
    const observer = new MutationObserver(() => {
      drawSunAngleGraph();
    });
    observer.observe(htmlEl, { attributes: true, attributeFilter: ['class'] });
    // Force redraw on darkThemeEnabled change
    drawSunAngleGraph();
    return () => observer.disconnect();
  }, [drawSunAngleGraph, darkThemeEnabled]);

  const handleSetToNow = () => {
    const now = new Date();
    const localHour = now.getHours() + now.getMinutes() / 60;
    setSunCurveHour(localHour);
    setSelectedDate(new Date()); // Also set selected date to today
    drawSunAngleGraph();
  };

  // Helper function to format date for input field
  const formatDateForInput = (date: Date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Handle date change from input
  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(event.target.value);
    setSelectedDate(newDate);
  };



  return (
    <div className="middleColumn border-2 rounded-lg h-fit mt-[0px] ml-2 w-[600px] pl-[11px] bg-white pb-3 mx-auto mb-2">
      <h2 className="text-center underline text-[18px] mt-3">Sun Info - Day View</h2>
      
      <div className="dayViewTool">
        {/* Sun intensity graph */}
        <canvas
          ref={sunAngleCanvasRef}
          width={540}
          height={230}
          className='mx-auto mt-3 border-2 border-black rounded-lg'
        />
        
        {/* Day Selector Section - moved below graph */}

        <div className="mx-auto w-fit mt-4">
          <button
            id="setToNowButton"
            className="color2Text px-5 py-[6px] bg-[#6a73d0] rounded-md text-white text-md cursor-pointer font-semibold text-[15px]"
            onClick={handleSetToNow}
          >
            Set to Now/Today
          </button>
        </div>
        <div id="dayViewTimeSelected" className="text-center text-[15px] mt-2" ref={dayViewTimeSelectedRef}></div>
        <div className="mx-auto w-fit rounded-lg">
          
          {/* Date Input */}
          <div className="mt-3 text-center">
            <label htmlFor="date-input" className="block font-medium mb-1">Selected Date:</label>
            <input
              id="date-input"
              type="date"
              value={formatDateForInput(selectedDate)}
              onChange={handleDateChange}
              className="border border-gray-400 rounded px-2 py-1 text-sm"
            />
          </div>
          {/*
          <button
            id="setToNowButton"
            className="color2Text mt-3 px-5 py-[6px] bg-[#6a73d0] rounded-md text-white text-md cursor-pointer font-semibold text-[15px]"
            onClick={handleSetToNow}
          >
            Set to Current Date
          </button>
          */}
        </div>
        <div className="text-center text-[15px] mt-3 font-medium text-blue-600">
          Selected Date: {selectedDate.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
        <div id="dayViewCurrentSunAngle" className="text-center text-[15px] mt-1" ref={dayViewCurrentSunAngleRef}></div>
        <div id="dayViewCurrentSunRelIntensity" className="text-center text-[15px] mt-1" ref={dayViewCurrentSunRelIntensityRef}></div>
      </div>
    </div>
  );
}

export default DayView;



/*

function solarElevationAngle(date: Date, lat: number, lon: number) {
        // Convert date to UTC decimal hours
        const hours = date.getUTCHours() + date.getUTCMinutes() / 60;
        // Day of year
        const start = new Date(Date.UTC(date.getUTCFullYear(), 0, 0));
        const diff = date.getTime() - start.getTime();
        const oneDay = 1000 * 60 * 60 * 24;
        const dayOfYear = Math.floor(diff / oneDay);

        // Declination of the sun
        const decl = 23.44 * Math.sin((2 * Math.PI / 365) * (dayOfYear - 81));
        // Time correction for longitude
        const timeOffset = (lon / 15);
        // Solar time
        const solarTime = hours + timeOffset;
        // Hour angle
        const hourAngle = (solarTime - 12) * 15;
        // Convert degrees to radians
        const toRad = Math.PI / radius;
        // Calculate elevation
        const elevation = Math.asin(
            Math.sin(lat * toRad) * Math.sin(decl * toRad) +
            Math.cos(lat * toRad) * Math.cos(decl * toRad) * Math.cos(hourAngle * toRad)
        ) * (radius / Math.PI);

        return elevation;
    }


*/