import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useAppContext } from "../app/appContext"; // Add this import

import { IoMdMoon, IoMdSunny } from "react-icons/io";

function ViewerTool() {

  const yellow1 = '#ffff00' // strong yellow
  const yellow2 = '#ffff99' // weaker yellow
  const blue1 = '#4444aa' //dark blue
  const blue2 = '#6666cc'// lighter blue

  // Add context for dark mode
  const { darkThemeEnabled, setDarkThemeEnabled }: any = useAppContext();

  // Add this effect to sync darkThemeEnabled with the html class
  useEffect(() => {
    if (darkThemeEnabled) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, [darkThemeEnabled]);

  // Add this function to toggle dark mode
  function toggleTheme() {
    setDarkThemeEnabled(!darkThemeEnabled);
    // No need to manually set class here, appContext handles it
  }

  // --- State and refs ---
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sunAngleCanvasRef = useRef<HTMLCanvasElement>(null);

  // Info divs
  const formattedDateRef = useRef<HTMLDivElement>(null);
  const sunlightPercentageRef = useRef<HTMLDivElement>(null);
  const avgSunlightPercentageRef = useRef<HTMLDivElement>(null);
  const temperaturePercentageRef = useRef<HTMLDivElement>(null);
  const daylightLengthRef = useRef<HTMLDivElement>(null);
  const daylightPercentageRef = useRef<HTMLDivElement>(null);
  
  const sunElevationAngleRef = useRef<HTMLDivElement>(null);

  // Day view info
  const dayViewTimeSelectedRef = useRef<HTMLDivElement>(null);
  const dayViewCurrentSunAngleRef = useRef<HTMLDivElement>(null);

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

  // Drag state
  const draggingDot = useRef(false);
  const draggingSunDot = useRef(false);

  // --- Helper functions (same as before, but moved outside useEffect) ---
  function roundSpec(num: number, decimals: number) {
      const factor = Math.pow(10, decimals);
      return Math.round(num * factor) / factor;
  }

  // --- Add: Helper to check if mouse is over the green dot ---
  function isMouseOverDot(mouseX: number, mouseY: number, dotX: number, dotY: number) {
    const dist = Math.sqrt((mouseX - dotX) ** 2 + (mouseY - dotY) ** 2);
    return dist < 10;
  }

  function getTotalDaysInYear(date: Date) {
    const year = date.getFullYear();
    return (new Date(year, 11, 31).getDate() === 31) ? 366 : 365;
  }

  // Helper: get day of year for June 21st and Dec 21st for any year
  function getDayOfYear(date: Date) {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
  }
  function getJune21DayOfYear(year: number) {
    return getDayOfYear(new Date(year, 5, 21)); // June is month 5 (0-based)
  }
  function getDec21DayOfYear(year: number) {
    return getDayOfYear(new Date(year, 11, 21)); // December is month 11
  }

  // Function to calculate sunlight percentage
  function calculateSunlightPercentage(dayOfYear: number, totalDays: number) {
    // Find the day of year for June 21st for the current year
    const year = new Date().getFullYear();
    const june21 = getJune21DayOfYear(year);

    // Calculate the offset from June 21st, wrapping around the year
    let offset = (dayOfYear - june21 + totalDays) % totalDays;

    // Map offset to [0, totalDays)
    // The cosine curve should peak at offset = 0 (June 21st)
    // and reach minimum at offset = totalDays/2 (Dec 21st)
    const sunlight = Math.cos((offset / totalDays) * 2 * Math.PI);

    // Normalize sunlight to range from 0 to 1
    const sunlightCoeff = ((sunlight + 1) / 2);

    return sunlightCoeff;
  }

  // Function to format the date as "9th of June 2016"
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

  // --- Add: Helper to get current canvas colors based on dark mode ---
  function getCanvasColors() {
    const isDark = document.documentElement.classList.contains('dark');
    return {
      circle: isDark ? '#e0e6f0' : '#23272f',
      label: isDark ? '#e0e6f0' : '#23272f',
      blue: isDark ? '#7ecbff' : '#0074d9',
      blueLight: isDark ? '#b3e0ff' : '#7ecbff',
      red: isDark ? '#ff8a80' : '#e53935',
      yellow: isDark ? '#20e648' : '#1e9636',
      green: isDark ? '#7fff9f' : '#09bb4b',
      axis: isDark ? '#e0e6f0' : '#23272f',
      axisLabel: isDark ? '#e0e6f0' : '#23272f',
      axisDotted: isDark ? '#b3b3b3' : '#888',
      dotOutline: isDark ? '#e0e6f0' : '#23272f',
      bg: isDark ? '#23272f' : '#fff'
    };
  }


  // --- Drawing functions ---
  const drawCircleAndDot = useCallback((dayOfYear: number, totalDays: number) => {



    
    
    //const colorsList = [yellow1, yellow2, blue2, blue1, blue2, yellow2]
    
    
    function drawMarkersAndSectors(weeksFromJune21) {
      
      const sectorCoords: [number, number, string][] = [
        [3.65, 5.77, yellow1], // strong yellow
        [5.77, 6.3, yellow2], // lighter yellow, right
        [5.77, 6.3, yellow2], // lighter yellow, right
        [6.3, 6.9, blue2], // lighter blue, right
        [6.8, 8.95, blue1], // dark blue
        [8.9, 9.44, blue2], // lighter blue, left
        [9.44, 10, yellow2] // lighter yellow, left
      ];
      
      const intensities = [0.8, 0.595, 0.4];


      const coords2 = [];


      // the below function is supposed to generate coordinates for the sectors based on the input intensitie percentiles
      
  
      intensities.forEach((intensity) => {
  
        const year = new Date().getFullYear();
        const june21 = getJune21DayOfYear(year);
        const radsFromJun21 = (weeksFromJune21 / 52) * 2 * Math.PI;
        

        const sunlightCoeff = (intensity - 0.197) / (1 - 0.197);
        const cosVal = sunlightCoeff * 2 - 1;
        let offset = Math.acos(cosVal) * totalDays / (2 * Math.PI);
        let markerDay = (june21 + Math.round(offset)) % totalDays;
        const angle = (-Math.PI / 2 + ((markerDay - june21 + totalDays) % totalDays) * (2 * Math.PI / totalDays)) + radsFromJun21;
        const angleMirror = angle + Math.PI;

        coords2.push(angle, angle + 2)
  
      })

      
      const radsFromJun21 = (weeksFromJune21 / 52) * 2 * Math.PI;
      
      sectorCoords.forEach((coord, index) => {
        console.log(coord)
  
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(circCenterX, circCenterY);
        ctx.arc(circCenterX, circCenterY, radius - 1, coord[0] + radsFromJun21, coord[1] + radsFromJun21, false);
  
        ctx.closePath();
        ctx.globalAlpha = 1;
        ctx.fillStyle = coord[2]; // light yellow
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.restore();
      
      })


      const year = new Date().getFullYear();
      const june21 = getJune21DayOfYear(year);


      function drawMarker(x1, x2, y1, y2) {

      }
      
      
      intensities.forEach((intensity) => {

        const sunlightCoeff = (intensity - 0.197) / (1 - 0.197);

        const cosVal = sunlightCoeff * 2 - 1;

        let offset = Math.acos(cosVal) * totalDays / (2 * Math.PI);
        
        let markerDay = (june21 + Math.round(offset)) % totalDays;
        
        const angle = (-Math.PI / 2 + ((markerDay - june21 + totalDays) % totalDays) * (2 * Math.PI / totalDays)) + radsFromJun21;
        
        const angleMirror = angle + Math.PI;

        ctx.save();
        ctx.strokeStyle = "red";
        ctx.lineWidth = 2;
        const dashLen = 13;

        function drawIntensityMarkers(angle) {
          
          const x1 = circCenterX + (radius - dashLen / 2) * Math.cos(angle);
          const y1 = circCenterY + (radius - dashLen / 2) * Math.sin(angle);
          const x2 = circCenterX + (radius + dashLen / 2) * Math.cos(angle);
          const y2 = circCenterY + (radius + dashLen / 2) * Math.sin(angle);
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();

        }

        drawIntensityMarkers(angle)
        drawIntensityMarkers(angleMirror)

        ctx.restore();


      });

      ctx.save();
      ctx.strokeStyle = "red";
      ctx.lineWidth = 2;
      const dashLen = 13;

      function drawTopAndBottomMarkers(coeff) {
        
        const angleTop = (coeff * Math.PI * 0.5) + radsFromJun21;
  
        const x1Top = circCenterX + (radius - dashLen / 2) * Math.cos(angleTop);
        const y1Top = circCenterY + (radius - dashLen / 2) * Math.sin(angleTop);
        const x2Top = circCenterX + (radius + dashLen / 2) * Math.cos(angleTop);
        const y2Top = circCenterY + (radius + dashLen / 2) * Math.sin(angleTop);
  
        ctx.beginPath();
        ctx.moveTo(x1Top, y1Top);
        ctx.lineTo(x2Top, y2Top);
        ctx.stroke();

      }

      drawTopAndBottomMarkers(1);
      drawTopAndBottomMarkers(-1);


      ctx.restore();

      console.log(radsFromJun21)

    
    }

    const canvasWidth = 300;
    const canvasHeight = 270;

    const circCenterX = canvasWidth / 2;
    const circCenterY = canvasHeight / 2;

    const pi = 3.141592;

    const radius = 100;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const colors = getCanvasColors();

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.strokeStyle = colors.circle;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(circCenterX, circCenterY, radius, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.restore();

    // Calculate blue marker points (cardinal)
    const top = { x: circCenterX, y: circCenterY - radius };
    const bottom = { x: circCenterX, y: circCenterY + radius };
    const left = { x: circCenterX - radius, y: circCenterY };
    const right = { x: circCenterX + radius, y: circCenterY };

    // Calculate red marker points (diagonals)
    const diag = Math.SQRT1_2 * radius;
    const nw = { x: circCenterX - diag, y: circCenterY - diag };
    const ne = { x: circCenterX + diag, y: circCenterY - diag };
    const sw = { x: circCenterX - diag, y: circCenterY + diag };
    const se = { x: circCenterX + diag, y: circCenterY + diag };

    // Helper to draw a perpendicular marker at (x, y) with angle theta
    const drawDiagonalMarker = (x: number, y: number, angle: number, len: number) => {
        const dx = Math.cos(angle) * len / 2;
        const dy = Math.sin(angle) * len / 2;
        ctx.beginPath();
        ctx.moveTo(x - dx, y - dy);
        ctx.lineTo(x + dx, y + dy);
        ctx.stroke();
    };

    // Draw blue markers (perpendicular to circle) and diagonal markers if enabled
    if (markerType === "timeBased") {
      ctx.save();
      ctx.strokeStyle = colors.blue;
      ctx.lineWidth = 2;
      const blueMarkerLen = 13;
      // Top marker (vertical)
      ctx.beginPath();
      ctx.moveTo(top.x, top.y - blueMarkerLen / 2 - 2);
      ctx.lineTo(top.x, top.y + blueMarkerLen / 2 - 1.5);
      ctx.stroke();

      // Bottom marker (vertical)
      ctx.beginPath();
      ctx.moveTo(bottom.x, bottom.y - blueMarkerLen / 3);
      ctx.lineTo(bottom.x, bottom.y + blueMarkerLen / 2 + 1.5);
      ctx.stroke();

      // Left marker (horizontal)
      ctx.beginPath();
      ctx.moveTo(left.x - blueMarkerLen / 2 - 2, left.y);
      ctx.lineTo(left.x + blueMarkerLen / 2 - 1.5, left.y);
      ctx.stroke();

      // Right marker (horizontal)
      ctx.beginPath();
      ctx.moveTo(right.x - blueMarkerLen / 2 + 2, right.y);
      ctx.lineTo(right.x + blueMarkerLen / 2 + 1.5, right.y);
      ctx.stroke();

      ctx.restore();

      ctx.save();
      ctx.strokeStyle = colors.blue;
      ctx.lineWidth = 2;

      // NW: angle = -3 * Math.PI / 4 (perpendicular to radius at NW)
      drawDiagonalMarker(nw.x - 1, nw.y - 1, -3 * Math.PI / 4, 8 + 3);
      // NE: angle = -Math.PI / 4
      drawDiagonalMarker(ne.x + 1, ne.y - 1, -Math.PI / 4, 8 + 3);
      // SW: angle = 3 * Math.PI / 4
      drawDiagonalMarker(sw.x - 1, sw.y + 1, 3 * Math.PI / 4, 8 + 3);
      // SE: angle = Math.PI / 4
      drawDiagonalMarker(se.x + 1, se.y + 1, Math.PI / 4, 8 + 3);

      ctx.restore();
    }


   if (markerType === "intensityBased") {

     
      drawMarkersAndSectors(0)
      

    }

    if (markerType === "tempAndIntensityBased") {

      drawMarkersAndSectors(2.5)
    }
    
    
    if (markerType === "tempBased") {
  
      drawMarkersAndSectors(5)


    }


    ctx.font = `${radius * 0.1}px Arial`;
    ctx.fillStyle = colors.label;
    ctx.textAlign = 'center';

    // Calculate actual day numbers for current year
    const year = new Date().getFullYear();
    const june21 = getJune21DayOfYear(year);
    const dec21 = getDec21DayOfYear(year);

    // Place June 21st label at the top
    ctx.fillText("Jun 21st – 100% Sun Intensity at Peak", circCenterX, circCenterY - radius * 1.1);

    // Place Dec 21st label at the bottom
    ctx.fillText('Dec 21st – 19.7% Sun Intensity at Peak', circCenterX, circCenterY + radius * 1.18);



    const angle = -Math.PI / 2 + ((dayOfYear - june21 + totalDays) % totalDays) * (2 * Math.PI / totalDays);

    // Calculate the dot's position
    const dotX = circCenterX + radius * Math.cos(angle);
    const dotY = circCenterY + radius * Math.sin(angle);

    // Draw the dot
    ctx.save();
    ctx.beginPath();
    ctx.arc(dotX, dotY, radius * 0.07, 0, 2 * Math.PI);
    ctx.fillStyle = colors.green;
    ctx.lineWidth = 2;
    ctx.fill();
    ctx.restore();
  }, [markerType]);

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
    const leftMargin = 80;
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
    for (let h = 0; h <= 24; h += 6) {
        const x = leftMargin + (h / 24) * graphWidth;
        ctx.beginPath();
        ctx.moveTo(x, radius);
        ctx.lineTo(x, 185);
        ctx.stroke();
        ctx.fillText(h.toString(), x - 6, 195);
    }

    // Move "Time" label below the numbers
    ctx.fillText('Time', leftMargin + graphWidth / 2, 210);

    // Y-axis ticks (angle)
    for (let a = -18; a <= 90; a += 36) {
        const y = radius - ((a + 18) / 108) * 160;
        ctx.beginPath();
        ctx.moveTo(leftMargin - 5, y);
        ctx.lineTo(leftMargin, y);
        ctx.stroke();
        ctx.fillText(a.toString(), leftMargin - 30, y + 4);
    }

    // --- Add horizontal y-axis title "Sun angle" ---
    ctx.save();
    ctx.font = '14px sans-serif';
    ctx.fillStyle = colors.axisLabel;
    ctx.textAlign = 'center';
    // Place the label horizontally, left of the y-axis, vertically centered
    ctx.fillText('Sun', leftMargin - 55, 100);
    ctx.restore();

    ctx.save();
    ctx.font = '14px sans-serif';
    ctx.fillStyle = colors.axisLabel;
    ctx.textAlign = 'center';
    // Place the label horizontally, left of the y-axis, vertically centered
    ctx.fillText('Angle', leftMargin - 55, 115);
    ctx.restore();

    // Draw dotted line at zero degrees
    const zeroY = radius - ((0 + 18) / 108) * 160;
    ctx.save();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = colors.axisDotted;
    ctx.beginPath();
    ctx.moveTo(leftMargin, zeroY);
    ctx.lineTo(leftMargin + graphWidth, zeroY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // Sun position calculation for London, May 15th
    // London: lat 51.5074, lon -0.1278, May 15th
    // We'll use a simple solar position formula for demonstration (not precise for all cases)
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

    // Plot sun angle for each hour (use smaller step for smoothness)
    ctx.strokeStyle = colors.yellow;
    ctx.lineWidth = 2;
    ctx.beginPath();
    let first = true;
    for (let h = 0; h <= 24; h += 0.01) { // smaller step for smoother curve
        const date = new Date(Date.UTC(2023, 4, 15, 0, h * 60, 0)); // h may be fractional
        const angle = Math.max(-18, Math.min(90, solarElevationAngle(date, 51.5074, -0.1278)));
        const x = leftMargin + (h / 24) * graphWidth;
        const y = radius - ((angle + 18) / 108) * 160;
        if (first) {
            ctx.moveTo(x, y);
            first = false;
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.stroke();

    // Draw draggable dot on the curve
    const dotHour = sunCurveHour;
    const dotDate = new Date(Date.UTC(2023, 4, 15, 0, dotHour * 60, 0));
    const dotAngle = Math.max(-18, Math.min(90, solarElevationAngle(dotDate, 51.5074, -0.1278)));
    const dotX = leftMargin + (dotHour / 24) * graphWidth;
    const dotY = radius - ((dotAngle + 18) / 108) * 160;

    // --- NEW: Draw horizontal dotted line at dotY ---
    ctx.save();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = colors.green;
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
    ctx.fillStyle = colors.green;
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
        const dotAngle = Math.max(-18, Math.min(90, solarElevationAngle(dotDate, 51.5074, -0.1278)));
        dayViewCurrentSunAngleRef.current.textContent = `Current sun angle: ${roundSpec(dotAngle, 1)}°`;
    }
  }, [sunCurveHour]);

  // --- Update info display ---
  const updateDisplay = useCallback((dayOfYear: number, totalDays: number, year: number) => {
    // ...existing code...
    if (formattedDateRef.current) formattedDateRef.current.textContent = `Day Selected: ${formatDate(dayOfYear, year)}`;
    if (sunlightPercentageRef.current) sunlightPercentageRef.current.textContent = `Daily Peak Sun Intensity: ${roundSpec((19.7 + ((100 - 19.7) * calculateSunlightPercentage(dayOfYear, totalDays))), 1)}%`;
    if (avgSunlightPercentageRef.current) avgSunlightPercentageRef.current.textContent = `24hr Average Sun Intensity: ${roundSpec((15.8 + ((100 - 15.8) * calculateSunlightPercentage(dayOfYear, totalDays))), 1)}%`;
    if (sunElevationAngleRef.current) sunElevationAngleRef.current.textContent = `Highest Sun Elevation: ${roundSpec((15.5 + calculateSunlightPercentage(dayOfYear, totalDays) * (61.5 - 15.5)), 1)}°`;
    if (daylightLengthRef.current) daylightLengthRef.current.textContent = `Daylight Time: ${roundSpec((6.5 + (calculateSunlightPercentage(dayOfYear, totalDays) * (16.5 - 6.5))), 1)} Hours`;
    if (temperaturePercentageRef.current) temperaturePercentageRef.current.textContent = `24hr Relative Temperature: ${roundSpec((15.8 + ((100 - 15.8) * calculateSunlightPercentage(dayOfYear - (365 * (5.5/52)), totalDays))), 1)}%`;
    if (daylightPercentageRef.current) daylightPercentageRef.current.textContent = `Daylight Percentage: ${roundSpec(calculateSunlightPercentage(dayOfYear, totalDays) * 100, 1)}%`;
    drawCircleAndDot(dayOfYear, totalDays);
  }, [drawCircleAndDot]);

  // --- Main effect for drawing and event listeners ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const canvasWidth = 300;
    const canvasHeight = 270;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    const totalDays = getTotalDaysInYear(new Date());
    updateDisplay(currentDayOfYear, totalDays, new Date().getFullYear());

    // --- Mouse events for main circle ---
    function handleMouseDown(event: MouseEvent) {

      const canvasWidth = 300;
      const canvasHeight = 270;

      const circCenterX = canvasWidth / 2;
      const circCenterY = canvasHeight / 2;

      const radius = 100;

      const rect = canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      const totalDays = getTotalDaysInYear(new Date());
      const year = new Date().getFullYear();
      const june21 = getJune21DayOfYear(year);
      // Calculate angle for current dot position
      const angle = -Math.PI / 2 + ((currentDayOfYear - june21 + totalDays) % totalDays) * (2 * Math.PI / totalDays);

      const dotX = circCenterX + radius * Math.cos(angle);
      const dotY = circCenterY + radius * Math.sin(angle);

      const dx = mouseX - circCenterX;
      const dy = mouseY - circCenterY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Position of green dot
      const greenDotX = dotX;
      const greenDotY = dotY;
      const dotDist = Math.sqrt((mouseX - greenDotX) ** 2 + (mouseY - greenDotY) ** 2);

      // If mouse is near the green dot, start dragging
      if (dotDist < 10) {
        draggingDot.current = true;
        canvas.style.cursor = 'grabbing'; // Change cursor to grabbing when dragging starts
      } else if (Math.abs(dist - radius) < 10) {
        // If click is near the circle's edge, move green dot there
        const newAngle = Math.atan2(dy, dx);
        setCurrentDayOfYear(calculateDayOfYearFromAngle(newAngle, totalDays));
        updateDisplay(currentDayOfYear, totalDays, year);
        return;
      }
    }
    function handleMouseMove(event: MouseEvent) {

      const canvasWidth = 300;
      const canvasHeight = 280;

      const circCenterX = canvasWidth / 2;
      const circCenterY = canvasHeight / 2;


      const radius = 100;

      const rect = canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      const totalDays = getTotalDaysInYear(new Date());
      const year = new Date().getFullYear();
      const june21 = getJune21DayOfYear(year);
      const angle = -Math.PI / 2 + ((currentDayOfYear - june21 + totalDays) % totalDays) * (2 * Math.PI / totalDays);

    
      const dotX = circCenterX + radius * Math.cos(angle);
      const dotY = circCenterY + radius * Math.sin(angle);

      if (isMouseOverDot(mouseX, mouseY, dotX, dotY)) {
        canvas.style.cursor = draggingDot.current ? 'grabbing' : 'pointer'; // Show pointer or grabbing cursor
      } else {
        canvas.style.cursor = 'default'; // Reset cursor to default if not over the dot
      }

      if (draggingDot.current) {
        const dx = mouseX - circCenterX;
        const dy = mouseY - circCenterY;
        const newAngle = Math.atan2(dy, dx);
        setCurrentDayOfYear(calculateDayOfYearFromAngle(newAngle, totalDays)); // Update the current day of the year

        updateDisplay(currentDayOfYear, totalDays, year);
      }
    }
    function handleMouseUp() {
      draggingDot.current = false;
      if (canvas) canvas.style.cursor = 'default';
    }
    function handleMouseLeave() {
      draggingDot.current = false;
      if (canvas) canvas.style.cursor = 'default';
    }
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    // --- Cleanup ---
    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [currentDayOfYear, updateDisplay]);

  // --- Effect for sun angle graph ---
  useEffect(() => {
    drawSunAngleGraph();

    // --- Add drag functionality for the sun angle dot ---
    const canvas = sunAngleCanvasRef.current;
    if (!canvas) return;

    // Helper: get dot position for current sunCurveHour
    function getDotPos(hour: number) {
      const leftMargin = 80;
      const graphWidth = 380;
      const radius = 180;
      // Sun position calculation for London, May 15th
      function solarElevationAngle(date: Date, lat: number, lon: number) {
        const hours = date.getUTCHours() + date.getUTCMinutes() / 60;
        const start = new Date(Date.UTC(date.getUTCFullYear(), 0, 0));
        const diff = date.getTime() - start.getTime();
        const oneDay = 1000 * 60 * 60 * 24;
        const dayOfYear = Math.floor(diff / oneDay);
        const decl = 23.44 * Math.sin((2 * Math.PI / 365) * (dayOfYear - 81));
        const timeOffset = (lon / 15);
        const solarTime = hours + timeOffset;
        const hourAngle = (solarTime - 12) * 15;
        const toRad = Math.PI / radius;
        const elevation = Math.asin(
          Math.sin(51.5074 * toRad) * Math.sin(decl * toRad) +
          Math.cos(51.5074 * toRad) * Math.cos(decl * toRad) * Math.cos(hourAngle * toRad)
        ) * (radius / Math.PI);
        return Math.max(-18, Math.min(90, elevation));
      }
      const date = new Date(Date.UTC(2023, 4, 15, 0, hour * 60, 0));
      const angle = solarElevationAngle(date, 51.5074, -0.1278);
      const x = leftMargin + (hour / 24) * graphWidth;
      const y = radius - ((angle + 18) / 108) * 160;
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
  }, [sunCurveHour, drawSunAngleGraph]);

  // --- Effect for dark mode toggle ---
  useEffect(() => {
    const htmlEl = document.documentElement;
    const observer = new MutationObserver(() => {
      const totalDays = getTotalDaysInYear(new Date());
      updateDisplay(currentDayOfYear, totalDays, new Date().getFullYear());
      drawSunAngleGraph();
    });
    observer.observe(htmlEl, { attributes: true, attributeFilter: ['class'] });
    // Force redraw on darkThemeEnabled change
    const totalDays = getTotalDaysInYear(new Date());
    updateDisplay(currentDayOfYear, totalDays, new Date().getFullYear());
    drawSunAngleGraph();
    return () => observer.disconnect();
  }, [currentDayOfYear, updateDisplay, drawSunAngleGraph, darkThemeEnabled]);


  // --- Handlers for toggles and buttons ---
  const handleSetToToday = () => {
    const today = new Date();
    const totalDays = getTotalDaysInYear(today);
    setCurrentDayOfYear(Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)));
    updateDisplay(currentDayOfYear, totalDays, today.getFullYear());
  };
  const handleSetToNow = () => {
    const now = new Date();
    const utcHour = now.getUTCHours() + now.getUTCMinutes() / 60;
    setSunCurveHour(utcHour);
    drawSunAngleGraph();
  };

  // Add this helper function near the top, after other helpers
  function formatHourDecimal(hour: number) {
    const h = Math.floor(hour);
    const m = Math.round((hour - h) * 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  }

  // --- Add: Helper to calculate day of year from angle on the circle ---
  function calculateDayOfYearFromAngle(angle: number, totalDays: number) {
    // June 21st is at -Math.PI/2 (top of the circle)
    // Angle increases clockwise, so map angle to dayOfYear
    // dayOfYear = june21 + ((angle + Math.PI/2) / (2*PI)) * totalDays
    const year = new Date().getFullYear();
    const june21 = (new Date(year, 5, 21).getTime() - new Date(year, 0, 0).getTime()) / (1000 * 60 * 60 * 24);
    let day = Math.round(june21 + ((angle + Math.PI / 2) / (2 * Math.PI)) * totalDays);
    // Wrap around the year
    day = ((day % totalDays) + totalDays) % totalDays;
    return day;
  }

  // --- Render ---
  return (
    <div className={`${darkThemeEnabled ? "dark" : "light"} mx-auto bg-gray-50`}>
      <div className="w-min flex flex-row mx-auto">
        {/* Toggle Dark Mode Button in top right */}
        
        <div className="container1 w-max justify-center mt-2 flex h-max bg-gray-50">
          <div id="column1" className="w-fit rounded-lg mx-auto mb-2">
            <div className="rounded-lg border-2 border-black bg-white">
              <h2 className="text-center text-[18px] mt-2 mb-[-9px] underline">Sun Info - Year View</h2>
              <canvas
                id="seasonsCanvas"
                ref={canvasRef}
                width={450}
                height={400}
                className="border-x-2 border-t-2 rounded-lg border-none mb-[3px]"
                style={{ border: '0px solid #ccc' }}
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
                
                  <div className="mx-auto w-fit mt-1 mb-2">
                    <button
                      id="setToTodayButton"
                      className="color2Text px-5 py-1.5 bg-[#09bb4b] rounded-md text-white text-md cursor-pointer font-semibold text-[15px]"
                      onClick={handleSetToToday}
                    >
                      Set to Today
                    </button>
                  </div>

                  <hr className='border-t-1 border-[#888888] w-full'/>

  
                  <p className='mx-auto pr-4 ml-8 pt-1'>Data View: </p>
                  <div className='pl-12 pb-1'>
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
          <div className="middleColumn border-2 rounded-lg h-fit mt-[0px] ml-2 w-[600px] pl-[11px] bg-white pb-3 mx-auto mb-2">
            <h2 className="text-center underline text-[18px] mt-3">Sun Info - Day View</h2>
            <div className="dayViewTool">
              {/* Time selected display */}
              <canvas
                ref={sunAngleCanvasRef}
                width={540}
                height={230}
                className='mx-auto mt-3 border-2 border-black rounded-lg'
              />
              <div className="mx-auto w-fit mt-4 mb-2.5">
                <button
                  id="setToNowButton"
                  className="color2Text px-5 py-1.5 bg-[#09bb4b] rounded-md text-white text-md cursor-pointer font-semibold text-[15px]"
                  onClick={handleSetToNow}
                >
                  Set to Now
                </button>
              </div>
              <div id="dayViewTimeSelected" className="text-center text-[15px] mt-2" ref={dayViewTimeSelectedRef}></div>
              <div id="dayViewCurrentSunAngle" className="text-center text-[15px] mt-1" ref={dayViewCurrentSunAngleRef}></div>
            </div>
          </div>
          <div className="rightColumn ml-2">
            <div className="border-2 h-fit rounded-lg p-4 w-fit bg-white mx-auto mb-2">
              <div className="mb-2 mx-auto">
                <label htmlFor="pet-select">Location Chosen:</label>
                <select
                  name="location"
                  id="location-select"
                  className="border-[1px] border-black"
                  defaultValue="london"
                >
                  <option value="london">&nbsp;London&nbsp;</option>
                  <option value="tokyo">&nbsp;Tokyo&nbsp;</option>
                </select>
              </div>
              <p className="mt-[7px] text-center underline text-[17px]">Sun & Sunlight Information:</p>
              <p className="mt-2 underline text-center text-[15px]">Year-round Daily-Peak Sun Intensities:</p>
              <div className="text-left w-fit mx-auto mt-[4px]">
                <p className="mt-2">Year's Highest: _____ˍ100%</p>
                <p className="">75th Percentile: ____ˍ80.0%</p>
                <p className="">Average: ___________ˍ59.9%</p>
                <p className="">25th Percentile: ˍ____40.0%</p>
                <p className="">Year's Lowest: ______ˍ19.7%</p>
              </div>
              <p className="mt-[5px] underline text-center text-[15px]">24hr Average Sunlight Intensities</p>
              <div className="w-fit mx-auto mt-1">
                <p className="">Year's Highest: _____100%</p>
                <p className="">Average: __________57.9%</p>
                <p className="">Year's Lowest: _____ˍ15.8%</p>
              </div>
              <p className="mt-[5px] underline text-center text-[15px]">Year-round Daily-peak Sun Elevation:</p>
              <div className="w-fit mx-auto mt-[4px]">
                <p className="">Highest: ______61.5°</p>
                <p className="">Average: ______38.5°</p>
                <p className="">Lowest: ______ˍ15.5°</p>
              </div>
              <p className="mt-[5px] underline text-center text-[15px]">Year-round Daily-Peak True Sun Intensities</p>
              <div className="w-fit mx-auto mt-1">
                <p className="">Highest ≈ _____ˍ900W/m²</p>
                <p className="">Average ≈ _____ˍ537.5W/m²</p>
                <p className="">Lowest ≈ ______175W/m²</p>
              </div>
              <p className="mt-[5px] underline text-center text-[15px]">Year-round Daylight Lengths:</p>
              <div className="w-fit mx-auto mt-1">
                <p className="">Highest: _____16hrs 32mins</p>
                <p className="">Average: _____11hrs 0 mins</p>
                <p className="">Lowest: ______6hrs 32mins</p>
              </div>
            </div>
            <div className="hidden border-2 h-fit mt-4 rounded-lg p-4 w-fit bg-white">
              <p>Three variables to track:</p>
              <p>- Maximum Intensity of Sun</p>
              <p>- Day Length</p>
              <p>- Maximum Height of Sun in Sky</p>
            </div>
          </div>

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