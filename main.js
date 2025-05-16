const canvasWidth = 450; // Controls the size of the canvas and circle
const canvasHeight = 400;
const canvas = document.getElementById('seasonsCanvas');
canvas.width = canvasWidth;
canvas.height = canvasHeight;

const ctx = canvas.getContext('2d');
const formattedDateDiv = document.getElementById('formattedDate');
const sunlightPercentageDiv = document.getElementById('sunlightPercentage');
const avgSunlightPercentageDiv = document.getElementById('avgSunlightPercentage');
const daylightLengthDiv = document.getElementById('daylightLength');
const daylightPercentageDiv = document.getElementById('daylightPercentage');
const sunElevationAngleDiv = document.getElementById('sunElevationAngle');
const setToTodayButton = document.getElementById('setToTodayButton');
// Add reference to the blue marker toggle checkbox
const toggleBlueMarkersCheckbox = document.getElementById('toggleBlueMarkers');
// Add reference to the red marker toggle checkbox
const toggleRedMarkersCheckbox = document.getElementById('toggleRedMarkers');

// --- FIX: Define showBlueMarkers and set initial value from checkbox ---
let showBlueMarkers = toggleBlueMarkersCheckbox ? toggleBlueMarkersCheckbox.checked : true;
// --- NEW: Define showRedMarkers and set initial value from checkbox ---
let showRedMarkers = toggleRedMarkersCheckbox ? toggleRedMarkersCheckbox.checked : true;

// --- FIX: Listen for checkbox changes and redraw ---
if (toggleBlueMarkersCheckbox) {
  toggleBlueMarkersCheckbox.addEventListener('change', () => {
    showBlueMarkers = toggleBlueMarkersCheckbox.checked;
    // Redraw with current state
    const totalDays = getTotalDaysInYear(new Date());
    updateDisplay(currentDayOfYear, totalDays, new Date().getFullYear());
  });
}
// --- NEW: Listen for red marker checkbox changes and redraw ---
if (toggleRedMarkersCheckbox) {
  toggleRedMarkersCheckbox.addEventListener('change', () => {
    showRedMarkers = toggleRedMarkersCheckbox.checked;
    const totalDays = getTotalDaysInYear(new Date());
    updateDisplay(currentDayOfYear, totalDays, new Date().getFullYear());
  });
}

const centerX = canvasWidth / 2;
const centerY = canvasHeight / 2;
const radius = canvasHeight * 0.4; // Circle radius is 40% of the canvas width

let isDragging = false;
let currentDayOfYear = 0; // Track the current day of the year dynamically

// State for draggable dot on sun angle curve
let sunCurveHour = 12; // default to noon
let draggingSunDot = false;

// Function to calculate the total number of days in the year

function roundSpec(num, decimals) {
    const factor = Math.pow(10, decimals);
    return Math.round(num * factor) / factor;
}

function getTotalDaysInYear(date) {
  const year = date.getFullYear();
  return (new Date(year, 11, 31).getDate() === 31) ? 366 : 365;
}

// Helper: get day of year for June 21st and Dec 21st for any year
function getDayOfYear(date) {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date - start;
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}
function getJune21DayOfYear(year) {
  return getDayOfYear(new Date(year, 5, 21)); // June is month 5 (0-based)
}
function getDec21DayOfYear(year) {
  return getDayOfYear(new Date(year, 11, 21)); // December is month 11
}

// Function to calculate sunlight percentage
function calculateSunlightPercentage(dayOfYear, totalDays) {
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

  // --- FIX: Always set strokeStyle and fillStyle before drawing ---
  ctx.save();
  ctx.strokeStyle = '#222'; // Ensure circle is visible
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(centerX - 0, centerY, radius, 0, 2 * Math.PI);
  ctx.stroke();
  ctx.restore();

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

  // Draw blue markers (perpendicular to circle) and diagonal markers if enabled
  if (showBlueMarkers) {
    // Blue markers (cardinal)
    ctx.save();
    ctx.strokeStyle = '#4444ff';
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

    // Diagonal markers (now also toggled by showBlueMarkers)
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
    drawDiagonalMarker(nw.x - 1, nw.y - 1, -3 * Math.PI / 4, 8 + 3);
    // NE: angle = -Math.PI / 4
    drawDiagonalMarker(ne.x + 1, ne.y - 1, -Math.PI / 4, 8 + 3);
    // SW: angle = 3 * Math.PI / 4
    drawDiagonalMarker(sw.x - 1, sw.y + 1, 3 * Math.PI / 4, 8 + 3);
    // SE: angle = Math.PI / 4
    drawDiagonalMarker(se.x + 1, se.y + 1, Math.PI / 4, 8 + 3);

    ctx.restore();
  }

  // --- NEW: Draw red markers as dashes at 80%, 59.5%, 40% peak intensities if enabled ---
  if (showRedMarkers) {
    // These are the target peak intensities
    const intensities = [0.8, 0.595, 0.4];
    // The formula for peak intensity is: 19.7 + ((100 - 19.7) * sunlightCoeff)
    // Solve for sunlightCoeff: sunlightCoeff = (peak - 19.7) / (100 - 19.7)
    // For each intensity, calculate the corresponding dayOfYear offset from June 21st

    const year = new Date().getFullYear();
    const june21 = getJune21DayOfYear(year);

    intensities.forEach((intensity) => {
      const sunlightCoeff = (intensity - 0.197) / (1 - 0.197); // 0.197 = 19.7/100
      // sunlightCoeff = cos(offset/totalDays * 2PI) + 1 / 2
      // So: cosVal = sunlightCoeff * 2 - 1
      const cosVal = sunlightCoeff * 2 - 1;
      // offset = arccos(cosVal) * totalDays / (2PI)
      let offset = Math.acos(cosVal) * totalDays / (2 * Math.PI);
      // There are two solutions: one before and one after June 21st. We'll use the one after June 21st.
      // So markerDay = (june21 + offset) % totalDays
      let markerDay = (june21 + Math.round(offset)) % totalDays;

      // Calculate angle for this marker
      const angle = -Math.PI / 2 + ((markerDay - june21 + totalDays) % totalDays) * (2 * Math.PI / totalDays);

      // Draw a red dash (line) at this angle, same style as blue markers
      ctx.save();
      ctx.strokeStyle = '#e53935';
      ctx.lineWidth = 2;
      const dashLen = 13; // same as blueMarkerLen
      // Start and end points for the dash, centered on the circle edge
      const x1 = centerX + (radius - dashLen / 2) * Math.cos(angle);
      const y1 = centerY + (radius - dashLen / 2) * Math.sin(angle);
      const x2 = centerX + (radius + dashLen / 2) * Math.cos(angle);
      const y2 = centerY + (radius + dashLen / 2) * Math.sin(angle);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      // --- NEW: Draw mirrored marker on the left side (angle + Math.PI) ---
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
    });

    // --- NEW: Add red markers at the top (100%) and bottom (19.7%) of the circle ---
    ctx.save();
    ctx.strokeStyle = '#e53935';
    ctx.lineWidth = 2;
    const dashLen = 13;

    // Top (100% intensity, June 21st)
    const angleTop = -Math.PI / 2;
    const x1Top = centerX + (radius - dashLen / 2) * Math.cos(angleTop);
    const y1Top = centerY + (radius - dashLen / 2) * Math.sin(angleTop);
    const x2Top = centerX + (radius + dashLen / 2) * Math.cos(angleTop);
    const y2Top = centerY + (radius + dashLen / 2) * Math.sin(angleTop);
    ctx.beginPath();
    ctx.moveTo(x1Top, y1Top);
    ctx.lineTo(x2Top, y2Top);
    ctx.stroke();

    // Bottom (19.7% intensity, Dec 21st)
    const angleBottom = Math.PI / 2;
    const x1Bottom = centerX + (radius - dashLen / 2) * Math.cos(angleBottom);
    const y1Bottom = centerY + (radius - dashLen / 2) * Math.sin(angleBottom);
    const x2Bottom = centerX + (radius + dashLen / 2) * Math.cos(angleBottom);
    const y2Bottom = centerY + (radius + dashLen / 2) * Math.sin(angleBottom);
    ctx.beginPath();
    ctx.moveTo(x1Bottom, y1Bottom);
    ctx.lineTo(x2Bottom, y2Bottom);
    ctx.stroke();

    ctx.restore();
  }

  // Draw "June 21st" and "December 21st" labels
  ctx.font = `${radius * 0.1}px Arial`;
  ctx.fillStyle = 'black';
  ctx.textAlign = 'center';

  // Calculate actual day numbers for current year
  const year = new Date().getFullYear();
  const june21 = getJune21DayOfYear(year);
  const dec21 = getDec21DayOfYear(year);

  // Place June 21st label at the top
  ctx.fillText("Jun 21st – 100% Sun Intensity at Peak", centerX, centerY - radius * 1.1);

  // Place Dec 21st label at the bottom
  ctx.fillText('Dec 21st – 19.7% Sun Intensity at Peak', centerX, centerY + radius * 1.18);

  // Calculate angle so that June 21st is at the top (12 o'clock)
  // Angle increases clockwise, 0 at 3 o'clock, so top is -Math.PI/2
  // Map dayOfYear so that day == june21 => angle = -Math.PI/2
  // and day == dec21 => angle = +Math.PI/2
  // Full year is mapped to [ -Math.PI/2, 3*Math.PI/2 ]
  const angle = -Math.PI / 2 + ((dayOfYear - june21 + totalDays) % totalDays) * (2 * Math.PI / totalDays);

  // Calculate the dot's position
  const dotX = centerX + radius * Math.cos(angle);
  const dotY = centerY + radius * Math.sin(angle);

  // Draw the dot
  ctx.save();
  ctx.beginPath();
  ctx.arc(dotX, dotY, radius * 0.05, 0, 2 * Math.PI);
  ctx.fillStyle = '#06ba48';
  ctx.lineWidth = 2;
  ctx.fill();
  ctx.restore();
}

// Function to check if the mouse is over the red dot
function isMouseOverDot(mouseX, mouseY, dotX, dotY) {
  const distance = Math.sqrt((mouseX - dotX) ** 2 + (mouseY - dotY) ** 2);
  return distance <= radius * 0.05; // Dot size is 5% of the radius
}

// Function to calculate the day of the year based on the angle
function calculateDayOfYearFromAngle(angle, totalDays) {
  // Reverse of the above: angle = -Math.PI/2 + ((dayOfYear - june21) * 2PI / totalDays)
  // So: dayOfYear = june21 + ((angle + Math.PI/2) * totalDays) / (2PI)
  const year = new Date().getFullYear();
  const june21 = getJune21DayOfYear(year);
  let day = Math.round(june21 + ((angle + Math.PI / 2) * totalDays) / (2 * Math.PI));
  // Wrap around if needed
  if (day < 0) day += totalDays;
  if (day >= totalDays) day -= totalDays;
  return day;
}

// Function to update the displayed information
function updateDisplay(dayOfYear, totalDays, year) {
  formattedDateDiv.textContent = formatDate(dayOfYear, year);

  const sunlightCoeff = calculateSunlightPercentage(dayOfYear, totalDays);

  sunlightPercentageDiv.textContent = `Peak Intensity: ${roundSpec((19.7 + ((100 - 19.7) * sunlightCoeff)), 1)}%`;


  avgSunlightPercentageDiv.textContent = `24hr Average Intensity: ${roundSpec((12.5 + ((63.7 - 12.5) * sunlightCoeff)), 1)}%`;

  // daylightPercentageDiv.textContent = `Daylight Time Length: ${sunlightPercentage}%`;
  sunElevationAngleDiv.textContent = `Highest Elevation: ${roundSpec((15.5 + sunlightCoeff * (61.5 - 15.5)), 1)}°`;

  daylightLengthDiv.textContent = `Daylight Time Length: ${roundSpec((6.5 + (sunlightCoeff * (16.5 - 6.5))), 1)} Hours`;
  drawCircleAndDot(dayOfYear, totalDays);
}

// Event listener for mouse down
canvas.addEventListener('mousedown', (event) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;

  const totalDays = getTotalDaysInYear(new Date());
  const year = new Date().getFullYear();
  const june21 = getJune21DayOfYear(year);
  // Calculate angle for current dot position
  const angle = -Math.PI / 2 + ((currentDayOfYear - june21 + totalDays) % totalDays) * (2 * Math.PI / totalDays);

  const dotX = centerX + radius * Math.cos(angle);
  const dotY = centerY + radius * Math.sin(angle);

  const dx = mouseX - centerX;
  const dy = mouseY - centerY;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Position of green dot
  const greenDotX = dotX;
  const greenDotY = dotY;
  const dotDist = Math.sqrt((mouseX - greenDotX) ** 2 + (mouseY - greenDotY) ** 2);

  // If mouse is near the green dot, start dragging
  if (dotDist < 10) {
    isDragging = true;
    canvas.style.cursor = 'grabbing'; // Change cursor to grabbing when dragging starts
  } else if (Math.abs(dist - radius) < 10) {
    // If click is near the circle's edge, move green dot there
    const newAngle = Math.atan2(dy, dx);
    currentDayOfYear = calculateDayOfYearFromAngle(newAngle, totalDays);
    updateDisplay(currentDayOfYear, totalDays, year);
    return;
  }
});

// Event listener for mouse move
canvas.addEventListener('mousemove', (event) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;

  const totalDays = getTotalDaysInYear(new Date());
  const year = new Date().getFullYear();
  const june21 = getJune21DayOfYear(year);
  const angle = -Math.PI / 2 + ((currentDayOfYear - june21 + totalDays) % totalDays) * (2 * Math.PI / totalDays);

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

    updateDisplay(currentDayOfYear, totalDays, year);
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
const middleColumn = document.querySelector('.dayViewTool');
const sunAngleCanvas = document.createElement('canvas');
sunAngleCanvas.width = 500;
sunAngleCanvas.height = 300;
sunAngleCanvas.style.border = '1px solid #ccc';
sunAngleCanvas.style.margin = '16px 0';
middleColumn.appendChild(sunAngleCanvas);

function drawSunAngleGraph() {
    const ctx = sunAngleCanvas.getContext('2d');
    ctx.clearRect(0, 0, sunAngleCanvas.width, sunAngleCanvas.height);

    // Axes
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    // X-axis (time)
    ctx.beginPath();
    ctx.moveTo(40, 180);
    ctx.lineTo(380, 180);
    ctx.stroke();
    // Y-axis (angle)
    ctx.beginPath();
    ctx.moveTo(40, 180);
    ctx.lineTo(40, 20);
    ctx.stroke();

    // Labels
    ctx.fillStyle = '#333';
    ctx.font = '12px sans-serif';
    ctx.fillText('Time', 200, 195);
    ctx.save();
    ctx.translate(10, 120);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Sun angle (°)', 0, 0);
    ctx.restore();

    // Y-axis range: -18 to +90 degrees
    const minAngle = -18;
    const maxAngle = 90;
    const yAxisHeight = 160;

    // X-axis ticks (hours)
    for (let h = 0; h <= 24; h += 6) {
        const x = 40 + (h / 24) * 340;
        ctx.beginPath();
        ctx.moveTo(x, 180);
        ctx.lineTo(x, 185);
        ctx.stroke();
        ctx.fillText(h, x - 6, 195);
    }

    // Y-axis ticks (angle)
    for (let a = minAngle; a <= maxAngle; a += 36) {
        const y = 180 - ((a - minAngle) / (maxAngle - minAngle)) * yAxisHeight;
        ctx.beginPath();
        ctx.moveTo(35, y);
        ctx.lineTo(40, y);
        ctx.stroke();
        ctx.fillText(a, 10, y + 4);
    }

    // Draw dotted line at zero degrees
    const zeroY = 180 - ((0 - minAngle) / (maxAngle - minAngle)) * yAxisHeight;
    ctx.save();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = '#888';
    ctx.beginPath();
    ctx.moveTo(40, zeroY);
    ctx.lineTo(380, zeroY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // Sun position calculation for London, May 15th
    // London: lat 51.5074, lon -0.1278, May 15th
    // We'll use a simple solar position formula for demonstration (not precise for all cases)
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
    for (let h = 0; h <= 24; h += 0.01) { // smaller step for smoother curve
        const date = new Date(Date.UTC(2023, 4, 15, 0, h * 60, 0)); // h may be fractional
        const angle = Math.max(minAngle, Math.min(maxAngle, solarElevationAngle(date, 51.5074, -0.1278)));
        const x = 40 + (h / 24) * 340;
        const y = 180 - ((angle - minAngle) / (maxAngle - minAngle)) * yAxisHeight;
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
    const dotX = 40 + (dotHour / 24) * 340;
    const dotY = 180 - ((dotAngle - minAngle) / (maxAngle - minAngle)) * yAxisHeight;

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

    // Compute dot position
    const dotDate = new Date(Date.UTC(2023, 4, 15, 0, sunCurveHour * 60, 0));
    const dotAngle = Math.max(-18, Math.min(90, solarElevationAngle(dotDate, 51.5074, -0.1278)));
    const dotX = 40 + (sunCurveHour / 24) * 340;
    const dotY = 180 - ((dotAngle + 18) / (90 + 18)) * 160;

    if (Math.hypot(mouseX - dotX, mouseY - dotY) < 10) {
        draggingSunDot = true;
        // Prevent text selection or other default actions
        e.preventDefault();
    }
});

// Listen for mousemove and mouseup on the whole window for robust dragging
window.addEventListener('mousemove', function(e) {
    if (!draggingSunDot) return;
    const rect = sunAngleCanvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    // Clamp mouseX to graph area
    const clampedX = Math.max(40, Math.min(380, mouseX));
    // Convert x back to hour
    sunCurveHour = ((clampedX - 40) / 340) * 24;
    drawSunAngleGraph(); // <-- This ensures the dot is redrawn as you drag
});

window.addEventListener('mouseup', function() {
    draggingSunDot = false;
});

// Optional: allow clicking anywhere on the curve to move the dot there
sunAngleCanvas.addEventListener('click', function(e) {
    const rect = sunAngleCanvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    // Clamp mouseX to graph area
    const clampedX = Math.max(40, Math.min(380, mouseX));
    sunCurveHour = ((clampedX - 40) / 340) * 24;
    drawSunAngleGraph();
});

drawSunAngleGraph();