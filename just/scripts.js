        const canvas = document.getElementById('graphCanvas');
        const context = canvas.getContext('2d');

        // Function to set canvas size
        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            drawGrid(); // Redraw the grid when resizing
        }

        // Function to render the grid
        function drawGrid() {
            // Clear the canvas
            context.clearRect(0, 0, canvas.width, canvas.height);

            // Set grid parameters
            const majorInterval = 80;
            const minorInterval = 10;
            const majorColor = '#414868 ';
            const minorColor = '#292e42 ';
            const majorLineWidth = 0.9;
            const minorLineWidth = 0.5;

            // Draw minor grid lines
            context.lineWidth = minorLineWidth;
            context.strokeStyle = minorColor;
            for (let x = 0; x <= canvas.width; x += minorInterval) {
                context.beginPath();
                context.moveTo(x, 0);
                context.lineTo(x, canvas.height);
                context.stroke();
            }
            for (let y = 0; y <= canvas.height; y += minorInterval) {
                context.beginPath();
                context.moveTo(0, y);
                context.lineTo(canvas.width, y);
                context.stroke();
            }

            // Draw major grid lines
            context.lineWidth = majorLineWidth;
            context.strokeStyle = majorColor;
            for (let x = 0; x <= canvas.width; x += majorInterval) {
                context.beginPath();
                context.moveTo(x, 0);
                context.lineTo(x, canvas.height);
                context.stroke();
            }
            for (let y = 0; y <= canvas.height; y += majorInterval) {
                context.beginPath();
                context.moveTo(0, y);
                context.lineTo(canvas.width, y);
                context.stroke();
            }
        }

        // Initial setup
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas); // Handle window resizing


document.addEventListener('DOMContentLoaded', () => {
    const cardContainer = document.querySelector('.card-container');
    let isDown = false;
    let startX, scrollLeft;

    // Mouse Interactions
    const handleMouseDown = (e) => {
        isDown = true;
        cardContainer.style.cursor = 'grabbing';
        startX = e.pageX - cardContainer.offsetLeft;
        scrollLeft = cardContainer.scrollLeft;
    };

    const handleMouseLeave = () => {
        isDown = false;
        cardContainer.style.cursor = 'grab';
    };

    const handleMouseUp = () => {
        isDown = false;
        cardContainer.style.cursor = 'grab';
    };

    const handleMouseMove = (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - cardContainer.offsetLeft;
        const walk = (x - startX) * 2; // Adjust scroll speed
        cardContainer.scrollLeft = scrollLeft - walk;
    };

    // Event Listeners
    cardContainer.addEventListener('mousedown', handleMouseDown);
    cardContainer.addEventListener('mouseleave', handleMouseLeave);
    cardContainer.addEventListener('mouseup', handleMouseUp);
    cardContainer.addEventListener('mousemove', handleMouseMove);

    // Smooth Snap Scrolling
    cardContainer.addEventListener('wheel', (e) => {
        e.preventDefault();
        const cardWidth = cardContainer.querySelector('.card').offsetWidth;
        const scrollDirection = e.deltaY > 0 ? 1 : -1;
        cardContainer.scrollLeft += cardWidth * scrollDirection;
    }, { passive: false });
});
