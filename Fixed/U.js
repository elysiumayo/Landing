document.addEventListener("DOMContentLoaded", () => {
  // DOM Element Selections
  const splashScreen = document.getElementById("splashScreen");
  const nameContainer = document.getElementById("nameContainer");
  const loadingBarContainer = document.getElementById("loadingBarContainer");
  const loadingBar = document.getElementById("loadingBar");
  const pageFrame = document.getElementById("pageFrame");
  const mainContent = document.getElementById("mainContent");
  const scrollableContent = document.getElementById("scrollableContent");
  const systemButton = document.getElementById("system");
  const quotesElement = document.getElementById("quotes");
  const linksContainer = document.getElementById("linksContainer");

  // Enhanced quotes array
  const quotes = [
    "Float like a Cadillac, sting like a Beemer.",
    "Speed is my middle name, no brakes.",
    "Life’s a highway, drive it with style.",
    "Fuel your dreams, race towards the sky.",
    "Fast, fearless, and ready to roll, always.",
    "Built for speed, driven by pure heart."
  ];

  // Utility Functions
  const utils = {
    // Set loading bar width to match name container
    setLoadingBarWidth() {
      const nameWidth = nameContainer.offsetWidth;
      loadingBarContainer.style.width = `${nameWidth}px`;
    },

    // Rotate quotes with fade effect
    rotateQuotes() {
      let currentQuoteIndex = 0;
      setInterval(() => {
        quotesElement.classList.add('fade-out');
        setTimeout(() => {
          currentQuoteIndex = (currentQuoteIndex + 1) % quotes.length;
          quotesElement.textContent = quotes[currentQuoteIndex];
          quotesElement.classList.remove('fade-out');
        }, 500);
      }, 5000);
    },

    // Create interactive system menu
    createSystemMenu() {
      const systemMenu = document.createElement('div');
      systemMenu.classList.add('system-menu');
      systemMenu.innerHTML = `
        <button id="darkModeToggle">Toggle Dark Mode</button>
        <button id="resetView">Reset View</button>
        <button id="toggleLinks">Toggle Links</button>
      `;
      systemMenu.style.display = 'none';
      document.body.appendChild(systemMenu);

      // Dark Mode Toggle
      const darkModeToggle = document.getElementById('darkModeToggle');
      darkModeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
      });

      // Reset View
      const resetViewBtn = document.getElementById('resetView');
      resetViewBtn.addEventListener('click', () => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      });

      // Toggle Links Visibility
      const toggleLinksBtn = document.getElementById('toggleLinks');
      toggleLinksBtn.addEventListener('click', () => {
        linksContainer.style.display = 
          linksContainer.style.display === 'none' ? 'flex' : 'none';
      });

      // System Button Toggle
      systemButton.addEventListener('click', () => {
        systemMenu.style.display = systemMenu.style.display === 'none' ? 'block' : 'none';
      });
    },

    // Section Intersection Observer
    setupSectionObserver() {
      const sections = document.querySelectorAll('section');
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          } else {
            entry.target.classList.remove('visible');
          }
        });
      }, {
        threshold: 0.1
      });

      sections.forEach(section => observer.observe(section));
    },

    // Restore Dark Mode Preference
    checkDarkModePreference() {
      const isDarkMode = localStorage.getItem('darkMode') === 'true';
      if (isDarkMode) {
        document.body.classList.add('dark-mode');
      }
    }
  };

  // Shader Background Class (from previous implementation)
  class ShaderBackground {
    constructor(containerElement) {
      this.container = containerElement;
      this.scene = new THREE.Scene();
      this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
      this.renderer = new THREE.WebGLRenderer();

      this.setupRenderer();
      this.createShaderMaterial();
      this.addPlane();
      this.startAnimation();
    }

    setupRenderer() {
      this.renderer.setSize(
        this.container.clientWidth,
        this.container.clientHeight,
      );
      this.renderer.setPixelRatio(window.devicePixelRatio);
      this.container.appendChild(this.renderer.domElement);
      this.renderer.domElement.style.position = "absolute";
      this.renderer.domElement.style.top = "0";
      this.renderer.domElement.style.left = "0";
      this.renderer.domElement.style.zIndex = "-1";
    }

    createShaderMaterial() {
      this.uniforms = {
        iTime: { value: 0 },
        iResolution: {
          value: new THREE.Vector2(window.innerWidth, window.innerHeight),
        },
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
            for(float i = 1.0; i < 10.0; i++){
              uv.x += 0.6 / i * cos(i * 2.5 * uv.y + iTime);
              uv.y += 0.6 / i * cos(i * 1.5 * uv.x + iTime);
            }

            gl_FragColor = vec4(vec3(0.045)/abs(sin(iTime-uv.y-uv.x)), 1.0);
          }
        `,
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

        // Update time uniform
        this.uniforms.iTime.value = performance.now() * 0.001;

        // Update resolution if window is resized
        this.uniforms.iResolution.value.set(
          this.container.clientWidth,
          this.container.clientHeight,
        );

        this.renderer.render(this.scene, this.camera);
      };
      animate();

      // Handle window resize
      window.addEventListener("resize", () => {
        this.renderer.setSize(
          this.container.clientWidth,
          this.container.clientHeight,
        );
      });
    }
  }

  // Initialization Function
  function init() {
    // Set initial loading bar width
    utils.setLoadingBarWidth();
    window.addEventListener("resize", utils.setLoadingBarWidth);

    // Initialize shader background
    const shaderBackground = new ShaderBackground(mainContent);

    // Quote rotation
    utils.rotateQuotes();

    // Create system menu
    utils.createSystemMenu();

    // Section observer
    utils.setupSectionObserver();

    // Check dark mode preference
    utils.checkDarkModePreference();

    // Hide splash screen after 3 seconds
    setTimeout(() => {
      splashScreen.classList.add("slide-out");
      setTimeout(() => {
        splashScreen.style.display = "none";
      }, 1000);
    }, 3000);
  }

  // Initialize the website
  init();
});
