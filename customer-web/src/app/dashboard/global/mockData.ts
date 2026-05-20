import { Leaf, Sun, Zap, Award, Factory, Home, FactoryIcon } from 'lucide-react';

export const SHOWCASE_PROJECTS = [
  {
    id: 'planta-empaque',
    title: 'Planta de Empaque Agrícola',
    type: 'Industrial',
    icon: FactoryIcon,
    size: '120 kWp',
    panels: 220,
    co2: '144 Tons/año',
    consumo_est: '18000',
    image: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?q=80&w=800&auto=format&fit=crop',
    description: 'Instalación en cubierta trapezoidal para planta procesadora. Sistema diseñado para suplir el 80% de la demanda diurna de los cuartos fríos.'
  },
  {
    id: 'edificio-residencial',
    title: 'Edificio Residencial',
    type: 'Residencial Múltiple',
    icon: Home,
    size: '45 kWp',
    panels: 82,
    co2: '54 Tons/año',
    consumo_est: '6500',
    image: 'https://images.unsplash.com/photo-1521618755572-156ae0cdd74d?q=80&w=800&auto=format&fit=crop',
    description: 'Sistema interconectado a red para compensar el consumo de áreas comunes y ascensores del complejo.'
  },
  {
    id: 'centro-comercial',
    title: 'Centro Comercial',
    type: 'Comercial',
    icon: Factory,
    size: '250 kWp',
    panels: 460,
    co2: '300 Tons/año',
    consumo_est: '35000',
    image: 'https://images.unsplash.com/photo-1613665813446-82a78c468a1d?q=80&w=800&auto=format&fit=crop',
    description: 'Mega-instalación con inversores de 50kW para abatir los picos de aire acondicionado de la plaza central.'
  },
  {
    id: 'finca-cacaotera',
    title: 'Finca Cacaotera',
    type: 'Agroindustrial',
    icon: Leaf,
    size: '18 kWp',
    panels: 34,
    co2: '21 Tons/año',
    consumo_est: '2500',
    image: 'https://images.pexels.com/photos/9875679/pexels-photo-9875679.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Instalación Off-Grid con baterías de litio para garantizar el 100% de la energía de la zona de secado y oficinas alejadas de la ciudad.'
  },
  {
    id: 'campus-universitario',
    title: 'Campus Universitario Sector Norte',
    type: 'Institucional',
    icon: Award,
    size: '300 kWp',
    panels: 550,
    co2: '360 Tons/año',
    consumo_est: '42000',
    image: 'https://images.unsplash.com/photo-1511649475669-e288648b2339?q=80&w=800&auto=format&fit=crop',
    description: 'Cubierta solar en las facultades de ingenierías, sirviendo como laboratorio activo para estudiantes de energía renovable.'
  },
  {
    id: 'hotel-eco',
    title: 'Hotel Boutique Ecológico',
    type: 'Comercial Sostenible',
    icon: Home,
    size: '60 kWp',
    panels: 110,
    co2: '72 Tons/año',
    consumo_est: '9000',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop',
    description: 'Integración estética con pérgolas solares que proveen sombra a las áreas sociales y energía 100% renovable para climatización.'
  },
  {
    id: 'bombeo-municipal',
    title: 'Estación de Bombeo Municipal',
    type: 'Infraestructura',
    icon: Zap,
    size: '500 kWp',
    panels: 920,
    co2: '600 Tons/año',
    consumo_est: '75000',
    image: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?q=80&w=800&auto=format&fit=crop',
    description: 'Suministro constante para motores de alto consumo, reduciendo el gasto de la red eléctrica estatal en un 65%.'
  },
  {
    id: 'granja-avicola',
    title: 'Granja Productora Avícola',
    type: 'Agroindustrial',
    icon: Leaf,
    size: '85 kWp',
    panels: 154,
    co2: '102 Tons/año',
    consumo_est: '12500',
    image: 'https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?q=80&w=800&auto=format&fit=crop',
    description: 'Sistema montado en tejados de los galpones. Garantiza el enfriamiento continuo de incubadoras frente a interrupciones eléctricas locales.'
  },
  {
    id: 'centro-logistico',
    title: 'Automotora y Centro Logístico',
    type: 'Industrial/Comercial',
    icon: FactoryIcon,
    size: '150 kWp',
    panels: 275,
    co2: '180 Tons/año',
    consumo_est: '22000',
    image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?q=80&w=800&auto=format&fit=crop',
    description: 'Estacionamiento cubierto con carports solares, brindando energía directa a las estaciones de carga de vehículos eléctricos.'
  }
];
