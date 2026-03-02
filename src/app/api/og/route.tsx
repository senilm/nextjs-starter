/**
 * @file route.tsx
 * @module app/api/og/route
 * Dynamic OG image generation for blog posts using @vercel/og.
 */

import { ImageResponse } from '@vercel/og'
import type { NextRequest } from 'next/server'

import { APP_NAME } from '@/lib/config'

export const runtime = 'edge'

export const GET = (request: NextRequest): ImageResponse => {
  const { searchParams } = new URL(request.url)
  const title = searchParams.get('title') ?? APP_NAME
  const description = searchParams.get('description') ?? ''

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          backgroundColor: '#09090b',
          padding: '80px',
        }}
      >
        <div
          style={{
            fontSize: 24,
            color: '#a1a1aa',
            marginBottom: 16,
          }}
        >
          {APP_NAME}
        </div>
        <div
          style={{
            fontSize: 56,
            fontWeight: 700,
            color: '#fafafa',
            lineHeight: 1.2,
            maxWidth: '80%',
          }}
        >
          {title}
        </div>
        {description && (
          <div
            style={{
              fontSize: 24,
              color: '#a1a1aa',
              marginTop: 24,
              maxWidth: '70%',
              lineHeight: 1.4,
            }}
          >
            {description}
          </div>
        )}
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  )
}
