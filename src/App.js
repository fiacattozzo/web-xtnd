// src/App.js

import React, { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { SplitText } from 'gsap/dist/SplitText';
import TextPressure from './TextPressure';

// Registramos los plugins de GSAP
gsap.registerPlugin(ScrollTrigger, SplitText);

/**
 * Componente principal de la aplicación.
 * Contiene el navbar y las diferentes secciones de la página.
 */
function App() {
  // Referencias para las secciones y elementos a animar
  const mainRef = useRef(null);
  const heroVideoRef = useRef(null);
  const heroTextRef = useRef(null); // Esto ahora será para el "Laboratorio Multimedia"
  const xtndLabTextRef = useRef(null); // Nueva referencia para el TextPressure
  const sectionRefs = useRef([]);
  sectionRefs.current = [];

  // Función para agregar las referencias
  const addToRefs = (el) => {
    if (el && !sectionRefs.current.includes(el)) {
      sectionRefs.current.push(el);
    }
  };

  // Usamos useLayoutEffect para asegurar que las animaciones
  // se configuren después de que el DOM haya sido actualizado.
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {

      // --- Animación del Hero (con pin GSAP) ---
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
        .to(heroTextRef.current, { // Ahora se refiere a "Laboratorio Multimedia"
          y: -100,
          opacity: 0,
          duration: 1,
        })
        .to(xtndLabTextRef.current, { // Animamos el TextPressure
          y: -100, // También lo desplazamos y desvanecemos
          opacity: 0,
          duration: 1,
        }, 0) // Empieza con la animación anterior
        .to(heroVideoRef.current, {
          scale: 1.2,
          duration: 2,
        }, 0); // Empieza con las animaciones anteriores

      // --- Animación del Navbar: ocultar al hacer scroll down ---
      gsap.to(".navbar", {
        y: -100,
        ease: "power2.inOut",
        scrollTrigger: {
          trigger: "body",
          start: "top top",
          end: "+=500",
          scrub: 1,
          toggleActions: "play none none reverse",
        },
      });

      // --- Timeline para la animación de las otras secciones ---
      const sections = sectionRefs.current;
      
      sections.forEach((section, i) => {
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

      // --- Animación especial de la última sección (SplitText) ---
      const splitTitle = document.getElementById('split-title');
      const splitSubtitle = document.getElementById('split-subtitle');

      if (splitTitle && splitSubtitle) { // Aseguramos que los elementos existan
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
          opacity: 0,
          y: 100,
          stagger: 0.1,
          duration: 1.2,
          ease: "power3.out"
        });

        splitTimeline.from(subtitleSplit.lines, {
          opacity: 0,
          y: 100,
          stagger: 0.1,
          duration: 1.2,
          ease: "power3.out"
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

      {/* Componente del Navbar */}
      <nav className="navbar fixed top-6 left-1/2 -translate-x-1/2 w-11/12 max-w-7xl z-50 backdrop-filter backdrop-blur-lg bg-white bg-opacity-5 text-white p-6 flex justify-between items-center rounded-full shadow-lg transition-transform duration-300">
        <a href="#section1" className="text-xl md:text-2xl font-bold tracking-wider hover:text-gray-200 transition-colors">
          XTND LAB
        </a>
        <ul className="flex space-x-4 sm:space-x-8 text-sm sm:text-lg font-medium">
          <li>
            <a href="#section2" className="hover:text-gray-200 transition-colors">Acerca</a>
          </li>
          <li>
            <a href="#section3" className="hover:text-gray-200 transition-colors">Servicios</a>
          </li>
          <li>
            <a href="#section4" className="hover:text-gray-200 transition-colors">Proyectos</a>
          </li>
          <li>
            <a href="#section6" className="hover:text-gray-200 transition-colors">Contacto</a>
          </li>
        </ul>
      </nav>

      {/* Contenedor principal */}
      <div className="scroll-container">

        {/* Primera Sección: El Hero (con pin de GSAP) */}
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
          {/* Moviendo TextPressure aquí, dentro de la sección hero */}
          <div 
            ref={xtndLabTextRef} // Asignamos la nueva referencia aquí
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
          {/* El texto "Laboratorio Multimedia" se mantiene, y su referencia es heroTextRef */}
          <div
            ref={heroTextRef}
            className="relative z-10 flex flex-col items-center justify-center h-full text-center"
          >
            {/* El h1 original se elimina porque TextPressure lo reemplaza visualmente */}
            {/* <h1 className="text-6xl md:text-8xl font-bold">XTND LAB</h1> */}
            <p className="mt-4 text-xl md:text-2xl font-light">
              Laboratorio Multimedia
            </p>
          </div>
        </section>

        {/* Segunda Sección: Acerca de (Valores y Misión) */}
        <section ref={addToRefs} className="scroll-section bg-zinc-900 flex flex-col items-center justify-center relative z-10" id="section2">
          <div className="text-center w-full max-w-4xl p-8">
            <h2 className="text-5xl md:text-6xl font-bold mb-4">Acerca de Nosotros</h2>
            <p className="mt-4 text-lg md:text-xl font-light leading-relaxed">
              Creemos en el poder de la tecnología para transformar realidades de manera significativa. Buscamos que la inmersión, la experiencia y la tecnología sean para todas las realidades. Nuestra mirada es social, responsable y a largo plazo. No diseñamos para hoy, diseñamos para el mundo que queremos habitar. Un futuro más justo, más consciente, más inclusivo. Trabajamos desde la colaboración y el aprendizaje constante. Nos reconocemos como eternos aprendices. Mezclamos disciplinas, talentos y perspectivas para nutrir nuestros proyectos y explorar nuevos territorios creativos.
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

        {/* Tercera Sección: Servicios (actualizada) */}
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

        {/* Cuarta Sección: Proyectos */}
        <section ref={addToRefs} className="scroll-section bg-black text-white flex flex-col items-center justify-center p-8 relative z-10" id="section4">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-bold mb-2">Proyectos Destacados</h2>
            <p className="text-lg font-light">Explora nuestro trabajo más reciente.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-7xl">
            <div className="bg-zinc-900 rounded-lg overflow-hidden shadow-lg transform hover:scale-105 transition-transform duration-300">
              <img src="https://placehold.co/600x400/27272a/FFFFFF?text=Proyecto+1" alt="Proyecto 1" className="w-full h-48 object-cover" />
              <div className="p-6">
                <h3 className="text-2xl font-semibold mb-2">Proyecto A</h3>
                <p className="text-sm text-gray-400">Diseño web y UX/UI</p>
              </div>
            </div>
            <div className="bg-zinc-900 rounded-lg overflow-hidden shadow-lg transform hover:scale-105 transition-transform duration-300">
              <img src="https://placehold.co/600x400/27272a/FFFFFF?text=Proyecto+2" alt="Proyecto 2" className="w-full h-48 object-cover" />
              <div className="p-6">
                <h3 className="text-2xl font-semibold mb-2">Proyecto B</h3>
                <p className="text-sm text-gray-400">Realidad virtual</p>
              </div>
            </div>
            <div className="bg-zinc-900 rounded-lg overflow-hidden shadow-lg transform hover:scale-105 transition-transform duration-300">
              <img src="https://placehold.co/600x400/27272a/FFFFFF?text=Proyecto+3" alt="Proyecto 3" className="w-full h-48 object-cover" />
              <div className="p-6">
                <h3 className="text-2xl font-semibold mb-2">Proyecto C</h3>
                <p className="text-sm text-gray-400">Instalación interactiva</p>
              </div>
            </div>
          </div>
        </section>

        {/* Quinta Sección: Diseño y estrategia */}
        <section ref={addToRefs} className="scroll-section relative bg-black flex items-center justify-center z-10" id="section5">
          <img
            src="https://placehold.co/1920x1080/000000/FFFFFF?text=Imagen"
            className="absolute inset-0 w-full h-full object-cover"
            alt="Fondo de la quinta sección"
          />
          <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white">
            <h2 className="text-6xl font-bold">Diseño y estrategia</h2>
            <p className="mt-4 text-xl font-light">Soluciones web a medida</p>
          </div>
        </section>

        {/* Sexta Sección: Contacto */}
        <section ref={addToRefs} className="scroll-section relative bg-zinc-900 flex items-center justify-center text-white z-10" id="section6">
          <div className="text-center">
            <h2 className="text-6xl font-bold">Contactanos</h2>
          </div>
        </section>

        {/* Séptima Sección: Animación avanzada con clip-path */}
        <section ref={addToRefs} className="scroll-section relative bg-gray-800 flex items-center justify-center text-white z-10" id="section7">
          <div className="text-center">
            <div className="overflow-hidden">
              <h2 className="text-6xl font-bold">Animación avanzada</h2>
            </div>
            <div className="overflow-hidden mt-4">
              <p className="text-xl font-light">Este texto se revela al hacer scroll</p>
            </div>
          </div>
        </section>

        {/* Octava Sección: Animación de texto línea por línea */}
        <section className="scroll-section relative bg-black flex items-center justify-center text-white z-10 split-section" id="section8">
          <div className="text-center">
            <h2 id="split-title" className="text-6xl font-bold">Texto que fluye</h2>
            <p id="split-subtitle" className="mt-4 text-xl font-light">Cada línea de este texto aparece en secuencia para un efecto más dramático.</p>
          </div>
        </section>
      </div>
    </div>
  );
}

export default App;