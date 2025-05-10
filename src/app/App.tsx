import React, { useEffect, useRef, useState } from 'react';
import '../styles/App.css';

const App = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [sunlightPercentage, setSunlightPercentage] = useState(0);
  const [formattedDate, setFormattedDate] = useState('');

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');

    if (ctx) {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = 200;

      // Function to calculate the total number of days in the year
      function getTotalDaysInYear(date: Date): number {
        const year = date.getFullYear();
        return (new Date(year, 11, 31).getDate() === 31) ? 366 : 365;
      }

      // Function to calculate sunlight percentage
      function calculateSunlightPercentage(dayOfYear: number, totalDays: number): number {
        const maxSunlightDay = totalDays / 2;
        const sunlight = Math.cos(((dayOfYear - maxSunlightDay) / totalDays) * 2 * Math.PI);

        // Normalize sunlight to range from 47% to 100%
        const normalizedSunlight = ((sunlight + 1) / 2) * (100 - 47) + 47;
        return Math.round(normalizedSunlight);
      }

      // Function to format the date as "9th of June 2016"
      function formatDate(dayOfYear: number, year: number): string {
        const startOfYear = new Date(year, 0, 0);
        const date = new Date(startOfYear.getTime() + dayOfYear * 24 * 60 * 60 * 1000);
        const day = date.getDate();
        const month = date.toLocaleString('default', { month: 'long' });
        const daySuffix = (day % 10 === 1 && day !== 11) ? 'st' :
                          (day % 10 === 2 && day !== 12) ? 'nd' :
                          (day % 10 === 3 && day !== 13) ? 'rd' : 'th';
        return `${day}${daySuffix} of ${month} ${year}`;
      }

      // Function to draw the circle and red dot
      function drawCircleAndDot(dayOfYear: number, totalDays: number) {
        if (ctx) {
          // Clear the canvas
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // Draw the circle
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
          ctx.stroke();

          // Adjust the angle so June 21st is at the top and December 21st is at the bottom
          const december21st = 355; // December 21st is approximately day 355
          const angleOffset = Math.PI / 2 - (december21st / totalDays) * 2 * Math.PI; // Align December 21st to the bottom
          const angle = ((dayOfYear / totalDays) * 2 * Math.PI + angleOffset) % (2 * Math.PI);

          // Calculate the dot's position
          const dotX = centerX + radius * Math.cos(angle);
          const dotY = centerY + radius * Math.sin(angle);

          // Draw the dot
          ctx.beginPath();
          ctx.arc(dotX, dotY, 10, 0, 2 * Math.PI);
          ctx.fillStyle = 'red';
          ctx.fill();
        }
      }

      // Function to handle dragging the red dot
      function handleDrag(event: MouseEvent) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        const dx = mouseX - centerX;
        const dy = mouseY - centerY;
        const angle = Math.atan2(dy, dx);

        const totalDays = getTotalDaysInYear(new Date());
        const december21st = 355; // December 21st offset
        const angleOffset = Math.PI / 2 - (december21st / totalDays) * 2 * Math.PI; // Align December 21st to the bottom
        let newDayOfYear = Math.round(((angle - angleOffset + 2 * Math.PI) % (2 * Math.PI)) / (2 * Math.PI) * totalDays);

        if (newDayOfYear < 0) newDayOfYear += totalDays;

        setFormattedDate(formatDate(newDayOfYear, new Date().getFullYear()));
        setSunlightPercentage(calculateSunlightPercentage(newDayOfYear, totalDays));
        drawCircleAndDot(newDayOfYear, totalDays);
      }

      // Function to set the program to today's day
      function setToToday() {
        const today = new Date();
        const totalDays = getTotalDaysInYear(today);
        const currentDayOfYear = Math.floor(
          (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
        );

        setFormattedDate(formatDate(currentDayOfYear, today.getFullYear()));
        setSunlightPercentage(calculateSunlightPercentage(currentDayOfYear, totalDays));
        drawCircleAndDot(currentDayOfYear, totalDays);
      }

      // Add event listener for dragging
      canvas.addEventListener('mousedown', () => {
        canvas.addEventListener('mousemove', handleDrag);
      });

      canvas.addEventListener('mouseup', () => {
        canvas.removeEventListener('mousemove', handleDrag);
      });

      canvas.addEventListener('mouseleave', () => {
        canvas.removeEventListener('mousemove', handleDrag);
      });

      // Initial draw
      setToToday();
    }
  }, []);

  return (
    <div style={{ marginTop: '-100px', textAlign: 'center' }}>
      <h1 style={{ marginBottom: '20px' }}>Seasons Viewer</h1>
      <div>
        <canvas id="seasonsCanvas" ref={canvasRef} width="500" height="500"></canvas>
        <div id="formattedDate" style={{ fontSize: '1.2rem' }}>
          {formattedDate}
        </div>
        <div style={{ marginTop: '10px', fontSize: '1.2rem' }}>
          Peak Relative Sun Intensity: {sunlightPercentage}%
        </div>
        <div style={{ marginTop: '10px', fontSize: '1.2rem' }}>
          Relative Day Length: {sunlightPercentage}%
        </div>
        <button
          onClick={() => {
            const today = new Date();
            const totalDays = getTotalDaysInYear(today);
            const currentDayOfYear = Math.floor(
              (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
            );

            setFormattedDate(formatDate(currentDayOfYear, today.getFullYear()));
            setSunlightPercentage(calculateSunlightPercentage(currentDayOfYear, totalDays));
            const canvas = canvasRef.current;
            const ctx = canvas?.getContext('2d');
            if (ctx) {
              drawCircleAndDot(currentDayOfYear, totalDays);
            }
          }}
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            fontSize: '1rem',
            fontWeight: 'bold',
            color: '#fff',
            backgroundColor: '#3498db',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          Set to Today
        </button>
      </div>
    </div>
  );
};

export default App;
