import React, { useRef, useLayoutEffect, useMemo } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger'; // <-- sin /dist
import TextPressure from './TextPressure';
import './index.css';
import GooeyNav from './GooeyNav';
import Dither from './Dither';
import { PrefsProvider, usePrefs } from '../public/a11y/PrefsContext';
import AccessibilityPanel from './components/AccessibilityPanel';
import ThemeSwitchFab from './components/ThemeSwitchFab';

gsap.registerPlugin(ScrollTrigger);


function AppInner(){
  const { prefs } = usePrefs();
  const mainRef = useRef(null);
  const heroTextRef = useRef(null);
  const xtndLabTextRef = useRef(null);
  const sectionRefs = useRef([]); 
  sectionRefs.current = [];
  const addToRefs = (el)=>{ if(el && !sectionRefs.current.includes(el)) sectionRefs.current.push(el); };

  const effectiveTheme = useMemo(() => {
    if (prefs.theme === 'system') {
      return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return prefs.theme;
  }, [prefs.theme]);

  const waveColor = useMemo(() => {
    if (prefs.highContrast) return effectiveTheme === 'dark' ? [1,1,1] : [0.15,0.15,0.2];
    return effectiveTheme === 'dark' ? [0.7,0.8,1] : [0.35,0.45,0.9];
  }, [prefs.highContrast, effectiveTheme]);

  useLayoutEffect(()=>{
    if (prefs.reducedMotion) return;
    const ctx = gsap.context(()=>{
      const heroTimeline = gsap.timeline({
        scrollTrigger:{ trigger:'.hero-section', start:'top top', end:'bottom top', scrub:true, pin:true }
      });
      heroTimeline
        .to(heroTextRef.current, { y:-100, opacity:0, duration:1 })
        .to(xtndLabTextRef.current, { y:-100, opacity:0, duration:1 }, 0);

      sectionRefs.current.forEach((section)=>{
        const tl = gsap.timeline({ scrollTrigger:{ trigger:section, start:'top center', toggleActions:'play none none reverse' } });
        tl.fromTo(section.querySelector('h2'), { opacity:0, y:50 }, { opacity:1, y:0, duration:1, ease:'power2.out' });
        const p = section.querySelector('p');
        if(p) tl.fromTo(p, { opacity:0, y:50 }, { opacity:1, y:0, duration:1, ease:'power2.out' }, '<0.2');
      });
    }, mainRef);
    return ()=> ctx.revert();
  },[prefs.reducedMotion]);

  const servicesData=[
    { category:'Soluciones de Diseño', services:['Experiencias inmersivas','Diseño para realidades extendidas (XR)','Experiencias gamificadas','Recorridos 360°'] },
    { category:'Estrategias Tecnológicas', services:['Soluciones con inteligencia artificial (IA)','Desarrollo de sitios web responsive','Videomapping y videoarte'] },
    { category:'Servicios Integrales', services:['Branding y servicios integrales para empresas','Capacitaciones y Workshops','Co-creación'] },
  ];

  const HERO_VH = 140; // alto del hero / dither

  return (
    <div ref={mainRef} className="relative text-app">
      <a href="#section2" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 bg-[color:var(--accent)] text-white px-3 py-2 rounded">
        Saltar al contenido
      </a>

      {/* Nav */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 w-11/12 max-w-7xl z-50">
        <GooeyNav items={[
          { label:'XTND LAB', href:'#section1' },
          { label:'Acerca', href:'#section2' },
          { label:'Servicios', href:'#section3' },
          { label:'Proyectos', href:'#section4' },
          { label:'Contacto', href:'#section6' },
        ]} />
      </div>

      {/* FABs */}
      <AccessibilityPanel />
      <ThemeSwitchFab />

      {/* HERO — Dither de fondo */}
      <section id="section1" className="hero-section relative isolate overflow-hidden" style={{ minHeight:`${HERO_VH}vh` }}>
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <Dither
            waveSpeed={prefs.reducedMotion ? 0 : 0.06}
            waveFrequency={4.1}
            waveAmplitude={0.3}
            waveColor={waveColor}
            colorNum={prefs.highContrast ? 2 : 4}
            pixelSize={prefs.highContrast ? 1.5 : 2}
            disableAnimation={!!prefs.reducedMotion}
            enableMouseInteraction={!prefs.reducedMotion && !prefs.disableHoverFx}
            mouseRadius={0.4}
            patternScale={0.6}
          />
        </div>

        {/* OJO: animamos estos contenedores con GSAP, por eso llevan ref */}
        <div className="relative z-20 h-full flex items-center">
          <div className="pl-6 md:pl-16 w-full">
            <div ref={xtndLabTextRef} className="w-[min(80vw,900px)]">
              <TextPressure
                text="XTND LAB"
                fontFamily="Space Grotesk"
                textColor="#ffffff"
                minFontSize={70}
                className="font-bold mb-6 leading-[0.92]"
                width={false}
                weight
                scale
                flex={false}
              />
            </div>
            <div ref={heroTextRef} className="mt-2 w-[min(80vw,720px)]">
              <TextPressure
                text="laboratorio multimedia"
                fontFamily="Space Grotesk"
                textColor="#ffffff"
                minFontSize={48}
                className="font-bold leading-[1]"
                width={false}
                weight
                scale
                flex={false}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Acerca */}
      <section id="section2" ref={addToRefs} className="scroll-section surface-1 backdrop-blur-sm flex flex-col items-center justify-center">
        <div className="text-center w-full max-w-4xl p-8">
          <h2 className="text-5xl md:text-6xl font-bold mb-4">Acerca de</h2>
          <p className="mt-4 text-lg md:text-xl font-light leading-relaxed">
            Creemos en el poder de la tecnología para transformar realidades de manera significativa.
          </p>
        </div>
      </section>

      {/* Servicios */}
      <section id="section3" ref={addToRefs} className="scroll-section surface-2 backdrop-blur-sm flex flex-col items-center justify-center p-8">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold mb-2">Servicios</h2>
          <p className="text-lg font-light">Soluciones creativas y tecnológicas para gran variedad de proyectos multimedia.</p>
        </div>
        <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-center">
          {servicesData.map((data, i)=> (
            <div key={i} className="flex flex-col items-center justify-center p-6 rounded-lg surface-1 shadow-xl border border-token">
              <h3 className="text-2xl font-semibold mb-4">{data.category}</h3>
              <div className="flex flex-col space-y-2">
                {data.services.map((s, idx)=>(<p key={idx} className="text-base font-light opacity-90">{s}</p>))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default function App(){
  return (
    <PrefsProvider>
      <AppInner />
    </PrefsProvider>
  );
}
