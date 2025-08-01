import React, { useEffect, useRef, useState, useCallback } from 'react';

interface InteractiveYearCircleProps {
  currentDayOfYear: number;
  setCurrentDayOfYear: (day: number) => void;
  markerType: "timeBased" | "intensityBased" | "tempBased" | "tempAndIntensityBased";
  darkThemeEnabled: boolean;
  onDisplayUpdate: (dayOfYear: number, totalDays: number, year: number) => void;
}

function InteractiveYearCircleV2({ 
  currentDayOfYear, 
  setCurrentDayOfYear, 
  markerType, 
  darkThemeEnabled,
  onDisplayUpdate 
}: InteractiveYearCircleProps) {

  const yellow1 = '#ffff00' // strong yellow
  const yellow2 = '#ffff99' // weaker yellow
  const blue1 = '#4444aa' //dark blue
  const blue2 = '#6666cc'// lighter blue

  // --- State and refs ---
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sunAngleCanvasRef = useRef<HTMLCanvasElement>(null);
  const [sunCurveHour, setSunCurveHour] = useState(12); // default to noon

  // Drag state
  const draggingDot = useRef(false);
  const draggingSunDot = useRef(false);

  // --- Helper functions (same as before, but moved outside useEffect) ---
  function roundSpec(num: number, decimals: number) {
      const factor = Math.pow(10, decimals);
      return Math.round(num * factor) / factor;
  }

  // Helper to draw a perpendicular marker at (x, y) with angle theta
  function drawDiagonalMarker(ctx: CanvasRenderingContext2D, x: number, y: number, angle: number, len: number) {
      const dx = Math.cos(angle) * len / 2;
      const dy = Math.sin(angle) * len / 2;
      ctx.beginPath();
      ctx.moveTo(x - dx, y - dy);
      ctx.lineTo(x + dx, y + dy);
      ctx.stroke();
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


  // --- Helper functions for drawing ---
  const drawDashMarker = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number, radius: number, angle: number, color: string, dashLen: number = 13) => {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    
    // Main marker
    const x1 = centerX + (radius - dashLen / 2) * Math.cos(angle);
    const y1 = centerY + (radius - dashLen / 2) * Math.sin(angle);
    const x2 = centerX + (radius + dashLen / 2) * Math.cos(angle);
    const y2 = centerY + (radius + dashLen / 2) * Math.sin(angle);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    // Mirrored marker
    const angleMirror = angle + Math.PI;
    const x1m = centerX + (radius - dashLen / 2) * Math.cos(angleMirror);
    const y1m = centerY + (radius - dashLen / 2) * Math.sin(angleMirror);
    const x2m = centerX + (radius + dashLen / 2) * Math.cos(angleMirror);
    const y2m = centerY + (radius + dashLen / 2) * Math.sin(angleMirror);
    ctx.beginPath();
    ctx.moveTo(x1m, y1m);
    ctx.lineTo(x2m, y2m);
    ctx.stroke();
    
    ctx.restore();
  };

  const calculateMarkerAngles = (intensities: number[], totalDays: number, june21: number, angleOffset: number = 0, intensityOffset: number = 0.197) => {
    return intensities.map(intensity => {
      const sunlightCoeff = (intensity - intensityOffset) / (1 - intensityOffset);
      const cosVal = sunlightCoeff * 2 - 1;
      const offset = Math.acos(cosVal) * totalDays / (2 * Math.PI);
      const markerDay = (june21 + Math.round(offset)) % totalDays;
      return angleOffset + (-Math.PI / 2 + ((markerDay - june21 + totalDays) % totalDays) * (2 * Math.PI / totalDays));
    });
  };

  const drawIntensityMarkers = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number, radius: number, intensities: number[], totalDays: number, june21: number, color: string, angleOffset: number = 0, intensityOffset: number = 0.197) => {
    const angles = calculateMarkerAngles(intensities, totalDays, june21, angleOffset, intensityOffset);
    
    // Draw markers for calculated intensities
    angles.forEach(angle => {
      drawDashMarker(ctx, centerX, centerY, radius, angle, color);
    });

    // Draw top and bottom markers
    const topAngle = -Math.PI / 2 + angleOffset;
    const bottomAngle = Math.PI / 2 + angleOffset;
    drawDashMarker(ctx, centerX, centerY, radius, topAngle, color);
    drawDashMarker(ctx, centerX, centerY, radius, bottomAngle, color);
  };

  // --- Drawing functions ---
  const drawCircleAndDot = useCallback((dayOfYear: number, totalDays: number) => {

    const sectorCoords = [
      [3.65, 5.77], // strong yellow
      [5.77, 6.3], // lighter yellow, right
      [6.3, 6.9], // lighter blue, right
      [6.8, 8.95], // dark blue
      [8.9, 9.44], // lighter blue, left
      [9.44, 10] // lighter yellow, left
    ];

    const colorsList = [yellow1, yellow2, blue2, blue1, blue2, yellow2]

    function drawShadedSectors(weeksFromJune21: number) {
      const radsFromJun21 = (weeksFromJune21 / 52) * 2 * Math.PI;
      
      sectorCoords.forEach((coord, index) => {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(circCenterX, circCenterY);
        ctx.arc(circCenterX, circCenterY, radius - 1, coord[0] + radsFromJun21, coord[1] + radsFromJun21, false);
        ctx.closePath();
        ctx.globalAlpha = 1;
        ctx.fillStyle = colorsList[index];
        ctx.fill();
        ctx.restore();
      });
    }

    const canvasWidth = 300;
    const canvasHeight = 270;
    const circCenterX = canvasWidth / 2;
    const circCenterY = canvasHeight / 2;
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
      ctx.strokeStyle = colors.blueLight;
      ctx.lineWidth = 2;

      // NW: angle = -3 * Math.PI / 4 (perpendicular to radius at NW)
      drawDiagonalMarker(ctx, nw.x - 1, nw.y - 1, -3 * Math.PI / 4, 8 + 3);
      // NE: angle = -Math.PI / 4
      drawDiagonalMarker(ctx, ne.x + 1, ne.y - 1, -Math.PI / 4, 8 + 3);
      // SW: angle = 3 * Math.PI / 4
      drawDiagonalMarker(ctx, sw.x - 1, sw.y + 1, 3 * Math.PI / 4, 8 + 3);
      // SE: angle = Math.PI / 4
      drawDiagonalMarker(ctx, se.x + 1, se.y + 1, Math.PI / 4, 8 + 3);

      ctx.restore();
    }

    // --- Draw yellow markers as dashes at same positions as red, but shifted by 2 months (about 61 days) ---

   if (markerType === "intensityBased") {
      const intensities = [0.8, 0.595, 0.4];
      const year = new Date().getFullYear();
      const june21 = getJune21DayOfYear(year);

      drawShadedSectors(0);
      drawIntensityMarkers(ctx, circCenterX, circCenterY, radius, intensities, totalDays, june21, colors.red);
    }

    if (markerType === "tempAndIntensityBased") {
      const intensities = [0.8, 0.595, 0.4];
      const year = new Date().getFullYear();
      const june21 = getJune21DayOfYear(year);
      const coeff = 0.302;

      drawShadedSectors(2.5);
      drawIntensityMarkers(ctx, circCenterX, circCenterY, radius, intensities, totalDays, june21, colors.red, coeff);
    }
    
    if (markerType === "tempBased") {
      const intensities = [0.8, 0.6122, 0.415];
      const year = new Date().getFullYear();
      const june21 = getJune21DayOfYear(year);
      const daysShift = Math.round(totalDays * 1.25 / 12); // 2 months ≈ 1/6 of year

      drawShadedSectors(5);
      
      // Calculate shifted angles for yellow markers
      const shiftedAngles = intensities.map(intensity => {
        const sunlightCoeff = (intensity - 0.197) / (1 - 0.197);
        const cosVal = sunlightCoeff * 2 - 1;
        const offset = Math.acos(cosVal) * totalDays / (2 * Math.PI);
        const markerDay = (june21 + Math.round(offset) + daysShift) % totalDays;
        return -Math.PI / 2 + ((markerDay - june21 + totalDays) % totalDays) * (2 * Math.PI / totalDays);
      });

      // Draw shifted markers
      shiftedAngles.forEach(angle => {
        drawDashMarker(ctx, circCenterX, circCenterY, radius, angle, colors.yellow);
      });

      // Draw shifted top and bottom markers
      const angleTop = -Math.PI / 2 + (daysShift * 2 * Math.PI / totalDays);
      const angleBottom = Math.PI / 2 + (daysShift * 2 * Math.PI / totalDays);
      drawDashMarker(ctx, circCenterX, circCenterY, radius, angleTop, colors.yellow);
      drawDashMarker(ctx, circCenterX, circCenterY, radius, angleBottom, colors.yellow);
    }

    // ---existing code for red markers---
    

    // Draw "June 21st" and "December 21st" labels
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

    // Calculate angle so that June 21st is at the top (12 o'clock)
    // Angle increases clockwise, 0 at 3 o'clock, so top is -Math.PI/2
    // Map dayOfYear so that day == june21 => angle = -Math.PI/2
    // and day == dec21 => angle = +Math.PI/2
    // Full year is mapped to [ -Math.PI/2, 3*Math.PI/2 ]
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

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const colors = getCanvasColors();
    const config = getSunAngleCanvasConfig();

    // Axes
    ctx.strokeStyle = colors.axis;
    ctx.lineWidth = 1;
    // X-axis (time)
    ctx.beginPath();
    ctx.moveTo(config.leftMargin, radius);
    ctx.lineTo(config.leftMargin + config.graphWidth, radius);
    ctx.stroke();
    // Y-axis (angle)
    ctx.beginPath();
    ctx.moveTo(config.leftMargin, radius);
    ctx.lineTo(config.leftMargin, 20);
    ctx.stroke();

    // Labels and ticks
    ctx.fillStyle = colors.axisLabel;
    ctx.font = '12px sans-serif';
    
    // X-axis ticks (hours)
    for (let h = 0; h <= 24; h += 6) {
      const x = config.leftMargin + (h / 24) * config.graphWidth;
      ctx.beginPath();
      ctx.moveTo(x, radius);
      ctx.lineTo(x, 185);
      ctx.stroke();
      ctx.fillText(h.toString(), x - 6, 195);
    }
    ctx.fillText('Time', config.leftMargin + config.graphWidth / 2, 210);

    // Y-axis ticks (angle)
    for (let a = -18; a <= 90; a += 36) {
      const y = radius - ((a + 18) / 108) * 160;
      ctx.beginPath();
      ctx.moveTo(config.leftMargin - 5, y);
      ctx.lineTo(config.leftMargin, y);
      ctx.stroke();
      ctx.fillText(a.toString(), config.leftMargin - 30, y + 4);
    }

    // Y-axis title
    ctx.save();
    ctx.font = '14px sans-serif';
    ctx.fillStyle = colors.axisLabel;
    ctx.textAlign = 'center';
    ctx.fillText('Sun', config.leftMargin - 55, 100);
    ctx.fillText('Angle', config.leftMargin - 55, 115);
    ctx.restore();

    // Draw dotted line at zero degrees
    const zeroY = radius - ((0 + 18) / 108) * 160;
    ctx.save();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = colors.axisDotted;
    ctx.beginPath();
    ctx.moveTo(config.leftMargin, zeroY);
    ctx.lineTo(config.leftMargin + config.graphWidth, zeroY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // Plot sun angle curve
    ctx.strokeStyle = colors.yellow;
    ctx.lineWidth = 2;
    ctx.beginPath();
    let first = true;
    for (let h = 0; h <= 24; h += 0.01) {
      const date = new Date(Date.UTC(2023, 4, 15, 0, h * 60, 0));
      const angle = Math.max(-18, Math.min(90, solarElevationAngle(date, 51.5074, -0.1278)));
      const x = config.leftMargin + (h / 24) * config.graphWidth;
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
    const dotDate = new Date(Date.UTC(2023, 4, 15, 0, sunCurveHour * 60, 0));
    const dotAngle = Math.max(-18, Math.min(90, solarElevationAngle(dotDate, 51.5074, -0.1278)));
    const dotX = config.leftMargin + (sunCurveHour / 24) * config.graphWidth;
    const dotY = radius - ((dotAngle + 18) / 108) * 160;

    // Draw horizontal dotted line at dotY
    ctx.save();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = colors.green;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(config.leftMargin, dotY);
    ctx.lineTo(config.leftMargin + config.graphWidth, dotY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // Draw the dot
    ctx.save();
    ctx.beginPath();
    ctx.arc(dotX, dotY, 6, 0, 2 * Math.PI);
    ctx.fillStyle = colors.green;
    ctx.strokeStyle = colors.dotOutline;
    ctx.lineWidth = 2;
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }, [sunCurveHour]);

  // Solar elevation angle calculation helper
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
    const toRad = Math.PI / 180; // Fixed: was using radius instead of 180
    const elevation = Math.asin(
      Math.sin(lat * toRad) * Math.sin(decl * toRad) +
      Math.cos(lat * toRad) * Math.cos(decl * toRad) * Math.cos(hourAngle * toRad)
    ) * (180 / Math.PI); // Fixed: convert back to degrees
    return elevation;
  }

  // Helper to get dot position for current sunCurveHour
  function getSunDotPosition(hour: number) {
    const config = getSunAngleCanvasConfig();
    const date = new Date(Date.UTC(2023, 4, 15, 0, hour * 60, 0));
    const angle = Math.max(-18, Math.min(90, solarElevationAngle(date, 51.5074, -0.1278)));
    const x = config.leftMargin + (hour / 24) * config.graphWidth;
    const y = config.radius - ((angle + 18) / 108) * 160;
    return { x, y };
  }

  function isOverSunDot(mouseX: number, mouseY: number) {
    const { x, y } = getSunDotPosition(sunCurveHour);
    const dist = Math.sqrt((mouseX - x) ** 2 + (mouseY - y) ** 2);
    return dist < 10;
  }

  // --- Mouse event helper functions ---
  const getCanvasConfig = () => ({
    width: 300,
    height: 270,
    centerX: 150,
    centerY: 135,
    radius: 100
  });

  const getSunAngleCanvasConfig = () => ({
    leftMargin: 80,
    graphWidth: 380,
    radius: 180
  });

  const handleCircleMouseDown = useCallback((event: MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const config = getCanvasConfig();
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const totalDays = getTotalDaysInYear(new Date());
    const year = new Date().getFullYear();
    const june21 = getJune21DayOfYear(year);
    
    // Calculate angle for current dot position
    const angle = -Math.PI / 2 + ((currentDayOfYear - june21 + totalDays) % totalDays) * (2 * Math.PI / totalDays);
    const dotX = config.centerX + config.radius * Math.cos(angle);
    const dotY = config.centerY + config.radius * Math.sin(angle);

    const dx = mouseX - config.centerX;
    const dy = mouseY - config.centerY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const dotDist = Math.sqrt((mouseX - dotX) ** 2 + (mouseY - dotY) ** 2);

    // If mouse is near the green dot, start dragging
    if (dotDist < 10) {
      draggingDot.current = true;
      canvas.style.cursor = 'grabbing';
    } else if (Math.abs(dist - config.radius) < 10) {
      // If click is near the circle's edge, move green dot there
      const newAngle = Math.atan2(dy, dx);
      setCurrentDayOfYear(calculateDayOfYearFromAngle(newAngle, totalDays));
      onDisplayUpdate(currentDayOfYear, totalDays, year);
    }
  }, [currentDayOfYear, setCurrentDayOfYear, onDisplayUpdate]);

  const handleCircleMouseMove = useCallback((event: MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const config = getCanvasConfig();
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const totalDays = getTotalDaysInYear(new Date());
    const year = new Date().getFullYear();
    const june21 = getJune21DayOfYear(year);
    const angle = -Math.PI / 2 + ((currentDayOfYear - june21 + totalDays) % totalDays) * (2 * Math.PI / totalDays);
    
    const dotX = config.centerX + config.radius * Math.cos(angle);
    const dotY = config.centerY + config.radius * Math.sin(angle);

    if (isMouseOverDot(mouseX, mouseY, dotX, dotY)) {
      canvas.style.cursor = draggingDot.current ? 'grabbing' : 'pointer';
    } else {
      canvas.style.cursor = 'default';
    }

    if (draggingDot.current) {
      const dx = mouseX - config.centerX;
      const dy = mouseY - config.centerY;
      const newAngle = Math.atan2(dy, dx);
      setCurrentDayOfYear(calculateDayOfYearFromAngle(newAngle, totalDays));
      onDisplayUpdate(currentDayOfYear, totalDays, year);
    }
  }, [currentDayOfYear, setCurrentDayOfYear, onDisplayUpdate]);

  const handleMouseUp = useCallback(() => {
    draggingDot.current = false;
    draggingSunDot.current = false;
    if (canvasRef.current) canvasRef.current.style.cursor = 'default';
    if (sunAngleCanvasRef.current) sunAngleCanvasRef.current.style.cursor = 'default';
  }, []);

  // --- Main effect for drawing and event listeners ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const config = getCanvasConfig();
    canvas.width = config.width;
    canvas.height = config.height;

    const totalDays = getTotalDaysInYear(new Date());
    drawCircleAndDot(currentDayOfYear, totalDays);
    onDisplayUpdate(currentDayOfYear, totalDays, new Date().getFullYear());

    // --- Mouse events for main circle ---
    function handleMouseLeave() {
      draggingDot.current = false;
      if (canvas) canvas.style.cursor = 'default';
    }

    canvas.addEventListener('mousedown', handleCircleMouseDown);
    canvas.addEventListener('mousemove', handleCircleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    // --- Cleanup ---
    return () => {
      canvas.removeEventListener('mousedown', handleCircleMouseDown);
      canvas.removeEventListener('mousemove', handleCircleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [currentDayOfYear, onDisplayUpdate, handleCircleMouseDown, handleCircleMouseMove, handleMouseUp]);

  // --- Effect for sun angle graph ---
  useEffect(() => {
    drawSunAngleGraph();

    const canvas = sunAngleCanvasRef.current;
    if (!canvas) return;

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
        const config = getSunAngleCanvasConfig();
        let hour = ((mouseX - config.leftMargin) / config.graphWidth) * 24;
        hour = Math.max(0, Math.min(24, hour));
        setSunCurveHour(hour);
      } else {
        canvas.style.cursor = isOverSunDot(mouseX, mouseY) ? 'pointer' : 'default';
      }
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
  }, [sunCurveHour, drawSunAngleGraph, handleMouseUp]);

  // --- Effect for dark mode toggle ---
  useEffect(() => {
    const htmlEl = document.documentElement;
    const observer = new MutationObserver(() => {
      const totalDays = getTotalDaysInYear(new Date());
      onDisplayUpdate(currentDayOfYear, totalDays, new Date().getFullYear());
      drawSunAngleGraph();
    });
    observer.observe(htmlEl, { attributes: true, attributeFilter: ['class'] });
    // Force redraw on darkThemeEnabled change
    const totalDays = getTotalDaysInYear(new Date());
    onDisplayUpdate(currentDayOfYear, totalDays, new Date().getFullYear());
    drawSunAngleGraph();
    return () => observer.disconnect();
  }, [currentDayOfYear, onDisplayUpdate, drawSunAngleGraph, darkThemeEnabled]);


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
    <div className="flex flex-col">
      <canvas
        id="seasonsCanvas"
        ref={canvasRef}
        width={450}
        height={400}
        className="border-x-2 border-t-2 rounded-lg border-none mb-[3px]"
        style={{ border: '0px solid #ccc' }}
      />
      <canvas
        id="sunAngleCanvas"
        ref={sunAngleCanvasRef}
        width={500}
        height={220}
        className="border-2 border-black bg-white"
        style={{ border: '1px solid #ccc' }}
      />
    </div>
  );
}

export default InteractiveYearCircleV2;