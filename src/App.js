// src/App.js

import React, { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { SplitText } from 'gsap/dist/SplitText';
import TextPressure from './TextPressure';
import GooeyNav from './GooeyNav';

gsap.registerPlugin(ScrollTrigger, SplitText);

function App() {
  const mainRef = useRef(null);
  const heroVideoRef = useRef(null);
  const heroTextRef = useRef(null);
  const xtndLabTextRef = useRef(null);
  const sectionRefs = useRef([]);
  sectionRefs.current = [];

  const addToRefs = (el) => {
    if (el && !sectionRefs.current.includes(el)) {
      sectionRefs.current.push(el);
    }
  };

  const navItems = [
    { label: 'XTND LAB', href: '#section1' },
    { label: 'Acerca', href: '#section2' },
    { label: 'Servicios', href: '#section3' },
    { label: 'Proyectos', href: '#section4' },
    { label: 'Contacto', href: '#section6' },
  ];

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Hero animation
      const heroTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: ".hero-section",
          start: "top top",
          end: "bottom top",
          scrub: true,
          pin: true,
        },
      });

      heroTimeline
        .to(heroTextRef.current, { y: -100, opacity: 0, duration: 1 })
        .to(xtndLabTextRef.current, { y: -100, opacity: 0, duration: 1 }, 0)
        .to(heroVideoRef.current, { scale: 1.2, duration: 2 }, 0);

      // Sections animation
      sectionRefs.current.forEach((section) => {
        const sectionTimeline = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top center",
            toggleActions: "play none none reverse",
          },
        });

        sectionTimeline.fromTo(
          section.querySelector("h2"),
          { opacity: 0, y: 50 },
          { opacity: 1, y: 0, duration: 1, ease: "power2.out" }
        );
        if (section.querySelector("p")) {
          sectionTimeline.fromTo(
            section.querySelector("p"),
            { opacity: 0, y: 50 },
            { opacity: 1, y: 0, duration: 1, ease: "power2.out" },
            "<0.2"
          );
        }
      });

      // SplitText animation
      const splitTitle = document.getElementById('split-title');
      const splitSubtitle = document.getElementById('split-subtitle');

      if (splitTitle && splitSubtitle) {
        const titleSplit = new SplitText(splitTitle, { type: "lines" });
        const subtitleSplit = new SplitText(splitSubtitle, { type: "lines" });

        const splitTimeline = gsap.timeline({
          scrollTrigger: {
            trigger: ".split-section",
            start: "top center",
            toggleActions: "play none none reverse",
          }
        });

        splitTimeline.from(titleSplit.lines, {
          opacity: 0, y: 100, stagger: 0.1, duration: 1.2, ease: "power3.out"
        });

        splitTimeline.from(subtitleSplit.lines, {
          opacity: 0, y: 100, stagger: 0.1, duration: 1.2, ease: "power3.out"
        }, "<0.2");
      }

    }, mainRef);

    return () => ctx.revert();
  }, []);

  const servicesData = [
    {
      category: "Soluciones de Diseño",
      services: [
        "Experiencias inmersivas",
        "Diseño para realidades extendidas (XR)",
        "Experiencias gamificadas",
        "Recorridos 360°",
      ],
    },
    {
      category: "Estrategias Tecnológicas",
      services: [
        "Soluciones con inteligencia artificial (IA)",
        "Desarrollo de sitios web responsive",
        "Videomapping y videoarte",
      ],
    },
    {
      category: "Servicios Integrales",
      services: [
        "Branding y servicios integrales para empresas",
        "Capacitaciones y Workshops",
        "Co-creación"
      ],
    },
  ];

  return (
    <div ref={mainRef} className="bg-black text-white">

      {/* GooeyNav */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 w-11/12 max-w-7xl z-50">
        <GooeyNav items={navItems} />
      </div>

      {/* Scroll container */}
      <div className="scroll-container">

        {/* Hero section */}
        <section className="scroll-section hero-section relative overflow-hidden" id="section1">
          <video
            ref={heroVideoRef}
            className="absolute inset-0 w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
          >
            <source src="https://a.storyblok.com/f/271652/x/d64c0936fe/zentry_trailer-md.mp4" type="video/mp4" />
          </video>

          <div 
            ref={xtndLabTextRef} 
            className="absolute inset-0 w-full h-full flex items-center justify-center z-20 p-4"
          >
            <TextPressure
              text="XTND LAB"
              flex={false}
              alpha={false}
              stroke={false}
              width={true}
              weight={true}
              italic={true}
              textColor="#ffffff"
              strokeColor="#ff0000"
              minFontSize={48}
            />
          </div>

          <div
            ref={heroTextRef}
            className="relative z-10 flex flex-col items-center justify-center h-full text-center"
          >
            <p className="mt-4 text-xl md:text-2xl font-light">Laboratorio Multimedia</p>
          </div>
        </section>

        {/* Acerca de */}
        <section ref={addToRefs} className="scroll-section bg-zinc-900 flex flex-col items-center justify-center relative z-10" id="section2">
          <div className="text-center w-full max-w-4xl p-8">
            <h2 className="text-5xl md:text-6xl font-bold mb-4">Acerca de Nosotros</h2>
            <p className="mt-4 text-lg md:text-xl font-light leading-relaxed">
              Creemos en el poder de la tecnología para transformar realidades de manera significativa...
            </p>
            <h3 className="text-4xl md:text-5xl font-bold mt-12 mb-4">Nuestros Valores</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-left text-base md:text-lg">
                <p className="font-semibold">✨ Innovación significativa</p>
                <p className="font-semibold">💖 Diseño centrado en las personas</p>
                <p className="font-semibold">🧠 Curiosidad y aprendizaje constante</p>
                <p className="font-semibold">🤝 Empatía e inclusión</p>
                <p className="font-semibold">✅ Compromiso y responsabilidad social</p>
                <p className="font-semibold">🔍 Transparencia</p>
                <p className="font-semibold">🎨 Trabajo interdisciplinario</p>
                <p className="font-semibold">💡 Co-creación</p>
            </div>
          </div>
        </section>

        {/* Servicios */}
        <section ref={addToRefs} className="scroll-section bg-zinc-950 text-white flex flex-col items-center justify-center p-8 relative z-10" id="section3">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-bold mb-2">Nuestros Servicios</h2>
            <p className="text-lg font-light">
              Ofrecemos una amplia gama de soluciones digitales, creativas y estratégicas para tu proyecto.
            </p>
          </div>
          <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-center">
            {servicesData.map((data, index) => (
              <div key={index} className="flex flex-col items-center justify-center p-6 rounded-lg bg-zinc-900 shadow-xl transition-transform duration-300 transform hover:scale-105">
                <h3 className="text-2xl font-semibold mb-4">{data.category}</h3>
                <div className="flex flex-col space-y-2">
                  {data.services.map((service, idx) => (
                    <p key={idx} className="text-base font-light text-gray-400">{service}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Proyectos */}
        <section ref={addToRefs} className="scroll-section bg-black text-white flex flex-col items-center justify-center p-8 relative z-10" id="section4">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-bold mb-2">Proyectos Destacados</h2>
            <p className="text-lg font-light">Explora nuestro trabajo más reciente en experiencias inmersivas y diseño digital.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl w-full">
            {/* Aquí se pueden agregar proyectos como imágenes o cards */}
          </div>
        </section>

        {/* Contacto */}
        <section ref={addToRefs} className="scroll-section bg-zinc-900 text-white flex flex-col items-center justify-center p-8 relative z-10" id="section6">
          <div className="text-center w-full max-w-4xl">
            <h2 className="text-5xl font-bold mb-4">Contacto</h2>
            <p className="mb-8 text-lg font-light">
              Si querés contactarnos, escribinos y te responderemos a la brevedad.
            </p>
            <form className="flex flex-col space-y-4">
              <input type="text" placeholder="Nombre" className="p-3 rounded-lg bg-zinc-800 text-white outline-none" />
              <input type="email" placeholder="Email" className="p-3 rounded-lg bg-zinc-800 text-white outline-none" />
              <textarea placeholder="Mensaje" className="p-3 rounded-lg bg-zinc-800 text-white outline-none" rows={4}></textarea>
              <button type="submit" className="bg-blue-500 hover:bg-blue-600 transition-colors text-white font-bold py-3 px-6 rounded-lg">
                Enviar
              </button>
            </form>
          </div>
        </section>

      </div>
    </div>
  );
}

export default App;
