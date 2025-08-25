// src/Navbar.js 

 import React, { useRef, useLayoutEffect } from 'react'; 
 import { gsap } from 'gsap'; 

 /**  * Componente de la barra de navegación para la página. 
  * Estilizado con Tailwind CSS para un diseño limpio y minimalista. 
  */ 
 function Navbar() { 
   const navRef = useRef(null); 

   // Usamos useLayoutEffect para animar la entrada del navbar al cargar la página. 
   useLayoutEffect(() => { 
     // Definimos un contexto de GSAP para que la animación sea más limpia y se pueda revertir. 
     const ctx = gsap.context(() => { 
       // Animación de entrada: el navbar se desliza hacia abajo y se desvanece. 
       gsap.fromTo(navRef.current,  
         { y: -100, opacity: 0 }, // Posición inicial (oculto arriba) 
         { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" } // Posición final (visible) 
       ); 
     }, navRef); 
      
     // Función de limpieza de GSAP. 
     return () => ctx.revert(); 
   }, []); 

   return ( 
     // Estilos de Tailwind CSS: 
     // - navbar: Clase utilizada por el ScrollTrigger de App.js. 
     // - fixed top-0 w-full z-50: Fija el navbar en la parte superior y ancho completo. 
     // - bg-black bg-opacity-30: Fondo semi-transparente oscuro. 
     // - text-white: Color del texto. 
     // - py-6 px-12: Padding para los bordes. 
     // - flex justify-between items-center: Layout para alinear elementos. 
     <nav  
       ref={navRef} 
       className="navbar fixed top-0 w-full z-50 bg-black bg-opacity-30 text-white py-6 px-12 flex justify-between items-center transition-transform duration-300" 
     > 
       {/* Título de la marca */} 
       <a href="#section1" className="text-2xl md:text-3xl font-bold tracking-wider hover:text-gray-200 transition-colors"> 
         WEB XTND 
       </a> 
        
       {/* Enlaces de navegación */} 
       <ul className="flex space-x-6 sm:space-x-10 text-base sm:text-lg font-medium"> 
         <li> 
           <a href="#section2" className="hover:text-gray-200 transition-colors">Acerca</a> 
         </li> 
         <li> 
           <a href="#section3" className="hover:text-gray-200 transition-colors">Productos</a> 
         </li> 
         <li> 
           <a href="#section4" className="hover:text-gray-200 transition-colors">Contacto</a> 
         </li> 
       </ul> 
     </nav> 
   ); 
 } 

 export default Navbar;
