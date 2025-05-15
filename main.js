const canvasWidth = 450; // Controls the size of the canvas and circle
const canvasHeight = 400;
const canvas = document.getElementById('seasonsCanvas');
canvas.width = canvasWidth;
canvas.height = canvasHeight;

const ctx = canvas.getContext('2d');
const formattedDateDiv = document.getElementById('formattedDate');
const sunlightPercentageDiv = document.getElementById('sunlightPercentage');
const avgSunlightPercentageDiv = document.getElementById('avgSunlightPercentage');
const daylightPercentageDiv = document.getElementById('daylightPercentage');
const daylightLengthDiv = document.getElementById('daylightLength');
const sunElevationAngleDiv = document.getElementById('sunElevationAngle');
const setToTodayButton = document.getElementById('setToTodayButton');

const centerX = canvasWidth / 2;
const centerY = canvasHeight / 2;
const radius = canvasHeight * 0.4; // Circle radius is 40% of the canvas width

let isDragging = false;
let currentDayOfYear = 0; // Track the current day of the year dynamically

// State for draggable dot on sun angle curve
let sunCurveHour = 12; // default to noon
let draggingSunDot = false;

// === Sun angle graph sizing constants ===
const SUN_GRAPH_WIDTH = 570;   // total canvas width in px
const SUN_GRAPH_HEIGHT = 320;  // total canvas height in px
const SUN_GRAPH_LEFT = 40;     // left margin for y-axis
const SUN_GRAPH_RIGHT = 20;    // right margin
const SUN_GRAPH_TOP = 20;      // top margin
const SUN_GRAPH_BOTTOM = 20;   // bottom margin
const SUN_GRAPH_X_AXIS_LEN = SUN_GRAPH_WIDTH - SUN_GRAPH_LEFT - SUN_GRAPH_RIGHT;
const SUN_GRAPH_Y_AXIS_LEN = SUN_GRAPH_HEIGHT - SUN_GRAPH_TOP - SUN_GRAPH_BOTTOM;

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
  ctx.arc(centerX - 0, centerY, radius, 0, 2 * Math.PI);
  ctx.stroke();

  // Calculate blue marker points (cardinal)
  const top = { x: centerX, y: centerY - radius };
  const bottom = { x: centerX, y: centerY + radius };
  const left = { x: centerX - radius, y: centerY };
  const right = { x: centerX + radius, y: centerY };

  // Calculate red marker points (diagonals)
  const diag = Math.SQRT1_2 * radius;
  const nw = { x: centerX - diag, y: centerY - diag };
  const ne = { x: centerX + diag, y: centerY - diag };
  const sw = { x: centerX - diag, y: centerY + diag };
  const se = { x: centerX + diag, y: centerY + diag };

  // Draw blue markers (perpendicular to circle)
  ctx.save();
  ctx.strokeStyle = '#4444ff';
  ctx.lineWidth = 2;
  const blueMarkerLen = 13;
  const redMarkerLen = 8;

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

  // Draw red markers (perpendicular to circle at diagonals)
  ctx.save();
  ctx.strokeStyle = '#5555ff';
  ctx.lineWidth = 2;

  // Helper to draw a perpendicular marker at (x, y) with angle theta
  function drawDiagonalMarker(x, y, angle, len) {
      const dx = Math.cos(angle) * len / 2;
      const dy = Math.sin(angle) * len / 2;
      ctx.beginPath();
      ctx.moveTo(x - dx, y - dy);
      ctx.lineTo(x + dx, y + dy);
      ctx.stroke();
  }

  // NW: angle = -3 * Math.PI / 4 (perpendicular to radius at NW)
  drawDiagonalMarker(nw.x - 1, nw.y - 1, -3 * Math.PI / 4, redMarkerLen + 3);
  // NE: angle = -Math.PI / 4
  drawDiagonalMarker(ne.x + 1, ne.y - 1, -Math.PI / 4, redMarkerLen + 3);
  // SW: angle = 3 * Math.PI / 4
  drawDiagonalMarker(sw.x - 1, sw.y + 1, 3 * Math.PI / 4, redMarkerLen + 3);
  // SE: angle = Math.PI / 4
  drawDiagonalMarker(se.x + 1, se.y + 1, Math.PI / 4, redMarkerLen + 3);

  ctx.restore();

  // Draw "June 21st" 95% to the left and 98% to the top of the canvas
  ctx.font = `${radius * 0.1}px Arial`; // Font size is 10% of the radius
  ctx.fillStyle = 'black';
  ctx.textAlign = 'center';
 
  // Draw "100%" at the same level as "June 21st" on the opposite side
  ctx.fillText("Jun 21st -- 100% Peak Sun Intensity", centerX + radius * 0.03, centerY - radius * 1.1);

  // Draw "December 21st" about 95% to the left of the canvas and 5% higher
  ctx.fillText('Dec 21st -- 19.7% Peak Sun Intensity', centerX - radius * -0.05, centerY + radius + radius * 0.17);


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
  ctx.fillStyle = '#06ba48';
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

  sunlightPercentageDiv.textContent = `Peak Sun Intensity: ${roundSpec((19.7 + ((100 - 19.7) * sunlightCoeff)), 1)}%`;


  avgSunlightPercentageDiv.textContent = `Average Sun Intensity: ${roundSpec((12.5 + ((63.7 - 12.5) * sunlightCoeff)), 1)}%`;

  // daylightPercentageDiv.textContent = `Daylight Time Length: ${sunlightPercentage}%`;

  daylightPercentageDiv.textContent = `Daylight Time Length: ${roundSpec((6.5 + (sunlightCoeff * (16.5 - 6.5))), 1)} Hours`;

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

  const dx = mouseX - centerX;
  const dy = mouseY - centerY;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Position of green dot
  const greenDotX = centerX + radius * Math.cos(angle);
  const greenDotY = centerY + radius * Math.sin(angle);
  const dotDist = Math.sqrt((mouseX - greenDotX) ** 2 + (mouseY - greenDotY) ** 2);

  // If mouse is near the green dot, start dragging
  if (dotDist < 10) {
    isDragging = true;
    canvas.style.cursor = 'grabbing'; // Change cursor to grabbing when dragging starts
  } else if (Math.abs(dist - radius) < 10) {
    // If click is near the circle's edge, move green dot there
    const newAngle = Math.atan2(dy, dx);
    currentDayOfYear = calculateDayOfYearFromAngle(newAngle, totalDays);
    updateDisplay(currentDayOfYear, totalDays, new Date().getFullYear());
    return;
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

// Create and insert the canvas for the sun angle tool
const middleColumn = document.querySelector('.middleColumn');
const sunAngleCanvas = document.createElement('canvas');
sunAngleCanvas.width = SUN_GRAPH_WIDTH;
sunAngleCanvas.height = SUN_GRAPH_HEIGHT;
sunAngleCanvas.style.border = '1px solid #ccc';
sunAngleCanvas.style.margin = '16px 0';
middleColumn.appendChild(sunAngleCanvas);

function drawSunAngleGraph() {
    const ctx = sunAngleCanvas.getContext('2d');
    ctx.clearRect(0, 0, SUN_GRAPH_WIDTH, SUN_GRAPH_HEIGHT);

    // Axes
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    // X-axis (time)
    ctx.beginPath();
    ctx.moveTo(SUN_GRAPH_LEFT, SUN_GRAPH_HEIGHT - SUN_GRAPH_BOTTOM);
    ctx.lineTo(SUN_GRAPH_LEFT + SUN_GRAPH_X_AXIS_LEN, SUN_GRAPH_HEIGHT - SUN_GRAPH_BOTTOM);
    ctx.stroke();
    // Y-axis (angle)
    ctx.beginPath();
    ctx.moveTo(SUN_GRAPH_LEFT, SUN_GRAPH_HEIGHT - SUN_GRAPH_BOTTOM);
    ctx.lineTo(SUN_GRAPH_LEFT, SUN_GRAPH_TOP);
    ctx.stroke();

    // Labels
    ctx.fillStyle = '#333';
    ctx.font = '12px sans-serif';
    ctx.fillText('Time', SUN_GRAPH_LEFT + SUN_GRAPH_X_AXIS_LEN / 2 - 18, SUN_GRAPH_HEIGHT - 5);
    ctx.save();
    ctx.translate(10, SUN_GRAPH_TOP + SUN_GRAPH_Y_AXIS_LEN / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Sun angle (°)', 0, 0);
    ctx.restore();

    // Y-axis range: -18 to +90 degrees
    const minAngle = -18;
    const maxAngle = 90;

    // X-axis ticks (hours)
    for (let h = 0; h <= 24; h += 6) {
        const x = SUN_GRAPH_LEFT + (h / 24) * SUN_GRAPH_X_AXIS_LEN;
        ctx.beginPath();
        ctx.moveTo(x, SUN_GRAPH_HEIGHT - SUN_GRAPH_BOTTOM);
        ctx.lineTo(x, SUN_GRAPH_HEIGHT - SUN_GRAPH_BOTTOM + 5);
        ctx.stroke();
        ctx.fillText(h, x - 6, SUN_GRAPH_HEIGHT - SUN_GRAPH_BOTTOM + 15);
    }

    // Y-axis ticks (angle)
    for (let a = minAngle; a <= maxAngle; a += 36) {
        const y = SUN_GRAPH_HEIGHT - SUN_GRAPH_BOTTOM - ((a - minAngle) / (maxAngle - minAngle)) * SUN_GRAPH_Y_AXIS_LEN;
        ctx.beginPath();
        ctx.moveTo(SUN_GRAPH_LEFT - 5, y);
        ctx.lineTo(SUN_GRAPH_LEFT, y);
        ctx.stroke();
        ctx.fillText(a, 10, y + 4);
    }

    // Draw dotted line at zero degrees
    const zeroY = SUN_GRAPH_HEIGHT - SUN_GRAPH_BOTTOM - ((0 - minAngle) / (maxAngle - minAngle)) * SUN_GRAPH_Y_AXIS_LEN;
    ctx.save();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = '#888';
    ctx.beginPath();
    ctx.moveTo(SUN_GRAPH_LEFT, zeroY);
    ctx.lineTo(SUN_GRAPH_LEFT + SUN_GRAPH_X_AXIS_LEN, zeroY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // Sun position calculation for London, May 15th
    function solarElevationAngle(date, lat, lon) {
        // Convert date to UTC decimal hours
        const hours = date.getUTCHours() + date.getUTCMinutes() / 60;
        // Day of year
        const start = new Date(Date.UTC(date.getUTCFullYear(), 0, 0));
        const diff = date - start;
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
        const toRad = Math.PI / 180;
        // Calculate elevation
        const elevation = Math.asin(
            Math.sin(lat * toRad) * Math.sin(decl * toRad) +
            Math.cos(lat * toRad) * Math.cos(decl * toRad) * Math.cos(hourAngle * toRad)
        ) * (180 / Math.PI);
        return elevation;
    }

    // Plot sun angle for each hour (use smaller step for smoothness)
    ctx.strokeStyle = 'orange';
    ctx.lineWidth = 2;
    ctx.beginPath();
    let first = true;
    for (let h = 0; h <= 24; h += 0.01) {
        const date = new Date(Date.UTC(2023, 4, 15, 0, h * 60, 0));
        const angle = Math.max(minAngle, Math.min(maxAngle, solarElevationAngle(date, 51.5074, -0.1278)));
        const x = SUN_GRAPH_LEFT + (h / 24) * SUN_GRAPH_X_AXIS_LEN;
        const y = SUN_GRAPH_HEIGHT - SUN_GRAPH_BOTTOM - ((angle - minAngle) / (maxAngle - minAngle)) * SUN_GRAPH_Y_AXIS_LEN;
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
    const dotAngle = Math.max(minAngle, Math.min(maxAngle, solarElevationAngle(dotDate, 51.5074, -0.1278)));
    const dotX = SUN_GRAPH_LEFT + (dotHour / 24) * SUN_GRAPH_X_AXIS_LEN;
    const dotY = SUN_GRAPH_HEIGHT - SUN_GRAPH_BOTTOM - ((dotAngle - minAngle) / (maxAngle - minAngle)) * SUN_GRAPH_Y_AXIS_LEN;

    ctx.save();
    ctx.beginPath();
    ctx.arc(dotX, dotY, 6, 0, 2 * Math.PI);
    ctx.fillStyle = 'green';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.fill();
    ctx.stroke();
    ctx.restore();
}

// Add event listeners for dragging the dot
sunAngleCanvas.addEventListener('mousedown', function(e) {
    const rect = sunAngleCanvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const dotDate = new Date(Date.UTC(2023, 4, 15, 0, sunCurveHour * 60, 0));
    const dotAngle = Math.max(-18, Math.min(90, solarElevationAngle(dotDate, 51.5074, -0.1278)));
    const dotX = SUN_GRAPH_LEFT + (sunCurveHour / 24) * SUN_GRAPH_X_AXIS_LEN;
    const dotY = SUN_GRAPH_HEIGHT - SUN_GRAPH_BOTTOM - ((dotAngle + 18) / (90 + 18)) * SUN_GRAPH_Y_AXIS_LEN;

    if (Math.hypot(mouseX - dotX, mouseY - dotY) < 10) {
        draggingSunDot = true;
        e.preventDefault();
    }
});

window.addEventListener('mousemove', function(e) {
    if (!draggingSunDot) return;
    const rect = sunAngleCanvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const clampedX = Math.max(SUN_GRAPH_LEFT, Math.min(SUN_GRAPH_LEFT + SUN_GRAPH_X_AXIS_LEN, mouseX));
    sunCurveHour = ((clampedX - SUN_GRAPH_LEFT) / SUN_GRAPH_X_AXIS_LEN) * 24;
    drawSunAngleGraph();
});

window.addEventListener('mouseup', function() {
    draggingSunDot = false;
});

sunAngleCanvas.addEventListener('click', function(e) {
    const rect = sunAngleCanvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const clampedX = Math.max(SUN_GRAPH_LEFT, Math.min(SUN_GRAPH_LEFT + SUN_GRAPH_X_AXIS_LEN, mouseX));
    sunCurveHour = ((clampedX - SUN_GRAPH_LEFT) / SUN_GRAPH_X_AXIS_LEN) * 24;
    drawSunAngleGraph();
});

drawSunAngleGraph();