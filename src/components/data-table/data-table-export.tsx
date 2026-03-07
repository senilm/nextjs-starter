/**
 * @file data-table-export.tsx
 * @module components/data-table/data-table-export
 * CSV and XLSX export dropdown for data tables.
 */

'use client'

import { Download } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface DataTableExportProps {
  onExportCSV: () => void | Promise<void>
  onExportXLSX: () => void | Promise<void>
  isExporting?: boolean
}

export const DataTableExport = ({
  onExportCSV,
  onExportXLSX,
  isExporting = false,
}: DataTableExportProps): React.ReactNode => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" loading={isExporting}>
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onExportCSV} disabled={isExporting}>In .CSV</DropdownMenuItem>
        <DropdownMenuItem onClick={onExportXLSX} disabled={isExporting}>In .XLSX</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
