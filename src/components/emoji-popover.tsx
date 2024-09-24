import EmojiPicker, { EmojiClickData } from 'emoji-picker-react'
import { useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip'

type Props = {
  children: React.ReactNode
  hint?: string
  onEmojiSelect: (emoji: string) => void
}

export const EmojiPopover = ({
  children,
  hint = 'Emoji',
  onEmojiSelect,
}: Props) => {
  const [popoverOpen, setPopoverOpen] = useState(false)
  const [tooltipOpen, setTooltipOpen] = useState(false)

  const onSelect = (value: EmojiClickData) => {
    onEmojiSelect(value.emoji)
    setPopoverOpen(false)

    setTimeout(() => {
      setTooltipOpen(false)
    }, 500)
  }

  return (
    <TooltipProvider>
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <Tooltip
          open={tooltipOpen}
          onOpenChange={setTooltipOpen}
          delayDuration={50}
        >
          <PopoverTrigger asChild>
            <TooltipTrigger asChild>{children}</TooltipTrigger>
          </PopoverTrigger>
          <TooltipContent className='bg-black text-white border border-white/5'>
            <p className='font-medium text-xs'>{hint}</p>
          </TooltipContent>
        </Tooltip>
        <PopoverContent className='p-0 w-full border-none shadow-none'>
          <EmojiPicker onEmojiClick={onSelect} />
        </PopoverContent>
      </Popover>
    </TooltipProvider>
  )
}
