import React, { useEffect, useRef } from 'react';
import '../styles/App.css';

const App = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');

    if (ctx) {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = 200;

      // Function to calculate the day of the year
      function getDayOfYear(date: Date): number {
        const start = new Date(date.getFullYear(), 0, 0);
        const diff = date.getTime() - start.getTime();
        const oneDay = 1000 * 60 * 60 * 24;
        return Math.floor(diff / oneDay);
      }

      // Function to calculate the total number of days in the year
      function getTotalDaysInYear(date: Date): number {
        const year = date.getFullYear();
        return (new Date(year, 11, 31).getDate() === 31) ? 366 : 365;
      }

      // Function to draw the circle and red dot based on the day of the year
      function drawCircleAndDot(dayOfYear: number, totalDays: number) {
        if (ctx) {
          // Clear the canvas
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // Draw the circle
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
          ctx.stroke();

          // Calculate the angle based on the day of the year
          const angle = (dayOfYear / totalDays) * 2 * Math.PI + Math.PI / 2;

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

      // Function to update the displayed date
      function updateDisplayedDate(dayOfYear: number) {
        const dayOfYearDiv = document.getElementById('dayOfYear');
        if (dayOfYearDiv) {
          const startOfYear = new Date(new Date().getFullYear(), 0, 0);
          const selectedDate = new Date(startOfYear.getTime() + dayOfYear * 24 * 60 * 60 * 1000);
          const day = selectedDate.getDate();
          const month = selectedDate.toLocaleString('default', { month: 'long' });
          const year = selectedDate.getFullYear();

          // Format the day with the appropriate suffix
          const daySuffix = (day % 10 === 1 && day !== 11) ? 'st' :
                            (day % 10 === 2 && day !== 12) ? 'nd' :
                            (day % 10 === 3 && day !== 13) ? 'rd' : 'th';

          dayOfYearDiv.textContent = `${day}${daySuffix} of ${month} ${year}`;
        }
      }

      // Initialize slider and button functionality
      const dateSlider = document.getElementById('dateSlider') as HTMLInputElement;
      const resetButton = document.getElementById('resetButton') as HTMLButtonElement;

      if (dateSlider && resetButton) {
        const today = new Date();
        const totalDays = getTotalDaysInYear(today);

        // Set slider to current day of the year
        dateSlider.value = getDayOfYear(today).toString();

        // Add event listener for slider
        dateSlider.addEventListener('input', () => {
          const dayOfYear = parseInt(dateSlider.value, 10);
          drawCircleAndDot(dayOfYear, totalDays);
          updateDisplayedDate(dayOfYear);
        });

        // Add event listener for reset button
        resetButton.addEventListener('click', () => {
          const currentDayOfYear = getDayOfYear(new Date());
          dateSlider.value = currentDayOfYear.toString();
          drawCircleAndDot(currentDayOfYear, totalDays);
          updateDisplayedDate(currentDayOfYear);
        });

        // Initial draw
        const currentDayOfYear = getDayOfYear(today);
        drawCircleAndDot(currentDayOfYear, totalDays);
        updateDisplayedDate(currentDayOfYear);
      }
    }
  }, []);

  return (
    <>
      <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>Seasons Viewer</h1>
      <div>
        <canvas id="seasonsCanvas" ref={canvasRef} width="500" height="500"></canvas>
        <input id="dateSlider" type="range" min="1" max="365" defaultValue="1" />
        <button id="resetButton">Set to Current Date</button>
        <div id="dayOfYear"></div>
      </div>
    </>
  );
};

export default App;
