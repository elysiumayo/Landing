document.addEventListener("DOMContentLoaded", () => {
  // Configuration and utility functions
  const config = {
    selectors: {
      splashScreen: "#splashScreen",
      nameContainer: "#nameContainer",
      loadingBarContainer: "#loadingBarContainer",
      mainContent: "#mainContent"
    },
    timings: {
      splashScreenDuration: 3000,
      resizeDebounceDelay: 100,
      smoothReloadDelay: 200,
      fadeOutDuration: 500
    }
  };

  // Utility functions
  const utils = {
    /**
     * Debounce function to limit the rate of function calls
     * @param {Function} func - Function to debounce
     * @param {number} delay - Delay in milliseconds
     * @returns {Function} Debounced function
     */
    debounce(func, delay) {
      let timeoutId;
      return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
      };
    },

    /**
     * Resize loading bar to match name container width
     * @param {HTMLElement} nameContainer - Container with name
     * @param {HTMLElement} loadingBarContainer - Loading bar container
     */
    setLoadingBarWidth(nameContainer, loadingBarContainer) {
      const nameWidth = nameContainer.offsetWidth;
      loadingBarContainer.style.width = `${nameWidth}px`;
    }
  };

  // Shader background module
  class ShaderBackground {
    constructor(containerElement) {
      this.container = containerElement;
      this.scene = new THREE.Scene();
      this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
      this.renderer = new THREE.WebGLRenderer();
      this.uniforms = null;
      this.material = null;

      this.init();
    }

    init() {
      this.setupRenderer();
      this.createShaderMaterial();
      this.addPlane();
      this.startAnimation();
    }

    setupRenderer() {
      this.renderer.setSize(
        this.container.clientWidth,
        this.container.clientHeight
      );
      this.renderer.setPixelRatio(window.devicePixelRatio);
      this.container.appendChild(this.renderer.domElement);
      
      Object.assign(this.renderer.domElement.style, {
        position: "absolute",
        top: "0",
        left: "0",
        zIndex: "-1"
      });
    }

    createShaderMaterial() {
      this.uniforms = {
        iTime: { value: 0 },
        iResolution: {
          value: new THREE.Vector2(window.innerWidth, window.innerHeight)
        }
      };

      this.material = new THREE.ShaderMaterial({
        uniforms: this.uniforms,
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform float iTime;
          uniform vec2 iResolution;
          varying vec2 vUv;

          void main() {
            vec2 uv = (2.0 * gl_FragCoord.xy - iResolution.xy) / min(iResolution.x, iResolution.y);
            for (float i = 1.0; i < 10.0; i++) {
              uv.x += 0.6 / i * cos(i * 2.5 * uv.y + iTime);
              uv.y += 0.6 / i * cos(i * 1.5 * uv.x + iTime);
            }

            gl_FragColor = vec4(vec3(0.04) / abs(sin(iTime - uv.y - uv.x)), 1.0);
          }
        `
      });
    }

    addPlane() {
      const geometry = new THREE.PlaneGeometry(2, 2);
      const mesh = new THREE.Mesh(geometry, this.material);
      this.scene.add(mesh);
    }

    startAnimation() {
      const animate = () => {
        requestAnimationFrame(animate);
        this.uniforms.iTime.value = performance.now() * 0.001;
        this.uniforms.iResolution.value.set(
          this.container.clientWidth,
          this.container.clientHeight
        );
        this.renderer.render(this.scene, this.camera);
      };
      animate();
    }
  }

  // Scroll-based Animations
  const scrollAnimations = {
    init() {
      const paragraphs = document.querySelectorAll('.about-content p');
      const headings = document.querySelectorAll('.about-heading h2, .card-heading h2');

      const observerOptions = {
        threshold: 0.1
      };

      const paragraphObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const paragraph = entry.target;
            if (!paragraph.classList.contains('animated')) {
              paragraph.classList.add('slide-in', 'animated');
            }
          }
        });
      }, observerOptions);

      const headingObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const heading = entry.target;
            if (!heading.classList.contains('animated')) {
              heading.classList.add('slide-in', 'animated');
            }
          }
        });
      }, observerOptions);

      paragraphs.forEach(paragraph => paragraphObserver.observe(paragraph));
      headings.forEach(heading => headingObserver.observe(heading));
    }
  };

  // Main initialization function
  function init() {
    const elements = {
      splashScreen: document.querySelector(config.selectors.splashScreen),
      nameContainer: document.querySelector(config.selectors.nameContainer),
      loadingBarContainer: document.querySelector(config.selectors.loadingBarContainer),
      mainContent: document.querySelector(config.selectors.mainContent)
    };

    // Initialize loading bar width
    utils.setLoadingBarWidth(elements.nameContainer, elements.loadingBarContainer);

    // Resize listener for loading bar
    const debouncedResizeLoadingBar = utils.debounce(
      () => utils.setLoadingBarWidth(elements.nameContainer, elements.loadingBarContainer), 
      config.timings.resizeDebounceDelay
    );
    window.addEventListener("resize", debouncedResizeLoadingBar);

    // Initialize shader background
    new ShaderBackground(elements.mainContent);

    // Hide splash screen
    setTimeout(() => {
      elements.splashScreen.classList.add("slide-out");
      setTimeout(() => {
        elements.splashScreen.style.display = "none";
      }, config.timings.fadeOutDuration);
    }, config.timings.splashScreenDuration);

    // Smooth reload on resize
    const debouncedSmoothReload = utils.debounce(() => {
      document.body.classList.add("fade-out");
      setTimeout(() => window.location.reload(), config.timings.fadeOutDuration);
    }, config.timings.resizeDebounceDelay);
    window.addEventListener("resize", debouncedSmoothReload);

    // Initialize scroll animations
    scrollAnimations.init();
  }

  // Execute initialization
  init();
});
