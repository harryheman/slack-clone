'use client'

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip'

type Props = {
  label: string
  children: React.ReactNode
  side?: 'top' | 'bottom' | 'left' | 'right'
  align?: 'center' | 'start' | 'end'
}

export const Hint = ({
  label,
  children,
  side = 'top',
  align = 'center',
}: Props) => {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={50}>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent
          side={side}
          align={align}
          className='bg-black text-white border border-white/5'
        >
          <p className='text-xs font-medium'>{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
