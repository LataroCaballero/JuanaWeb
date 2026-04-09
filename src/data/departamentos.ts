export interface Departamento {
  id: string;
  nombre: string;
  tagline: string;
  tipo: 'studio' | '1-dorm' | '2-dorm';
  precio: number; // ARS por noche
  capacidad: number; // huéspedes
  superficie: number; // m²
  descripcion: string;
  descripcionLarga: string;
  amenidades: string[];
  ubicacion: string;
  piso: string;
  imageSeed: string;
  imageSeeds: string[]; // para galería
  disponible: boolean;
}

export const departamentos: Departamento[] = [
  {
    id: 'loft-nomade',
    nombre: 'LOFT NÓMADE',
    tagline: 'Para los que viajan solos y piensan distinto.',
    tipo: 'studio',
    precio: 25000,
    capacidad: 2,
    superficie: 38,
    descripcion:
      'Espacio compacto y luminoso con mezzanine de madera. Cocina integrada, escritorio de diseño y acceso al café de planta baja incluido.',
    descripcionLarga:
      'El Loft Nómade es el espacio ideal para el viajero urbano que busca comodidad sin renunciar al carácter. Un ambiente de 38 m² que aprovecha cada centímetro con inteligencia: mezzanine de madera para dormir, zona de trabajo con escritorio de diseño y cocina totalmente equipada. La conexión directa con el café Juana House en planta baja significa que tu primera taza del día es cuestión de bajar las escaleras.',
    amenidades: [
      'WiFi 300 Mbps',
      'Smart TV 43"',
      'Cafetera specialty',
      'Cocina equipada',
      'Aire / Calefacción',
      'Lavandería compartida',
      'Acceso al café',
      'Check-in autónomo',
    ],
    ubicacion: 'Del Bono 383 Sur, San Juan',
    piso: '1er Piso',
    imageSeed: 'apartment',
    imageSeeds: ['interior', 'bedroom', 'kitchen', 'bathroom'],
    disponible: true,
  },
  {
    id: 'suite-azul',
    nombre: 'SUITE AZUL',
    tagline: 'Diseño editorial. Vista urbana. Calma absoluta.',
    tipo: '1-dorm',
    precio: 35000,
    capacidad: 3,
    superficie: 52,
    descripcion:
      'Dormitorio independiente con ventanales al frente. Sala de estar con muebles de diseño local, cocina abierta y baño de autor.',
    descripcionLarga:
      'La Suite Azul es nuestro espacio más solicitado. 52 m² con una distinción clara entre el área de estar y el dormitorio independiente. Los ventanales al frente inundan el espacio de luz natural durante todo el día. Mobiliario diseñado por artesanos locales de San Juan, paleta cromática que dialoga con la identidad visual de Juana House. Un lugar para quedarse más de lo planeado.',
    amenidades: [
      'WiFi 300 Mbps',
      'Smart TV 55"',
      'Cafetera specialty',
      'Cocina equipada',
      'Lavarropa privado',
      'Aire / Calefacción',
      'Acceso al café',
      'Limpieza 2x/sem',
    ],
    ubicacion: 'Del Bono 383 Sur, San Juan',
    piso: '2do Piso',
    imageSeed: 'modern-apartment',
    imageSeeds: ['modern-room', 'living', 'modern-kitchen', 'modern-bath'],
    disponible: true,
  },
  {
    id: 'panoramico',
    nombre: 'PANORÁMICO',
    tagline: 'La cordillera desde tu ventana. Cada mañana.',
    tipo: '1-dorm',
    precio: 42000,
    capacidad: 2,
    superficie: 48,
    descripcion:
      'Piso superior con vista directa a la Precordillera. Terraza privada, dormitorio en suite y living minimalista con doble altura.',
    descripcionLarga:
      'El Panorámico es el espacio más alto del edificio y lo hace valer. Desde la terraza privada, la Precordillera de los Andes se despliega como un telón permanente. El interior responde a esa escala: doble altura en el living, dormitorio en suite con baño de diseño, y una terraza pensada para el desayuno y el atardecer. Para quienes vienen a San Juan por las montañas y quieren sentirlas desde adentro.',
    amenidades: [
      'WiFi 300 Mbps',
      'Smart TV 65"',
      'Cafetera specialty',
      'Cocina equipada',
      'Terraza privada',
      'Lavarropa privado',
      'Aire / Calefacción',
      'Acceso prioritario al café',
    ],
    ubicacion: 'Del Bono 383 Sur, San Juan',
    piso: '3er Piso',
    imageSeed: 'penthouse',
    imageSeeds: ['penthouse-living', 'penthouse-bed', 'penthouse-terrace', 'penthouse-bath'],
    disponible: true,
  },
  {
    id: 'casa-tribu',
    nombre: 'CASA TRIBU',
    tagline: 'Cuando el grupo necesita un hogar real.',
    tipo: '2-dorm',
    precio: 58000,
    capacidad: 5,
    superficie: 75,
    descripcion:
      'El espacio más amplio de Juana. Dos dormitorios completos, living-comedor generoso y cocina de chef para grupos que quieren vivir juntos.',
    descripcionLarga:
      'Casa Tribu nació de una necesidad simple: grupos que viajan juntos merecen un espacio que los contenga sin compromisos. 75 m² distribuidos en dos dormitorios completos (uno doble, uno twin), un living-comedor con mesa para 6, y una cocina de chef completamente equipada. Pensada para familias, equipos creativos o grupos de amigos que prefieren la vida en casa a la impersonalidad del hotel.',
    amenidades: [
      'WiFi 300 Mbps',
      'Smart TV 65"',
      'Cafetera specialty',
      'Cocina de chef',
      'Lavarropa privado',
      'Aire / Calefacción',
      '2 Baños completos',
      'Mesa comedor 6 pers.',
      'Acceso al café',
    ],
    ubicacion: 'Del Bono 383 Sur, San Juan',
    piso: '2do Piso',
    imageSeed: 'family-apartment',
    imageSeeds: ['family-living', 'family-bed1', 'family-kitchen', 'family-dining'],
    disponible: false,
  },
  {
    id: 'rincon-urbano',
    nombre: 'RINCÓN URBANO',
    tagline: 'Pequeño. Perfecto. Completamente vos.',
    tipo: 'studio',
    precio: 22000,
    capacidad: 2,
    superficie: 32,
    descripcion:
      'El más íntimo de los espacios Juana. Micro-apartment de diseño con todo lo esencial en una planta impecablemente organizada.',
    descripcionLarga:
      'El Rincón Urbano demuestra que el tamaño no limita la calidad. 32 m² organizados con la precisión de un puzzle: cama queen empotrada con storage integrado, cocina minimalista, baño con ducha italiana y un rincón de trabajo con la mejor luz del edificio. Para el viajero que entiende que menos es, literalmente, más.',
    amenidades: [
      'WiFi 300 Mbps',
      'Smart TV 40"',
      'Cafetera specialty',
      'Cocina equipada',
      'Aire / Calefacción',
      'Lavandería compartida',
      'Acceso al café',
    ],
    ubicacion: 'Del Bono 383 Sur, San Juan',
    piso: 'PB',
    imageSeed: 'studio',
    imageSeeds: ['studio-main', 'studio-kitchen', 'studio-bath', 'studio-desk'],
    disponible: true,
  },
  {
    id: 'altitud',
    nombre: 'ALTITUD',
    tagline: 'Barreal. Silencio. Cielo sin contaminar.',
    tipo: '2-dorm',
    precio: 62000,
    capacidad: 4,
    superficie: 68,
    descripcion:
      'Nuestra apuesta en Barreal. Dos dormitorios con vista directa al Valle de Calingasta, diseño rústico contemporáneo y conexión con la naturaleza.',
    descripcionLarga:
      'Altitud es la extensión natural de Juana House hacia el Valle de Calingasta. A 1.600 metros sobre el nivel del mar, este espacio abraza la vista más dramática de nuestra región: el Valle de Calingasta y las Sierras del Tontal. Materiales locales — piedra, madera, barro — en diálogo con el confort contemporáneo. El lugar donde el silencio tiene textura y las estrellas no necesitan filtro.',
    amenidades: [
      'WiFi satelital',
      'Smart TV 55"',
      'Cafetera specialty',
      'Cocina equipada',
      'Calefacción a leña',
      'Lavarropa privado',
      '2 Baños',
      'Fogón exterior',
      'Observación astronómica',
    ],
    ubicacion: 'Barreal, San Juan',
    piso: 'Planta única',
    imageSeed: 'mountain-cabin',
    imageSeeds: ['mountain-1', 'mountain-bed', 'mountain-view', 'mountain-ext'],
    disponible: true,
  },
];

export const tipoLabel: Record<Departamento['tipo'], string> = {
  'studio': 'STUDIO',
  '1-dorm': '1 DORMITORIO',
  '2-dorm': '2 DORMITORIOS',
};
