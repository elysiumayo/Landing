// Select the canvas and set up its context
const canvas = document.getElementById('gridCanvas');
const ctx = canvas.getContext('2d');

// Function to resize canvas to fit the entire screen
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    drawGrid(); // Redraw the grid after resizing
}

// Customizable grid settings
const settings = {
    majorGridSpacing: 100, // Pixels between major gridlines
    minorGridSpacing: 20, // Pixels between minor gridlines
    majorLineColor: '#000', // Color for major gridlines
    minorLineColor: '#ccc', // Color for minor gridlines
    majorLineWidth: 0.7 ,// Thickness for major gridlines
    minorLineWidth: 0.5, // Thickness for minor gridlines
};

// Function to draw gridlines
function drawGrid() {
    const { majorGridSpacing, minorGridSpacing, majorLineColor, minorLineColor, majorLineWidth, minorLineWidth } = settings;

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw minor gridlines
    ctx.strokeStyle = minorLineColor;
    ctx.lineWidth = minorLineWidth;
    for (let x = 0; x < canvas.width; x += minorGridSpacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += minorGridSpacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }

    // Draw major gridlines
    ctx.strokeStyle = majorLineColor;
    ctx.lineWidth = majorLineWidth;
    for (let x = 0; x < canvas.width; x += majorGridSpacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += majorGridSpacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

// Initialize canvas size and draw the grid
resizeCanvas();

// Redraw the grid whenever the window is resized
window.addEventListener('resize', resizeCanvas);
