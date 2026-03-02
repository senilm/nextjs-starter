/**
 * @file blog-card.tsx
 * @module features/marketing/components/blog-card
 * Blog post card with title, description, date, and reading time.
 */

import Link from 'next/link'
import { Calendar, Clock } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { BlogPostMeta } from '@/features/marketing/types'

interface BlogCardProps {
  post: BlogPostMeta
}

export const BlogCard = ({ post }: BlogCardProps): React.ReactNode => {
  return (
    <Link href={`/blog/${post.slug}`}>
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardHeader>
          {post.tags && post.tags.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-1">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          <CardTitle className="line-clamp-2">{post.title}</CardTitle>
          <CardDescription className="line-clamp-2">{post.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="size-3" />
              {new Date(post.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="size-3" />
              {post.readingTime}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
