/**
 * @file sitemap.ts
 * @module app/sitemap
 * Dynamic sitemap generation with static routes and blog post slugs.
 */

import type { MetadataRoute } from 'next'

import { APP_URL } from '@/lib/config'
import { paths } from '@/lib/paths'
import { getBlogPosts } from '@/lib/mdx'

const STATIC_ROUTES = [paths.home(), paths.pricing(), paths.blog.list(), paths.contact()] as const

export default function sitemap(): MetadataRoute.Sitemap {
  const staticEntries = STATIC_ROUTES.map((route) => ({
    url: `${APP_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '/' ? 1 : 0.8,
  }))

  const blogPosts = getBlogPosts()
  const blogEntries = blogPosts.map((post) => ({
    url: `${APP_URL}${paths.blog.post(post.slug)}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  return [...staticEntries, ...blogEntries]
}
