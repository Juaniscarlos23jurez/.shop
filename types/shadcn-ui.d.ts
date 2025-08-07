import { ReactNode } from 'react'

import { DialogPortalProps } from '@radix-ui/react-dialog'

declare module '@/components/ui/sheet' {
  export interface SheetContentProps extends DialogPortalProps {
    side?: 'top' | 'right' | 'bottom' | 'left'
    className?: string
  }
}
