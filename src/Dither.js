// --------------------------- src/Dither.jsx ---------------------------
/* eslint-disable react/no-unknown-property */
import { useRef, useEffect, forwardRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, wrapEffect } from '@react-three/postprocessing';
import { Effect } from 'postprocessing';
import * as THREE from 'three';

// Vertex estándar
const waveVertexShader = `
precision highp float;
varying vec2 vUv;
void main() {
  vUv = uv;
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  vec4 viewPosition = viewMatrix * modelPosition;
  gl_Position = projectionMatrix * viewPosition;
}
`;

// Fragmento: ruido + dither, con zoom/pan y mouse exacto en espacio de pantalla
const waveFragmentShader = `
precision highp float;
uniform vec2 resolution;             // tamaño del canvas en píxeles reales
uniform float time;
uniform float waveSpeed;
uniform float waveFrequency;
uniform float waveAmplitude;
uniform vec3 waveColor;
uniform vec2 mousePos;               // posición del mouse en px (espacio canvas)
uniform int enableMouseInteraction;
uniform float mouseRadius;           // radio en unidades de UV transformadas
uniform float patternScale;          // <1 => formas más grandes
uniform vec2 patternOffset;          // pan

vec4 mod289(vec4 x){return x - floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);} 
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314*r;} 
vec2 fade(vec2 t){return t*t*t*(t*(t*6.0-15.0)+10.0);} 

float cnoise(vec2 P){
  vec4 Pi=floor(P.xyxy)+vec4(0.0,0.0,1.0,1.0);
  vec4 Pf=fract(P.xyxy)-vec4(0.0,0.0,1.0,1.0);
  Pi=mod289(Pi);
  vec4 ix=Pi.xzxz; vec4 iy=Pi.yyww; vec4 fx=Pf.xzxz; vec4 fy=Pf.yyww;
  vec4 i=permute(permute(ix)+iy);
  vec4 gx=fract(i*(1.0/41.0))*2.0-1.0; vec4 gy=abs(gx)-0.5; vec4 tx=floor(gx+0.5); gx=gx-tx;
  vec2 g00=vec2(gx.x,gy.x); vec2 g10=vec2(gx.y,gy.y); vec2 g01=vec2(gx.z,gy.z); vec2 g11=vec2(gx.w,gy.w);
  vec4 norm=taylorInvSqrt(vec4(dot(g00,g00),dot(g01,g01),dot(g10,g10),dot(g11,g11)));
  g00*=norm.x; g01*=norm.y; g10*=norm.z; g11*=norm.w;
  float n00=dot(g00,vec2(fx.x,fy.x)); float n10=dot(g10,vec2(fx.y,fy.y));
  float n01=dot(g01,vec2(fx.z,fy.z)); float n11=dot(g11,vec2(fx.w,fy.w));
  vec2 fade_xy=fade(Pf.xy); vec2 n_x=mix(vec2(n00,n01),vec2(n10,n11),fade_xy.x);
  return 2.3*mix(n_x.x,n_x.y,fade_xy.y);
}

const int OCTAVES = 4;
float fbm(vec2 p){
  float value=0.0, amp=1.0, freq=waveFrequency;
  for(int i=0;i<OCTAVES;i++){ value+=amp*abs(cnoise(p)); p*=freq; amp*=waveAmplitude; }
  return value;
}

float pattern(vec2 p){ vec2 p2=p - time*waveSpeed; return fbm(p + fbm(p2)); }

void main(){
  // UV base en espacio de pantalla (centrado y corrigiendo aspecto)
  vec2 uv = gl_FragCoord.xy / resolution.xy; // 0..1
  uv -= 0.5;
  float aspect = resolution.x / resolution.y;
  uv.x *= aspect;

  // zoom/pan independientes del tamaño del canvas
  uv = uv * patternScale + patternOffset;

  float f = pattern(uv);

  if(enableMouseInteraction==1){
    // mapear mouse en px a UV con mismas transformaciones
    vec2 m = mousePos / resolution; // 0..1
    m -= 0.5; m.x *= aspect;        // centrar + corregir aspecto
    m = m * patternScale + patternOffset;

    float dist = length(uv - m);
    float effect = 1.0 - smoothstep(0.0, mouseRadius, dist);
    f -= 0.5 * effect;
  }

  vec3 col = mix(vec3(0.0), waveColor, f);
  gl_FragColor = vec4(col, 1.0);
}
`;

// Dither post-processing (Bayer 8x8)
const ditherFragmentShader = `
precision highp float;
uniform float colorNum;
uniform float pixelSize;
const float bayerMatrix8x8[64]=float[64](
  0.0/64.0,48.0/64.0,12.0/64.0,60.0/64.0,3.0/64.0,51.0/64.0,15.0/64.0,63.0/64.0,
  32.0/64.0,16.0/64.0,44.0/64.0,28.0/64.0,35.0/64.0,19.0/64.0,47.0/64.0,31.0/64.0,
  8.0/64.0,56.0/64.0,4.0/64.0,52.0/64.0,11.0/64.0,59.0/64.0,7.0/64.0,55.0/64.0,
  40.0/64.0,24.0/64.0,36.0/64.0,20.0/64.0,43.0/64.0,27.0/64.0,39.0/64.0,23.0/64.0,
  2.0/64.0,50.0/64.0,14.0/64.0,62.0/64.0,1.0/64.0,49.0/64.0,13.0/64.0,61.0/64.0,
  34.0/64.0,18.0/64.0,46.0/64.0,30.0/64.0,33.0/64.0,17.0/64.0,45.0/64.0,29.0/64.0,
  10.0/64.0,58.0/64.0,6.0/64.0,54.0/64.0,9.0/64.0,57.0/64.0,5.0/64.0,53.0/64.0,
  42.0/64.0,26.0/64.0,38.0/64.0,22.0/64.0,41.0/64.0,25.0/64.0,37.0/64.0,21.0/64.0
);
vec3 dither(vec2 uv, vec3 color){
  vec2 scaledCoord=floor(uv*resolution/pixelSize);
  int x=int(mod(scaledCoord.x,8.0)); int y=int(mod(scaledCoord.y,8.0));
  float threshold=bayerMatrix8x8[y*8+x]-0.25; float step=1.0/(colorNum-1.0);
  color+=threshold*step; color=clamp(color-0.2,0.0,1.0);
  return floor(color*(colorNum-1.0)+0.5)/(colorNum-1.0);
}
void mainImage(in vec4 inputColor, in vec2 uv, out vec4 outputColor){
  vec2 normalizedPixelSize=pixelSize/resolution;
  vec2 uvPixel=normalizedPixelSize*floor(uv/normalizedPixelSize);
  vec4 color=texture2D(inputBuffer,uvPixel);
  color.rgb=dither(uv,color.rgb);
  outputColor=color;
}
`;

class RetroEffectImpl extends Effect {
  constructor(){
    const uniforms=new Map([
      ['colorNum', new THREE.Uniform(4.0)],
      ['pixelSize', new THREE.Uniform(2.0)],
    ]);
    super('RetroEffect', ditherFragmentShader, { uniforms });
    this.uniforms=uniforms;
  }
  set colorNum(v){ this.uniforms.get('colorNum').value=v; }
  get colorNum(){ return this.uniforms.get('colorNum').value; }
  set pixelSize(v){ this.uniforms.get('pixelSize').value=v; }
  get pixelSize(){ return this.uniforms.get('pixelSize').value; }
}
const WrappedRetro = wrapEffect(RetroEffectImpl);
const RetroEffect = forwardRef((props, ref)=>{
  const { colorNum, pixelSize } = props;
  return <WrappedRetro ref={ref} colorNum={colorNum} pixelSize={pixelSize} />;
});
RetroEffect.displayName='RetroEffect';

function DitheredWaves({
  waveSpeed, waveFrequency, waveAmplitude, waveColor,
  colorNum, pixelSize, disableAnimation, enableMouseInteraction,
  mouseRadius, patternScale, patternOffset,
}){
  const mouseRef = useRef(new THREE.Vector2());
  const { size, gl, viewport } = useThree();

  const u = useRef({
    time: new THREE.Uniform(0),
    resolution: new THREE.Uniform(new THREE.Vector2(0,0)),
    waveSpeed: new THREE.Uniform(waveSpeed),
    waveFrequency: new THREE.Uniform(waveFrequency),
    waveAmplitude: new THREE.Uniform(waveAmplitude),
    waveColor: new THREE.Uniform(new THREE.Color(...waveColor)),
    mousePos: new THREE.Uniform(new THREE.Vector2(0,0)),
    enableMouseInteraction: new THREE.Uniform(enableMouseInteraction ? 1 : 0),
    mouseRadius: new THREE.Uniform(mouseRadius),
    patternScale: new THREE.Uniform(patternScale),
    patternOffset: new THREE.Uniform(new THREE.Vector2(...patternOffset)),
  });

  useEffect(()=>{
    const dpr = gl.getPixelRatio();
    const w = Math.floor(size.width * dpr);
    const h = Math.floor(size.height * dpr);
    const res = u.current.resolution.value; if (res.x!==w || res.y!==h) res.set(w,h);
  },[size,gl]);

  useEffect(()=>{
    if(!enableMouseInteraction) return;
    const onMove = (e)=>{
      const rect = gl.domElement.getBoundingClientRect();
      const dpr = gl.getPixelRatio();
      mouseRef.current.set((e.clientX-rect.left)*dpr, (e.clientY-rect.top)*dpr);
      u.current.mousePos.value.copy(mouseRef.current);
    };
    window.addEventListener('mousemove', onMove, { passive:true });
    return ()=> window.removeEventListener('mousemove', onMove);
  },[enableMouseInteraction, gl]);

  const prevColor = useRef([...waveColor]);
  useFrame(({ clock })=>{
    if(!disableAnimation) u.current.time.value = clock.getElapsedTime();
    u.current.waveSpeed.value = waveSpeed;
    u.current.waveFrequency.value = waveFrequency;
    u.current.waveAmplitude.value = waveAmplitude;
    if(!prevColor.current.every((v,i)=>v===waveColor[i])){ u.current.waveColor.value.set(...waveColor); prevColor.current=[...waveColor]; }
    u.current.enableMouseInteraction.value = enableMouseInteraction ? 1 : 0;
    u.current.mouseRadius.value = mouseRadius;
    u.current.patternScale.value = patternScale;
    u.current.patternOffset.value.set(patternOffset[0], patternOffset[1]);
  });

  return (
    <>
      <mesh scale={[viewport.width, viewport.height, 1]} frustumCulled={false}>
        <planeGeometry args={[1,1]} />
        <shaderMaterial vertexShader={waveVertexShader} fragmentShader={waveFragmentShader} uniforms={u.current} />
      </mesh>
      <EffectComposer>
        <RetroEffect colorNum={colorNum} pixelSize={pixelSize} />
      </EffectComposer>
    </>
  );
}

export default function Dither({
  waveSpeed = 0.06,
  waveFrequency = 4.1,
  waveAmplitude = 0.3,
  waveColor = [0.7, 0.8, 1],
  colorNum = 4,
  pixelSize = 2,
  disableAnimation = false,
  enableMouseInteraction = true,
  mouseRadius = 0.4,
  patternScale = 0.6,
  patternOffset = [0, 0],
}){
  return (
    <Canvas
      className="w-full h-full"
      style={{ display:'block', pointerEvents:'none' }}
      camera={{ position:[0,0,6] }}
      dpr={typeof window!=='undefined' ? window.devicePixelRatio : 1}
      gl={{ antialias:true, preserveDrawingBuffer:true }}
    >
      <DitheredWaves
        waveSpeed={waveSpeed}
        waveFrequency={waveFrequency}
        waveAmplitude={waveAmplitude}
        waveColor={waveColor}
        colorNum={colorNum}
        pixelSize={pixelSize}
        disableAnimation={disableAnimation}
        enableMouseInteraction={enableMouseInteraction}
        mouseRadius={mouseRadius}
        patternScale={patternScale}
        patternOffset={patternOffset}
      />
    </Canvas>
  );
}
