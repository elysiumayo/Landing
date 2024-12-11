window.onload = () => {
  const splashScreen = document.getElementById("splash-screen");
  const loadingBar = document.getElementById("loading-bar");
  const mainContent = document.getElementById("main-content");
  const nameContainer = document.getElementById("name-container");

  // Function to set loading bar width
  const setLoadingBarWidth = () => {
    // Ensure the font is loaded and name is fully rendered
    const nameWidth = nameContainer.offsetWidth;
    loadingBar.style.width = `${nameWidth}px`;

    // Transition sequence
    setTimeout(() => {
      loadingBar.style.width = `${nameWidth}px`;

      setTimeout(() => {
        splashScreen.classList.add("hidden");
        mainContent.classList.add("visible");
      }, 2000);
    }, 500);
  };

  // Ensure that fonts are fully loaded before executing the transition logic
  if (document.fonts) {
    document.fonts.ready.then(() => {
      // Wait a brief moment for layout to stabilize
      setTimeout(setLoadingBarWidth, 100);
    });
  } else {
    // Fallback for browsers without Font Loading API
    setTimeout(setLoadingBarWidth, 100);
  }
};

// Dot Grid Animation
const canvas = document.getElementById("dot-grid");
const ctx = canvas.getContext("2d");

// Animation parameters
let animationTime = 0;
const dotColor = "#ebede94"; // Slightly lighter dark gray dots
const dotSize = 2; // Smaller dot diameter
const gridSpacing = 15; // Closer dot spacing
const waveAmplitude = 100; // Dramatically increased wave movement
const waveFrequency = 0.02; // Adjusted wave frequency
const waveSpeed = 1; // Wave propagation speed

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function drawDotGrid() {
  // Clear previous drawing
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const gradientHeight = canvas.height * 0.2; // 20% gradient at top and bottom
  const maxOpacity = 10; // Max opacity for center
  const minOpacity = 0.2; // Minimum opacity at edges

  // Create a radial gradient
  const gradient = ctx.createRadialGradient(
    centerX,
    centerY,
    0,
    centerX,
    centerY,
    Math.max(canvas.width, canvas.height),
  );
  gradient.addColorStop(0, `rgba(51, 51, 51, ${maxOpacity})`);
  gradient.addColorStop(1, `rgba(51, 51, 51, ${minOpacity})`);

  // Draw dots across the entire canvas
  for (let x = 0; x < canvas.width; x += gridSpacing) {
    for (let y = 0; y < canvas.height; y += gridSpacing) {
      // Calculate distance from center
      const distanceFromCenter = Math.sqrt(
        Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2),
      );

      // More complex wave calculation for clearer ripples
      const waveOffset =
        Math.sin(
          distanceFromCenter * waveFrequency - animationTime * waveSpeed,
        ) *
        (waveAmplitude / (1 + distanceFromCenter * 0.05));

      // Calculate opacity based on distance from center
      let opacity =
        1 - distanceFromCenter / (Math.max(canvas.width, canvas.height) / 2);
      opacity = Math.max(minOpacity, opacity); // Prevent opacity from going below a certain level

      // Calculate gradient opacity based on Y position (top-bottom gradient)
      if (y < gradientHeight) {
        opacity *= y / gradientHeight; // Top gradient
      } else if (y > canvas.height - gradientHeight) {
        opacity *= (canvas.height - y) / gradientHeight; // Bottom gradient
      }

      // Draw dot with wave effect and calculated opacity
      ctx.beginPath();
      ctx.arc(x, y + waveOffset, dotSize / 2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(51, 51, 51, ${opacity})`;
      ctx.fill();
    }
  }

  // Increment animation time
  animationTime += 0.05;

  // Request next animation frame
  requestAnimationFrame(drawDotGrid);
}

// Initial setup
resizeCanvas();
drawDotGrid();

// Redraw grid on window resize
window.addEventListener("resize", resizeCanvas);

// Delay showing the dot grid after the main content is visible
setTimeout(() => {
  canvas.classList.add("visible"); // Show the dot grid after delay
}, 1000); // Delay in milliseconds (1 second after the splash screen transition)
