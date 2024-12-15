document.addEventListener("DOMContentLoaded", () => {
  const splashScreen = document.getElementById("splashScreen");
  const nameContainer = document.getElementById("nameContainer");
  const loadingBarContainer = document.getElementById("loadingBarContainer");
  const loadingBar = document.getElementById("loadingBar");
  const pageFrame = document.getElementById("pageFrame");
  const mainContent = document.getElementById("mainContent");

  // Set loading bar width to match name container
  function setLoadingBarWidth() {
    const nameWidth = nameContainer.offsetWidth;
    loadingBarContainer.style.width = `${nameWidth}px`;
  }

  // Call on initial load and after a short delay to ensure accurate measurement
  setLoadingBarWidth();
  setTimeout(setLoadingBarWidth, 100);

  // Resize listener
  window.addEventListener("resize", setLoadingBarWidth);

  // Shader Background Class
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

            gl_FragColor = vec4(vec3(0.05)/abs(sin(iTime-uv.y-uv.x)), 1.0);
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

  // Initialize shader background
  const shaderBackground = new ShaderBackground(mainContent);

  // Hide splash screen after 3 seconds with slide transition
  setTimeout(() => {
    splashScreen.classList.add("slide-out");
    // Completely remove splash screen after transition
    setTimeout(() => {
      splashScreen.style.display = "none";
    }, 1000);
  }, 3000);
});
document.addEventListener("DOMContentLoaded", () => {
    const contentScrollContainer = document.querySelector('.content-scroll-container');
    
    // Smooth scroll control
    function smoothScroll() {
        contentScrollContainer.addEventListener('wheel', (e) => {
            e.preventDefault();
            // Adjust scroll speed and smoothness
            contentScrollContainer.scrollTop += e.deltaY * 0.5;
        }, { passive: false });
    }

    // Parallax effect for sections
    function parallaxEffect() {
        contentScrollContainer.addEventListener('scroll', () => {
            const sections = document.querySelectorAll('.content-section');
            sections.forEach((section, index) => {
                const scrollPosition = contentScrollContainer.scrollTop;
                const sectionTop = section.offsetTop;
                const parallaxFactor = index * 50; // Adjust for desired effect
                
                section.style.transform = `translateY(${
                    (scrollPosition - sectionTop) * 0.3 + parallaxFactor
                }px)`;
            });
        });
    }

    // Initialize scroll and parallax features
    smoothScroll();
    parallaxEffect();
});
document.addEventListener("DOMContentLoaded", function () {
  const aboutMeSection = document.querySelector(".about-me-section");

  // IntersectionObserver to detect when the section scrolls into view
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          aboutMeSection.classList.add("visible");
        } else {
          aboutMeSection.classList.remove("visible");
        }
      });
    },
    {
      threshold: 0.5, // Trigger when 50% of the section is visible
    }
  );

  observer.observe(aboutMeSection);
});

