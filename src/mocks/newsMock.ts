import type { NewsItem } from '../types/news.d';

const newsMock: NewsItem[] = [
  {
    id: 'n-001',
    title: 'Apertura del periodo de matrícula para estudiantes de nuevo ingreso',
    summary: 'La Universidad de Holguín anuncia la apertura del periodo de matrícula para los estudiantes de nuevo ingreso. Se realizará online y presencial con cita previa.',
    content: 'Se informa a los estudiantes admitidos en la convocatoria 2025 que la matrícula comenzará el 1ro de octubre. Los pasos incluyen la presentación de documentos (certificado de estudios, carnet de identidad), llenado del formulario en línea y la confirmación presencial en la facultad correspondiente.',
    date: '2025-10-01',
    tags: ['Matrícula','Trámite'],
    link: '#'
  },
  {
    id: 'n-002',
    title: 'Renovación de becas: documentos requeridos y plazo',
    summary: 'Los estudiantes beneficiados con becas deben entregar la documentación actualizada antes del 15 de septiembre para mantener la ayuda.',
    content: 'La Secretaría de Asuntos Estudiantiles comunica los documentos necesarios para la renovación de becas: comprobante de notas, declaración de ingresos y certificado médico. La entrega puede hacerse en formato digital a través del portal institucional.',
    date: '2025-09-15',
    tags: ['Becas','Trámite'],
    link: '#'
  },
  {
    id: 'n-003',
    title: 'Cómo solicitar constancia de estudios y certificado de notas',
    summary: 'Guía rápida para solicitar la constancia de estudios y el certificado de notas tanto para egresados como para estudiantes activos.',
    content: 'Para solicitar la constancia de estudios diríjase al sitio web de la Oficina de Registros y complete el formulario. El trámite tiene un plazo estimado de 3 días hábiles. Para certificados de notas, se requiere la autorización del departamento académico.',
    date: '2025-08-20',
    tags: ['Certificados','Trámite','Registros'],
    link: '#'
  },
  {
    id: 'n-004',
    title: 'Actualización en el proceso de convalidación de asignaturas',
    summary: 'Se actualizan los requisitos para la convalidación de asignaturas provenientes de otras instituciones. Nuevos formularios y plazos de evaluación.',
    content: 'La comisión de Convalidaciones aprobó un nuevo formato de solicitud y un calendario para evaluación. Los estudiantes deben presentar el programa de la asignatura y las actas de la institución de origen.',
    date: '2025-09-10',
    tags: ['Convalidación','Trámite'],
    link: '#'
  },
  {
    id: 'n-005',
    title: 'Horario extendido en Secretaría para entrega de documentos',
    summary: 'La Secretaría ampliará su horario durante el mes de matrícula para facilitar la entrega de documentos por parte de los estudiantes.',
    content: 'Con el fin de mejorar el servicio, la Secretaría atenderá de 8:00 a 18:00 horas durante octubre. Se recuerda traer original y copia de los documentos solicitados.',
    date: '2025-09-30',
    tags: ['Secretaría','Horario','Trámite'],
    link: '#'
  }
];

export default newsMock;
