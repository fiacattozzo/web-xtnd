import React, { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { SplitText } from 'gsap/dist/SplitText';
import TextPressure from './TextPressure';
import './index.css';
import GooeyNav from './GooeyNav';
import Dither from './Dither';

gsap.registerPlugin(ScrollTrigger, SplitText);

function App(){
  const mainRef = useRef(null);
  const heroTextRef = useRef(null);
  const xtndLabTextRef = useRef(null);
  const sectionRefs = useRef([]); sectionRefs.current = [];
  const addToRefs = (el)=>{ if(el && !sectionRefs.current.includes(el)) sectionRefs.current.push(el); };

  const navItems=[
    { label:'XTND LAB', href:'#section1' },
    { label:'Acerca', href:'#section2' },
    { label:'Servicios', href:'#section3' },
    { label:'Proyectos', href:'#section4' },
    { label:'Contacto', href:'#section6' },
  ];

  useLayoutEffect(()=>{
    const ctx = gsap.context(()=>{
      const heroTimeline = gsap.timeline({ scrollTrigger:{ trigger:'.hero-section', start:'top top', end:'bottom top', scrub:true, pin:true } });
      heroTimeline
        .to(heroTextRef.current, { y:-100, opacity:0, duration:1 })
        .to(xtndLabTextRef.current, { y:-100, opacity:0, duration:1 }, 0);

      sectionRefs.current.forEach((section)=>{
        const tl = gsap.timeline({ scrollTrigger:{ trigger:section, start:'top center', toggleActions:'play none none reverse' } });
        tl.fromTo(section.querySelector('h2'), { opacity:0, y:50 }, { opacity:1, y:0, duration:1, ease:'power2.out' });
        const p = section.querySelector('p');
        if(p) tl.fromTo(p, { opacity:0, y:50 }, { opacity:1, y:0, duration:1, ease:'power2.out' }, '<0.2');
      });

      const splitTitle=document.getElementById('split-title');
      const splitSubtitle=document.getElementById('split-subtitle');
      if(splitTitle && splitSubtitle){
        const tSplit=new SplitText(splitTitle,{type:'lines'});
        const sSplit=new SplitText(splitSubtitle,{type:'lines'});
        const tl=gsap.timeline({scrollTrigger:{trigger:'.split-section',start:'top center',toggleActions:'play none none reverse'}});
        tl.from(tSplit.lines,{opacity:0,y:100,stagger:0.1,duration:1.2,ease:'power3.out'})
          .from(sSplit.lines,{opacity:0,y:100,stagger:0.1,duration:1.2,ease:'power3.out'},'<0.2');
      }
    }, mainRef);
    return ()=> ctx.revert();
  },[]);

  const servicesData=[
    { category:'Soluciones de Diseño', services:['Experiencias inmersivas','Diseño para realidades extendidas (XR)','Experiencias gamificadas','Recorridos 360°'] },
    { category:'Estrategias Tecnológicas', services:['Soluciones con inteligencia artificial (IA)','Desarrollo de sitios web responsive','Videomapping y videoarte'] },
    { category:'Servicios Integrales', services:['Branding y servicios integrales para empresas','Capacitaciones y Workshops','Co-creación'] },
  ];

  const HERO_VH = 140; // alto total del hero / dither

  return (
    <div ref={mainRef} className="relative text-white">
      {/* Dither ARRIBA: overlay fijo en el tope (como ReactBits) */}
      <div
        className="fixed top-0 left-0 right-0 pointer-events-none -z-10"
        style={{ height: `${HERO_VH}vh`, WebkitMaskImage: 'linear-gradient(to bottom, black, black 90%, transparent)', maskImage: 'linear-gradient(to bottom, black, black 90%, transparent)' }}
      >
        <Dither
          waveSpeed={0.06}
          waveFrequency={4.1}
          waveAmplitude={0.3}
          waveColor={[0.7,0.8,1]}
          colorNum={4}
          pixelSize={2}
          enableMouseInteraction
          mouseRadius={0.4}
          patternScale={0.6}
        />
      </div>

      {/* Nav */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 w-11/12 max-w-7xl z-50">
        <GooeyNav items={navItems} />
      </div>

      {/* HERO sin dither interno */}
      <section id="section1" className="hero-section relative overflow-hidden" style={{ minHeight:`${HERO_VH}vh` }}>
        <div className="relative z-10 flex items-center justify-center h-full px-4 text-center">
          <div>
            <TextPressure
              text="XTND LAB"
              fontFamily="Space Grotesk"
              textColor="#ffffff"
              minFontSize={150}
              className="font-bold mb-8 leading-[0.9] text-[clamp(80px,12vw,220px)] whitespace-nowrap"
              width={false}
              weight
              scale
              ref={xtndLabTextRef}
            />
            <TextPressure
              text="laboratorio multimedia"
              fontFamily="Space Grotesk"
              textColor="#ffffff"
              minFontSize={90}
              className="font-bold leading-[0.95] text-[clamp(36px,6vw,120px)] whitespace-nowrap"
              width={false}
              weight
              scale
              ref={heroTextRef}
            />
          </div>
        </div>
      </section>

      {/* Acerca de */}
      <section ref={addToRefs} id="section2" className="scroll-section bg-zinc-900/80 backdrop-blur-sm flex flex-col items-center justify-center">
        <div className="text-center w-full max-w-4xl p-8">
          <h2 className="text-5xl md:text-6xl font-bold mb-4">Acerca de</h2>
          <p className="mt-4 text-lg md:text-xl font-light leading-relaxed">Creemos en el poder de la tecnología para transformar realidades de manera significativa.</p>
        </div>
      </section>

      {/* Servicios */}
      <section ref={addToRefs} id="section3" className="scroll-section bg-zinc-950/80 backdrop-blur-sm text-white flex flex-col items-center justify-center p-8">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold mb-2">Servicios</h2>
          <p className="text-lg font-light">Soluciones creativas y tecnológicas para gran variedad de proyectos multimedia.</p>
        </div>
        <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-center">
          {servicesData.map((data, i)=> (
            <div key={i} className="flex flex-col items-center justify-center p-6 rounded-lg bg-zinc-900/80 shadow-xl">
              <h3 className="text-2xl font-semibold mb-4">{data.category}</h3>
              <div className="flex flex-col space-y-2">
                {data.services.map((s, idx)=>(<p key={idx} className="text-base font-light text-gray-300">{s}</p>))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Resto de secciones */}
    </div>
  );
}

export default App;
