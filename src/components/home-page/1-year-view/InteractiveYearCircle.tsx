import React, { useEffect, useRef, useState, useCallback } from 'react';

interface InteractiveYearCircleProps {
  currentDayOfYear: number;
  setCurrentDayOfYear: (day: number) => void;
  markerType: "timeBased" | "intensityBased" | "tempBased" | "tempAndIntensityBased";
  darkThemeEnabled: boolean;
  onDisplayUpdate: (dayOfYear: number, totalDays: number, year: number) => void;
}

function InteractiveYearCircle({ 
  currentDayOfYear, 
  setCurrentDayOfYear, 
  markerType, 
  darkThemeEnabled,
  onDisplayUpdate 
}: InteractiveYearCircleProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const draggingDot = useRef(false);

  // --- Helper functions ---
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

  function getDec21DayOfYear(year: number) {
    return getDayOfYear(new Date(year, 11, 21)); // December is month 11
  }

  function isMouseOverDot(mouseX: number, mouseY: number, dotX: number, dotY: number) {
    const dist = Math.sqrt((mouseX - dotX) ** 2 + (mouseY - dotY) ** 2);
    return dist < 10;
  }

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

  function calculateDayOfYearFromAngle(angle: number, totalDays: number) {
    const year = new Date().getFullYear();
    const june21 = (new Date(year, 5, 21).getTime() - new Date(year, 0, 0).getTime()) / (1000 * 60 * 60 * 24);
    let day = Math.round(june21 + ((angle + Math.PI / 2) / (2 * Math.PI)) * totalDays);
    day = ((day % totalDays) + totalDays) % totalDays;
    return day;
  }

  // --- Drawing functions ---
  const drawCircleAndDot = useCallback((dayOfYear: number, totalDays: number) => {
    // Helper functions for gradient coloring
    function hexToRgb(hex: string): [number, number, number] {
      hex = hex.replace('#', '');
      if (hex.length === 3) {
        hex = hex.split('').map(x => x + x).join('');
      }
      const num = parseInt(hex, 16);
      return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
    }

    function lerpColor(rgb1: [number, number, number], rgb2: [number, number, number], t: number): [number, number, number] {
      return [
        Math.round(rgb1[0] + (rgb2[0] - rgb1[0]) * t),
        Math.round(rgb1[1] + (rgb2[1] - rgb1[1]) * t),
        Math.round(rgb1[2] + (rgb2[2] - rgb1[2]) * t)
      ];
    }

    function rgbToHex(rgb: [number, number, number]): string {
      return '#' + rgb.map(x => x.toString(16).padStart(2, '0')).join('');
    }

    function getSectorColor(angle: number, summer1: string, summer2: string, winter1: string, winter2: string): string {
      // Calculate the y-coordinate at the circumference for this angle
      const y = circCenterY + radius * Math.sin(angle);
      // Normalize y to [0,1]: 0 at bottom, 1 at top
      const yNorm = 1 - ((y - (circCenterY - radius)) / (2 * radius));
      
      // Top half: summer, Bottom half: winter
      if (yNorm >= 0.5) {
        // Top half: interpolate summer2 (bottom) to summer1 (top)
        const t = (yNorm - 0.5) / 0.5;
        const c1 = hexToRgb(summer2);
        const c2 = hexToRgb(summer1);
        return rgbToHex(lerpColor(c1, c2, t));
      } else {
        // Bottom half: interpolate winter2 (top of bottom) to winter1 (bottom)
        const t = yNorm / 0.5;
        const c1 = hexToRgb(winter1);
        const c2 = hexToRgb(winter2);
        return rgbToHex(lerpColor(c1, c2, t));
      }
    }

    function drawGradientSectors(weeksFromJune21: number) {
      const numSectors = 64; // Number of sectors for smooth gradient
      const summer1 = "#ffff00"; // bright yellow (top)
      const summer2 = "#ffa8a8"; // light pink (mid-top)
      const winter2 = "#ffa8a8"; // light pink (mid-bottom)
      const winter1 = "#0077ff"; // blue (bottom)
      
      const radsFromJun21 = (weeksFromJune21 / 52) * 2 * Math.PI;
      
      for (let i = 0; i < numSectors; i++) {
        const angle1 = -Math.PI / 2 + i * 2 * Math.PI / numSectors + radsFromJun21;
        const angle2 = -Math.PI / 2 + (i + 1) * 2 * Math.PI / numSectors + radsFromJun21;
        
        // Use the midpoint angle for color calculation, but subtract the rotation offset
        // so we get the color based on the original position before rotation
        let midAngle = (angle1 + angle2) / 2;
        if (angle2 < angle1) midAngle += Math.PI;
        
        // Calculate color based on the non-rotated position
        const colorAngle = midAngle - radsFromJun21;
        const color = getSectorColor(colorAngle, summer1, summer2, winter1, winter2);
        
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(circCenterX, circCenterY);
        ctx.arc(circCenterX, circCenterY, radius - 1, angle1, angle2);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
        ctx.restore();
      }
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

    // Draw the gradient background first, with rotation based on marker type
    let weeksOffset = 0;
    if (markerType === "tempBased") {
      weeksOffset = 5;
    } else if (markerType === "tempAndIntensityBased") {
      weeksOffset = 2.5;
    } else if (markerType === "intensityBased") {
      weeksOffset = 0;
    } else if (markerType === "timeBased") {
      weeksOffset = 0;
    }
    
    drawGradientSectors(weeksOffset);

    // Draw the circle outline on top of the gradient
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
      ctx.strokeStyle = '#000;'
      // ctx.strokeStyle = colors.blue;
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
      ctx.strokeStyle = '#000';
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

    // Draw additional markers based on marker type
    if (markerType === "intensityBased") {
      // Draw intensity markers only (gradient background already drawn)
      const intensities = [0.8, 0.595, 0.4];
      const year = new Date().getFullYear();
      const june21 = getJune21DayOfYear(year);
      const weeksFromJune21 = 0;
      const radsFromJun21 = (weeksFromJune21 / 52) * 2 * Math.PI;
      
      intensities.forEach((intensity) => {
        const sunlightCoeff = (intensity - 0.197) / (1 - 0.197);
        const cosVal = sunlightCoeff * 2 - 1;
        let offset = Math.acos(cosVal) * totalDays / (2 * Math.PI);
        let markerDay = (june21 + Math.round(offset)) % totalDays;
        const angle = (-Math.PI / 2 + ((markerDay - june21 + totalDays) % totalDays) * (2 * Math.PI / totalDays)) + radsFromJun21;
        const angleMirror = angle + Math.PI;

        ctx.save();
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        const dashLen = 13;

        function drawIntensityMarkers(angle: number) {
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

      // Draw top and bottom markers
      ctx.save();
      ctx.strokeStyle = "black";
      ctx.lineWidth = 2;
      const dashLen = 13;

      const drawTopAndBottomMarkers = (coeff: number) => {
        const angleTop = (coeff * Math.PI * 0.5) + radsFromJun21;

        const x1Top = circCenterX + (radius - dashLen / 2) * Math.cos(angleTop);
        const y1Top = circCenterY + (radius - dashLen / 2) * Math.sin(angleTop);
        const x2Top = circCenterX + (radius + dashLen / 2) * Math.cos(angleTop);
        const y2Top = circCenterY + (radius + dashLen / 2) * Math.sin(angleTop);

        ctx.beginPath();
        ctx.moveTo(x1Top, y1Top);
        ctx.lineTo(x2Top, y2Top);
        ctx.stroke();
      };

      drawTopAndBottomMarkers(1);
      drawTopAndBottomMarkers(-1);
      ctx.restore();
    }

    if (markerType === "tempAndIntensityBased") {
      // Draw intensity markers with temperature offset
      const intensities = [0.8, 0.595, 0.4];
      const year = new Date().getFullYear();
      const june21 = getJune21DayOfYear(year);
      const weeksFromJune21 = 2.5;
      const radsFromJun21 = (weeksFromJune21 / 52) * 2 * Math.PI;
      
      intensities.forEach((intensity) => {
        const sunlightCoeff = (intensity - 0.197) / (1 - 0.197);
        const cosVal = sunlightCoeff * 2 - 1;
        let offset = Math.acos(cosVal) * totalDays / (2 * Math.PI);
        let markerDay = (june21 + Math.round(offset)) % totalDays;
        const angle = (-Math.PI / 2 + ((markerDay - june21 + totalDays) % totalDays) * (2 * Math.PI / totalDays)) + radsFromJun21;
        const angleMirror = angle + Math.PI;

        ctx.save();
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        const dashLen = 13;

        function drawIntensityMarkers(angle: number) {
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

      // Draw top and bottom markers
      ctx.save();
      ctx.strokeStyle = "black";
      ctx.lineWidth = 2;
      const dashLen = 13;

      const drawTopAndBottomMarkers = (coeff: number) => {
        const angleTop = (coeff * Math.PI * 0.5) + radsFromJun21;

        const x1Top = circCenterX + (radius - dashLen / 2) * Math.cos(angleTop);
        const y1Top = circCenterY + (radius - dashLen / 2) * Math.sin(angleTop);
        const x2Top = circCenterX + (radius + dashLen / 2) * Math.cos(angleTop);
        const y2Top = circCenterY + (radius + dashLen / 2) * Math.sin(angleTop);

        ctx.beginPath();
        ctx.moveTo(x1Top, y1Top);
        ctx.lineTo(x2Top, y2Top);
        ctx.stroke();
      };

      drawTopAndBottomMarkers(1);
      drawTopAndBottomMarkers(-1);
      ctx.restore();
    }
    
    if (markerType === "tempBased") {
      // Draw intensity markers with temperature offset
      const intensities = [0.8, 0.595, 0.4];
      const year = new Date().getFullYear();
      const june21 = getJune21DayOfYear(year);
      const weeksFromJune21 = 5;
      const radsFromJun21 = (weeksFromJune21 / 52) * 2 * Math.PI;
      
      intensities.forEach((intensity) => {
        const sunlightCoeff = (intensity - 0.197) / (1 - 0.197);
        const cosVal = sunlightCoeff * 2 - 1;
        let offset = Math.acos(cosVal) * totalDays / (2 * Math.PI);
        let markerDay = (june21 + Math.round(offset)) % totalDays;
        const angle = (-Math.PI / 2 + ((markerDay - june21 + totalDays) % totalDays) * (2 * Math.PI / totalDays)) + radsFromJun21;
        const angleMirror = angle + Math.PI;

        ctx.save();
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        const dashLen = 13;

        function drawIntensityMarkers(angle: number) {
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

      // Draw top and bottom markers
      ctx.save();
      ctx.strokeStyle = "black";
      ctx.lineWidth = 2;
      const dashLen = 13;

      const drawTopAndBottomMarkers = (coeff: number) => {
        const angleTop = (coeff * Math.PI * 0.5) + radsFromJun21;

        const x1Top = circCenterX + (radius - dashLen / 2) * Math.cos(angleTop);
        const y1Top = circCenterY + (radius - dashLen / 2) * Math.sin(angleTop);
        const x2Top = circCenterX + (radius + dashLen / 2) * Math.cos(angleTop);
        const y2Top = circCenterY + (radius + dashLen / 2) * Math.sin(angleTop);

        ctx.beginPath();
        ctx.moveTo(x1Top, y1Top);
        ctx.lineTo(x2Top, y2Top);
        ctx.stroke();
      };

      drawTopAndBottomMarkers(1);
      drawTopAndBottomMarkers(-1);
      ctx.restore();
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
    ctx.fillStyle = "black"
    ctx.lineWidth = 2;
    ctx.fill();
    ctx.restore();
  }, [markerType]);

  // --- Main effect for drawing and event listeners ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const canvasWidth = 300;
    const canvasHeight = 270;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    const totalDays = getTotalDaysInYear(new Date());
    drawCircleAndDot(currentDayOfYear, totalDays);
    onDisplayUpdate(currentDayOfYear, totalDays, new Date().getFullYear());

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
  }, [currentDayOfYear, setCurrentDayOfYear, drawCircleAndDot, onDisplayUpdate]);

  // --- Effect for dark mode toggle ---
  useEffect(() => {
    const htmlEl = document.documentElement;
    const observer = new MutationObserver(() => {
      const totalDays = getTotalDaysInYear(new Date());
      drawCircleAndDot(currentDayOfYear, totalDays);
      onDisplayUpdate(currentDayOfYear, totalDays, new Date().getFullYear());
    });
    observer.observe(htmlEl, { attributes: true, attributeFilter: ['class'] });
    // Force redraw on darkThemeEnabled change
    const totalDays = getTotalDaysInYear(new Date());
    drawCircleAndDot(currentDayOfYear, totalDays);
    onDisplayUpdate(currentDayOfYear, totalDays, new Date().getFullYear());
    return () => observer.disconnect();
  }, [currentDayOfYear, drawCircleAndDot, onDisplayUpdate, darkThemeEnabled]);

  return (
    <canvas
      id="seasonsCanvas"
      ref={canvasRef}
      width={450}
      height={400}
      className="border-x-2 border-t-2 rounded-lg border-none mb-[3px]"
      style={{ border: '0px solid #000' }}
    />
  );
}

export default InteractiveYearCircle;
