document.addEventListener('DOMContentLoaded', () => {
    const splash = document.querySelector('.splash');
    const mainContent = document.querySelector('.main-content');
    const loaderPercentage = document.querySelector('.loader-percentage');
    const titleTop = document.querySelector('.title-top');
    const titleBottom = document.querySelector('.title-bottom');

    // Initialize loading sequence
    let progress = 0;
    const loadingInterval = setInterval(() => {
        progress += Math.random() * 3;
        if (progress >= 100) {
            progress = 100;
            clearInterval(loadingInterval);
            setTimeout(transitionToMain, 500);
        }
        loaderPercentage.textContent = `${Math.floor(progress)}%`;
    }, 50);

    // Add dynamic text effects
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let interval = null;

    const startTextScramble = (element) => {
        let iteration = 0;
        const originalText = element.textContent;
        
        clearInterval(interval);
        
        interval = setInterval(() => {
            element.textContent = originalText
                .split("")
                .map((letter, index) => {
                    if(index < iteration) {
                        return originalText[index];
                    }
                    return letters[Math.floor(Math.random() * 26)];
                })
                .join("");
            
            if(iteration >= originalText.length) {
                clearInterval(interval);
            }
            
            iteration += 1/3;
        }, 30);
    };

    // Initial text scramble effect
    setTimeout(() => {
        startTextScramble(titleTop);
        setTimeout(() => startTextScramble(titleBottom), 400);
    }, 500);

    // Repeat text scramble occasionally
    setInterval(() => {
        startTextScramble(titleTop);
        setTimeout(() => startTextScramble(titleBottom), 400);
    }, 5000);

    function transitionToMain() {
        // Remove hidden class first to prepare for animation
        mainContent.classList.remove('hidden');
        
        // Trigger slide animations
        requestAnimationFrame(() => {
            splash.classList.add('slide-up');
            mainContent.classList.add('slide-up');
        });
        
        // Remove splash after animation completes
        setTimeout(() => {
            splash.style.display = 'none';
        }, 1000);
    }
});
