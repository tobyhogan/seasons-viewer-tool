const canvas = document.getElementById('seasonsCanvas');
const ctx = canvas.getContext('2d');
const formattedDateDiv = document.getElementById('formattedDate');
const sunlightPercentageDiv = document.getElementById('sunlightPercentage');
const setToTodayButton = document.getElementById('setToTodayButton');

const centerX = canvas.width / 2;
const centerY = canvas.height / 2;
const radius = 200;

// Function to calculate the total number of days in the year
function getTotalDaysInYear(date) {
  const year = date.getFullYear();
  return (new Date(year, 11, 31).getDate() === 31) ? 366 : 365;
}

// Function to calculate sunlight percentage
function calculateSunlightPercentage(dayOfYear, totalDays) {
  const maxSunlightDay = totalDays / 2;
  const sunlight = Math.cos(((dayOfYear - maxSunlightDay) / totalDays) * 2 * Math.PI);

  // Normalize sunlight to range from 47% to 100%
  const normalizedSunlight = ((sunlight + 1) / 2) * (100 - 47) + 47;
  return Math.round(normalizedSunlight);
}

// Function to format the date as "9th of June 2016"
function formatDate(dayOfYear, year) {
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
function drawCircleAndDot(dayOfYear, totalDays) {
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

// Function to set the program to today's day
function setToToday() {
  const today = new Date();
  const totalDays = getTotalDaysInYear(today);
  const currentDayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
  );

  formattedDateDiv.textContent = formatDate(currentDayOfYear, today.getFullYear());
  sunlightPercentageDiv.textContent = `Sunlight Percentage: ${calculateSunlightPercentage(currentDayOfYear, totalDays)}%`;
  drawCircleAndDot(currentDayOfYear, totalDays);
}

// Add event listener for the "Set to Today" button
setToTodayButton.addEventListener('click', setToToday);

// Initial draw
setToToday();
