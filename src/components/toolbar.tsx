import { MessageSquareText, Pencil, Smile, Trash } from 'lucide-react'
import { Button } from './ui/button'
import { Hint } from './hint'
import { EmojiPopover } from './emoji-popover'

type Props = {
  isAuthor: boolean
  isPending: boolean
  hideThreadButton?: boolean
  handleEdit: () => void
  handleDelete: () => void
  handleThread: () => void
  handleReaction: (v: string) => void
}

export const Toolbar = ({
  isAuthor,
  isPending,
  handleEdit,
  handleDelete,
  handleThread,
  handleReaction,
  hideThreadButton,
}: Props) => {
  return (
    <div className='absolute top-0 right-5'>
      <div className='group-hover:opacity-100 opacity-0 transition-opacity border bg-white rounded-md shadow-sm'>
        <EmojiPopover hint='Add reaction' onEmojiSelect={handleReaction}>
          <Button variant={'ghost'} size={'iconSm'} disabled={isPending}>
            <Smile className='size-4' />
          </Button>
        </EmojiPopover>
        {!hideThreadButton && (
          <Hint label='Reply in thread'>
            <Button
              variant={'ghost'}
              size={'iconSm'}
              disabled={isPending}
              onClick={handleThread}
            >
              <MessageSquareText className='size-4' />
            </Button>
          </Hint>
        )}
        {isAuthor && (
          <>
            <Hint label='Edit message'>
              <Button
                variant={'ghost'}
                size={'iconSm'}
                disabled={isPending}
                onClick={handleEdit}
              >
                <Pencil className='size-4' />
              </Button>
            </Hint>
            <Hint label='Delete message'>
              <Button
                variant={'ghost'}
                size={'iconSm'}
                disabled={isPending}
                onClick={handleDelete}
              >
                <Trash className='size-4' />
              </Button>
            </Hint>
          </>
        )}
      </div>
    </div>
  )
}
