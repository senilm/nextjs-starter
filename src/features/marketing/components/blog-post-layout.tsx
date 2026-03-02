/**
 * @file blog-post-layout.tsx
 * @module features/marketing/components/blog-post-layout
 * Blog post layout with title, meta information, and prose-styled MDX content.
 */

import Link from 'next/link'
import { ArrowLeft, Calendar, Clock, User } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { BlogPost } from '@/features/marketing/types'

interface BlogPostLayoutProps {
  post: BlogPost
}

export const BlogPostLayout = ({ post }: BlogPostLayoutProps): React.ReactNode => {
  const { meta, content } = post

  return (
    <article className="py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <Button variant="ghost" size="sm" className="mb-8" asChild>
          <Link href="/blog">
            <ArrowLeft className="mr-1 size-4" />
            Back to blog
          </Link>
        </Button>

        <header className="mb-12">
          {meta.tags && meta.tags.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-1">
              {meta.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            {meta.title}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">{meta.description}</p>
          <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <User className="size-4" />
              {meta.author}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="size-4" />
              {new Date(meta.date).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="size-4" />
              {meta.readingTime}
            </span>
          </div>
        </header>

        <div className="prose prose-neutral dark:prose-invert max-w-none">
          {content}
        </div>
      </div>
    </article>
  )
}
