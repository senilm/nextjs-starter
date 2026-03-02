/**
 * @file mdx.ts
 * @module lib/mdx
 * Server utility for reading, parsing, and compiling MDX blog posts.
 */

import fs from 'fs'
import path from 'path'

import matter from 'gray-matter'
import { compileMDX } from 'next-mdx-remote/rsc'
import rehypeShiki from '@shikijs/rehype'

import type { BlogPostMeta, BlogPost } from '@/features/marketing/types'

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog')

const calculateReadingTime = (content: string): string => {
  const wordsPerMinute = 200
  const words = content.split(/\s+/).length
  const minutes = Math.ceil(words / wordsPerMinute)
  return `${minutes} min read`
}

export const getBlogPosts = (): BlogPostMeta[] => {
  if (!fs.existsSync(BLOG_DIR)) {
    return []
  }

  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith('.mdx'))

  const posts = files.map((file) => {
    const slug = file.replace('.mdx', '')
    const raw = fs.readFileSync(path.join(BLOG_DIR, file), 'utf-8')
    const { data, content } = matter(raw)

    return {
      title: data.title as string,
      description: data.description as string,
      date: data.date as string,
      author: data.author as string,
      image: (data.image as string) ?? undefined,
      tags: (data.tags as string[]) ?? undefined,
      slug,
      readingTime: calculateReadingTime(content),
    } satisfies BlogPostMeta
  })

  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export const getBlogPost = async (slug: string): Promise<BlogPost | null> => {
  const filePath = path.join(BLOG_DIR, `${slug}.mdx`)

  if (!fs.existsSync(filePath)) {
    return null
  }

  const raw = fs.readFileSync(filePath, 'utf-8')
  const { data, content: rawContent } = matter(raw)

  const { content } = await compileMDX({
    source: rawContent,
    options: {
      mdxOptions: {
        rehypePlugins: [
          [
            rehypeShiki,
            {
              themes: {
                light: 'github-light',
                dark: 'github-dark',
              },
            },
          ],
        ],
      },
    },
  })

  return {
    meta: {
      title: data.title as string,
      description: data.description as string,
      date: data.date as string,
      author: data.author as string,
      image: (data.image as string) ?? undefined,
      tags: (data.tags as string[]) ?? undefined,
      slug,
      readingTime: calculateReadingTime(rawContent),
    },
    content,
  }
}
