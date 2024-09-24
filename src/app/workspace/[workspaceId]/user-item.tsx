import { Button } from '@/components/ui/button'
import { Id } from '../../../../convex/_generated/dataModel'
import { cva, VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { useWorkspaceId } from '@/hooks/use-workspace-id'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const userItemVariants = cva(
  'flex item-center gap-1.5 justify-start h-7 px-4 font-normal text-sm overflow-hidden',
  {
    variants: {
      variant: {
        default: 'text-[#f9edffcc]',
        active: 'text-[#481349] bg-white/90 hover:bg-white/90',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

type Props = {
  id: Id<'members'>
  label?: string
  image?: string
  variant?: VariantProps<typeof userItemVariants>['variant']
}

export const UserItem = ({ label = 'Member', image, id, variant }: Props) => {
  const workspaceId = useWorkspaceId()

  return (
    <Button
      variant={'transparent'}
      className={cn(userItemVariants({ variant }))}
      size={'sm'}
      asChild
    >
      <Link href={`/workspace/${workspaceId}/member/${id}`}>
        <Avatar className='size-5 mr-1'>
          <AvatarImage src={image} alt={label} />
          <AvatarFallback>{label[0].toUpperCase()}</AvatarFallback>
        </Avatar>
        <span className='text-sm truncate'>{label}</span>
      </Link>
    </Button>
  )
}
