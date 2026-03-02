/**
 * @file page-header.tsx
 * @module components/shared/page-header
 * Page header with title, description, and right-side actions.
 */

interface PageHeaderProps {
  title: string
  description?: string
  actions?: React.ReactNode
}

export const PageHeader = ({ title, description, actions }: PageHeaderProps): React.ReactNode => {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}
