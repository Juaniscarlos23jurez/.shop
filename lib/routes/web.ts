export const routes = {
  home: '/',
  login: '/auth/login',
  register: '/auth/register',
  forgotPassword: '/auth/forgot-password',
  dashboard: '/dashboard',
  profile: '/profile',
} as const;

export type AppRoutes = typeof routes;
export type RouteKeys = keyof AppRoutes;
