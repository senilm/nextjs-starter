/**
 * @file robots.ts
 * @module app/robots
 * Robots.txt configuration — allow all, disallow private routes.
 */

import type { MetadataRoute } from 'next'

import { APP_URL } from '@/lib/config'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard', '/admin', '/api'],
    },
    sitemap: `${APP_URL}/sitemap.xml`,
  }
}
