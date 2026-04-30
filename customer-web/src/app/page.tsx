'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Leaf, BarChart3, ShieldCheck, Zap, ArrowRight, Layout, Phone, Mail, Star, Quote, ChevronLeft, ChevronRight, CheckCircle2, Globe2, Target } from 'lucide-react';
import Image from 'next/image';

const CAROUSEL_PROJECTS = [
   { id: 1, title: 'Residencial 25 kWp', location: 'Bucaramanga, Santander', img: '/projects/residential.png' },
   { id: 2, title: 'Comercial 150 kWp', location: 'Floridablanca', img: '/projects/commercial.png' },
   { id: 3, title: 'Industrial 500 kWp', location: 'Zona Franca', img: '/projects/industrial.png' },
   { id: 4, title: 'Granja Solar 2 MWp', location: 'Los Santos', img: '/projects/farm.png' },
];

export default function LandingPage() {
   const [currentSlide, setCurrentSlide] = useState(0);

   useEffect(() => {
      const timer = setInterval(() => {
         setCurrentSlide((prev) => (prev + 1) % CAROUSEL_PROJECTS.length);
      }, 5000);
      return () => clearInterval(timer);
   }, []);

   const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % CAROUSEL_PROJECTS.length);
   const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + CAROUSEL_PROJECTS.length) % CAROUSEL_PROJECTS.length);

   return (
      <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] overflow-x-hidden selection:bg-emerald-500 selection:text-white">
         {/* Background Orbs */}
         <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-400/10 rounded-full blur-[120px] -z-10" />
         <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-400/10 rounded-full blur-[120px] -z-10" />

         {/* Navigation */}
         <nav className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center bg-white/60 backdrop-blur-md sticky top-0 z-50 rounded-b-3xl border-b border-white/20 shadow-sm">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <Leaf className="text-white" size={24} />
               </div>
               <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-blue-600">
                  GreenTech
               </span>
            </div>
            <div className="flex items-center gap-6">
               <div className="hidden md:flex items-center gap-4 text-sm text-slate-600 font-medium">
                  <a href="#proyectos" className="hover:text-emerald-600 transition-colors">Proyectos</a>
                  <a href="#mision" className="hover:text-emerald-600 transition-colors">Nosotros</a>
                  <a href="#servicios" className="hover:text-emerald-600 transition-colors">Servicios</a>
               </div>
               <div className="h-6 w-px bg-slate-200 hidden md:block"></div>
               <Link href="/auth" className="text-sm font-bold text-slate-600 hover:text-emerald-600 transition-colors">
                  Iniciar Sesión
               </Link>
               <Link href="/auth?view=register" className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-full text-sm font-medium shadow-md shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95 hidden sm:block">
                  Registrarme
               </Link>
            </div>
         </nav>

         {/* Hero Section */}
         <section className="max-w-7xl mx-auto px-6 pt-20 pb-24 flex flex-col items-center text-center relative z-10">
            <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full text-sm font-medium mb-8 border border-emerald-100 animate-bounce-subtle">
               <Zap size={16} /> Energía Limpia en tus manos
            </div>
            <h1 className="text-6xl md:text-8xl font-bold tracking-tight mb-8 max-w-5xl leading-[1.05] text-slate-900">
               Revoluciona tu <span className="text-emerald-500 bg-emerald-50 px-4 rounded-3xl inline-block -rotate-2">Energía</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 mb-12 max-w-3xl leading-relaxed">
               Diseñamos, construimos y monitoreamos plantas solares de alto rendimiento. Únete a miles de clientes gestionando su ahorro a través de GreenTech.
            </p>
         </section>

         {/* Detailed Stats Strip */}
         <section className="bg-emerald-900 text-white py-12">
            <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-between items-center gap-8 divide-x divide-emerald-800">
               <div className="flex-1 text-center min-w-[200px]">
                  <h4 className="text-5xl font-black text-emerald-400 mb-2">5M+</h4>
                  <p className="text-emerald-100 font-medium">kWh Generados</p>
               </div>
               <div className="flex-1 text-center min-w-[200px]">
                  <h4 className="text-5xl font-black text-emerald-400 mb-2">1.2K</h4>
                  <p className="text-emerald-100 font-medium">Proyectos Activos</p>
               </div>
               <div className="flex-1 text-center min-w-[200px]">
                  <h4 className="text-5xl font-black text-emerald-400 mb-2">3.5k</h4>
                  <p className="text-emerald-100 font-medium">Toneladas CO₂ Evitadas</p>
               </div>
            </div>
         </section>

         {/* Dynamic Project Carousel */}
         <section id="proyectos" className="max-w-7xl mx-auto px-6 py-24">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
               <div>
                  <h2 className="text-4xl font-bold tracking-tight text-slate-800 mb-4">Nuestras Instalaciones</h2>
                  <p className="text-slate-600 max-w-xl text-lg">Soluciones escalables desde tu hogar hasta complejos industriales completos.</p>
               </div>
               <div className="flex gap-3">
                  <button onClick={prevSlide} className="w-12 h-12 rounded-full border-2 border-slate-200 flex items-center justify-center hover:bg-slate-100 hover:scale-105 transition-all text-slate-600">
                     <ChevronLeft size={24} />
                  </button>
                  <button onClick={nextSlide} className="w-12 h-12 rounded-full border-2 border-slate-200 flex items-center justify-center hover:bg-slate-100 hover:scale-105 transition-all text-slate-600">
                     <ChevronRight size={24} />
                  </button>
               </div>
            </div>

            <div className="relative h-[500px] rounded-[3rem] overflow-hidden shadow-2xl group border border-slate-200 bg-slate-100">
               {CAROUSEL_PROJECTS.map((project, idx) => (
                  <div
                     key={project.id}
                     className={`absolute inset-0 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] ${idx === currentSlide ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 translate-x-full scale-105'
                        }`}
                  >
                     <div className="absolute inset-0 bg-slate-200 animate-pulse" /> {/* Placeholder loading */}
                     <Image
                        src={project.img}
                        alt={project.title}
                        fill
                        className="object-cover"
                        priority={idx === 0}
                     />
                     <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent flex flex-col justify-end p-12">
                        <div className="transform transition-transform duration-500 translate-y-0 opacity-100">
                           <h3 className="text-white font-bold text-4xl mb-3">{project.title}</h3>
                           <div className="flex items-center gap-2 text-emerald-400 text-lg font-medium">
                              <Globe2 size={20} /> {project.location}
                           </div>
                        </div>
                     </div>
                  </div>
               ))}

               <div className="absolute bottom-12 right-12 flex gap-2 z-20">
                  {CAROUSEL_PROJECTS.map((_, idx) => (
                     <button
                        key={idx}
                        onClick={() => setCurrentSlide(idx)}
                        className={`h-2 rounded-full transition-all duration-500 ${idx === currentSlide ? 'bg-emerald-500 w-8' : 'bg-white/50 w-2 hover:bg-white'}`}
                     />
                  ))}
               </div>
            </div>
         </section>

         {/* Mission & Vision Segment */}
         <section id="mision" className="bg-white py-24 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                  <div className="space-y-10">
                     <div className="glass bg-emerald-50/50 p-8 rounded-3xl border border-emerald-100 relative">
                        <div className="absolute -top-6 -left-6 w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg rotate-12">
                           <Target size={24} />
                        </div>
                        <h3 className="text-3xl font-bold mb-4 text-slate-800">Nuestra Misión</h3>
                        <p className="text-slate-600 text-lg leading-relaxed">
                           Democratizar el acceso a la energía renovable mediante tecnología inteligente, instalaciones eficientes y herramientas de monitoreo transparentes. Transformamos la manera en que hogares y empresas interactúan con el consumo eléctrico, fomentando la rentabilidad económica y el balance ambiental.
                        </p>
                     </div>
                     <div className="glass bg-blue-50/50 p-8 rounded-3xl border border-blue-100 relative">
                        <div className="absolute -top-6 -left-6 w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center text-white shadow-lg -rotate-12">
                           <Globe2 size={24} />
                        </div>
                        <h3 className="text-3xl font-bold mb-4 text-slate-800">Nuestra Visión</h3>
                        <p className="text-slate-600 text-lg leading-relaxed">
                           Ser el pilar infraestructural número uno de la transición energética en LATAM para 2030, dotando de autonomía energética a un millón de infraestructuras a nivel nacional a través de soluciones llave en mano y ecosistemas digitales interconectados que empoderen a cada usuario.
                        </p>
                     </div>
                  </div>

                  <div className="relative h-full min-h-[500px]">
                     <div className="absolute inset-x-0 bottom-0 top-1/4 bg-slate-100 rounded-[3rem] -z-10" />
                     <div className="relative h-full flex flex-col justify-center px-8">
                        <h2 className="text-4xl font-bold tracking-tight text-slate-900 mb-8">Por qué GreenTech</h2>
                        <ul className="space-y-6">
                           {[
                              'Ingeniería especializada con garantías directas de 25 años.',
                              'Plataforma integral "Todo-en-uno" para clientes, pagos y reportes.',
                              'Soporte técnico preferencial 24/7 a través del portal en la nube.',
                              'Procesamiento automatizado de permisos y certificación RETIE.',
                              'Estudios financieros predictivos para asegurar el ROI en tiempo récord.'
                           ].map((item, i) => (
                              <li key={i} className="flex gap-4">
                                 <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 mt-1">
                                    <CheckCircle2 size={18} />
                                 </div>
                                 <span className="text-lg text-slate-700 leading-snug">{item}</span>
                              </li>
                           ))}
                        </ul>
                     </div>
                  </div>
               </div>
            </div>
         </section>

         {/* Services/Features Grid */}
         <section id="servicios" className="max-w-7xl mx-auto px-6 py-24 relative">
            <div className="text-center mb-16">
               <h2 className="text-4xl font-bold tracking-tight text-slate-800 mb-4">El Ecosistema Completo</h2>
               <p className="text-lg text-slate-600 max-w-2xl mx-auto">Nuestro Portal de Clientes incorpora todas las herramientas requeridas para controlar la autonomía de tu red.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <div className="bg-white p-10 rounded-[3rem] border border-slate-100 group transition-all duration-500 shadow-sm hover:shadow-2xl hover:-translate-y-2 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -z-10 transition-transform group-hover:scale-150"></div>
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/30">
                     <BarChart3 size={32} />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-slate-800">Telemetría Smart</h3>
                  <p className="text-slate-600 leading-relaxed">
                     Visualiza gráficas de generación diaria, semanal y mensual. Nuestro IoT centraliza la data y la sincroniza herméticamente con tus inversores en campo.
                  </p>
               </div>

               <div className="bg-white p-10 rounded-[3rem] border border-slate-100 group transition-all duration-500 shadow-sm hover:shadow-2xl hover:-translate-y-2 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -z-10 transition-transform group-hover:scale-150"></div>
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/30">
                     <ShieldCheck size={32} />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-slate-800">Pagos Criptográficamente Seguros</h3>
                  <p className="text-slate-600 leading-relaxed">
                     Estado de cuenta en tiempo real, histórico de abonos y pasarela encriptada integrada directamente para cancelar las cuotas del proyecto.
                  </p>
               </div>

               <div className="bg-white p-10 rounded-[3rem] border border-slate-100 group transition-all duration-500 shadow-sm hover:shadow-2xl hover:-translate-y-2 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-bl-full -z-10 transition-transform group-hover:scale-150"></div>
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-500 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-amber-500/30">
                     <Layout size={32} />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-slate-800">Backoffice Empresarial</h3>
                  <p className="text-slate-600 leading-relaxed">
                     No dejes nada al azar. Administra perfiles de usuario, gestiona tickets de soporte y actualiza información de facturación omnicanal.
                  </p>
               </div>
            </div>
         </section>

         {/* Testimonials */}
         <section className="bg-slate-900 text-white py-24 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 relative z-10">
               <div className="flex flex-col items-center text-center mb-16">
                  <div className="inline-block px-4 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-full font-bold mb-6 italic tracking-wider">TESTIMONIOS</div>
                  <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Experiencias Energizantes</h2>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                  <div className="bg-slate-800 p-8 rounded-3xl relative">
                     <Quote size={80} className="absolute top-4 right-4 text-white/5 opacity-50" />
                     <div className="flex gap-1 mb-6 text-amber-400">
                        <Star fill="currentColor" size={20} /> <Star fill="currentColor" size={20} /> <Star fill="currentColor" size={20} /> <Star fill="currentColor" size={20} /> <Star fill="currentColor" size={20} />
                     </div>
                     <p className="text-xl leading-relaxed text-slate-300 mb-8 font-medium">"El portal me permite ver exactamente cuánto estoy ahorrando cada mes sin tener que llamar a un técnico. La transparencia en la plataforma lo hace una excelente aplicación."</p>
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center font-bold text-lg">EN</div>
                        <div>
                           <h4 className="font-bold text-white">Empacadora del Norte</h4>
                           <p className="text-emerald-400 text-sm">Gerencia General</p>
                        </div>
                     </div>
                  </div>
                  <div className="bg-slate-800 p-8 rounded-3xl relative">
                     <Quote size={80} className="absolute top-4 right-4 text-white/5 opacity-50" />
                     <div className="flex gap-1 mb-6 text-amber-400">
                        <Star fill="currentColor" size={20} /> <Star fill="currentColor" size={20} /> <Star fill="currentColor" size={20} /> <Star fill="currentColor" size={20} /> <Star fill="currentColor" size={20} />
                     </div>
                     <p className="text-xl leading-relaxed text-slate-300 mb-8 font-medium">"Gracias a GreenTech pudimos reducir nuestros gastos un 40%. Su panel de tickets de soporte resolvió mi duda de la batería en cuestión de horas. Brillante diseño."</p>
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center font-bold text-lg">LS</div>
                        <div>
                           <h4 className="font-bold text-white">Logística San Marcos</h4>
                           <p className="text-blue-400 text-sm">Dirección de Operaciones</p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </section>

         {/* CTA Layer */}
         <section className="py-24 max-w-4xl mx-auto text-center px-6">
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 p-1 rounded-[3rem] shadow-2xl shadow-emerald-500/30">
               <div className="bg-white rounded-[2.8rem] py-16 px-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-100 rounded-full blur-[80px] -z-10 translate-x-1/2 -translate-y-1/2" />
                  <h2 className="text-4xl md:text-5xl font-black mb-6 text-slate-800 tracking-tight">¿Listo para modernizarte?</h2>
                  <p className="text-slate-600 mb-10 text-xl font-medium max-w-2xl mx-auto">Regístrate en el portal y ten el absoluto control de tus ahorros y métricas de consumo en todo momento.</p>
                  <Link href="/auth?view=register" className="bg-slate-900 hover:bg-slate-800 text-white px-10 py-5 rounded-full text-lg font-bold shadow-xl shadow-slate-900/20 transition-all hover:scale-105 inline-flex items-center gap-3">
                     Crear cuenta gratuita <ArrowRight size={22} />
                  </Link>
               </div>
            </div>
         </section>

         {/* Footer */}
         <footer className="border-t border-slate-200 py-12 bg-slate-50 relative mt-auto z-10">
            <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
               <div className="flex flex-col items-center md:items-start gap-4">
                  <div className="flex items-center gap-2 mb-2">
                     <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
                        <Leaf className="text-white" size={20} />
                     </div>
                     <span className="font-bold text-2xl text-slate-800">GreenTech</span>
                  </div>
                  <p className="text-slate-500 font-medium text-sm">Liderando el futuro solar en Colombia, <br />megavatio por megavatio.</p>
               </div>
               <div className="flex gap-8 text-sm font-semibold text-slate-700 bg-white px-8 py-4 rounded-full shadow-sm border border-slate-100">
                  <a href="mailto:greentechucc@gmail.com" className="flex items-center gap-2 hover:text-emerald-600 transition-colors"><Mail size={18} className="text-emerald-500" /> greentechucc@gmail.com</a>
                  <span className="w-px h-5 bg-slate-200 block" />
                  <a href="tel:3002062104" className="flex items-center gap-2 hover:text-emerald-600 transition-colors"><Phone size={18} className="text-emerald-500" /> 300 206 2104</a>
               </div>
            </div>
            <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-400 font-medium">
               <p>© {new Date().getFullYear()} GreenTech Solutions. Todos los derechos reservados.</p>
               <div className="flex gap-6">
                  <a href="#" className="hover:text-emerald-500 transition-colors">Términos de Privacidad</a>
                  <a href="#" className="hover:text-emerald-500 transition-colors">Soporte Técnico</a>
               </div>
            </div>
         </footer>

         {/* Custom Styles */}
         <style jsx global>{`
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 3s infinite ease-in-out;
        }
        html { scroll-behavior: smooth; }
      `}</style>
      </div>
   );
}
