// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Prevent zoom on double tap
    document.addEventListener('dblclick', function(e) {
        e.preventDefault();
    });

    // Prevent zoom on pinch
    document.addEventListener('gesturestart', function(e) {
        e.preventDefault();
    });

    // Prevent zoom on Ctrl + scroll
    document.addEventListener('wheel', function(e) {
        if (e.ctrlKey) {
            e.preventDefault();
        }
    }, { passive: false });

    // Prevent zoom on Ctrl + +/- keys
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && (e.key === '+' || e.key === '-' || e.key === '=')) {
            e.preventDefault();
        }
    });

    const splash = document.querySelector('.splash');
    const mainContent = document.querySelector('.main-content');
    const loaderPercentage = document.querySelector('.loader-percentage');
    const titleTop = document.querySelector('.title-top');
    const titleBottom = document.querySelector('.title-bottom');

    // Initialize loading sequence
    let progress = 0;
    const duration = 2000;
    const startTime = performance.now();
    const loaderProgress = document.querySelector('.loader-progress');
    
    function updateLoader(currentTime) {
        const elapsed = currentTime - startTime;
        progress = Math.min((elapsed / duration) * 100, 100);
        
        loaderPercentage.textContent = `${Math.floor(progress)}%`;
        loaderProgress.style.setProperty('--progress', `${progress}%`);
        
        if (progress < 100) {
            requestAnimationFrame(updateLoader);
        } else {
            transitionToMain();
        }
    }
    
    requestAnimationFrame(updateLoader);

    // Add dynamic text effects
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let textInterval = null;

    const startTextScramble = (element) => {
        let iteration = 0;
        const originalText = element.textContent;
        
        clearInterval(textInterval);
        
        textInterval = setInterval(() => {
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
                clearInterval(textInterval);
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
        // Remove hidden class and trigger animations immediately
        mainContent.classList.remove('hidden');
        
        // Ensure main content is visible before transitioning
        mainContent.style.display = 'block';
        
        // Force reflow
        void mainContent.offsetHeight;
        
        // Add transition classes
        splash.classList.add('slide-up');
        mainContent.classList.add('slide-up');
        
        // Initialize kernel after transition
        setTimeout(() => {
            initKernel();
            // Remove splash screen after kernel is initialized
            splash.remove();
        }, 1000);
    }

    // Separate kernel initialization into its own function
    function initKernel() {
        const kernelContainer = document.getElementById('kernel-container');
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, kernelContainer.clientWidth / kernelContainer.clientHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ 
            antialias: true, 
            alpha: true,
            powerPreference: "high-performance"
        });
        
        renderer.setSize(kernelContainer.clientWidth, kernelContainer.clientHeight);
        renderer.setClearColor(0x000000, 0);
        renderer.setPixelRatio(window.devicePixelRatio);
        kernelContainer.appendChild(renderer.domElement);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
        scene.add(ambientLight);

        const lights = [];
        for(let i = 0; i < 4; i++) {
            const light = new THREE.PointLight(0xffffff, 0.5);
            light.position.set(
                Math.cos(i * Math.PI / 2) * 2,
                Math.sin(i * Math.PI / 2) * 2,
                1
            );
            lights.push(light);
            scene.add(light);
        }

        // Set camera position and adjust model position
        camera.position.z = 5;
        
        // Create kernel model
        const kernel = createQuantumCore();
        kernel.model.position.y = -0.3;
        kernel.model.position.x = -0.5;
        scene.add(kernel.model);

        // Animation loop
        function animate() {
            requestAnimationFrame(animate);
            const time = performance.now() * 0.001;

            kernel.animate(time);
            
            // Animate lights
            lights.forEach((light, i) => {
                light.position.x = Math.cos(time * 0.5 + i * Math.PI / 2) * 2;
                light.position.y = Math.sin(time * 0.5 + i * Math.PI / 2) * 2;
                light.intensity = 0.5 + Math.sin(time * 2 + i) * 0.2;
            });

            renderer.render(scene, camera);
        }

        // Handle window resize
        window.addEventListener('resize', () => {
            camera.aspect = kernelContainer.clientWidth / kernelContainer.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(kernelContainer.clientWidth, kernelContainer.clientHeight);
        });

        // Start animation
        animate();
    }

    function createQuantumCore() {
        const modelGroup = new THREE.Group();

        // Create Core
        function createCore() {
            const core = new THREE.Group();
            
            // Main core geometry - significantly increased size
            const coreGeometry = new THREE.IcosahedronGeometry(0.8, 2);
            const coreMaterial = new THREE.MeshPhongMaterial({
                color: 0xffffff,
                emissive: 0x333333,
                wireframe: true,
                transparent: true,
                opacity: 0.9,
                side: THREE.DoubleSide
            });
            const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
            
            // Inner core - increased size
            const innerGeometry = new THREE.IcosahedronGeometry(0.6, 1);
            const innerMaterial = new THREE.MeshPhongMaterial({
                color: 0xffffff,
                emissive: 0xffffff,
                transparent: true,
                opacity: 0.5
            });
            const innerCore = new THREE.Mesh(innerGeometry, innerMaterial);
            
            core.add(coreMesh);
            core.add(innerCore);
            
            return { core, coreMesh, innerCore };
        }

        // Create Energy Field
        function createEnergyField() {
            const field = new THREE.Group();
            const layers = [];
            
            for (let i = 0; i < 3; i++) {
                const layer = new THREE.Group();
                const radius = 1.2 + i * 0.4;
                
                for (let j = 0; j < 8; j++) {
                    const curve = new THREE.EllipseCurve(
                        0, 0,
                        radius, radius,
                        0, Math.PI * 2,
                        false,
                        0
                    );
                    
                    const points = curve.getPoints(50);
                    const geometry = new THREE.BufferGeometry().setFromPoints(points);
                    const material = new THREE.LineBasicMaterial({
                        color: 0xffffff,
                        transparent: true,
                        opacity: 0.3 - i * 0.1
                    });
                    
                    const ellipse = new THREE.Line(geometry, material);
                    ellipse.rotation.x = Math.random() * Math.PI;
                    ellipse.rotation.y = Math.random() * Math.PI;
                    layer.add(ellipse);
                }
                
                layers.push(layer);
                field.add(layer);
            }
            
            return { field, layers };
        }

        // Create Particle System
        function createParticleSystem() {
            const particles = new THREE.Group();
            const particleSystems = [];
            
            const particleCount = 1000;
            const geometry = new THREE.BufferGeometry();
            const positions = new Float32Array(particleCount * 3);
            const velocities = new Float32Array(particleCount * 3);
            
            for (let i = 0; i < particleCount * 3; i += 3) {
                const r = 0.9 + Math.random() * 1.0;
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.acos(2 * Math.random() - 1);
                
                positions[i] = r * Math.sin(phi) * Math.cos(theta);
                positions[i + 1] = r * Math.sin(phi) * Math.sin(theta);
                positions[i + 2] = r * Math.cos(phi);
                
                velocities[i] = (Math.random() - 0.5) * 0.002;
                velocities[i + 1] = (Math.random() - 0.5) * 0.002;
                velocities[i + 2] = (Math.random() - 0.5) * 0.002;
            }
            
            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
            
            const material = new THREE.PointsMaterial({
                color: 0xffffff,
                size: 0.015,
                transparent: true,
                opacity: 0.6,
                blending: THREE.AdditiveBlending
            });
            
            const system = new THREE.Points(geometry, material);
            particleSystems.push(system);
            particles.add(system);
            
            return { particles, particleSystems };
        }

        // Initialize components
        const coreSystem = createCore();
        const energyField = createEnergyField();
        const particleSystem = createParticleSystem();
        
        modelGroup.add(coreSystem.core);
        modelGroup.add(energyField.field);
        modelGroup.add(particleSystem.particles);

        return {
            model: modelGroup,
            animate: function(time) {
                // Core animations
                coreSystem.coreMesh.rotation.x = time * 0.2;
                coreSystem.coreMesh.rotation.y = time * 0.3;
                coreSystem.innerCore.scale.setScalar(1 + Math.sin(time * 2) * 0.1);
                
                // Energy field animations
                energyField.layers.forEach((layer, i) => {
                    layer.rotation.x = time * (0.1 + i * 0.05);
                    layer.rotation.y = time * (0.15 + i * 0.05);
                    layer.rotation.z = time * (0.1 + i * 0.05);
                    
                    layer.children.forEach((ring, j) => {
                        ring.material.opacity = 0.2 + Math.sin(time * 2 + i + j) * 0.1;
                    });
                });
                
                // Particle system animations
                particleSystem.particleSystems.forEach(system => {
                    const positions = system.geometry.attributes.position.array;
                    const velocities = system.geometry.attributes.velocity.array;
                    
                    for (let i = 0; i < positions.length; i += 3) {
                        positions[i] += velocities[i];
                        positions[i + 1] += velocities[i + 1];
                        positions[i + 2] += velocities[i + 2];
                        
                        const distance = Math.sqrt(
                            positions[i] ** 2 + 
                            positions[i + 1] ** 2 + 
                            positions[i + 2] ** 2
                        );
                        
                        if (distance > 1.4) {
                            const scale = 0.6 / distance;
                            positions[i] *= scale;
                            positions[i + 1] *= scale;
                            positions[i + 2] *= scale;
                        }
                    }
                    
                    system.geometry.attributes.position.needsUpdate = true;
                });

                // Overall model rotation
                modelGroup.rotation.y = time * 0.1;
            }
        };
    }

    // About section animations
    const aboutContainer = document.querySelector('.about-container');
    
    const aboutObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeIn 0.5s ease-out forwards';
                entry.target.querySelector('.about-title').style.animation = 'slideInFromRight 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards';
                entry.target.querySelector('.about-underline').style.animation = 'lineExpandFromRight 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards 0.3s';
                entry.target.querySelector('.about-description').style.animation = 'fadeUp 1s cubic-bezier(0.16, 1, 0.3, 1) forwards 0.5s';
                aboutObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.2
    });

    if (aboutContainer) {
        aboutObserver.observe(aboutContainer);
    }

    // Reset animations when section is out of view
    const resetAboutObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                entry.target.style.animation = 'none';
                entry.target.querySelector('.about-title').style.animation = 'none';
                entry.target.querySelector('.about-underline').style.animation = 'none';
                entry.target.querySelector('.about-description').style.animation = 'none';
                // Trigger reflow
                void entry.target.offsetWidth;
                // Re-observe with the main observer
                aboutObserver.observe(entry.target);
            }
        });
    }, {
        threshold: 0
    });

    if (aboutContainer) {
        resetAboutObserver.observe(aboutContainer);
    }

    // Future Goals section animations
    const futureGoalsContainer = document.querySelector('.future-goals-container');
    
    const futureGoalsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeIn 0.5s ease-out forwards';
                entry.target.querySelector('.future-goals-title').style.animation = 'slideInFromRight 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards';
                entry.target.querySelector('.future-goals-underline').style.animation = 'lineExpandFromRight 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards 0.3s';
                entry.target.querySelector('.future-goals-description').style.animation = 'fadeUp 1s cubic-bezier(0.16, 1, 0.3, 1) forwards 0.5s';
                futureGoalsObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.2
    });

    if (futureGoalsContainer) {
        futureGoalsObserver.observe(futureGoalsContainer);
    }

    // Reset animations when section is out of view
    const resetFutureGoalsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                entry.target.style.animation = 'none';
                entry.target.querySelector('.future-goals-title').style.animation = 'none';
                entry.target.querySelector('.future-goals-underline').style.animation = 'none';
                entry.target.querySelector('.future-goals-description').style.animation = 'none';
                // Trigger reflow
                void entry.target.offsetWidth;
                // Re-observe with the main observer
                futureGoalsObserver.observe(entry.target);
            }
        });
    }, {
        threshold: 0
    });

    if (futureGoalsContainer) {
        resetFutureGoalsObserver.observe(futureGoalsContainer);
    }

    // Hobbies section animations
    const hobbiesContainer = document.querySelector('.hobbies-container');
    
    const hobbiesObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.querySelector('.hobbies-title').style.animation = 'slideInFromLeft 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards';
                entry.target.querySelector('.hobbies-underline').style.animation = 'lineExpand 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards 0.3s';
                entry.target.querySelector('.hobbies-description').style.animation = 'fadeUp 1s cubic-bezier(0.16, 1, 0.3, 1) forwards 0.5s';
                entry.target.style.animation = 'fadeIn 0.5s ease-out forwards';
                hobbiesObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.2
    });

    if (hobbiesContainer) {
        hobbiesObserver.observe(hobbiesContainer);
    }

    // Reset hobbies animations when section is out of view
    const resetHobbiesObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                const title = entry.target.querySelector('.hobbies-title');
                const underline = entry.target.querySelector('.hobbies-underline');
                const description = entry.target.querySelector('.hobbies-description');

                entry.target.style.animation = 'none';
                title.style.animation = 'none';
                underline.style.animation = 'none';
                description.style.animation = 'none';

                // Trigger reflow
                void entry.target.offsetWidth;
                // Re-observe with the main observer
                hobbiesObserver.observe(entry.target);
            }
        });
    }, {
        threshold: 0
    });

    if (hobbiesContainer) {
        resetHobbiesObserver.observe(hobbiesContainer);
    }

    // Projects section animations
    const projectsContainer = document.querySelector('.projects-container');
    
    const projectsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.querySelector('.projects-title').style.animation = 'slideInFromLeft 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards';
                entry.target.querySelector('.projects-underline').style.animation = 'lineExpand 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards 0.3s';
                projectsObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.2
    });

    if (projectsContainer) {
        projectsObserver.observe(projectsContainer);
    }

    // Reset animations when section is out of view
    const resetProjectsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                const title = entry.target.querySelector('.projects-title');
                const underline = entry.target.querySelector('.projects-underline');
                
                entry.target.style.opacity = '0';
                title.style.animation = 'none';
                underline.style.animation = 'none';
                
                // Trigger reflow
                void entry.target.offsetWidth;
                void title.offsetWidth;
                void underline.offsetWidth;
                
                // Re-observe with the main observer
                projectsObserver.observe(entry.target);
            }
        });
    }, {
        threshold: 0
    });

    if (projectsContainer) {
        resetProjectsObserver.observe(projectsContainer);
    }

    // Projects carousel
    const projectCards = document.querySelectorAll('.project-card');
    const projectsCarousel = document.querySelector('.projects-carousel');
    let currentIndex = 0;
    const totalCards = projectCards.length;
    let isAnimating = false;

    let isDragging = false;
    let startX;
    let dragThreshold = 50;
    let dragStartTime;
    let lastDragPosition;
    let dragVelocity = 0;
    let activeCard = null;
    let touchStartX = 0;
    let touchStartY = 0;
    let touchMoveX = 0;
    let touchMoveY = 0;
    let isHorizontalSwipe = false;
    let activeTouchCard = null;
    let lastTouchTime = 0;
    let wheelTimeout;
    let autoRotateInterval;

    const SWIPE_THRESHOLD = 50;
    const VELOCITY_THRESHOLD = 0.5;
    const TAP_THRESHOLD = 10;
    const DOUBLE_TAP_DELAY = 300;
    const AUTO_ROTATE_DELAY = 3000;

    function updateCardsWithTransition(instant = false) {
        if (instant) {
            projectsCarousel.style.transition = 'none';
        }
        
        projectCards.forEach((card, index) => {
            card.className = 'project-card'; // Reset classes
            
            // Calculate the position relative to the current card
            let position = (index - currentIndex) % totalCards;
            if (position < 0) position += totalCards;
            
            // Add appropriate class based on position
            if (position === 0) {
                card.classList.add('center');
            } else if (position === 1) {
                card.classList.add('right');
            } else if (position === totalCards - 1) {
                card.classList.add('left');
            } else if (position === 2) {
                card.classList.add('far-right');
            } else {
                card.classList.add('far-left');
            }
        });

        if (instant) {
            // Force reflow
            projectsCarousel.offsetHeight;
            projectsCarousel.style.transition = '';
        }
    }

    function nextCard() {
        if (isAnimating) return;
        isAnimating = true;
        currentIndex = (currentIndex - 1 + totalCards) % totalCards;
        updateCardsWithTransition();
        setTimeout(() => { isAnimating = false; }, 500); // Match transition duration
    }

    function prevCard() {
        if (isAnimating) return;
        isAnimating = true;
        currentIndex = (currentIndex + 1) % totalCards;
        updateCardsWithTransition();
        setTimeout(() => { isAnimating = false; }, 500); // Match transition duration
    }

    projectCards.forEach(card => {
        card.addEventListener('wheel', (e) => {
            e.preventDefault();
            e.stopPropagation(); // Prevent event from bubbling to carousel
            
            clearTimeout(wheelTimeout);
            wheelTimeout = setTimeout(() => {
                if (e.deltaY > 0) {
                    nextCard();
                } else {
                    prevCard();
                }
            }, 50); // Debounce wheel events
        }, { passive: false });
    });

    projectCards.forEach(card => {
        card.addEventListener('mousedown', (e) => {
            isDragging = true;
            activeCard = card;
            startX = e.clientX;
            dragStartTime = Date.now();
            lastDragPosition = e.clientX;
            card.style.cursor = 'grabbing';
        });
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging || !activeCard) return;
        e.preventDefault();

        const currentPosition = e.clientX;
        const deltaTime = Date.now() - dragStartTime;
        
        if (deltaTime > 0) {
            dragVelocity = (currentPosition - lastDragPosition) / deltaTime;
        }
        
        lastDragPosition = currentPosition;
    });

    function handleDragEnd(e) {
        if (!isDragging || !activeCard) return;
        
        const endX = e.type === 'mouseup' ? e.clientX : e.changedTouches[0].clientX;
        const deltaX = endX - startX;

        // Use both distance and velocity to determine direction
        if (Math.abs(deltaX) > dragThreshold || Math.abs(dragVelocity) > VELOCITY_THRESHOLD) {
            if (deltaX > 0 || dragVelocity > VELOCITY_THRESHOLD) {
                prevCard();
            } else {
                nextCard();
            }
        }

        isDragging = false;
        activeCard.style.cursor = 'pointer';
        activeCard = null;
    }

    document.addEventListener('mouseup', handleDragEnd);
    document.addEventListener('mouseleave', handleDragEnd);

    projectCards.forEach(card => {
        card.addEventListener('touchstart', (e) => {
            e.preventDefault(); // Prevent default touch behavior
            isDragging = true;
            activeTouchCard = card;
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            dragStartTime = Date.now();
            lastDragPosition = touchStartX;
            isHorizontalSwipe = false;

            // Add touch-active class for visual feedback
            card.classList.add('touch-active');
        });

        card.addEventListener('touchmove', (e) => {
            if (!isDragging || !activeTouchCard) return;

            touchMoveX = e.touches[0].clientX;
            touchMoveY = e.touches[0].clientY;

            const deltaX = Math.abs(touchMoveX - touchStartX);
            const deltaY = Math.abs(touchMoveY - touchStartY);

            if (!isHorizontalSwipe && deltaX > deltaY && deltaX > 10) {
                isHorizontalSwipe = true;
            }

            if (isHorizontalSwipe) {
                const currentPosition = touchMoveX;
                const deltaTime = Date.now() - dragStartTime;
                
                if (deltaTime > 0) {
                    dragVelocity = (currentPosition - lastDragPosition) / deltaTime;
                }
                
                lastDragPosition = currentPosition;
                
                const swipeProgress = (currentPosition - touchStartX) / window.innerWidth;
                activeTouchCard.style.setProperty('--swipe-progress', swipeProgress);
            }
        });

        card.addEventListener('touchend', (e) => {
            if (!activeTouchCard) {
                isDragging = false;
                return;
            }

            const touchEndX = e.changedTouches[0].clientX;
            const deltaX = touchEndX - touchStartX;
            const currentTime = Date.now();

            activeTouchCard.classList.remove('touch-active');
            activeTouchCard.style.removeProperty('--swipe-progress');

            if (isHorizontalSwipe) {
                if (Math.abs(deltaX) > SWIPE_THRESHOLD || Math.abs(dragVelocity) > VELOCITY_THRESHOLD) {
                    if (deltaX > 0 || dragVelocity > VELOCITY_THRESHOLD) {
                        prevCard();
                    } else {
                        nextCard();
                    }
                }
            } else if (Math.abs(deltaX) < TAP_THRESHOLD) {
                const timeSinceLastTap = currentTime - lastTouchTime;
                if (timeSinceLastTap < DOUBLE_TAP_DELAY) {
                    e.preventDefault();
                }
                lastTouchTime = currentTime;
            }

            isDragging = false;
            activeTouchCard = null;
            isHorizontalSwipe = false;
        });

        card.addEventListener('touchcancel', () => {
            if (activeTouchCard) {
                activeTouchCard.classList.remove('touch-active');
                activeTouchCard.style.removeProperty('--swipe-progress');
            }
            isDragging = false;
            activeTouchCard = null;
            isHorizontalSwipe = false;
        });
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            nextCard();
        } else if (e.key === 'ArrowRight') {
            prevCard();
        }
    });

    function startAutoRotate() {
        stopAutoRotate();
        autoRotateInterval = setInterval(nextCard, AUTO_ROTATE_DELAY);
    }

    function stopAutoRotate() {
        clearInterval(autoRotateInterval);
    }

    projectsCarousel.addEventListener('mouseenter', stopAutoRotate);
    projectsCarousel.addEventListener('mouseleave', startAutoRotate);
    projectsCarousel.addEventListener('touchstart', stopAutoRotate);
    projectsCarousel.addEventListener('touchend', () => {
        setTimeout(startAutoRotate, 1000);
    });

    updateCardsWithTransition(true);
    startAutoRotate();

    // Initialize background shader
    const shaderCanvas = document.getElementById('shaderCanvas');
    const gl = shaderCanvas.getContext('webgl');

    if (!gl) {
        console.error('WebGL not supported');
        return;
    }

    const vsSource = `
        attribute vec4 aVertexPosition;
        void main() {
            gl_Position = aVertexPosition;
        }
    `;

    const fsSource = `
        precision highp float;
        uniform vec2 iResolution;
        uniform float iTime;

        void mainImage(out vec4 fragColor, in vec2 fragCoord) {
            vec2 uv = (2.0 * fragCoord - iResolution.xy) / min(iResolution.x, iResolution.y);

            for(float i = 1.0; i < 10.0; i++){
                uv.x += 0.6 / i * cos(i * 2.5 * uv.y + iTime);
                uv.y += 0.6 / i * cos(i * 1.5 * uv.x + iTime);
            }
            
            fragColor = vec4(vec3(0.04)/abs(sin(iTime-uv.y-uv.x)), 1.0);
        }

        void main() {
            mainImage(gl_FragColor, gl_FragCoord.xy);
        }
    `;

    function createShader(gl, type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    }

    function initShaderProgram(gl, vsSource, fsSource) {
        const vertexShader = createShader(gl, gl.VERTEX_SHADER, vsSource);
        const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fsSource);

        const shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);

        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            console.error('Shader program linking error:', gl.getProgramInfoLog(shaderProgram));
            return null;
        }

        return shaderProgram;
    }

    const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
    const programInfo = {
        program: shaderProgram,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
        },
        uniformLocations: {
            resolution: gl.getUniformLocation(shaderProgram, 'iResolution'),
            time: gl.getUniformLocation(shaderProgram, 'iTime'),
        },
    };

    const positions = new Float32Array([
        -1.0, -1.0,
         1.0, -1.0,
        -1.0,  1.0,
         1.0,  1.0,
    ]);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    function resizeCanvas() {
        const displayWidth = shaderCanvas.clientWidth;
        const displayHeight = shaderCanvas.clientHeight;

        if (shaderCanvas.width !== displayWidth || shaderCanvas.height !== displayHeight) {
            shaderCanvas.width = displayWidth;
            shaderCanvas.height = displayHeight;
            gl.viewport(0, 0, displayWidth, displayHeight);
        }
    }

    function render(time) {
        time *= 0.001; // Convert to seconds

        resizeCanvas();

        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.useProgram(programInfo.program);

        gl.uniform2f(programInfo.uniformLocations.resolution, shaderCanvas.width, shaderCanvas.height);
        gl.uniform1f(programInfo.uniformLocations.time, time);

        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.vertexAttribPointer(
            programInfo.attribLocations.vertexPosition,
            2,
            gl.FLOAT,
            false,
            0,
            0
        );
        gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);

    window.addEventListener('resize', resizeCanvas);

    function initCustomCursor() {
        const cursorDot = document.createElement('div');
        const cursorOutline = document.createElement('div');
        
        cursorDot.className = 'cursor-dot';
        cursorOutline.className = 'cursor-dot-outline';
        
        cursorOutline.appendChild(cursorDot);
        document.body.appendChild(cursorOutline);
        document.body.classList.add('custom-cursor');

        let cursorVisible = false;
        let cursorTimeout;
        
        function hideCursor() {
            cursorDot.style.opacity = 0;
            cursorOutline.style.opacity = 0;
            cursorVisible = false;
        }
        
        function showCursor() {
            cursorDot.style.opacity = 1;
            cursorOutline.style.opacity = 1;
            cursorVisible = true;
        }
        
        function updateCursor(e) {
            const x = e.clientX;
            const y = e.clientY;

            cursorOutline.style.transform = `translate(${x}px, ${y}px)`;

            if (!cursorVisible) {
                showCursor();
            }
            
            clearTimeout(cursorTimeout);
            cursorTimeout = setTimeout(hideCursor, 1000); // Hide after 1 second of inactivity
        }

        document.addEventListener('mousemove', (e) => {
            if (cursorTimeout) {
                clearTimeout(cursorTimeout);
            }
            cursorTimeout = setTimeout(() => updateCursor(e), 0);
        });
        
        document.addEventListener('mousedown', () => {
            cursorDot.style.transform = cursorDot.style.transform.replace(/scale\([^)]*\)/, '') + ' scale(0.75)';
            cursorOutline.style.transform = cursorOutline.style.transform.replace(/scale\([^)]*\)/, '') + ' scale(0.75)';
        });
        
        document.addEventListener('mouseup', () => {
            cursorDot.style.transform = cursorDot.style.transform.replace(/scale\([^)]*\)/, '');
            cursorOutline.style.transform = cursorOutline.style.transform.replace(/scale\([^)]*\)/, '');
        });
        
        document.addEventListener('mouseleave', () => {
            hideCursor();
            clearTimeout(cursorTimeout); // Clear timeout when mouse leaves window
        });
        
        document.addEventListener('mouseenter', () => {
            showCursor();
            clearTimeout(cursorTimeout); // Reset timeout on mouse enter
            cursorTimeout = setTimeout(hideCursor, 1000);
        });

        const clickables = document.querySelectorAll('a, button, .clickable');
        clickables.forEach((el) => {
            el.addEventListener('mouseenter', () => {
                cursorDot.classList.add('hover');
                cursorOutline.classList.add('hover');
                showCursor(); // Always show cursor on hoverable elements
                clearTimeout(cursorTimeout); // Don't hide cursor while hovering clickable elements
            });
            
            el.addEventListener('mouseleave', () => {
                cursorDot.classList.remove('hover');
                cursorOutline.classList.remove('hover');
                clearTimeout(cursorTimeout); // Reset timeout when leaving clickable elements
                cursorTimeout = setTimeout(hideCursor, 1000);
            });
        });
    }

    initCustomCursor();
});