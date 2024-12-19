document.addEventListener("DOMContentLoaded", () => {
  // Configuration and utility functions
  const config = {
    selectors: {
      splashScreen: "#splashScreen",
      nameContainer: "#nameContainer",
      loadingBarContainer: "#loadingBarContainer",
      mainContent: "#mainContent",
    },
    timings: {
      splashScreenDuration: 3000,
      resizeDebounceDelay: 100,
      smoothReloadDelay: 200,
      fadeOutDuration: 500,
    },
  };

  // Utility functions
  const utils = {
    debounce(func, delay) {
      let timeoutId;
      return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
      };
    },

    setLoadingBarWidth(nameContainer, loadingBarContainer) {
      const nameWidth = nameContainer.offsetWidth;
      loadingBarContainer.style.width = `${nameWidth}px`;
    },
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
        this.container.clientHeight,
      );
      this.renderer.setPixelRatio(window.devicePixelRatio);
      this.container.appendChild(this.renderer.domElement);

      Object.assign(this.renderer.domElement.style, {
        position: "absolute",
        top: "0",
        left: "0",
        zIndex: "-1",
      });
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
            for (float i = 1.0; i < 10.0; i++) {
              uv.x += 0.6 / i * cos(i * 2.5 * uv.y + iTime);
              uv.y += 0.6 / i * cos(i * 1.5 * uv.x + iTime);
            }

            gl_FragColor = vec4(vec3(0.04) / abs(sin(iTime - uv.y - uv.x)), 1.0);
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
        this.uniforms.iTime.value = performance.now() * 0.001;
        this.uniforms.iResolution.value.set(
          this.container.clientWidth,
          this.container.clientHeight,
        );
        this.renderer.render(this.scene, this.camera);
      };
      animate();
    }
  }

  // Scroll-based Animations
  const scrollAnimations = {
    init() {
      const paragraphs = document.querySelectorAll(".about-content p");
      const headings = document.querySelectorAll(
        ".about-heading h2, .card-heading h2",
      );

      const observerOptions = {
        threshold: 0.1,
      };

      const handleAnimation = (entries) => {
        entries.forEach((entry) => {
          const element = entry.target;
          if (entry.isIntersecting) {
            element.classList.add("slide-in", "animated");
          } else {
            element.classList.remove("slide-in", "animated");
          }
        });
      };

      const observer = new IntersectionObserver(
        handleAnimation,
        observerOptions,
      );

      paragraphs.forEach((paragraph) => observer.observe(paragraph));
      headings.forEach((heading) => observer.observe(heading));
    },
  };

  // Main initialization function
  function init() {
    const elements = {
      splashScreen: document.querySelector(config.selectors.splashScreen),
      nameContainer: document.querySelector(config.selectors.nameContainer),
      loadingBarContainer: document.querySelector(
        config.selectors.loadingBarContainer,
      ),
      mainContent: document.querySelector(config.selectors.mainContent),
    };

    utils.setLoadingBarWidth(
      elements.nameContainer,
      elements.loadingBarContainer,
    );

    const debouncedResizeLoadingBar = utils.debounce(
      () =>
        utils.setLoadingBarWidth(
          elements.nameContainer,
          elements.loadingBarContainer,
        ),
      config.timings.resizeDebounceDelay,
    );
    window.addEventListener("resize", debouncedResizeLoadingBar);

    new ShaderBackground(elements.mainContent);

    setTimeout(() => {
      elements.splashScreen.classList.add("slide-out");
      setTimeout(() => {
        elements.splashScreen.style.display = "none";
      }, config.timings.fadeOutDuration);
    }, config.timings.splashScreenDuration);

    const debouncedSmoothReload = utils.debounce(() => {
      document.body.classList.add("fade-out");
      setTimeout(
        () => window.location.reload(),
        config.timings.fadeOutDuration,
      );
    }, config.timings.resizeDebounceDelay);
    window.addEventListener("resize", debouncedSmoothReload);

    scrollAnimations.init();
  }

  init();
});
