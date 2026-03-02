/**
 * @file types.ts
 * @module features/marketing/types
 * Type definitions for the marketing module including blog post metadata.
 */

export interface BlogPostMeta {
  title: string
  description: string
  date: string
  author: string
  image?: string
  tags?: string[]
  slug: string
  readingTime: string
}

export interface BlogPost {
  meta: BlogPostMeta
  content: React.ReactNode
}
