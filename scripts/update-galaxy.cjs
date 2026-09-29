const fs = require('fs');
let code = fs.readFileSync('apps/pwa/src/Galaxy.tsx', 'utf8');
const start = code.indexOf('export default function Galaxy');
const newCode = `export default function Galaxy({
  focal = [0.5, 0.5],
  rotation = [1.0, 0.0],
  starSpeed = 0.5,
  density = 1,
  hueShift = 140,
  disableAnimation = false,
  speed = 1.0,
  mouseInteraction = true,
  glowIntensity = 0.3,
  saturation = 0.0,
  mouseRepulsion = true,
  repulsionStrength = 2,
  twinkleIntensity = 0.3,
  rotationSpeed = 0.1,
  autoCenterRepulsion = 0,
  transparent = true,
  lightMode = false,
  ...rest
}) {
  const ctnDom = useRef(null);
  const targetMousePos = useRef({ x: 0.5, y: 0.5 });
  const smoothMousePos = useRef({ x: 0.5, y: 0.5 });
  const targetMouseActive = useRef(0.0);
  const smoothMouseActive = useRef(0.0);
  
  const propsRef = useRef({ focal, rotation, starSpeed, density, hueShift, disableAnimation, speed, mouseInteraction, glowIntensity, saturation, mouseRepulsion, repulsionStrength, twinkleIntensity, rotationSpeed, autoCenterRepulsion });
  useEffect(() => {
    propsRef.current = { focal, rotation, starSpeed, density, hueShift, disableAnimation, speed, mouseInteraction, glowIntensity, saturation, mouseRepulsion, repulsionStrength, twinkleIntensity, rotationSpeed, autoCenterRepulsion };
  }, [focal, rotation, starSpeed, density, hueShift, disableAnimation, speed, mouseInteraction, glowIntensity, saturation, mouseRepulsion, repulsionStrength, twinkleIntensity, rotationSpeed, autoCenterRepulsion]);

  useEffect(() => {
    if (!ctnDom.current) return;
    const ctn = ctnDom.current;
    
    // Use reasonable DPR
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    const renderer = new Renderer({
      alpha: transparent,
      premultipliedAlpha: false,
      dpr
    });
    const gl = renderer.gl;

    if (lightMode) {
      gl.clearColor(1, 1, 1, 1);
    } else if (transparent) {
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.clearColor(0, 0, 0, 0);
    } else {
      gl.clearColor(0, 0, 0, 1);
    }

    let program;

    function resize() {
      renderer.setSize(ctn.offsetWidth, ctn.offsetHeight);
      if (program) {
        program.uniforms.uResolution.value = new Color(
          gl.canvas.width,
          gl.canvas.height,
          gl.canvas.width / gl.canvas.height
        );
      }
    }
    window.addEventListener('resize', resize, false);

    const geometry = new Triangle(gl);
    program = new Program(gl, {
      vertex: vertexShader,
      fragment: fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uResolution: {
          value: new Color(gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height)
        },
        uFocal: { value: new Float32Array(focal) },
        uRotation: { value: new Float32Array(rotation) },
        uStarSpeed: { value: starSpeed },
        uDensity: { value: density },
        uHueShift: { value: hueShift },
        uSpeed: { value: speed },
        uMouse: {
          value: new Float32Array([smoothMousePos.current.x, smoothMousePos.current.y])
        },
        uGlowIntensity: { value: glowIntensity },
        uSaturation: { value: saturation },
        uMouseRepulsion: { value: mouseRepulsion },
        uTwinkleIntensity: { value: twinkleIntensity },
        uRotationSpeed: { value: rotationSpeed },
        uRepulsionStrength: { value: repulsionStrength },
        uMouseActiveFactor: { value: 0.0 },
        uAutoCenterRepulsion: { value: autoCenterRepulsion },
        uTransparent: { value: transparent },
        uLightMode: { value: lightMode ? 1 : 0 }
      }
    });

    const mesh = new Mesh(gl, { geometry, program });
    let animateId;

    // Call resize once before starting
    resize();

    function update(t) {
      animateId = requestAnimationFrame(update);
      const p = propsRef.current;
      
      if (!p.disableAnimation) {
        program.uniforms.uTime.value = t * 0.001;
        program.uniforms.uStarSpeed.value = (t * 0.001 * p.starSpeed) / 10.0;
      }

      program.uniforms.uDensity.value = p.density;
      program.uniforms.uHueShift.value = p.hueShift;
      program.uniforms.uSpeed.value = p.speed;
      program.uniforms.uGlowIntensity.value = p.glowIntensity;
      program.uniforms.uSaturation.value = p.saturation;
      program.uniforms.uMouseRepulsion.value = p.mouseRepulsion;
      program.uniforms.uTwinkleIntensity.value = p.twinkleIntensity;
      program.uniforms.uRotationSpeed.value = p.rotationSpeed;
      program.uniforms.uRepulsionStrength.value = p.repulsionStrength;
      program.uniforms.uAutoCenterRepulsion.value = p.autoCenterRepulsion;
      
      if (p.focal[0] !== program.uniforms.uFocal.value[0] || p.focal[1] !== program.uniforms.uFocal.value[1]) {
         program.uniforms.uFocal.value[0] = p.focal[0];
         program.uniforms.uFocal.value[1] = p.focal[1];
      }
      if (p.rotation[0] !== program.uniforms.uRotation.value[0] || p.rotation[1] !== program.uniforms.uRotation.value[1]) {
         program.uniforms.uRotation.value[0] = p.rotation[0];
         program.uniforms.uRotation.value[1] = p.rotation[1];
      }

      const lerpFactor = 0.05;
      smoothMousePos.current.x += (targetMousePos.current.x - smoothMousePos.current.x) * lerpFactor;
      smoothMousePos.current.y += (targetMousePos.current.y - smoothMousePos.current.y) * lerpFactor;
      smoothMouseActive.current += (targetMouseActive.current - smoothMouseActive.current) * lerpFactor;

      program.uniforms.uMouse.value[0] = smoothMousePos.current.x;
      program.uniforms.uMouse.value[1] = smoothMousePos.current.y;
      program.uniforms.uMouseActiveFactor.value = smoothMouseActive.current;

      renderer.render({ scene: mesh });
    }
    animateId = requestAnimationFrame(update);
    ctn.appendChild(gl.canvas);

    function handleMouseMove(e) {
      if (!propsRef.current.mouseInteraction) return;
      const rect = ctn.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = 1.0 - (e.clientY - rect.top) / rect.height;
      targetMousePos.current = { x, y };
      targetMouseActive.current = 1.0;
    }

    function handleMouseLeave() {
      if (!propsRef.current.mouseInteraction) return;
      targetMouseActive.current = 0.0;
    }

    ctn.addEventListener('mousemove', handleMouseMove);
    ctn.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      cancelAnimationFrame(animateId);
      window.removeEventListener('resize', resize);
      ctn.removeEventListener('mousemove', handleMouseMove);
      ctn.removeEventListener('mouseleave', handleMouseLeave);
      ctn.removeChild(gl.canvas);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, []); // Run ONCE!

  return <div ref={ctnDom} className="galaxy-container" {...rest} />;
}
`;
fs.writeFileSync('apps/pwa/src/Galaxy.tsx', code.substring(0, start) + newCode);
