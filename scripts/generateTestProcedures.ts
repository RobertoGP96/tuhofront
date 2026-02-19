import { procedureService } from '../src/services/secretary';

// Types
type StudyType = 'PREGRADO' | 'POSGRADO' | '';
type StudyMode = 'Nacional' | 'Internacional' | '';
type UseType = 'Nacional' | 'Internacional' | '';

// Sample data generators
const getRandomDate = (start: Date, end: Date): string => {
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toISOString().split('T')[0];
};

const getRandomElement = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

const studyTypes: StudyType[] = ['PREGRADO', 'POSGRADO', ''];
const studyModes: StudyMode[] = ['Nacional', 'Internacional', ''];
const useTypes: UseType[] = ['Nacional', 'Internacional', ''];
const estados = ['Pendiente', 'En revisión', 'Aprobado', 'Rechazado', 'Completado'];
const carreras = [
  'Ingeniería Informática',
  'Derecho',
  'Medicina',
  'Arquitectura',
  'Economía',
  'Contabilidad',
  'Psicología',
  'Periodismo'
];

const generateProcedure = (id: number) => {
  const tipo_estudio = getRandomElement(studyTypes);
  const tipo_est = getRandomElement(studyModes);
  const uso = getRandomElement(useTypes);
  const estado = getRandomElement(estados);
  const carrera = getRandomElement(carreras);
  const year = (2020 + Math.floor(Math.random() * 5)).toString();
  
  return {
    tipo_estudio,
    tipo_est,
    uso,
    uso_i: '',
    nombre: `Estudiante${id}`,
    apellidos: `Apellido${id} SegundoApellido${id}`,
    ci: `A${Math.floor(1000000 + Math.random() * 9000000)}`,
    email: `estudiante${id}@estudiantes.uho.edu.cu`,
    telefono: `5${Math.floor(1000000 + Math.random() * 9000000)}`,
    tomo: Math.floor(1 + Math.random() * 10).toString(),
    folio: Math.floor(1 + Math.random() * 100).toString(),
    numero: Math.floor(1000 + Math.random() * 9000).toString(),
    fecha: getRandomDate(new Date(2023, 0, 1), new Date()),
    estado,
    intereses: `Interés ${Math.floor(1 + Math.random() * 10)}`,
    organismo: null,
    organismo_op: 'UHO',
    motivo: `Motivo de trámite ${id}`,
    funcionario: 'Funcionario de Prueba',
    carrera,
    year,
    programa_academico: `Programa ${id}`,
    nombre_programa: `Nombre del Programa ${id}`,
    tipo_pren: 'Pregrado Nacional',
    tipo_prei: 'Pregrado Internacional',
    tipo_posn: 'Posgrado Nacional',
    tipo_posi: 'Posgrado Internacional',
    legalizacion: 'Sí',
    archivo: 'https://example.com/document.pdf'
  };
};

const generateTestData = async (count: number) => {
  console.log(`Generando ${count} trámites de prueba...`);
  
  for (let i = 1; i <= count; i++) {
    try {
      const procedureData = generateProcedure(i);
      await procedureService.createProcedure(procedureData);
      console.log(`Trámite ${i} creado exitosamente`);
    } catch (error) {
      console.error(`Error creando trámite ${i}:`, error);
    }
  }
  
  console.log('Proceso de generación de datos de prueba completado');
};

// Generate 20 test procedures
generateTestData(20).catch(console.error);
