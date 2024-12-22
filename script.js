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

    // Shader implementation
    const canvas = document.getElementById('shaderCanvas');
    const gl = canvas.getContext('webgl');

    if (!gl) {
        console.error('WebGL not supported');
    }

    const vertexShaderSource = `
        attribute vec2 position;
        void main() {
            gl_Position = vec4(position, 0.0, 1.0);
        }
    `;

    const fragmentShaderSource = `
        precision highp float;
        uniform vec2 iResolution;
        uniform float iTime;

        void mainImage(out vec4 fragColor, in vec2 fragCoord) {
            vec2 uv = (2.0 * fragCoord - iResolution.xy) / min(iResolution.x, iResolution.y);

            for(float i = 1.0; i < 10.0; i++){
                uv.x += 0.6 / i * cos(i * 2.5 * uv.y + iTime);
                uv.y += 0.6 / i * cos(i * 1.5 * uv.x + iTime);
            }
            
            fragColor = vec4(vec3(0.1)/abs(sin(iTime-uv.y-uv.x)), 1.0);
        }

        void main() {
            vec2 fragCoord = gl_FragCoord.xy;
            mainImage(gl_FragColor, fragCoord);
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

        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error('Program linking error:', gl.getProgramInfoLog(program));
            return null;
        }
        return program;
    }

    // Initialize shader program
    const shaderProgram = initShaderProgram(gl, vertexShaderSource, fragmentShaderSource);
    const programInfo = {
        program: shaderProgram,
        attribLocations: {
            position: gl.getAttribLocation(shaderProgram, 'position'),
        },
        uniformLocations: {
            iResolution: gl.getUniformLocation(shaderProgram, 'iResolution'),
            iTime: gl.getUniformLocation(shaderProgram, 'iTime'),
        },
    };

    // Create buffer for vertices
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const positions = new Float32Array([
        -1.0, -1.0,
         1.0, -1.0,
        -1.0,  1.0,
         1.0,  1.0,
    ]);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    function resizeCanvas() {
        const displayWidth = canvas.clientWidth;
        const displayHeight = canvas.clientHeight;

        if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
            canvas.width = displayWidth;
            canvas.height = displayHeight;
            gl.viewport(0, 0, canvas.width, canvas.height);
        }
    }

    function render(time) {
        time *= 0.001; // Convert to seconds

        resizeCanvas();

        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.useProgram(programInfo.program);

        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.vertexAttribPointer(programInfo.attribLocations.position, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(programInfo.attribLocations.position);

        gl.uniform2f(programInfo.uniformLocations.iResolution, canvas.width, canvas.height);
        gl.uniform1f(programInfo.uniformLocations.iTime, time);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

        requestAnimationFrame(render);
    }

    // Start the animation
    requestAnimationFrame(render);
});