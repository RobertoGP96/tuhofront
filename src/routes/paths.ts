// Constantes de rutas base
const ROUTE_SEGMENTS = {
  INTERNAL: '/internal',
  SECRETARY: '/secretary',
  ADMIN: '/admin',
  PROCEDURES: '/procedures',
  USERS: '/users',
  PROFILE: '/profile',
  MY_PROCEDURES: '/my-procedures',
  NEWS: '/news',
  SUPPORT: '/support',
  LOGIN: '/login',
  REGISTER: '/register',
} as const;

// Tipos para mayor seguridad
export type RouteSegment = typeof ROUTE_SEGMENTS[keyof typeof ROUTE_SEGMENTS];

// Rutas principales organizadas por categoría
export const ROUTES = {
  // Rutas públicas
  PUBLIC: {
    HOME: '/',
    NEWS: ROUTE_SEGMENTS.NEWS,
    SUPPORT: ROUTE_SEGMENTS.SUPPORT,
    LOGIN: ROUTE_SEGMENTS.LOGIN,
    REGISTER: ROUTE_SEGMENTS.REGISTER,
  },

  // Rutas privadas (requieren autenticación)
  PRIVATE: {
    PROFILE: ROUTE_SEGMENTS.PROFILE,
    MY_PROCEDURES: ROUTE_SEGMENTS.MY_PROCEDURES,
  },

  // Rutas de procedimientos
  PROCEDURES: {
    ROOT: ROUTE_SEGMENTS.PROCEDURES,
    
    // Procedimientos internos
    INTERNAL: {
      ROOT: `${ROUTE_SEGMENTS.PROCEDURES}${ROUTE_SEGMENTS.INTERNAL}`,
      FEEDING: `${ROUTE_SEGMENTS.PROCEDURES}${ROUTE_SEGMENTS.INTERNAL}/feeding`,
      TRANSPORT: `${ROUTE_SEGMENTS.PROCEDURES}${ROUTE_SEGMENTS.INTERNAL}/transport`,
      MAINTENANCE: `${ROUTE_SEGMENTS.PROCEDURES}${ROUTE_SEGMENTS.INTERNAL}/maintenance`,
      ACCOMMODATION: `${ROUTE_SEGMENTS.PROCEDURES}${ROUTE_SEGMENTS.INTERNAL}/accommodation`,
    },
    
    // Procedimientos de secretaría
    SECRETARY: {
      ROOT: `${ROUTE_SEGMENTS.PROCEDURES}${ROUTE_SEGMENTS.SECRETARY}`,
      UNDERGRADUATE_NATIONAL: `${ROUTE_SEGMENTS.PROCEDURES}${ROUTE_SEGMENTS.SECRETARY}/undergraduate-national`,
      UNDERGRADUATE_INTERNATIONAL: `${ROUTE_SEGMENTS.PROCEDURES}${ROUTE_SEGMENTS.SECRETARY}/undergraduate-international`,
      POSTGRADUATE_NATIONAL: `${ROUTE_SEGMENTS.PROCEDURES}${ROUTE_SEGMENTS.SECRETARY}/postgraduate-national`,
      POSTGRADUATE_INTERNATIONAL: `${ROUTE_SEGMENTS.PROCEDURES}${ROUTE_SEGMENTS.SECRETARY}/postgraduate-international`,
      LEGALIZATION: `${ROUTE_SEGMENTS.PROCEDURES}${ROUTE_SEGMENTS.SECRETARY}/legalization`,
      // Función para rutas dinámicas
      DETAIL: (id: string = ':id') => `${ROUTE_SEGMENTS.PROCEDURES}${ROUTE_SEGMENTS.SECRETARY}/${id}`,
    },
  },

  // Rutas de administración
  ADMIN: {
    ROOT: ROUTE_SEGMENTS.ADMIN,
    DASHBOARD: `${ROUTE_SEGMENTS.ADMIN}/dashboard`,
    USERS: `${ROUTE_SEGMENTS.ADMIN}${ROUTE_SEGMENTS.USERS}`,
    STRUCTURE: `${ROUTE_SEGMENTS.ADMIN}/structure`,
    ROLES: `${ROUTE_SEGMENTS.ADMIN}/roles`,
    EMAIL: `${ROUTE_SEGMENTS.ADMIN}/email`,

    // Administración interna
    INTERNAL: {
      PERSONAL: `${ROUTE_SEGMENTS.ADMIN}${ROUTE_SEGMENTS.INTERNAL}/personal`,
      PROCEDURES: `${ROUTE_SEGMENTS.ADMIN}${ROUTE_SEGMENTS.INTERNAL}/procedures`,
      CONFIG: `${ROUTE_SEGMENTS.ADMIN}${ROUTE_SEGMENTS.INTERNAL}/config`,
    },

    // Administración de secretaría
    SECRETARY: {
      PERSONAL: `${ROUTE_SEGMENTS.ADMIN}${ROUTE_SEGMENTS.SECRETARY}/personal`,
      PROCEDURES: `${ROUTE_SEGMENTS.ADMIN}${ROUTE_SEGMENTS.SECRETARY}/procedures`,
      CONFIG: `${ROUTE_SEGMENTS.ADMIN}${ROUTE_SEGMENTS.SECRETARY}/config`,
    },

    // Funciones para rutas dinámicas
    USER_DETAIL: (userId: string = ':userId') => `${ROUTE_SEGMENTS.ADMIN}${ROUTE_SEGMENTS.USERS}/${userId}`,
  },

  // Rutas especiales
  SPECIAL: {
    INTERNAL_ADMIN: (procedureId: string = ':procedure') => `/internal-admin/${procedureId}`,
    UNAUTHORIZED: '/unauthorized',
    NOT_FOUND: '/404',
  },
} as const;

// Compatibilidad con el sistema actual (mantener para no romper código existente)
const routes = {
  home: ROUTES.PUBLIC.HOME,
  news: ROUTES.PUBLIC.NEWS,
  support: ROUTES.PUBLIC.SUPPORT,
  login: ROUTES.PUBLIC.LOGIN,
  register: ROUTES.PUBLIC.REGISTER,
  profile: ROUTES.PRIVATE.PROFILE,
  myProcedures: ROUTES.PRIVATE.MY_PROCEDURES,

  procedures: {
    root: ROUTES.PROCEDURES.ROOT,
    internal: {
      root: ROUTE_SEGMENTS.INTERNAL,
      feeding: '/feeding',
      transport: '/transport',
      maintenance: '/maintenance',
      accommodation: '/accommodation',
    },
    secretary: {
      root: ROUTE_SEGMENTS.SECRETARY,
      undernat: '/undernat',
      underinter: '/underinter',
      postnat: '/postnat',
      postinter: '/postinter',
      legaliz: '/legaliz',
      detail: (id = ':id') => `${ROUTE_SEGMENTS.SECRETARY}/${id}`,
    },
  },

  admin: {
    root: ROUTES.ADMIN.ROOT,
    users: `${ROUTE_SEGMENTS.ADMIN}${ROUTE_SEGMENTS.USERS}`,
    structure: `${ROUTE_SEGMENTS.ADMIN}/structure`,
    roles: `${ROUTE_SEGMENTS.ADMIN}/roles`,
    dashboard: `${ROUTE_SEGMENTS.ADMIN}/dashboard`,
    email: `${ROUTE_SEGMENTS.ADMIN}/email`,

    internal: {
      personal: `${ROUTE_SEGMENTS.ADMIN}${ROUTE_SEGMENTS.INTERNAL}/personal`,
      procedures: `${ROUTE_SEGMENTS.ADMIN}${ROUTE_SEGMENTS.INTERNAL}/procedures`,
      config: `${ROUTE_SEGMENTS.ADMIN}${ROUTE_SEGMENTS.INTERNAL}/config`,
    },

    secretary: {
      personal: `${ROUTE_SEGMENTS.ADMIN}/secretary/personal`,
      procedures: `${ROUTE_SEGMENTS.ADMIN}/secretary/procedures`,
      config: `${ROUTE_SEGMENTS.ADMIN}/secretary/config`,
    },

    userDetail: (userId = ':userId') => `${ROUTE_SEGMENTS.ADMIN}${ROUTE_SEGMENTS.USERS}/${userId}`,
  },

  internalAdmin: (procedureId = ':procedure') => `/internal-admin/${procedureId}`,
};

export default routes;
