const INTERNAL = '/internal';
const SECRETARY = '/secretary';
const ADMIN = '/admin';

const routes = {
  home: '/',
  news: '/news',
  support: '/support',
  login: '/login',
  register: '/register',
  profile: '/profile',
  procedures: '/procedures',
  myProcedures: '/my-procedures',

  internal: {
    root: INTERNAL,
    config: `${INTERNAL}/config`,
    procedures: `${INTERNAL}/procedures`,
    procedures_feeding: `${INTERNAL}/procedures/feeding`,
    procedures_transport: `${INTERNAL}/procedures/transport`,
    procedures_maintenance: `${INTERNAL}/procedures/maintenance`,
    procedures_accommodation: `${INTERNAL}/procedures/accommodation`,
  },

  secretary: {
    root: SECRETARY,
    undernat: `${SECRETARY}/undernat`,
    underinter: `${SECRETARY}/underinter`,
    postnat: `${SECRETARY}/postnat`,
    postinter: `${SECRETARY}/postinter`,
    legaliz: `${SECRETARY}/legaliz`,
    detail: (id = ':id') => `${SECRETARY}/${id}`,
  },

  admin: {
    root: ADMIN,
    users: `${ADMIN}/users`,
    structure: `${ADMIN}/structure`,
    roles: `${ADMIN}/roles`,
    dashboard: `${ADMIN}/dashboard`,
    email: `${ADMIN}/email`,

    internal:{
      personal: `${ADMIN}/internal/feed`,
      procedures:`${ADMIN}/internal/procedures`,
      config:`${ADMIN}/internal/config`,
    },
    
    secretary:{
      personal: `${ADMIN}/secretary/feed`,
      procedures:`${ADMIN}/secretary/procedures`,
      config:`${ADMIN}/secretary/config`,
    },
    
    userDetail: (userId = ':userId') => `/admin/users/${userId}`,
  },

  internalAdmin: (procedureId = ':procedure') => `/internal-admin/${procedureId}`,
};

export default routes;
