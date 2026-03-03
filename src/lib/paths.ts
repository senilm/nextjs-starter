/**
 * @file paths.ts
 * @module lib/paths
 * Centralized path builder — every app route in one place.
 */

export const paths = {
  home: () => '/',
  pricing: () => '/pricing',
  contact: () => '/contact',

  blog: {
    list: () => '/blog',
    post: (slug: string) => `/blog/${slug}`,
  },

  auth: {
    signIn: () => '/sign-in',
    signUp: (token?: string) => (token ? `/sign-up?token=${token}` : '/sign-up'),
    forgotPassword: () => '/forgot-password',
    resetPassword: () => '/reset-password',
    verifyEmail: () => '/verify-email',
  },

  dashboard: {
    home: () => '/dashboard',
    projects: {
      list: () => '/dashboard/projects',
      detail: (id: string) => `/dashboard/projects/${id}`,
    },
    settings: () => '/dashboard/settings',
    billing: () => '/dashboard/billing',
  },

  admin: {
    home: () => '/admin',
    users: () => '/admin/users',
    roles: () => '/admin/roles',
    plans: () => '/admin/plans',
    settings: () => '/admin/settings',
  },
}
