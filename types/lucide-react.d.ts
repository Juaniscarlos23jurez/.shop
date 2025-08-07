declare module 'lucide-react' {
  import { ComponentType, SVGProps } from 'react'

  export interface LucideProps extends SVGProps<SVGSVGElement> {
    size?: number | string
    absoluteStrokeWidth?: boolean
    color?: string
  }

  type Icon = ComponentType<LucideProps>

  export const Search: Icon
  export const Filter: Icon
  export const ShoppingCart: Icon
  export const Plus: Icon
  export const Minus: Icon
  export const X: Icon
  export const Trash2: Icon
}
