const canvas = document.getElementById('seasonsCanvas');
const ctx = canvas.getContext('2d');
const formattedDateDiv = document.getElementById('formattedDate');
const sunlightPercentageDiv = document.getElementById('sunlightPercentage');
const setToTodayButton = document.getElementById('setToTodayButton');

const centerX = canvas.width / 2;
const centerY = canvas.height / 2;
const radius = 200;

let isDragging = false;

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

// Function to calculate the day of the year based on the angle
function calculateDayOfYearFromAngle(angle, totalDays) {
  const december21st = 355; // December 21st is approximately day 355
  const angleOffset = Math.PI / 2 - (december21st / totalDays) * 2 * Math.PI; // Align December 21st to the bottom
  const adjustedAngle = (angle - angleOffset + 2 * Math.PI) % (2 * Math.PI);
  return Math.round((adjustedAngle / (2 * Math.PI)) * totalDays);
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

// Event listener for mouse down
canvas.addEventListener('mousedown', (event) => {
  isDragging = true;
});

// Event listener for mouse move
canvas.addEventListener('mousemove', (event) => {
  if (!isDragging) return;

  const rect = canvas.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;

  const dx = mouseX - centerX;
  const dy = mouseY - centerY;
  const angle = Math.atan2(dy, dx);

  const today = new Date();
  const totalDays = getTotalDaysInYear(today);
  const newDayOfYear = calculateDayOfYearFromAngle(angle, totalDays);

  formattedDateDiv.textContent = formatDate(newDayOfYear, today.getFullYear());
  sunlightPercentageDiv.textContent = `Sunlight Percentage: ${calculateSunlightPercentage(newDayOfYear, totalDays)}%`;
  drawCircleAndDot(newDayOfYear, totalDays);
});

// Event listener for mouse up
canvas.addEventListener('mouseup', () => {
  isDragging = false;
});

// Event listener for mouse leave
canvas.addEventListener('mouseleave', () => {
  isDragging = false;
});

// Initial draw
setToToday();
