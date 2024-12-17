document.addEventListener("DOMContentLoaded", () => {
  const splashScreen = document.getElementById("splashScreen");
  const nameContainer = document.getElementById("nameContainer");
  const loadingBarContainer = document.getElementById("loadingBarContainer");
  const mainContent = document.getElementById("mainContent");

  // Set loading bar width to match name container
  function setLoadingBarWidth() {
    const nameWidth = nameContainer.offsetWidth;
    loadingBarContainer.style.width = `${nameWidth}px`;
  }

  // Resize listener with debounce for loading bar width
  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(setLoadingBarWidth, 100);
  });

  setLoadingBarWidth();

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

            gl_FragColor = vec4(vec3(0.045) / abs(sin(iTime - uv.y - uv.x)), 1.0);
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

  // Initialize shader background
  const shaderBackground = new ShaderBackground(mainContent);

  // Hide splash screen after 3 seconds with slide transition
  setTimeout(() => {
    splashScreen.classList.add("slide-out");
    setTimeout(() => (splashScreen.style.display = "none"), 1000);
  }, 3000);

  // Handle Resize with smooth reload effect
  let resizeTimeoutSmoothReload;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeoutSmoothReload);
    resizeTimeoutSmoothReload = setTimeout(() => {
      // Apply fade-out effect
      document.body.classList.add("fade-out");

      // Wait for fade-out to complete before reloading
      setTimeout(() => window.location.reload(), 500);
    }, 200);
  });
});
document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.card-container');
    let startX = 0;
    let isDragging = false;

    container.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        isDragging = true;
    });

    container.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        const currentX = e.touches[0].clientX;
        const diff = startX - currentX;
        container.scrollLeft += diff;
        startX = currentX;
    });

    container.addEventListener('touchend', () => {
        isDragging = false;
    });
});
