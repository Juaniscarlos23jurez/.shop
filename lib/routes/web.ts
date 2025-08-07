export const routes = {
  home: '/',
  login: '/auth/login',
  register: '/auth/register',
  dashboard: '/dashboard',
  profile: '/profile',
} as const;

export type AppRoutes = typeof routes;
export type RouteKeys = keyof AppRoutes;
