/**
 * @file page.tsx
 * @module app/(marketing)/blog/[slug]/page
 * Individual blog post page with generateStaticParams, generateMetadata, and JSON-LD.
 */

import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

import { APP_NAME, APP_URL } from '@/lib/config'
import { paths } from '@/lib/paths'
import { getBlogPosts, getBlogPost } from '@/lib/mdx'
import { BlogPostLayout } from '@/features/marketing/components/blog-post-layout'

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

export const generateStaticParams = (): { slug: string }[] => {
  return getBlogPosts().map((post) => ({ slug: post.slug }))
}

export const generateMetadata = async ({
  params,
}: BlogPostPageProps): Promise<Metadata> => {
  const { slug } = await params
  const post = await getBlogPost(slug)
  if (!post) return {}

  return {
    title: `${post.meta.title} — ${APP_NAME}`,
    description: post.meta.description,
    openGraph: {
      title: post.meta.title,
      description: post.meta.description,
      type: 'article',
      publishedTime: post.meta.date,
      authors: [post.meta.author],
      url: `${APP_URL}${paths.blog.post(slug)}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.meta.title,
      description: post.meta.description,
    },
  }
}

export default async function BlogPostPage({
  params,
}: BlogPostPageProps): Promise<React.ReactNode> {
  const { slug } = await params
  const post = await getBlogPost(slug)

  if (!post) {
    notFound()
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.meta.title,
    description: post.meta.description,
    datePublished: post.meta.date,
    author: {
      '@type': 'Person',
      name: post.meta.author,
    },
    publisher: {
      '@type': 'Organization',
      name: APP_NAME,
      url: APP_URL,
    },
    url: `${APP_URL}/blog/${slug}`,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BlogPostLayout post={post} />
    </>
  )
}
