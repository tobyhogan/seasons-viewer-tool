const canvasWidth = 400; // Controls the size of the canvas and circle
const canvas = document.getElementById('seasonsCanvas');
canvas.width = canvasWidth;
canvas.height = canvasWidth;

const ctx = canvas.getContext('2d');
const formattedDateDiv = document.getElementById('formattedDate');
const sunlightPercentageDiv = document.getElementById('sunlightPercentage');
const daylightPercentageDiv = document.getElementById('daylightPercentage');
const daylightLengthDiv = document.getElementById('daylightLength');
const sunElevationAngleDiv = document.getElementById('sunElevationAngle');
const setToTodayButton = document.getElementById('setToTodayButton');

const centerX = canvasWidth / 2;
const centerY = canvasWidth / 2;
const radius = canvasWidth * 0.4; // Circle radius is 40% of the canvas width

let isDragging = false;
let currentDayOfYear = 0; // Track the current day of the year dynamically

// Function to calculate the total number of days in the year

function roundSpec(num, decimals) {
    const factor = Math.pow(10, decimals);
    return Math.round(num * factor) / factor;
}

function getTotalDaysInYear(date) {
  const year = date.getFullYear();
  return (new Date(year, 11, 31).getDate() === 31) ? 366 : 365;
}

// Function to calculate sunlight percentage
function calculateSunlightPercentage(dayOfYear, totalDays) {
  const maxSunlightDay = totalDays / 2;
  const sunlight = Math.cos(((dayOfYear - maxSunlightDay) / totalDays) * 2 * Math.PI);

  // Normalize sunlight to range from 47% to 100%

  const sunlightCoeff = ((sunlight + 1) / 2);


  return sunlightCoeff;
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

// Function to draw the circle, red dot, and text labels
function drawCircleAndDot(dayOfYear, totalDays) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw the circle
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
  ctx.stroke();

  // Draw "100%" 95% to the left and 98% to the top of the canvas
  ctx.font = `${radius * 0.1}px Arial`; // Font size is 10% of the radius
  ctx.fillStyle = 'black';
  ctx.textAlign = 'center';
  ctx.fillText('100%', centerX - radius * 0.95, centerY - radius * 0.98);

  // Draw "47%" about 95% to the left of the canvas and another 5% higher
  ctx.fillText('47%', centerX - radius * 0.95, centerY + radius + radius * 0.07);

  // Adjust the angle so June 21st is at the top and December 21st is at the bottom
  const december21st = 355; // December 21st is approximately day 355
  const angleOffset = Math.PI / 2 - (december21st / totalDays) * 2 * Math.PI; // Align December 21st to the bottom
  const angle = ((dayOfYear / totalDays) * 2 * Math.PI + angleOffset) % (2 * Math.PI);

  // Calculate the dot's position
  const dotX = centerX + radius * Math.cos(angle);
  const dotY = centerY + radius * Math.sin(angle);

  // Draw the dot
  ctx.beginPath();
  ctx.arc(dotX, dotY, radius * 0.05, 0, 2 * Math.PI); // Dot size is 5% of the radius
  ctx.fillStyle = 'red';
  ctx.fill();
}

// Function to check if the mouse is over the red dot
function isMouseOverDot(mouseX, mouseY, dotX, dotY) {
  const distance = Math.sqrt((mouseX - dotX) ** 2 + (mouseY - dotY) ** 2);
  return distance <= radius * 0.05; // Dot size is 5% of the radius
}

// Function to calculate the day of the year based on the angle
function calculateDayOfYearFromAngle(angle, totalDays) {
  const december21st = 355; // December 21st is approximately day 355
  const angleOffset = Math.PI / 2 - (december21st / totalDays) * 2 * Math.PI; // Align December 21st to the bottom
  const adjustedAngle = (angle - angleOffset + 2 * Math.PI) % (2 * Math.PI);
  return Math.round((adjustedAngle / (2 * Math.PI)) * totalDays);
}

// Function to update the displayed information
function updateDisplay(dayOfYear, totalDays, year) {
  formattedDateDiv.textContent = formatDate(dayOfYear, year);

  const sunlightCoeff = calculateSunlightPercentage(dayOfYear, totalDays);

  sunlightPercentageDiv.textContent = `Peak Sun Intensity: ${roundSpec((47 + ((100 - 47) * sunlightCoeff)), 1)}%`;

  // daylightPercentageDiv.textContent = `Daylight Time Length: ${sunlightPercentage}%`;

  daylightPercentageDiv.textContent = `Daylight Time Length: ${roundSpec((sunlightCoeff * 16.5), 1)} Hours`;
  sunElevationAngleDiv.textContent = `Highest Sun Elevation: ${roundSpec((15.5 + sunlightCoeff * (61.5 - 15.5)), 1)}°`;
  drawCircleAndDot(dayOfYear, totalDays);
}

// Event listener for mouse down
canvas.addEventListener('mousedown', (event) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;

  const totalDays = getTotalDaysInYear(new Date());
  const angleOffset = Math.PI / 2 - (355 / totalDays) * 2 * Math.PI; // December 21st offset
  const angle = ((currentDayOfYear / totalDays) * 2 * Math.PI + angleOffset) % (2 * Math.PI);

  const dotX = centerX + radius * Math.cos(angle);
  const dotY = centerY + radius * Math.sin(angle);

  if (isMouseOverDot(mouseX, mouseY, dotX, dotY)) {
    isDragging = true;
    canvas.style.cursor = 'grabbing'; // Change cursor to grabbing when dragging starts
  }
});

// Event listener for mouse move
canvas.addEventListener('mousemove', (event) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;

  const totalDays = getTotalDaysInYear(new Date());
  const angleOffset = Math.PI / 2 - (355 / totalDays) * 2 * Math.PI; // December 21st offset
  const angle = ((currentDayOfYear / totalDays) * 2 * Math.PI + angleOffset) % (2 * Math.PI);

  const dotX = centerX + radius * Math.cos(angle);
  const dotY = centerY + radius * Math.sin(angle);

  if (isMouseOverDot(mouseX, mouseY, dotX, dotY)) {
    canvas.style.cursor = isDragging ? 'grabbing' : 'pointer'; // Show pointer or grabbing cursor
  } else {
    canvas.style.cursor = 'default'; // Reset cursor to default if not over the dot
  }

  if (isDragging) {
    const dx = mouseX - centerX;
    const dy = mouseY - centerY;
    const newAngle = Math.atan2(dy, dx);
    currentDayOfYear = calculateDayOfYearFromAngle(newAngle, totalDays); // Update the current day of the year

    updateDisplay(currentDayOfYear, totalDays, new Date().getFullYear());
  }
});

// Event listener for mouse up
canvas.addEventListener('mouseup', () => {
  isDragging = false;
  canvas.style.cursor = 'default'; // Reset cursor to default after dragging ends
});

// Event listener for mouse leave
canvas.addEventListener('mouseleave', () => {
  isDragging = false;
  canvas.style.cursor = 'default'; // Reset cursor to default after leaving the canvas
});

// Function to set the program to today's day
setToToday = () => {
  const today = new Date();
  const totalDays = getTotalDaysInYear(today);
  currentDayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
  );

  updateDisplay(currentDayOfYear, totalDays, today.getFullYear());
};

// Add event listener for the "Set to Today" button
setToTodayButton.addEventListener('click', setToToday);

// Initial draw
setToToday();
