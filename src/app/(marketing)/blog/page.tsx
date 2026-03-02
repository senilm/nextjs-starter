/**
 * @file page.tsx
 * @module app/(marketing)/blog/page
 * Blog list page with card grid.
 */

import type { Metadata } from 'next'

import { APP_NAME } from '@/lib/config'
import { getBlogPosts } from '@/lib/mdx'
import { BlogCard } from '@/features/marketing/components/blog-card'
import { AnimatedSection } from '@/features/marketing/components/animated-section'

export const metadata: Metadata = {
  title: `Blog — ${APP_NAME}`,
  description: `Guides, tutorials, and updates from the ${APP_NAME} team.`,
}

export default function BlogPage(): React.ReactNode {
  const posts = getBlogPosts()

  return (
    <div className="py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Blog</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Guides, tutorials, and updates from the {APP_NAME} team.
          </p>
        </AnimatedSection>

        {posts.length === 0 ? (
          <p className="mt-16 text-center text-muted-foreground">
            No posts yet. Check back soon!
          </p>
        ) : (
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, index) => (
              <AnimatedSection key={post.slug} delay={index * 0.1}>
                <BlogCard post={post} />
              </AnimatedSection>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
