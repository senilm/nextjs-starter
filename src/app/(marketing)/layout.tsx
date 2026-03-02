/**
 * @file layout.tsx
 * @module app/(marketing)/layout
 * Marketing layout — renders navbar, main content area, and footer.
 */

import { Navbar } from '@/features/marketing/components/navbar'
import { Footer } from '@/features/marketing/components/footer'

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>): React.ReactNode {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
