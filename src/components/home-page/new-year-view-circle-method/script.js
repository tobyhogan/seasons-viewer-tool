// Canvas class to handle all drawing and functionality for each canvas
class CircleCanvas {
    constructor(canvasId, dataElementId, summer1, summer2, winter1, winter2, numMarkers) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.dataElement = document.getElementById(dataElementId);

        // Canvas and circle properties
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
        this.radius = 150;

        // Number of markers (and thus sectors)
        this.numMarkers = numMarkers;
        this.markerAngles = [];
        for (let i = 0; i < this.numMarkers; i++) {
            // Start from top (-PI/2), go clockwise
            this.markerAngles.push(-Math.PI / 2 + i * 2 * Math.PI / this.numMarkers);
        }
        this.dataElement.textContent = this.markerAngles.map(a => a.toFixed(2)).join(',');

        // Store the four colors
        this.summer1 = summer1;
        this.summer2 = summer2;
        this.winter1 = winter1;
        this.winter2 = winter2;

        // Initial draw
        this.draw();
    }

    drawCircle() {
        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.centerY, this.radius, 0, 2 * Math.PI);
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 3;
        this.ctx.stroke();
    }

    calculateMarkerPosition(angle) {
        // Calculate x, y on the circle for a given angle
        return {
            x: this.centerX + this.radius * Math.cos(angle),
            y: this.centerY + this.radius * Math.sin(angle)
        };
    }

    drawMarker(x, y) {
        // Draw marker circle
        this.ctx.beginPath();
        this.ctx.arc(x, y, 2, 0, 2 * Math.PI);
        this.ctx.fillStyle = 'black';
        this.ctx.fill();
        this.ctx.strokeStyle = 'black';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
    }

    drawMarkers() {
        this.markerAngles.forEach(angle => {
            const pos = this.calculateMarkerPosition(angle);
            this.drawMarker(pos.x, pos.y);
        });
    }

    drawYAxis() {
        const axisX = 60; // X position for the y-axis (moved further left)
        const axisStartY = this.centerY - this.radius;
        const axisEndY = this.centerY + this.radius;
        
        // Draw the main axis line
        this.ctx.beginPath();
        this.ctx.moveTo(axisX, axisStartY);
        this.ctx.lineTo(axisX, axisEndY);
        this.ctx.strokeStyle = '#666';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // Draw tick marks and labels
        const tickValues = [0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0];
        
        tickValues.forEach(value => {
            // Calculate y position for this tick
            const normalizedRange = (value - 0.197) / (1 - 0.197);
            const tickY = this.centerY + this.radius - (normalizedRange * 2 * this.radius);
            
            // Draw tick mark
            this.ctx.beginPath();
            this.ctx.moveTo(axisX - 5, tickY);
            this.ctx.lineTo(axisX + 5, tickY);
            this.ctx.strokeStyle = '#666';
            this.ctx.lineWidth = 1;
            this.ctx.stroke();
            
            // Draw label
            this.ctx.fillStyle = '#333';
            this.ctx.font = '12px Arial';
            this.ctx.textAlign = 'right';
            this.ctx.fillText(value.toFixed(1), axisX - 10, tickY + 4);
        });
        
        // Draw axis label
        this.ctx.save();
        this.ctx.translate(10, this.centerY); // Moved label further left as well
        this.ctx.rotate(-Math.PI / 2);
        this.ctx.fillStyle = '#333';
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Y Position', 0, 0);
        this.ctx.restore();
    }
    
    // Helper: parse hex color to [r,g,b]
    hexToRgb(hex) {
        hex = hex.replace('#', '');
        if (hex.length === 3) {
            hex = hex.split('').map(x => x + x).join('');
        }
        const num = parseInt(hex, 16);
        return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
    }

    // Helper: interpolate between two rgb arrays
    lerpColor(rgb1, rgb2, t) {
        return [
            Math.round(rgb1[0] + (rgb2[0] - rgb1[0]) * t),
            Math.round(rgb1[1] + (rgb2[1] - rgb1[1]) * t),
            Math.round(rgb1[2] + (rgb2[2] - rgb1[2]) * t)
        ];
    }

    // Helper: rgb array to hex string
    rgbToHex(rgb) {
        return '#' + rgb.map(x => x.toString(16).padStart(2, '0')).join('');
    }

    // Given an angle, return the interpolated color for that sector
    getSectorColor(angle) {
        // Calculate the y-coordinate at the circumference for this angle
        const y = this.centerY + this.radius * Math.sin(angle);
        // Normalize y to [0,1]: 0 at bottom, 1 at top
        const yNorm = 1 - ((y - (this.centerY - this.radius)) / (2 * this.radius));
        // Top half: summer, Bottom half: winter
        if (yNorm >= 0.5) {
            // Top half: interpolate summer2 (bottom) to summer1 (top)
            // t = (yNorm - 0.5) / 0.5, so t=0 at yNorm=0.5 (middle), t=1 at yNorm=1 (top)
            const t = (yNorm - 0.5) / 0.5;
            // Log how close the color is to summer2 (0) or summer1 (1)
            console.log(`Sector angle ${angle.toFixed(2)}: summer2 (0) <--- t=${t.toFixed(2)} ---> summer1 (1)`);
            const c1 = this.hexToRgb(this.summer2);
            const c2 = this.hexToRgb(this.summer1);
            return this.rgbToHex(this.lerpColor(c1, c2, t));
        } else {
            // Bottom half: interpolate winter2 (top of bottom) to winter1 (bottom)
            // t = yNorm / 0.5, so t=0 at yNorm=0 (bottom), t=1 at yNorm=0.5 (middle)
            const t = yNorm / 0.5;
            const c1 = this.hexToRgb(this.winter1);
            const c2 = this.hexToRgb(this.winter2);
            return this.rgbToHex(this.lerpColor(c1, c2, t));
        }
    }
    
    drawSector(angle1, angle2, color) {
        // Draw sector between two angles
        this.ctx.beginPath();
        this.ctx.moveTo(this.centerX, this.centerY);
        this.ctx.arc(this.centerX, this.centerY, this.radius, angle1, angle2);
        this.ctx.closePath();
        this.ctx.fillStyle = color;
        this.ctx.fill();
        // Make the white line between segments visible and thin
        this.ctx.strokeStyle = '#888888';
        this.ctx.lineWidth = 0.5; // Thin white line
        //this.ctx.stroke();
    }
    
    drawSectors() {
        for (let i = 0; i < this.numMarkers; i++) {
            const angle1 = this.markerAngles[i];
            const angle2 = this.markerAngles[(i + 1) % this.numMarkers];
            // Use the midpoint angle for color interpolation
            let midAngle = (angle1 + angle2) / 2;
            // If crossing the 2PI boundary, adjust
            if (angle2 < angle1) midAngle += Math.PI;
            const color = this.getSectorColor(midAngle);
            this.drawSector(angle1, angle2, color);
        }
    }
    
    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw y-axis
        this.drawYAxis();
        
        // Draw sectors
        this.drawSectors();
        
        // Draw circle
        this.drawCircle();
        
        // Draw markers
        this.drawMarkers();
    }
    
    // Method to update colors
    updateColors(summer1, summer2, winter1, winter2) {
        this.summer1 = summer1;
        this.summer2 = summer2;
        this.winter1 = winter1;
        this.winter2 = winter2;
        this.draw();
    }
    
    // Method to update number of markers (and thus sectors)
    updateNumMarkers(newNumMarkers) {
        this.numMarkers = newNumMarkers;
        this.markerAngles = [];
        for (let i = 0; i < this.numMarkers; i++) {
            this.markerAngles.push(-Math.PI / 2 + i * 2 * Math.PI / this.numMarkers);
        }
        this.dataElement.textContent = this.markerAngles.map(a => a.toFixed(2)).join(',');
        this.draw();
    }
}

// Example colors
const summer1 = "#ffff00";
//const summer2 = "#ffa8a8";
const summer2 = "#ffa8a8";
const winter2 = "#ffa8a8";
const winter1 = "#0077ff";

// Create the canvas instance with number of markers (e.g. 32)
const canvas1 = new CircleCanvas('circleCanvas1', 'markerYValueData1', summer1, summer2, winter1, winter2, 32);

// Example of how to update a specific canvas
// To be used for future functionality:
// canvas1.updateColors(newColorsArray);
// canvas2.updateMarkerPositions(newPositionsArray);
